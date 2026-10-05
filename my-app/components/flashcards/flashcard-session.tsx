"use client";

import { useEffect, useRef, useState } from "react";
import { Leaf, Volume2 } from "lucide-react";
import { SoundControls, useSoundPrefs, type SoundChannel } from "@/components/flashcards/sound-toggle";
import { useTranslations } from "next-intl";
import { MarkedText } from "@/components/flashcards/marked-text";
import { FamiliaritySelect } from "@/components/flashcards/familiarity-select";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { loadDeckMastery, saveSessionProgress } from "@/lib/flashcards/progress";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { buildStudySession, nextMastery } from "@/lib/flashcards/review";
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
  const sound = useSoundPrefs();
  const cardsRef = useRef(cards);
  const masteryRef = useRef<Record<string, number>>({});
  const updatesRef = useRef(new Map<string, { mastery: number; practices: number }>());
  const savedRef = useRef(false);
  const savingRef = useRef<Promise<"ok" | "signed-out" | "error"> | null>(null);
  const [queue, setQueue] = useState<StudyCard[]>([]);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [speakingClip, setSpeakingClip] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const clips = useRef(new Map<string, HTMLAudioElement>());
  const pendingPlay = useRef<{
    text: string;
    nextClip: string | null;
    kind: "word" | "sentence";
  } | null>(null);
  const speakingKindRef = useRef<"word" | "sentence" | null>(null);
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
    let cancelled = false;

    loadDeckMastery(deckId)
      .then(({ signedIn: hasAccount, mastery }) => {
        if (cancelled) {
          return;
        }

        setSignedIn(hasAccount);
        masteryRef.current = mastery;
        const next = buildStudySession(cardsRef.current, mastery);
        setQueue(next);
        setSessionTotal(next.length);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        const next = buildStudySession(cardsRef.current, masteryRef.current);
        setQueue(next);
        setSessionTotal(next.length);
        setReady(true);
        setSaveError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [deckId]);

  useEffect(() => {
    if (!deckKey) {
      return;
    }
    const created: string[] = [];
    let cancelled = false;
    const texts = [...new Set(deckKey.split("\n").filter(Boolean))].slice(0, 40);

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

          if (pendingPlay.current?.text === clip.text && flippedRef.current) {
            const pending = pendingPlay.current;
            pendingPlay.current = null;
            playClip(pending.text, pending.nextClip, pending.kind);
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

  function playClip(text: string, nextClip: string | null, kind: "word" | "sentence") {
    if (!sound.allows(kind)) {
      pendingPlay.current = null;
      speakingKindRef.current = null;
      if (kind === "word" && nextClip && sound.allows("sentence")) {
        playClip(nextClip, null, "sentence");
      }
      return;
    }

    if (!clips.current.has(text) && text.startsWith("/deck-media/")) {
      const audio = new Audio(text);
      audio.preload = "auto";
      clips.current.set(text, audio);
    }

    const audio = clips.current.get(text);

    if (!audio) {
      pendingPlay.current = { text, nextClip, kind };
      if (usesRecordedAudio && !text.startsWith("/")) {
        void loadSpeechClip(text).then((loaded) => {
          if (!loaded) {
            if (pendingPlay.current?.text === text) {
              pendingPlay.current = null;
              speakingKindRef.current = null;
              setSpeakingClip(null);
              setSpeechError(true);
            }
            return;
          }
          clips.current.set(text, loaded);
          if (pendingPlay.current?.text === text) {
            playClip(text, pendingPlay.current.nextClip, pendingPlay.current.kind);
          }
        });
      }
      return;
    }

    pendingPlay.current = null;

    for (const clip of clips.current.values()) {
      clip.pause();
      clip.currentTime = 0;
    }

    audio.onended = () => {
      if (nextClip && flippedRef.current && sound.allows("sentence")) {
        playClip(nextClip, null, "sentence");
        return;
      }

      speakingKindRef.current = null;
      setSpeakingClip((current) => (current === text ? null : current));
    };
    setSpeechError(false);
    speakingKindRef.current = kind;
    setSpeakingClip(text);
    void audio.play().catch(() => {
      speakingKindRef.current = null;
      setSpeakingClip((current) => (current === text ? null : current));
      setSpeechError(true);
    });
  }

  function stopClip() {
    pendingPlay.current = null;
    speakingKindRef.current = null;

    for (const clip of clips.current.values()) {
      clip.onended = null;
      clip.pause();
      clip.currentTime = 0;
    }

    setSpeakingClip(null);
  }

  function flip() {
    const next = !flippedRef.current;
    flippedRef.current = next;
    setFlipped(next);

    if (next && hebrewRef.current && sound.allows("word")) {
      playClip(hebrewRef.current, exampleAudioRef.current, "word");
      return;
    }

    if (next && exampleAudioRef.current && sound.allows("sentence")) {
      playClip(exampleAudioRef.current, null, "sentence");
      return;
    }

    stopClip();
  }

  function applyGrade(grade: RecallGrade) {
    if (!card) {
      return;
    }

    const updated = { ...card, mastery: nextMastery(card.mastery, grade) };
    const previous = updatesRef.current.get(card.id);
    updatesRef.current.set(card.id, {
      mastery: updated.mastery,
      practices: (previous?.practices ?? 0) + 1,
    });
    masteryRef.current = { ...masteryRef.current, [card.id]: updated.mastery };
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

      if (rest.length === 0) {
        void persistSession();
      }
    }

    setFlipped(false);
    flippedRef.current = false;
    stopClip();
    setSpeechError(false);
  }

  async function persistSession() {
    if (savedRef.current) {
      return "ok" as const;
    }

    if (savingRef.current) {
      return savingRef.current;
    }

    const updates = [...updatesRef.current.entries()].map(([cardId, value]) => ({
      cardId,
      mastery: value.mastery,
      practices: value.practices,
    }));

    const request = saveSessionProgress(deckId, updates).then((result) => {
      if (result === "error") {
        setSaveError(true);
      } else {
        savedRef.current = true;
        setSaveError(false);
      }

      return result;
    });

    savingRef.current = request;
    setSaving(true);

    try {
      return await request;
    } finally {
      savingRef.current = null;
      setSaving(false);
    }
  }

  async function studyAgain() {
    const result = await persistSession();
    if (result === "error") {
      return;
    }

    updatesRef.current.clear();
    savedRef.current = false;
    const next = buildStudySession(cardsRef.current, masteryRef.current);
    setQueue(next);
    setSessionTotal(next.length);
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

    const graded = updatesRef.current.get(card.id);
    if (graded) {
      updatesRef.current.set(card.id, { ...graded, mastery: level });
    }

    masteryRef.current = { ...masteryRef.current, [card.id]: level };
    setQueue((current) =>
      current.map((item) => (item.id === card.id ? { ...item, mastery: level } : item)),
    );
  }

  function toggleSound(channel: SoundChannel) {
    const next = !sound.prefsRef.current[channel];
    sound.setChannel(channel, next);
    if (!next && (channel === "general" || channel === speakingKindRef.current)) {
      stopClip();
    }
  }

  function speak(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!card || !sound.allows("word")) {
      return;
    }

    playClip(card.audioUrl ?? card.hebrew, null, "word");
  }

  function speakExample(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!card?.exampleAudioUrl || !sound.allows("sentence")) {
      return;
    }

    playClip(card.exampleAudioUrl, null, "sentence");
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-10 sm:px-8">
      {signedIn === false ? (
        <p className="mb-4 text-center text-sm text-emerald-900/70">
          <Link href="/login" className="text-emerald-800 underline underline-offset-2">
            {t("signInToSave")}
          </Link>
        </p>
      ) : null}
      {saveError ? (
        <p className="mb-4 text-center text-sm text-red-800" role="alert">
          {t("saveError")}
        </p>
      ) : null}
      {ready && card ? (
        <StudyCardView
          card={card}
          flipped={flipped}
          speakingClip={speakingClip}
          speechError={speechError}
          soundPrefs={sound.prefs}
          onToggleSound={toggleSound}
          completed={completed}
          total={sessionTotal}
          onFlip={flip}
          onSpeak={speak}
          onSpeakExample={speakExample}
          onFamiliarity={setFamiliarity}
          onGrade={applyGrade}
        />
      ) : ready && cards.length === 0 ? (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <Leaf className="mb-4 size-8 text-emerald-800" aria-hidden />
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("emptyDeck")}</h1>
          <Button asChild className="mt-8 h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900">
            <Link href={`/?deck=${deckId}&view=cards`}>{t("addCard")}</Link>
          </Button>
        </section>
      ) : ready ? (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <Leaf className="mb-4 size-8 text-emerald-800" aria-hidden />
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">
            {t("completeTitle")}
          </h1>
          <p className="mt-3 max-w-sm text-emerald-900/70">{t("completeBody")}</p>
          <Button
            className="mt-8 h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900"
            disabled={saving}
            onClick={studyAgain}
          >
            {t("studyAgain")}
          </Button>
        </section>
      ) : null}
    </main>
  );
}

function StudyCardView({
  card,
  flipped,
  speakingClip,
  speechError,
  soundPrefs,
  onToggleSound,
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
  soundPrefs: { general: boolean; word: boolean; sentence: boolean };
  onToggleSound: (channel: SoundChannel) => void;
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
      <div className="mb-4">
        <SoundControls prefs={soundPrefs} onToggle={onToggleSound} />
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
                disabled={!soundPrefs.general || !soundPrefs.word || wordPlaying}
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
                    disabled={!soundPrefs.general || !soundPrefs.sentence || sentencePlaying}
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
