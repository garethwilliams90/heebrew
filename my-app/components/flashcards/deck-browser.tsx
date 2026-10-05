"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import {
  SoundControls,
  useSoundPrefs,
  type SoundChannel,
} from "@/components/flashcards/sound-toggle";
import { useTranslations } from "next-intl";
import { CardEditor } from "@/components/flashcards/card-editor";
import { DeckHeading } from "@/components/flashcards/deck-heading";
import { FamiliaritySelect } from "@/components/flashcards/familiarity-select";
import { MarkedText } from "@/components/flashcards/marked-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { removeCard } from "@/lib/flashcards/library";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { loadDeckMastery, writeCardMastery } from "@/lib/flashcards/progress";
import type { Flashcard } from "@/lib/flashcards/types";

const PAGE_SIZE = 20;

type CardSort = "az" | "za" | "newest" | "oldest" | "mastered" | "unknown";

const deckRequests = new Map<string, Promise<{ text: string; audio: string }[]>>();

function requestDeck(texts: string[]) {
  const key = texts.join("\n");
  const existing = deckRequests.get(key);

  if (existing) {
    return existing;
  }

  const request = fetch("/api/speech/deck", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts }),
  })
    .then(async (response) => {
      if (!response.ok) {
        deckRequests.delete(key);
        throw new Error("Speech failed");
      }

      const payload = (await response.json()) as {
        clips?: { text?: unknown; audio?: unknown }[];
      };

      return (payload.clips ?? []).flatMap((clip) =>
        typeof clip.text === "string" && typeof clip.audio === "string"
          ? [{ text: clip.text, audio: clip.audio }]
          : [],
      );
    })
    .catch((error: unknown) => {
      deckRequests.delete(key);
      throw error;
    });

  deckRequests.set(key, request);
  return request;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0591-\u05C7]/g, "")
    .toLowerCase();
}

