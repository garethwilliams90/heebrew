"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { useCue } from "@/components/settings/use-cue";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { HearReplayButton } from "@/components/learn/hear-replay";
import { PracticeQuizHeader } from "@/components/learn/practice-quiz-header";
import { usePracticeHearts } from "@/components/learn/use-practice-hearts";
import { BlueNikud, PointedLetter } from "@/components/learn/pointed-letter";
import { addExperience } from "@/lib/flashcards/experience";
import { armAfterSpeech } from "@/lib/learn/arm-after-speech";
import { LESSON_EXPERIENCE } from "@/lib/learn/lesson-experience";
import { nikudCue, nikudCycle, type SpeechCue } from "@/lib/alephbet/intro-alphabet";
import type { LetterFact } from "@/lib/alephbet/letter-info";
import { shuffleLetters } from "@/lib/alephbet/letters";

const cardSpring = { type: "spring" as const, bounce: 0.35, visualDuration: 0.22 };
const correctMove = { duration: 0.9, times: [0, 0.28, 0.48, 1], ease: "easeInOut" as const };
const correctTint = "#16a34a";
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
  pool,
  onPlay,
  onPass,
}: {
  letters: readonly LetterFact[];
  pool?: readonly LetterFact[];
  onPlay: (cue: SpeechCue) => void | Promise<void>;
  onPass: () => void;
}) {
  const [rounds] = useState(() => letterRounds(letters, pool ?? letters));
  return <SoundQuiz rounds={rounds} onPlay={onPlay} onPass={onPass} />;
}

