"use client";

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
import { StudyGradeBar } from "@/components/study/study-grade-bar";
import { StudyReplayButton } from "@/components/study/study-replay-button";
import { useReplayPulse } from "@/components/study/use-replay-pulse";
import { useStudyCardKeyboard } from "@/components/study/use-study-card-keyboard";
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
  const { replayOn, replayTick, replayTarget, pulse } = useReplayPulse<"word" | "sentence">();
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

  useEffect(() => {
    busyRef.current = false;
  }, [appearance]);

  function grade(next: FlashcardGrade) {
    if (!flippedRef.current || busyRef.current) {
      return;
    }

    busyRef.current = true;
    setDirection(next === "dontKnow" ? -1 : next === "know" ? 1 : 0);
    onGrade(next);
  }

  function replay() {
    const played = onReplay();
    if (!played) {
      return;
    }

    pulse(played);
  }

  useStudyCardKeyboard({
    busy: busyRef,
    onFlip,
    onLeft: () => grade("dontKnow"),
    onRight: () => grade("know"),
    onReplay: replay,
  });

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
        <StudyReplayButton
          label={wordPlaying ? t("listening") : t("listen")}
          disabled={!soundPrefs.general || !soundPrefs.word || wordPlaying}
          pulsing={replayOn && replayTarget === "word"}
          showPulse={replayTarget === "word"}
          pulseKey={replayTick}
          showShortcut
          onClick={onSpeak}
        />
      </div>
      <h2 dir="rtl" lang="he" className="mt-4 text-6xl font-semibold text-emerald-950 sm:text-7xl lg:text-8xl">
        <NikudSwap show={display.nikud} pointed={card.hebrew} plain={hebrewWord.text} />
      </h2>
      <Reveal show={Boolean(display.example && card.hebrewExample)}>
        <div dir="rtl" lang="he" className="mt-8 flex max-w-xl items-start justify-center gap-3">
          <StudyReplayButton
            className="relative mt-0.5 shrink-0"
            label={sentencePlaying ? t("listening") : t("listenSentence")}
            disabled={!soundPrefs.general || !soundPrefs.sentence || sentencePlaying}
            pulsing={replayOn && replayTarget === "sentence"}
            showPulse={replayTarget === "sentence"}
            pulseKey={replayTick}
            size="icon"
            onClick={onSpeakExample}
          />
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

      <StudyGradeBar
        flipped={flipped}
        dontKnowLabel={t("dontKnow")}
        knowLabel={t("know")}
        masteredLabel={t("mastered")}
        onDontKnow={() => grade("dontKnow")}
        onKnow={() => grade("know")}
        onMastered={() => grade("mastered")}
      />
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
