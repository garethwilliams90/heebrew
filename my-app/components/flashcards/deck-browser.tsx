"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BrowserCard } from "@/components/flashcards/browser-card";
import { CardEditor } from "@/components/flashcards/card-editor";
import { CardPager } from "@/components/flashcards/card-pager";
import { DeckHeading } from "@/components/flashcards/deck-heading";
import { DeckSettings } from "@/components/flashcards/deck-settings";
import { FormDialog } from "@/components/flashcards/form-dialog";
import { useSoundPrefs, type SoundChannel } from "@/components/flashcards/sound-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { prepareSpeechClip, requestDeckSpeech } from "@/lib/flashcards/deck-speech";
import { removeCard } from "@/lib/flashcards/library";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { loadDeckMastery } from "@/lib/flashcards/progress";
import { sortCards, type CardSort } from "@/lib/flashcards/sort-cards";
import type { Flashcard } from "@/lib/flashcards/types";

const PAGE_SIZE = 20;

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
      const clipsForDeck = await requestDeckSpeech(texts);

      await Promise.all(
        clipsForDeck.map(async (clip) => {
          const { url, audio } = await prepareSpeechClip(clip.audio);
          created.push(url);

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

  const filtered = useMemo(
    () => sortCards(cards, sort, mastery, query),
    [cards, mastery, query, sort],
  );

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
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col self-center px-5 pb-16 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <DeckHeading
            deckId={deckId}
            title={title}
            description={description}
            canDelete={kind === "custom"}
            level="h1"
            titleClassName="text-4xl font-semibold tracking-tight"
            descriptionClassName="mt-2 max-w-xl text-emerald-950/70"
          />
          <p className="mt-3 text-sm text-emerald-900/70">
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
          {libraryMessage === "signed-out" ? (
            <p className="mt-2 text-sm text-emerald-900/70">{t("signInToEdit")}</p>
          ) : null}
          {libraryMessage === "error" ? (
            <p className="mt-2 text-sm text-red-800" role="alert">
              {t("libraryError")}
            </p>
          ) : null}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          <Button asChild className="h-11 bg-emerald-800 px-4 text-white hover:bg-emerald-900">
            <Link href={`/decks?deck=${deckId}&view=setup`}>{t("study")}</Link>
          </Button>
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder={t("searchCards")}
            aria-label={t("searchCards")}
            className="h-11 min-w-0 flex-1 border-emerald-900/10 bg-white lg:w-72"
          />
          <Button
            type="button"
            variant="outline"
            className="h-11 border-emerald-900/10 bg-white px-4 text-emerald-950 hover:bg-emerald-50"
            onClick={() => {
              setEditor("new");
              setConfirmDelete(null);
            }}
          >
            {t("addCard")}
          </Button>
          <DeckSettings
            sort={sort}
            onSort={(next) => {
              setSort(next);
              setPage(0);
            }}
            prefs={sound.prefs}
            onToggle={toggleSound}
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

      {editor ? (
        <FormDialog
          label={editor === "new" ? t("addCard") : t("editCard")}
          onClose={() => setEditor(null)}
          className="w-full max-w-2xl"
        >
          <CardEditor
            deckId={deckId}
            card={editor === "new" ? null : editor}
            onClose={() => setEditor(null)}
            onSaved={(result) => {
              if (result === "ok") {
                refresh();
              }
            }}
          />
        </FormDialog>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-8 text-emerald-900/70">{query ? t("noMatches") : t("emptyDeck")}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {visible.map((card) => (
            <BrowserCard
              key={card.id}
              card={card}
              level={mastery[card.id] ?? 0}
              wordPlaying={playingId === card.id}
              sentencePlaying={playingId === `${card.id}:example`}
              failed={failedId === card.id || failedId === `${card.id}:example`}
              wordEnabled={sound.prefs.general && sound.prefs.word}
              sentenceEnabled={sound.prefs.general && sound.prefs.sentence}
              confirmingDelete={confirmDelete === card.id}
              onPlayWord={() => play(card)}
              onPlaySentence={() => playUrl(`${card.id}:example`, card.exampleAudioUrl ?? "", "sentence")}
              onEdit={() => {
                setEditor(card);
                setConfirmDelete(null);
              }}
              onAskDelete={() => setConfirmDelete(card.id)}
              onCancelDelete={() => setConfirmDelete(null)}
              onDelete={() => void destroyCard(card)}
            />
          ))}
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
