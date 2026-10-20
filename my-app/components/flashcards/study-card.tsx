"use client";

import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { CardFace, SwipeCard, type SwipeDirection } from "@/components/flashcards/swipe-card";
import { GenderMark } from "@/components/flashcards/gender-mark";
import { MarkedText } from "@/components/flashcards/marked-text";
import { MasteryRing } from "@/components/flashcards/mastery-ring";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { type SoundChannel, type SoundPrefs } from "@/components/flashcards/sound-toggle";
import { StudyTools, type CardDisplay } from "@/components/flashcards/study-tools";
import { Button } from "@/components/ui/button";
import { withoutNiqqud } from "@/lib/flashcards/bold";
import type { CardMemory, FlashcardGrade } from "@/lib/flashcards/schedule";
import { TRIAL_SECONDS } from "@/lib/flashcards/study-plan";
import type { Flashcard } from "@/lib/flashcards/types";

export type StudyCard = Flashcard & { memory: CardMemory; repeats: number };

const revealSpring = { type: "spring" as const, bounce: 0.12, visualDuration: 0.28 };
const nikudFade = { duration: 0.22, ease: "easeOut" as const };

export function StudyCardView({
  card,
  flipped,
  speakingClip,
  speechError,
  soundPrefs,
  onToggleSound,
  display,
  onToggleDisplay,
  completed,
  total,
  onFlip,
  onSpeak,
  onSpeakExample,
  onReplay,
  onGrade,
  trial = null,
}: {
  card: StudyCard;
  flipped: boolean;
  speakingClip: string | null;
  speechError: boolean;
  soundPrefs: SoundPrefs;
  onToggleSound: (channel: SoundChannel) => void;
  display: CardDisplay;
  onToggleDisplay: (key: keyof CardDisplay) => void;
  completed: number;
  total: number;
  onFlip: () => void;
  onSpeak: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSpeakExample: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onReplay: () => "word" | "sentence" | null;
  onGrade: (grade: FlashcardGrade) => void;
  trial?: { secondsLeft: number; multiplier: number } | null;
}) {
  const t = useTranslations("Flashcards");
  const [direction, setDirection] = useState<SwipeDirection>(1);
  const flippedRef = useRef(flipped);
  const busyRef = useRef(false);
  const flipRef = useRef(onFlip);
  const requestRef = useRef<(grade: FlashcardGrade) => void>(() => {});
  const replayRef = useRef<() => void>(() => {});
  const [replayTick, setReplayTick] = useState(0);
  const [replayTarget, setReplayTarget] = useState<"word" | "sentence" | null>(null);
  const [replayOn, setReplayOn] = useState(false);
  const replayTimer = useRef<number | null>(null);
  const appearance = `${card.id}:${card.repeats}:${card.memory.dueAt ?? "new"}`;
  const clockSeconds = trial ? Math.max(0, Math.ceil(trial.secondsLeft)) : 0;
  const ratio = trial
    ? Math.max(0, Math.min(100, (trial.secondsLeft / TRIAL_SECONDS) * 100))
    : total === 0
      ? 0
      : Math.round((completed / total) * 100);
  const wordKey = card.audioUrl ?? card.hebrew;
  const wordPlaying = speakingClip === wordKey;
  const sentenceKey = card.exampleAudioUrl || card.hebrewExample;
  const sentencePlaying = speakingClip === sentenceKey;

  flippedRef.current = flipped;
  flipRef.current = onFlip;

  useEffect(() => {
    busyRef.current = false;
  }, [appearance]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select")) {
        return;
      }

      if (event.repeat || busyRef.current) {
        return;
      }

      if (event.key === " " || event.code === "Space") {
        if (target instanceof HTMLElement && target.closest("button, a")) {
          return;
        }

        event.preventDefault();
        flipRef.current();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        requestRef.current("dontKnow");
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        requestRef.current("know");
        return;
      }

      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        replayRef.current();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function grade(next: FlashcardGrade) {
    if (!flippedRef.current || busyRef.current) {
      return;
    }

    busyRef.current = true;
    setDirection(next === "dontKnow" ? -1 : next === "know" ? 1 : 0);
    onGrade(next);
  }

  requestRef.current = grade;

  function replay() {
    const played = onReplay();
    if (!played) {
      return;
    }

    setReplayTarget(played);
    setReplayTick((tick) => tick + 1);
    setReplayOn(true);
    if (replayTimer.current !== null) {
      window.clearTimeout(replayTimer.current);
    }
    replayTimer.current = window.setTimeout(() => setReplayOn(false), 450);
  }

  replayRef.current = replay;

  const hebrewWord = display.nikud ? { text: card.hebrew } : withoutNiqqud(card.hebrew);
  const hebrewSentence = display.nikud
    ? { text: card.hebrewExample, bold: card.hebrewExampleBold }
    : withoutNiqqud(card.hebrewExample, card.hebrewExampleBold);

  const englishFace = (
    <>
      <p className="text-xs font-medium tracking-[0.16em] text-emerald-800/70 uppercase sm:text-sm">
        {t(`pos.${card.partOfSpeech}`)}
      </p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight text-emerald-950 sm:text-7xl lg:text-8xl">
        {card.english}
      </h1>
      <Reveal show={Boolean(display.example && card.example)}>
        <p className="mt-8 max-w-xl text-xl text-emerald-950/70 sm:text-2xl">
          <MarkedText text={card.example} bold={card.exampleBold} />
        </p>
      </Reveal>
    </>
  );
  const hebrewFace = (
    <>
      <div className="flex items-center gap-3">
        {card.gender ? <GenderMark gender={card.gender} /> : null}
        <span className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className={`border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50 ${
              replayOn && replayTarget === "word" ? "ring-2 ring-emerald-500" : ""
            }`}
            aria-keyshortcuts="R"
            aria-label={wordPlaying ? t("listening") : t("listen")}
            disabled={!soundPrefs.general || !soundPrefs.word || wordPlaying}
            onClick={onSpeak}
          >
            <Volume2 />
          </Button>
          <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-emerald-800 text-[9px] font-semibold text-white">
            R
          </span>
          {replayTarget === "word" ? (
            <motion.span
              key={replayTick}
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-600"
              initial={{ opacity: 0.75, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
            />
          ) : null}
        </span>
      </div>
      <h2 dir="rtl" lang="he" className="mt-4 text-6xl font-semibold text-emerald-950 sm:text-7xl lg:text-8xl">
        <NikudSwap show={display.nikud} pointed={card.hebrew} plain={hebrewWord.text} />
      </h2>
      <Reveal show={Boolean(display.example && card.hebrewExample)}>
        <div dir="rtl" lang="he" className="mt-8 flex max-w-xl items-start justify-center gap-3">
          <span className="relative mt-0.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={`border-emerald-900/10 bg-white text-emerald-900 hover:bg-emerald-50 ${
                replayOn && replayTarget === "sentence" ? "ring-2 ring-emerald-500" : ""
              }`}
              aria-label={sentencePlaying ? t("listening") : t("listenSentence")}
              disabled={!soundPrefs.general || !soundPrefs.sentence || sentencePlaying}
              onClick={onSpeakExample}
            >
              <Volume2 />
            </Button>
            {replayTarget === "sentence" ? (
              <motion.span
                key={replayTick}
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-600"
                initial={{ opacity: 0.75, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{ willChange: "transform, opacity" }}
              />
            ) : null}
          </span>
          <p className="text-xl text-emerald-950/70 sm:text-2xl">
            <NikudSwap
              show={display.nikud}
              pointed={<MarkedText text={card.hebrewExample} bold={card.hebrewExampleBold} />}
              plain={<MarkedText text={hebrewSentence.text} bold={hebrewSentence.bold} />}
            />
          </p>
        </div>
      </Reveal>
    </>
  );

  return (
    <div className="flex min-h-0 w-full max-w-6xl flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between gap-4 text-sm text-emerald-900/70">
        {trial ? (
          <p className={clockSeconds <= 10 ? "font-semibold text-orange-700 tabular-nums" : "tabular-nums"}>
            {t("trialClock", { seconds: clockSeconds })}
            <motion.span
              key={trial.multiplier}
              className="ms-3 inline-block font-semibold text-emerald-800"
              initial={{ scale: 1.28 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.35, visualDuration: 0.22 }}
            >
              {t("trialMultiplier", { multiplier: trial.multiplier })}
            </motion.span>
          </p>
        ) : (
          <p>{t("progress", { done: completed, total })}</p>
        )}
        <MasteryRing level={card.memory.mastery} />
      </div>
      <div className="mb-4">
        <StudyTools
          soundPrefs={soundPrefs}
          onToggleSound={onToggleSound}
          display={display}
          onToggleDisplay={onToggleDisplay}
        />
      </div>
      <div className="mb-6">
        <ProgressMeter
          className="h-1.5 rounded-full"
          label={trial ? t("trialClock", { seconds: clockSeconds }) : t("progress", { done: completed, total })}
          value={trial ? clockSeconds : completed}
          max={trial ? TRIAL_SECONDS : Math.max(total, 1)}
          ratio={ratio}
          sections={trial ? undefined : total}
          pace={trial ? "tick" : "glide"}
          barClassName={trial && clockSeconds <= 10 ? "bg-orange-600" : "bg-emerald-700"}
        />
      </div>

      <div className="relative min-h-0 w-full flex-1 basis-0">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <SwipeCard key={appearance} flipped={flipped} onFlip={onFlip}>
            <CardFace className={flipped ? "pointer-events-none" : ""}>{englishFace}</CardFace>
            <CardFace className={`transform-[rotateY(180deg)] ${flipped ? "" : "pointer-events-none"}`}>
              {hebrewFace}
            </CardFace>
          </SwipeCard>
        </AnimatePresence>
      </div>

      <p className="mt-4 text-center text-sm text-emerald-900/60">{t("flipHint")}</p>
      {speechError ? (
        <p className="mt-2 text-center text-sm text-red-800" role="alert">
          {t("speechError")}
        </p>
      ) : null}

      <div
        className={`mt-4 transition-opacity duration-200 ${flipped ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-14 border-red-200 bg-white text-red-800 hover:bg-red-50"
            disabled={!flipped}
            onClick={() => grade("dontKnow")}
          >
            {t("dontKnow")}
            <ArrowLeft className="size-5" strokeWidth={3} />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-14 border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50"
            disabled={!flipped}
            onClick={() => grade("know")}
          >
            {t("know")}
            <ArrowRight className="size-5" strokeWidth={3} />
          </Button>
        </div>
        <div className="flex justify-center">
          <Button
            type="button"
            className="mt-3 h-12 w-2/3 bg-emerald-800 text-white hover:bg-emerald-900"
            disabled={!flipped}
            onClick={() => grade("mastered")}
            >
            {t("mastered")}
          </Button>
          </div>
      </div>
    </div>
  );
}

function Reveal({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.div
          key="shown"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={revealSpring}
          style={{ overflow: "hidden", willChange: "height, opacity" }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function NikudSwap({
  show,
  pointed,
  plain,
}: {
  show: boolean;
  pointed: React.ReactNode;
  plain: React.ReactNode;
}) {
  return (
    <span className="inline-grid justify-items-center">
      <motion.span
        className="col-start-1 row-start-1"
        animate={{ opacity: show ? 1 : 0 }}
        transition={nikudFade}
        aria-hidden={!show}
        style={{ willChange: "opacity" }}
      >
        {pointed}
      </motion.span>
      <motion.span
        className="col-start-1 row-start-1"
        animate={{ opacity: show ? 0 : 1 }}
        transition={nikudFade}
        aria-hidden={show}
        style={{ willChange: "opacity" }}
      >
        {plain}
      </motion.span>
    </span>
  );
}
