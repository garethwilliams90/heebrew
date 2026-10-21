"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import useSound from "use-sound";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { BlueNikud, PointedLetter } from "@/components/learn/pointed-letter";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { Button } from "@/components/ui/button";
import { addExperience } from "@/lib/flashcards/experience";
import { nikudCue, nikudCycle, type SpeechCue } from "@/lib/alephbet/intro-alphabet";
import type { LetterFact } from "@/lib/alephbet/letter-info";
import { shuffleLetters } from "@/lib/alephbet/letters";

const cardSpring = { type: "spring" as const, bounce: 0.35, visualDuration: 0.22 };
const correctMove = { duration: 0.9, times: [0, 0.28, 0.48, 1], ease: "easeInOut" as const };
const correctTint = "#16a34a";
const lessonExperience = 6;
const variedVowels = ["tsere", "segol", "hiriq", "kubutz", "holam", "holamVav"] as const;

export type QuizCard = {
  id: string;
  name: string;
  cue: SpeechCue;
  glyph: string;
  mark?: string;
  tail?: string;
};

export type QuizRound = {
  id: string;
  correctId: string;
  prompt: SpeechCue;
  choices: QuizCard[];
};

export function LetterQuiz({
  letters,
  onPlay,
  onPass,
}: {
  letters: readonly LetterFact[];
  onPlay: (cue: SpeechCue) => void | Promise<void>;
  onPass: () => void;
}) {
  const [rounds] = useState(() => letterRounds(letters));
  return <SoundQuiz rounds={rounds} onPlay={onPlay} onPass={onPass} />;
}

export function SoundQuiz({
  rounds,
  onPlay,
  onPass,
  onLearn,
}: {
  rounds: QuizRound[];
  onPlay: (cue: SpeechCue) => void | Promise<void>;
  onPass: () => void;
  onLearn?: (card: QuizCard) => void;
}) {
  const t = useTranslations("Learn");
  const [index, setIndex] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [flyingId, setFlyingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [replayDown, setReplayDown] = useState(false);
  const [playWrong] = useSound("/sounds/samples/disable-sound.mp3", { volume: 0.5, interrupt: true });
  const [playSuccess] = useSound("/sounds/samples/success.mp3", { volume: 0.55, interrupt: true });
  const playRef = useRef(onPlay);
  const learnRef = useRef(onLearn);
  const armed = useRef(false);
  const armTimer = useRef<number | null>(null);
  const settled = useRef(false);
  const settleRef = useRef<() => void>(() => {});
  const round = rounds[index];
  const done = index >= rounds.length;

  playRef.current = onPlay;
  learnRef.current = onLearn;

  useEffect(() => {
    if (!round) {
      return;
    }

    return holdOptions(round.prompt, playRef, armed, armTimer);
  }, [round]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea")) {
        return;
      }

      if (!round) {
        return;
      }

      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        if (event.type === "keyup") {
          setReplayDown(false);
          return;
        }
        if (event.repeat || flyingId) {
          return;
        }
        setReplayDown(true);
        holdOptions(round.prompt, playRef, armed, armTimer);
        return;
      }

      if (event.type === "keyup" || flyingId) {
        return;
      }

      const choice = event.key === "1" ? 0 : event.key === "2" ? 1 : event.key === "3" ? 2 : -1;
      const card = choice < 0 ? undefined : round.choices[choice];
      if (!card) {
        return;
      }

      event.preventDefault();
      choose(card);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [round, flyingId]);

  function choose(card: QuizCard) {
    if (!round || done || flyingId) {
      return;
    }

    const correct = round.choices.find((item) => item.id === round.correctId);
    if (!correct || card.id !== correct.id) {
      playWrong();
      setWrongId(card.id);
      window.setTimeout(() => setWrongId((value) => (value === card.id ? null : value)), 450);
      return;
    }

    playSuccess();
    void addExperience(lessonExperience);
    learnRef.current?.(card);
    if (onLearn) {
      setToast(t("newWordToast"));
      window.setTimeout(() => setToast(null), 2400);
    }
    settled.current = false;
    setWrongId(null);
    setFlyingId(card.id);
  }

  function settle() {
    if (settled.current || !round) {
      return;
    }

    settled.current = true;
    const next = index + 1;
    setFlyingId(null);
    if (next >= rounds.length) {
      onPass();
    }
    setIndex(next);
  }

  settleRef.current = settle;

  useEffect(() => {
    if (!flyingId) {
      return;
    }

    const timer = window.setTimeout(() => settleRef.current(), 980);
    return () => window.clearTimeout(timer);
  }, [flyingId]);

  function preview(card: QuizCard) {
    if (!armed.current || flyingId) {
      return;
    }

    void onPlay(card.cue);
  }

  if (done || !round) {
    return null;
  }

  const answered = round.choices.find((item) => item.id === round.correctId);
  const question = Math.min(index + 1, rounds.length);
  const ratio = rounds.length === 0 ? 0 : ((index + 0.5) / rounds.length) * 100;

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3">
      <div className="flex w-full flex-col items-center gap-3">
      <div className="w-full">
        <ProgressMeter
          label={t("quizProgress", { done: question, total: rounds.length })}
          value={question}
          max={rounds.length}
          ratio={ratio}
          sections={rounds.length}
          className="h-2.5 rounded-full bg-emerald-950/10"
        />
      </div>
      <div className="text-center">
        <p className="text-base text-emerald-900/80 sm:text-lg">{t("quizPrompt")}</p>
        <p className="mt-2 text-sm text-emerald-800">{t("quizProgress", { done: question, total: rounds.length })}</p>
      </div>
      {toast
        ? createPortal(
            <p className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white shadow-lg">
              {toast}
            </p>,
            document.body,
          )
        : null}
      <div className="flex flex-col items-center gap-1">
        <motion.span
          className="relative inline-flex"
          animate={{ scale: replayDown ? 0.96 : 1 }}
          transition={{ type: "spring", bounce: 0.05, visualDuration: 0.12 }}
        >
          <Button
            type="button"
            variant="outline"
            className="h-10 px-5"
            aria-keyshortcuts="R"
            onPointerDown={() => setReplayDown(true)}
            onPointerUp={() => setReplayDown(false)}
            onPointerLeave={() => setReplayDown(false)}
            onClick={() => holdOptions(round.prompt, playRef, armed, armTimer)}
          >
            {t("quizHear")}
          </Button>
          <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-800 text-[10px] font-semibold text-white">
            R
          </span>
        </motion.span>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-4">
        {round.choices.map((card, choice) => {
          const flying = flyingId === card.id;

          return (
            <div key={card.id} className="flex flex-col items-center gap-2">
              <motion.button
                type="button"
                whileHover={flyingId ? undefined : { scale: 1.05, y: -4 }}
                variants={{
                  idle: { x: 0, y: 0, rotate: 0 },
                  correct: { x: [0, 0, 0, 640], y: [0, 0, -48, -48], rotate: [0, 0, 0, 8] },
                }}
                initial="idle"
                animate={flying ? "correct" : "idle"}
                transition={flying ? correctMove : cardSpring}
                onAnimationComplete={(definition) => {
                  if (definition === "correct") {
                    settleRef.current();
                  }
                }}
                className={cn(
                  printFont.className,
                  "relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 text-4xl text-black shadow-[0_18px_40px_-28px_rgba(6,78,59,0.8)] outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30 sm:h-32 sm:w-32 sm:text-5xl",
                  wrongId === card.id && "border-red-300 bg-red-50 text-red-700",
                )}
                style={flying ? { willChange: "transform" } : undefined}
                dir="rtl"
                lang="he"
                aria-keyshortcuts={String(choice + 1)}
                aria-label={t("quizChoice", { number: choice + 1, name: card.name })}
                onPointerEnter={() => preview(card)}
                onFocus={() => preview(card)}
                onClick={() => choose(card)}
              >
                {card.mark || card.tail ? (
                  <PointedLetter letter={card.glyph} mark={card.mark} tail={card.tail} />
                ) : (
                  <BlueNikud text={card.glyph} />
                )}
                {flying ? (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.9, 0.9, 0.55] }}
                    transition={correctMove}
                    style={{ backgroundColor: correctTint }}
                  />
                ) : null}
              </motion.button>
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-800 text-xs font-semibold text-white">
                {choice + 1}
              </span>
            </div>
          );
        })}
      </div>
      <span className="sr-only">{answered?.name}</span>
      </div>
    </div>
  );
}

