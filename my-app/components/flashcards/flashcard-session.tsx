"use client";

import { useEffect, useRef, useState } from "react";
import { Leaf, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { MarkedText } from "@/components/flashcards/marked-text";
import { FamiliaritySelect } from "@/components/flashcards/familiarity-select";
import { Button } from "@/components/ui/button";
import {
  clearDeckMastery,
  readDeckMastery,
  writeCardMastery,
} from "@/lib/flashcards/progress";
import { nextMastery } from "@/lib/flashcards/review";
import type {
  Flashcard,
  RecallGrade,
} from "@/lib/flashcards/types";

type StudyCard = Flashcard & { mastery: number };

const grades: RecallGrade[] = ["dontKnow", "know", "knowWell", "memorised"];

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

export function FlashcardSession({
  deckId,
  cards,
}: {
  deckId: string;
  cards: Flashcard[];
}) {
  const t = useTranslations("Flashcards");
  const cardsRef = useRef(cards);
  const [queue, setQueue] = useState<StudyCard[]>(() =>
    cards.map((card) => ({ ...card, mastery: 0 })),
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [speakingClip, setSpeakingClip] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState(false);
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const pendingPlay = useRef<string | null>(null);
  const hasCard = useRef(false);
  const flippedRef = useRef(false);
  const hebrewRef = useRef<string | null>(null);
  const exampleAudioRef = useRef<string | null>(null);

  const card = queue[index];
  const usesRecordedAudio = cards.some((item) => item.audioUrl);
  hasCard.current = Boolean(card);
  flippedRef.current = flipped;
  hebrewRef.current = card?.audioUrl ?? card?.hebrew ?? null;
  exampleAudioRef.current = card?.exampleAudioUrl ?? null;
  const deckKey = usesRecordedAudio
    ? ""
    : cards.map((item) => item.hebrew).join("\n");

  useEffect(() => {
    const saved = readDeckMastery(deckId);
    setQueue(
      cardsRef.current.map((card) => ({
        ...card,
        mastery: saved[card.id] ?? 0,
      })),
    );
  }, [deckId]);

  useEffect(() => {
    if (!deckKey) {
      return;
    }
    const created: string[] = [];
    let cancelled = false;
    const texts = [...new Set(deckKey.split("\n").filter(Boolean))];

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

          if (pendingPlay.current === clip.text && flippedRef.current) {
            playClip(clip.text);
          }
        }),
      );
    }

    void loadDeck().catch(() => {
      if (!cancelled) {
        setSpeechError(true);
      }
    });

    return () => {
      cancelled = true;
      stopClip();
      clips.current.clear();
      for (const url of created) {
        URL.revokeObjectURL(url);
      }
    };
  }, [deckKey]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== " " && event.code !== "Space") {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("button, a, input, textarea, select")
      ) {
        return;
      }

      if (!hasCard.current) {
        return;
      }

      event.preventDefault();
      flip();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!usesRecordedAudio) {
      return;
    }

    for (const item of queue.slice(index, index + 4)) {
      for (const url of [item.audioUrl, item.exampleAudioUrl]) {
        if (!url || clips.current.has(url)) {
          continue;
        }

        const audio = new Audio(url);
        audio.preload = "auto";
        clips.current.set(url, audio);
      }
    }
  }, [usesRecordedAudio, index, queue]);

  function playClip(text: string, nextClip: string | null = null) {
    if (!clips.current.has(text) && text.startsWith("/deck-media/")) {
      const audio = new Audio(text);
      audio.preload = "auto";
      clips.current.set(text, audio);
    }

    const audio = clips.current.get(text);

    if (!audio) {
      pendingPlay.current = text;
      return;
    }

    pendingPlay.current = null;

    for (const clip of clips.current.values()) {
      clip.pause();
      clip.currentTime = 0;
    }

    audio.onended = () => {
      if (nextClip && flippedRef.current) {
        playClip(nextClip);
        return;
      }

      setSpeakingClip((current) => (current === text ? null : current));
    };
    setSpeechError(false);
    setSpeakingClip(text);
    void audio.play().catch(() => {
      setSpeakingClip((current) => (current === text ? null : current));
      setSpeechError(true);
    });
  }

  function stopClip() {
    pendingPlay.current = null;

    for (const clip of clips.current.values()) {
      clip.pause();
      clip.currentTime = 0;
    }

    setSpeakingClip(null);
  }

  function flip() {
    const next = !flippedRef.current;
    flippedRef.current = next;
    setFlipped(next);

    if (next && hebrewRef.current) {
      playClip(hebrewRef.current, exampleAudioRef.current);
      return;
    }

    stopClip();
  }

  function applyGrade(grade: RecallGrade) {
    if (!card) {
      return;
    }

    const updated = { ...card, mastery: nextMastery(card.mastery, grade) };
    writeCardMastery(deckId, card.id, updated.mastery);
    const rest = queue.filter((_, itemIndex) => itemIndex !== index);

    if (grade === "dontKnow") {
      const insertAt = Math.min(index + 1, rest.length);
      rest.splice(insertAt, 0, updated);
      setQueue(rest);
      setIndex(Math.min(index, rest.length - 1));
    } else {
      setCompleted((count) => count + 1);
      setQueue(rest);
      setIndex(rest.length === 0 ? 0 : Math.min(index, rest.length - 1));
    }

    setFlipped(false);
    flippedRef.current = false;
    stopClip();
    setSpeechError(false);
  }

  function studyAgain() {
    clearDeckMastery(deckId);
    setQueue(cards.map((item) => ({ ...item, mastery: 0 })));
    setIndex(0);
    setCompleted(0);
    setFlipped(false);
    flippedRef.current = false;
    stopClip();
    setSpeechError(false);
  }

  function setFamiliarity(level: number) {
    if (!card) {
      return;
    }

    writeCardMastery(deckId, card.id, level);
    setQueue((current) =>
      current.map((item) => (item.id === card.id ? { ...item, mastery: level } : item)),
    );
  }

  function speak(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!card) {
      return;
    }

    playClip(card.audioUrl ?? card.hebrew);
  }

  function speakExample(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!card?.exampleAudioUrl) {
      return;
    }

    playClip(card.exampleAudioUrl);
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-10 sm:px-8">
      {card ? (
        <StudyCardView
          card={card}
          flipped={flipped}
          speakingClip={speakingClip}
          speechError={speechError}
          completed={completed}
          total={cards.length}
          onFlip={flip}
          onSpeak={speak}
          onSpeakExample={speakExample}
          onFamiliarity={setFamiliarity}
          onGrade={applyGrade}
        />
      ) : (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <Leaf className="mb-4 size-8 text-emerald-800" aria-hidden />
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">
            {t("completeTitle")}
          </h1>
          <p className="mt-3 max-w-sm text-emerald-900/70">{t("completeBody")}</p>
          <Button
            className="mt-8 h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900"
            onClick={studyAgain}
          >
            {t("studyAgain")}
          </Button>
        </section>
      )}
    </main>
  );
}

