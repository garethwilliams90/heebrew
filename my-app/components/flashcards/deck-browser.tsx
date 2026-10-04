"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FamiliaritySelect } from "@/components/flashcards/familiarity-select";
import { MarkedText } from "@/components/flashcards/marked-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readDeckMastery, writeCardMastery } from "@/lib/flashcards/progress";
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
  cards,
}: {
  deckId: string;
  title: string;
  cards: Flashcard[];
}) {
  const t = useTranslations("Flashcards");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CardSort>("az");
  const [page, setPage] = useState(0);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const pendingPlay = useRef<{ id: string; key: string } | null>(null);

  const usesRecordedAudio = cards.some((card) => card.audioUrl);

  useEffect(() => {
    setMastery(readDeckMastery(deckId));
  }, [deckId]);

  useEffect(() => {
    if (usesRecordedAudio) {
      return;
    }

    const created: string[] = [];
    let cancelled = false;
    const texts = [...new Set(cards.map((card) => card.hebrew).filter(Boolean))];

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

          if (pendingPlay.current?.key === clip.text) {
            const pending = pendingPlay.current;
            pendingPlay.current = null;
            startClip(pending.id, audio);
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

  function startClip(id: string, audio: HTMLAudioElement) {
    for (const clip of clips.current.values()) {
      clip.pause();
      clip.currentTime = 0;
    }

    audio.onended = () => setPlayingId((current) => (current === id ? null : current));
    setFailedId(null);
    setPlayingId(id);
    void audio.play().catch(() => {
      setPlayingId(null);
      setFailedId(id);
    });
  }

  function playUrl(id: string, url: string) {
    let audio = clips.current.get(url);

    if (!audio) {
      audio = new Audio(url);
      audio.preload = "auto";
      clips.current.set(url, audio);
    }

    pendingPlay.current = null;
    startClip(id, audio);
  }

  function play(card: Flashcard) {
    const key = card.audioUrl ?? card.hebrew;
    const audio = clips.current.get(key);

    if (!audio && card.audioUrl) {
      playUrl(card.id, card.audioUrl);
      return;
    }

    if (!audio) {
      pendingPlay.current = { id: card.id, key };
      setFailedId(null);
      setPlayingId(card.id);
      return;
    }

    pendingPlay.current = null;
    startClip(card.id, audio);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-10 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-emerald-900/70">
            {t("cardCount", { count: cards.length })}
          </p>
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

      {visible.length === 0 ? (
        <p className="mt-8 text-emerald-900/70">{t("noMatches")}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {visible.map((card) => {
            const level = mastery[card.id] ?? 0;
            const playing = playingId === card.id;

            return (
              <li
                key={card.id}
                className="rounded-3xl border border-emerald-950/10 bg-white/90 p-5 shadow-[0_24px_60px_-40px_rgba(6,78,59,0.45)]"
              >
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
                        writeCardMastery(deckId, card.id, next);
                        setMastery((current) => ({ ...current, [card.id]: next }));
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-lg"
                      className="border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
                      aria-label={playing ? t("listening") : t("listen")}
                      disabled={playing}
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
                        disabled={playingId === `${card.id}:example`}
                        onClick={() => playUrl(`${card.id}:example`, card.exampleAudioUrl!)}
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