export function DeckBrowser({
  deckId,
  title,
  description,
  kind,
  cards,
}: {
  deckId: string;
  title: string;
  description: string;
  kind: "builtin" | "custom";
  cards: Flashcard[];
}) {
  const t = useTranslations("Flashcards");
  const router = useRouter();
  const sound = useSoundPrefs();
  const playingKindRef = useRef<"word" | "sentence" | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CardSort>("az");
  const [page, setPage] = useState(0);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<Flashcard | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [libraryMessage, setLibraryMessage] = useState<"signed-out" | "error" | null>(null);
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const pendingPlay = useRef<{ id: string; key: string } | null>(null);

  const usesRecordedAudio = cards.some((card) => card.audioUrl);

  useEffect(() => {
    let cancelled = false;

    loadDeckMastery(deckId)
      .then(({ signedIn: hasAccount, mastery: saved }) => {
        if (cancelled) {
          return;
        }

        setSignedIn(hasAccount);
        setMastery(saved);
      })
      .catch(() => {
        if (!cancelled) {
          setSaveError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [deckId]);

  useEffect(() => {
    if (usesRecordedAudio) {
      return;
    }

    const created: string[] = [];
    let cancelled = false;
    const texts = [...new Set(cards.map((card) => card.hebrew).filter(Boolean))].slice(0, 40);

    async function loadDeck() {
      const clipsForDeck = await requestDeck(texts);

      await Promise.all(
        clipsForDeck.map(async (clip) => {
          const bytes = Uint8Array.from(atob(clip.audio), (char) => char.charCodeAt(0));
          const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
          created.push(url);
          const audio = new Audio(url);
          audio.preload = "auto";
          await new Promise<void>((resolve, reject) => {
            audio.addEventListener("canplaythrough", () => resolve(), { once: true });
            audio.addEventListener("error", () => reject(new Error("audio")), {
              once: true,
            });
          });

          if (cancelled) {
            return;
          }

          clips.current.set(clip.text, audio);

          if (pendingPlay.current?.key === clip.text && sound.allows("word")) {
            const pending = pendingPlay.current;
            pendingPlay.current = null;
            startClip(pending.id, audio, "word");
          }
        }),
      );
    }

    void loadDeck().catch(() => {
      if (!cancelled) {
        setPlayingId(null);
        setFailedId(pendingPlay.current?.id ?? "deck");
        pendingPlay.current = null;
      }
    });

    return () => {
      cancelled = true;
      for (const url of created) {
        URL.revokeObjectURL(url);
      }
    };
  }, [cards, usesRecordedAudio]);

  useEffect(() => {
    const current = clips.current;

    return () => {
      for (const clip of current.values()) {
        clip.pause();
      }
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    const matched = needle
      ? cards.filter((card) =>
          normalize(
            `${card.english} ${card.hebrew} ${card.example} ${card.hebrewExample}`,
          ).includes(needle),
        )
      : cards;
    const addedAt = new Map(cards.map((card, index) => [card.id, index]));
    const sorted = [...matched];
    const byAdded = (a: Flashcard, b: Flashcard) =>
      (addedAt.get(a.id) ?? 0) - (addedAt.get(b.id) ?? 0);
    const byEnglish = (a: Flashcard, b: Flashcard) =>
      a.english.localeCompare(b.english, "en", { sensitivity: "base" });

    if (sort === "newest" || sort === "oldest") {
      const direction = sort === "oldest" ? 1 : -1;
      sorted.sort((a, b) => direction * byAdded(a, b));
      return sorted;
    }

    if (sort === "mastered" || sort === "unknown") {
      const direction = sort === "unknown" ? 1 : -1;
      sorted.sort((a, b) => {
        const level = (mastery[a.id] ?? 0) - (mastery[b.id] ?? 0);
        if (level !== 0) {
          return direction * level;
        }

        return byAdded(a, b);
      });
      return sorted;
    }

    sorted.sort((a, b) => (sort === "za" ? byEnglish(b, a) : byEnglish(a, b)));
    return sorted;
  }, [cards, mastery, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  function stopClips() {
    pendingPlay.current = null;
    playingKindRef.current = null;

    for (const clip of clips.current.values()) {
      clip.pause();
      clip.currentTime = 0;
    }

    setPlayingId(null);
  }

  function toggleSound(channel: SoundChannel) {
    const next = !sound.prefsRef.current[channel];
    sound.setChannel(channel, next);
    if (!next && (channel === "general" || channel === playingKindRef.current)) {
      stopClips();
    }
  }

  function startClip(id: string, audio: HTMLAudioElement, kind: "word" | "sentence") {
    if (!sound.allows(kind)) {
      pendingPlay.current = null;
      return;
    }

    for (const clip of clips.current.values()) {
      clip.pause();
      clip.currentTime = 0;
    }

    playingKindRef.current = kind;
    audio.onended = () => {
      playingKindRef.current = null;
      setPlayingId((current) => (current === id ? null : current));
    };
    setFailedId(null);
    setPlayingId(id);
    void audio.play().catch(() => {
      playingKindRef.current = null;
      setPlayingId(null);
      setFailedId(id);
    });
  }

  function playUrl(id: string, url: string, kind: "word" | "sentence") {
    let audio = clips.current.get(url);

    if (!audio) {
      audio = new Audio(url);
      audio.preload = "auto";
      clips.current.set(url, audio);
    }

    pendingPlay.current = null;
    startClip(id, audio, kind);
  }

  function play(card: Flashcard) {
    if (!sound.allows("word")) {
      return;
    }

    const key = card.audioUrl ?? card.hebrew;
    const audio = clips.current.get(key);

    if (!audio && card.audioUrl) {
      playUrl(card.id, card.audioUrl, "word");
      return;
    }

    if (!audio) {
      pendingPlay.current = { id: card.id, key };
      setFailedId(null);
      setPlayingId(card.id);
      if (usesRecordedAudio && !card.audioUrl) {
        void loadSpeechClip(card.hebrew).then((loaded) => {
          if (!loaded) {
            setPlayingId(null);
            setFailedId(card.id);
            return;
          }
          clips.current.set(card.hebrew, loaded);
          if (pendingPlay.current?.key === card.hebrew) {
            startClip(card.id, loaded, "word");
          }
        });
      }
      return;
    }

    pendingPlay.current = null;
    startClip(card.id, audio, "word");
  }

  function refresh() {
    setEditor(null);
    setConfirmDelete(null);
    setLibraryMessage(null);
    router.refresh();
  }

  async function destroyCard(card: Flashcard) {
    const result = await removeCard(deckId, card);
    if (result === "ok") {
      refresh();
      return;
    }
    setLibraryMessage(result === "signed-out" ? "signed-out" : "error");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-10 sm:px-8">
      <div className="flex flex-row gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <DeckHeading
            deckId={deckId}
            title={title}
            description={description}
            canDelete={kind === "custom"}
            level="h1"
            titleClassName="text-3xl font-semibold tracking-tight"
            descriptionClassName="mt-2 text-emerald-950/70"
          />
          <p className="mt-2 text-sm text-emerald-900/70">
            {t("cardCount", { count: cards.length })}
          </p>
          {signedIn === false ? (
            <p className="mt-2 text-sm text-emerald-900/70">
              <Link href="/login" className="text-emerald-800 underline underline-offset-2">
                {t("signInToSave")}
              </Link>
            </p>
          ) : null}
          {saveError ? (
            <p className="mt-2 text-sm text-red-800" role="alert">
              {t("saveError")}
            </p>
          ) : null}
          <div className="mt-3">
            <SoundControls prefs={sound.prefs} onToggle={toggleSound} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              className="h-10 bg-emerald-800 px-4 text-white hover:bg-emerald-900"
              onClick={() => {
                setEditor("new");
                setConfirmDelete(null);
              }}
            >
              {t("addCard")}
            </Button>
          </div>
          {libraryMessage === "signed-out" ? (
            <p className="mt-2 text-sm text-emerald-900/70">{t("signInToEdit")}</p>
          ) : null}
          {libraryMessage === "error" ? (
            <p className="mt-2 text-sm text-red-800" role="alert">
              {t("libraryError")}
            </p>
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">
          <select
            aria-label={t("sortCards")}
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as CardSort);
              setPage(0);
            }}
            className="h-11 rounded-lg border border-emerald-900/10 bg-white px-3 text-sm text-emerald-950"
          >
            <optgroup label={t("sortGroupAlphabetical")}>
              <option value="az">{t("sortAz")}</option>
              <option value="za">{t("sortZa")}</option>
            </optgroup>
            <optgroup label={t("sortGroupAdded")}>
              <option value="newest">{t("sortNewest")}</option>
              <option value="oldest">{t("sortOldest")}</option>
            </optgroup>
            <optgroup label={t("sortGroupMastery")}>
              <option value="mastered">{t("sortMastered")}</option>
              <option value="unknown">{t("sortUnknown")}</option>
            </optgroup>
          </select>
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder={t("searchCards")}
            aria-label={t("searchCards")}
            className="h-11 border-emerald-900/10 bg-white"
          />
        </div>
      </div>

      <CardPager
        page={safePage}
        pageCount={pageCount}
        start={filtered.length === 0 ? 0 : start + 1}
        end={Math.min(start + PAGE_SIZE, filtered.length)}
        total={filtered.length}
        onPage={(next) => {
          pendingPlay.current = null;
          for (const clip of clips.current.values()) {
            clip.pause();
            clip.currentTime = 0;
          }
          setPlayingId(null);
          setPage(next);
        }}
      />

      {editor === "new" ? (
        <div className="mt-6">
          <CardEditor
            deckId={deckId}
            card={null}
            onClose={() => setEditor(null)}
            onSaved={(result) => {
              if (result === "ok") {
                refresh();
              }
            }}
          />
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-8 text-emerald-900/70">{query ? t("noMatches") : t("emptyDeck")}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {visible.map((card) => {
            const level = mastery[card.id] ?? 0;
            const playing = playingId === card.id;

            const editing = editor !== "new" && editor?.id === card.id;

            return (
              <li
                key={card.id}
                className="rounded-3xl border border-emerald-950/10 bg-white/90 p-5 shadow-[0_24px_60px_-40px_rgba(6,78,59,0.45)]"
              >
                {editing ? (
                  <CardEditor
                    deckId={deckId}
                    card={card}
                    onClose={() => setEditor(null)}
                    onSaved={(result) => {
                      if (result === "ok") {
                        refresh();
                      }
                    }}
                  />
                ) : (
                <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium tracking-[0.16em] text-emerald-800/70 uppercase">
                      {t(`pos.${card.partOfSpeech}`)}
                      {card.gender ? ` · ${t(card.gender)}` : ""}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      {card.english}
                    </h2>
                    {card.example ? (
                      <p className="mt-2 text-emerald-950/70">
                        <MarkedText text={card.example} bold={card.exampleBold} />
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <FamiliaritySelect
                      level={level}
                      onChange={(next) => {
                        setMastery((current) => ({ ...current, [card.id]: next }));
                        void writeCardMastery(deckId, card.id, next).then((result) => {
                          if (result === "error") {
                            setSaveError(true);
                          }
                        });
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-lg"
                      className="border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
                      aria-label={playing ? t("listening") : t("listen")}
                      disabled={!sound.prefs.general || !sound.prefs.word || playing}
                      onClick={() => play(card)}
                    >
                      <Volume2 />
                    </Button>
                  </div>
                </div>
                    <p dir="rtl" lang="he" className="mt-4 text-3xl font-semibold">
                      {card.hebrew}
                    </p>
                    {card.hebrewExample ? (
                      <div dir="rtl" lang="he" className="mt-2 flex items-start gap-2">
                        {card.exampleAudioUrl ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="mt-0.5 shrink-0 border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
                            aria-label={
                              playingId === `${card.id}:example` ? t("listening") : t("listenSentence")
                            }
                            disabled={
                              !sound.prefs.general ||
                              !sound.prefs.sentence ||
                              playingId === `${card.id}:example`
                            }
                            onClick={() =>
                              playUrl(`${card.id}:example`, card.exampleAudioUrl!, "sentence")
                            }
                          >
                            <Volume2 />
                          </Button>
                        ) : null}
                        <p className="text-emerald-950/70">
                          <MarkedText text={card.hebrewExample} bold={card.hebrewExampleBold} />
                        </p>
                      </div>
                    ) : null}
                    {failedId === card.id || failedId === `${card.id}:example` ? (
                      <p className="mt-3 text-sm text-red-800" role="alert">
                        {t("speechError")}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50"
                        onClick={() => {
                          setEditor(card);
                          setConfirmDelete(null);
                        }}
                      >
                        {t("editCard")}
                      </Button>
                      {confirmDelete === card.id ? (
                        <>
                          <p className="text-sm text-emerald-900/70">{t("deleteCardConfirm")}</p>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 border-red-200 bg-white text-red-800 hover:bg-red-50"
                            onClick={() => void destroyCard(card)}
                          >
                            {t("deleteCard")}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 border-emerald-900/10 bg-white hover:bg-emerald-50"
                            onClick={() => setConfirmDelete(null)}
                          >
                            {t("cancel")}
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 border-red-200 bg-white text-red-800 hover:bg-red-50"
                          onClick={() => setConfirmDelete(card.id)}
                        >
                          {t("deleteCard")}
                        </Button>
                      )}
                    </div>
                </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {failedId === "deck" ? (
        <p className="mt-4 text-sm text-red-800" role="alert">
          {t("speechError")}
        </p>
      ) : null}
    </main>
  );
}

function CardPager({
  page,
  pageCount,
  start,
  end,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  start: number;
  end: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const t = useTranslations("Flashcards");

  if (total === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <p className="text-sm text-emerald-900/70">
        {t("cardRange", { start, end, total })}
      </p>
      {pageCount > 1 ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50"
            disabled={page === 0}
            onClick={() => onPage(page - 1)}
          >
            {t("previous")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50"
            disabled={page >= pageCount - 1}
            onClick={() => onPage(page + 1)}
          >
            {t("next")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