export function SoundQuiz({
  rounds,
  onPlay,
  onPass,
  onLearn,
  dense = false,
  prompt,
}: {
  rounds: QuizRound[];
  onPlay: (cue: SpeechCue) => void | Promise<void>;
  onPass: () => void;
  onLearn?: (card: QuizCard) => void;
  dense?: boolean;
  prompt?: string;
}) {
  const t = useTranslations("Learn");
  const [index, setIndex] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [flyingId, setFlyingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { halves, failed, loseHeart, resetHearts } = usePracticeHearts();
  const [hidden, setHidden] = useState<string[]>([]);
  const playWrong = useCue("wrong");
  const playSuccess = useCue("success");
  const playRef = useRef(onPlay);
  const learnRef = useRef(onLearn);
  const armed = useRef(false);
  const armTimer = useRef<number | null>(null);
  const settled = useRef(false);
  const answering = useRef(false);
  const settleRef = useRef<() => void>(() => {});
  const round = rounds[index];
  const done = index >= rounds.length;

  playRef.current = onPlay;
  learnRef.current = onLearn;

  useEffect(() => {
    if (!round) {
      return;
    }

    const learned = round.choices.find((item) => item.id === round.correctId);
    if (learned) {
      learnRef.current?.(learned);
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

      if (event.type === "keyup" || flyingId || failed) {
        return;
      }

      const visible = round.choices.filter((item) => !hidden.includes(item.id));
      const choice = event.key === "1" ? 0 : event.key === "2" ? 1 : event.key === "3" ? 2 : -1;
      const card = choice < 0 ? undefined : visible[choice];
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
  }, [round, flyingId, failed, hidden]);

  async function choose(card: QuizCard) {
    if (!round || done || flyingId || failed || answering.current) {
      return;
    }

    answering.current = true;
    try {
      await Promise.resolve(playRef.current(card.cue));
    } catch {
      // A missing clip still counts as an answer.
    }

    const correct = round.choices.find((item) => item.id === round.correctId);
    if (!correct || card.id !== correct.id) {
      playWrong();
      setWrongId(card.id);
      loseHeart(2);
      window.setTimeout(() => {
        setWrongId((value) => (value === card.id ? null : value));
        answering.current = false;
      }, 450);
      return;
    }

    playSuccess();
    learnRef.current?.(card);
    if (onLearn) {
      setToast(t("newWordToast"));
      window.setTimeout(() => setToast(null), 2400);
    }
    settled.current = false;
    setWrongId(null);
    setHidden([]);
    setFlyingId(card.id);
    answering.current = false;
  }

  function hint() {
    if (!round || failed || flyingId || halves < 1) {
      return;
    }

    const wrongs = round.choices.filter((item) => item.id !== round.correctId && !hidden.includes(item.id));
    const pick = wrongs[Math.floor(Math.random() * wrongs.length)];
    if (!pick) {
      return;
    }

    setHidden((current) => [...current, pick.id]);
    loseHeart(1);
  }

  function retry() {
    answering.current = false;
    settled.current = false;
    resetHearts();
    setHidden([]);
    setWrongId(null);
    setFlyingId(null);
    setIndex(0);
  }

  function settle() {
    if (settled.current || !round) {
      return;
    }

    settled.current = true;
    const next = index + 1;
    setFlyingId(null);
    if (next >= rounds.length) {
      void addExperience(rounds.length * LESSON_EXPERIENCE);
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

  if (done || !round) {
    return null;
  }

  const answered = round.choices.find((item) => item.id === round.correctId);
  const visible = round.choices.filter((item) => !hidden.includes(item.id));
  const wrongLeft = round.choices.filter((item) => item.id !== round.correctId && !hidden.includes(item.id)).length;
  const question = Math.min(index + 1, rounds.length);
  const ratio = rounds.length === 0 ? 0 : ((index + 0.5) / rounds.length) * 100;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center gap-3">
      <div className="w-full shrink-0">
      <PracticeQuizHeader
        question={question}
        total={rounds.length}
        ratio={ratio}
        halves={halves}
        failed={failed}
        prompt={prompt ?? t("quizPrompt")}
        hintDisabled={failed || halves < 1 || wrongLeft < 1}
        onHint={hint}
        onRetry={retry}
      />
      </div>
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3 overflow-y-auto">
      {toast
        ? createPortal(
            <p className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white shadow-lg">
              {toast}
            </p>,
            document.body,
          )
        : null}
      <div className="flex flex-col items-center gap-1">
        <HearReplayButton onHear={() => {
          if (flyingId) {
            return;
          }
          holdOptions(round.prompt, playRef, armed, armTimer);
        }}>
          {t("quizHear")}
        </HearReplayButton>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-4">
        {failed
          ? null
          : visible.map((card, choice) => {
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
                  dense
                    ? "relative flex min-h-28 w-44 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 px-3 py-4 text-lg leading-snug text-black shadow-[0_18px_40px_-28px_rgba(6,78,59,0.8)] outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30 sm:w-52"
                    : "relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 text-4xl text-black shadow-[0_18px_40px_-28px_rgba(6,78,59,0.8)] outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30 sm:h-32 sm:w-32 sm:text-5xl",
                  wrongId === card.id && "border-red-300 bg-red-50 text-red-700",
                )}
                style={flying ? { willChange: "transform" } : undefined}
                dir="rtl"
                lang="he"
                aria-keyshortcuts={String(choice + 1)}
                aria-label={t("quizChoice", { number: choice + 1, name: card.name })}
                onClick={() => void choose(card)}
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
  let cancelled = false;
  armAfterSpeech(
    () => playRef.current(prompt),
    armTimer,
    () => {
      armed.current = true;
    },
    () => !cancelled,
  );

  return () => {
    cancelled = true;
    if (armTimer.current !== null) {
      window.clearTimeout(armTimer.current);
    }
  };
}

function letterRounds(letters: readonly LetterFact[], pool: readonly LetterFact[]): QuizRound[] {
  const base = shuffleLetters(letters);
  const prompts = base.length >= 6 ? base.slice(0, 6) : Array.from({ length: 6 }, (_, index) => base[index % base.length]);

  return prompts.map((letter, promptIndex) => {
    const nikudId = Math.random() < 0.3 ? variedVowels[Math.floor(Math.random() * variedVowels.length)] : "patach";
    const nikud = nikudCycle.find((item) => item.id === nikudId) ?? nikudCycle[1];
    const others = shuffleLetters(pool.filter((item) => item.id !== letter.id)).slice(0, 2);
    const choices = shuffleLetters([letter, ...others]).map((item) => ({
      id: item.id,
      name: item.name,
      cue: nikudCue(item, nikud.id),
      glyph: item.letter,
      mark: nikud.mark,
      tail: nikud.tail,
    }));

    return {
      id: `${letter.id}-${nikud.id}-${promptIndex}`,
      correctId: letter.id,
      prompt: nikudCue(letter, nikud.id),
      choices,
    };
  });
}