function holdOptions(
  prompt: SpeechCue,
  playRef: RefObject<(cue: SpeechCue) => void | Promise<void>>,
  armed: RefObject<boolean>,
  armTimer: RefObject<number | null>,
) {
  armed.current = false;
  if (armTimer.current !== null) {
    window.clearTimeout(armTimer.current);
  }

  let cancelled = false;
  const started = Date.now();
  void Promise.resolve(playRef.current(prompt)).finally(() => {
    if (cancelled) {
      return;
    }
    const wait = Math.max(0, 500 - (Date.now() - started));
    armTimer.current = window.setTimeout(() => {
      armed.current = true;
    }, wait);
  });

  return () => {
    cancelled = true;
    if (armTimer.current !== null) {
      window.clearTimeout(armTimer.current);
    }
  };
}

function letterRounds(letters: readonly LetterFact[]): QuizRound[] {
  return shuffleLetters(letters)
    .slice(0, 6)
    .map((letter) => {
    const nikudId = Math.random() < 0.3 ? variedVowels[Math.floor(Math.random() * variedVowels.length)] : "patach";
    const nikud = nikudCycle.find((item) => item.id === nikudId) ?? nikudCycle[1];
    const others = shuffleLetters(letters.filter((item) => item.id !== letter.id)).slice(0, 2);
    const choices = shuffleLetters([letter, ...others]).map((item) => ({
      id: item.id,
      name: item.name,
      cue: nikudCue(item, nikud.id),
      glyph: item.letter,
      mark: nikud.mark,
      tail: nikud.tail,
    }));

    return {
      id: `${letter.id}-${nikud.id}`,
      correctId: letter.id,
      prompt: nikudCue(letter, nikud.id),
      choices,
    };
  });
}
