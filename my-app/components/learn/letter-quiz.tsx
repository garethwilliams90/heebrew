"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import useSound from "use-sound";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { PointedLetter } from "@/components/learn/pointed-letter";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { Button } from "@/components/ui/button";
import { addExperience, loadExperience, placeExperience } from "@/lib/flashcards/experience";
import { nikudCue, nikudCycle, type SpeechCue } from "@/lib/alephbet/intro-alphabet";
import type { LetterFact } from "@/lib/alephbet/letter-info";
import { shuffleLetters } from "@/lib/alephbet/letters";

const cardSpring = { type: "spring" as const, bounce: 0.35, visualDuration: 0.22 };
const correctMove = { duration: 0.9, times: [0, 0.28, 0.48, 1], ease: "easeInOut" as const };
const correctTint = "#16a34a";
const lessonExperience = 6;
const variedVowels = ["tsere", "segol", "hiriq", "kubutz", "shuruk", "holam", "holamVav"] as const;

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
  const xpLabel = useTranslations("Flashcards");
  const [index, setIndex] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [flyingId, setFlyingId] = useState<string | null>(null);
  const [learned, setLearned] = useState<string | null>(null);
  const [replayDown, setReplayDown] = useState(false);
  const [experience, setExperience] = useState(0);
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
  const place = placeExperience(experience);

  playRef.current = onPlay;
  learnRef.current = onLearn;

  useEffect(() => {
    void loadExperience().then((saved) => setExperience(saved.experience));
  }, []);

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
    setExperience((value) => value + lessonExperience);
    void addExperience(lessonExperience);
    learnRef.current?.(card);
    if (onLearn) {
      setLearned(card.name);
      window.setTimeout(() => setLearned(null), 2400);
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

  function ExperienceTube({ total, label, detail }: { total: number; label: string; detail: string }) {
  const place = placeExperience(total);
  const ratio = place.span === 0 ? 0 : (place.into / place.span) * 100;

  return (
    <div className="pointer-events-none fixed top-28 right-4 bottom-28 z-20 flex w-8 flex-col items-center">
      <p className="mb-2 text-center text-[10px] font-semibold tracking-wide text-emerald-900">{label}</p>
      <div className="relative h-full w-full overflow-hidden rounded-full border border-white/80 bg-white/25 shadow-[inset_0_10px_14px_rgba(255,255,255,0.75),inset_0_-10px_14px_rgba(6,78,59,0.28),0_10px_24px_rgba(6,78,59,0.22)]">
        <div
          className="absolute inset-x-0 bottom-0 transition-[height] duration-500"
          style={{
            height: `${ratio}%`,
            background: "linear-gradient(180deg, #ecfdf5 0%, #6ee7b7 28%, #10b981 62%, #047857 100%)",
            boxShadow: "inset 3px 0 6px rgba(255,255,255,0.75), inset -2px 0 4px rgba(6,78,59,0.25)",
          }}
        />
        <div className="pointer-events-none absolute inset-y-2 left-1 w-1 rounded-full bg-white/70" />
      </div>
      <p className="mt-2 max-w-16 text-center text-[10px] text-emerald-900/70">{detail}</p>
    </div>
  );
}

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
  const ratio = rounds.length === 0 ? 0 : (index / rounds.length) * 100;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
        <ProgressMeter
          label={t("quizProgress", { done: index, total: rounds.length })}
          value={index}
          max={rounds.length}
          ratio={ratio}
          sections={rounds.length}
          className="h-2.5 rounded-none"
        />
      </div>
      <ExperienceTube total={experience} label={xpLabel("levelLabel", { level: place.level })} detail={xpLabel("experienceProgress", { into: place.into, span: place.span })} />
      <div className="text-center">
        <p className="text-base text-emerald-900/80 sm:text-lg">{t("quizPrompt")}</p>
        <p className="mt-2 text-sm text-emerald-800">{t("quizProgress", { done: index, total: rounds.length })}</p>
      </div>
      {learned ? <p className="max-w-md text-center text-sm font-medium text-emerald-800">{t("newWord", { word: learned })}</p> : null}
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
                  "relative flex h-40 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 text-5xl text-black shadow-[0_18px_40px_-28px_rgba(6,78,59,0.8)] outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30",
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
                <PointedLetter letter={card.glyph} mark={card.mark} tail={card.tail} />
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