function StudyCardView({
  card,
  flipped,
  speakingClip,
  speechError,
  completed,
  total,
  onFlip,
  onSpeak,
  onSpeakExample,
  onFamiliarity,
  onGrade,
}: {
  card: StudyCard;
  flipped: boolean;
  speakingClip: string | null;
  speechError: boolean;
  completed: number;
  total: number;
  onFlip: () => void;
  onSpeak: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSpeakExample: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFamiliarity: (level: number) => void;
  onGrade: (grade: RecallGrade) => void;
}) {
  const t = useTranslations("Flashcards");
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const wordKey = card.audioUrl ?? card.hebrew;
  const wordPlaying = speakingClip === wordKey;
  const sentencePlaying = speakingClip === card.exampleAudioUrl;

  return (
    <div className="flex w-full max-w-xl flex-1 flex-col justify-center">
      <div className="mb-4 flex items-center justify-between gap-4 text-sm text-emerald-900/70">
        <p>{t("progress", { done: completed, total })}</p>
        <FamiliaritySelect level={card.mastery} onChange={onFamiliarity} />
      </div>
      <div
        className="mb-6 h-1.5 overflow-hidden rounded-full bg-emerald-950/10"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-emerald-700 transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="perspective-distant">
        <div
          onClick={onFlip}
          className={`relative h-80 transform-3d cursor-pointer rounded-[2rem] transition-transform duration-500 motion-reduce:transition-none sm:h-96 ${flipped ? "transform-[rotateY(180deg)]" : ""}`}
        >
          <CardFace className={flipped ? "pointer-events-none" : ""}>
            <p className="text-xs font-medium tracking-[0.16em] text-emerald-800/70 uppercase">
              {t(`pos.${card.partOfSpeech}`)}
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-emerald-950 sm:text-6xl">
              {card.english}
            </h1>
            {card.example ? (
              <p className="mt-6 max-w-sm text-lg text-emerald-950/70">
                <MarkedText text={card.example} bold={card.exampleBold} />
              </p>
            ) : null}
          </CardFace>
          <CardFace
            className={`transform-[rotateY(180deg)] ${flipped ? "" : "pointer-events-none"}`}
          >
            <div className="flex items-center gap-3">
              {card.gender ? (
                <p className="text-xs font-medium tracking-[0.16em] text-emerald-800/70 uppercase">
                  {t(card.gender)}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
                aria-label={wordPlaying ? t("listening") : t("listen")}
                disabled={wordPlaying}
                onClick={onSpeak}
              >
                <Volume2 />
              </Button>
            </div>
            <h2
              dir="rtl"
              lang="he"
              className="mt-4 text-6xl font-semibold text-emerald-950"
            >
              {card.hebrew}
            </h2>
            {card.hebrewExample ? (
              <div
                dir="rtl"
                lang="he"
                className="mt-6 flex max-w-sm items-start justify-center gap-2"
              >
                {card.exampleAudioUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mt-0.5 shrink-0 border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50"
                    aria-label={sentencePlaying ? t("listening") : t("listenSentence")}
                    disabled={sentencePlaying}
                    onClick={onSpeakExample}
                  >
                    <Volume2 />
                  </Button>
                ) : null}
                <p className="text-lg text-emerald-950/70">
                  <MarkedText text={card.hebrewExample} bold={card.hebrewExampleBold} />
                </p>
              </div>
            ) : null}
          </CardFace>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-emerald-900/60">{t("flipHint")}</p>
      {speechError ? (
        <p className="mt-2 text-center text-sm text-red-800" role="alert">
          {t("speechError")}
        </p>
      ) : null}

      <div
        className={`mt-4 grid grid-cols-2 gap-2 transition-opacity duration-300 sm:grid-cols-4 ${flipped ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        {grades.map((grade) => (
          <Button
            key={grade}
            type="button"
            variant={grade === "memorised" ? "default" : "outline"}
            className={
              grade === "memorised"
                ? "h-12 bg-emerald-800 text-white hover:bg-emerald-900"
                : "h-12 border-emerald-900/10 bg-white text-emerald-950 hover:bg-emerald-50"
            }
            disabled={!flipped}
            onClick={() => onGrade(grade)}
          >
            {t(grade)}
          </Button>
        ))}
      </div>
    </div>
  );
}

function CardFace({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-emerald-950/10 bg-white/90 px-8 text-center shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)] backface-hidden ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
