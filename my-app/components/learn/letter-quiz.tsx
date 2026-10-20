"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import useSound from "use-sound";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { PointedLetter } from "@/components/learn/pointed-letter";
import { Button } from "@/components/ui/button";
import { swipeSpring } from "@/components/flashcards/swipe-card";
import { patachCue, patachMark, type SpeechCue } from "@/lib/alephbet/intro-alphabet";
import type { LetterFact } from "@/lib/alephbet/letter-info";
import { shuffleLetters } from "@/lib/alephbet/letters";

const cardSpring = { type: "spring" as const, bounce: 0.35, visualDuration: 0.22 };
const correctTint = "#16a34a";

function deal(current: LetterFact, letters: readonly LetterFact[]) {
  const others = shuffleLetters(letters.filter((letter) => letter.id !== current.id)).slice(0, 2);
  return shuffleLetters([current, ...others]);
}

export function LetterQuiz({
  letters,
  onPlay,
  onPass,
}: {
  letters: readonly LetterFact[];
  onPlay: (cue: SpeechCue) => void | Promise<void>;
  onPass: () => void;
}) {
  const t = useTranslations("Learn");
  const [order] = useState(() => shuffleLetters(letters));
  const [index, setIndex] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [flyingId, setFlyingId] = useState<string | null>(null);
  const [choices, setChoices] = useState<LetterFact[]>(() => deal(order[0], letters));
  const [playWrong] = useSound("/sounds/samples/disable-sound.mp3", { volume: 0.5, interrupt: true });
  const playRef = useRef(onPlay);
  const armed = useRef(false);
  const armTimer = useRef<number | null>(null);
  const settled = useRef(false);
  const settleRef = useRef<() => void>(() => {});
  const current = order[index];
  const done = index >= order.length;

  playRef.current = onPlay;

  useEffect(() => {
    if (!current) {
      return;
    }

    let cancelled = false;
    armed.current = false;
    if (armTimer.current !== null) {
      window.clearTimeout(armTimer.current);
    }

    const started = Date.now();
    void Promise.resolve(playRef.current(patachCue(current))).finally(() => {
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
  }, [current]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea")) {
        return;
      }

      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        if (!current || flyingId) {
          return;
        }
        armed.current = false;
        const started = Date.now();
        void Promise.resolve(playRef.current(patachCue(current))).finally(() => {
          const wait = Math.max(0, 500 - (Date.now() - started));
          if (armTimer.current !== null) {
            window.clearTimeout(armTimer.current);
          }
          armTimer.current = window.setTimeout(() => {
            armed.current = true;
          }, wait);
        });
        return;
      }

      if (flyingId || !current) {
        return;
      }

      const choice = event.key === "1" ? 0 : event.key === "2" ? 1 : event.key === "3" ? 2 : -1;
      if (choice < 0) {
        return;
      }

      const letter = choices[choice];
      if (!letter) {
        return;
      }

      event.preventDefault();
      choose(letter);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [choices, current, flyingId]);

  function choose(letter: LetterFact) {
    if (!current || done || flyingId) {
      return;
    }

    if (letter.id !== current.id) {
      playWrong();
      setWrongId(letter.id);
      window.setTimeout(() => setWrongId((value) => (value === letter.id ? null : value)), 450);
      return;
    }

    settled.current = false;
    setWrongId(null);
    setFlyingId(letter.id);
  }

  function settle() {
    if (settled.current || !current) {
      return;
    }

    settled.current = true;
    const next = index + 1;
    setFlyingId(null);
    if (next >= order.length) {
      onPass();
    } else {
      setChoices(deal(order[next], letters));
    }
    setIndex(next);
  }

  settleRef.current = settle;

  useEffect(() => {
    if (!flyingId) {
      return;
    }

    const timer = window.setTimeout(() => settleRef.current(), 520);
    return () => window.clearTimeout(timer);
  }, [flyingId]);

  function preview(letter: LetterFact) {
    if (!armed.current || flyingId) {
      return;
    }

    void onPlay(patachCue(letter));
  }

  if (done) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="text-center">
        <p className="text-base text-emerald-900/80 sm:text-lg">{t("quizPrompt")}</p>
        <p className="mt-2 text-sm text-emerald-800">{t("quizProgress", { done: index, total: order.length })}</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="relative">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-5"
            aria-keyshortcuts="R"
            onClick={() => {
              armed.current = false;
              const started = Date.now();
              void Promise.resolve(onPlay(patachCue(current))).finally(() => {
                const wait = Math.max(0, 500 - (Date.now() - started));
                if (armTimer.current !== null) {
                  window.clearTimeout(armTimer.current);
                }
                armTimer.current = window.setTimeout(() => {
                  armed.current = true;
                }, wait);
              });
            }}
          >
            {t("quizHear")}
          </Button>
          <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-800 text-[10px] font-semibold text-white">
            R
          </span>
        </span>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-4">
        {choices.map((letter, choice) => {
          const flying = flyingId === letter.id;

          return (
            <div key={letter.id} className="flex flex-col items-center gap-2">
              <motion.button
                type="button"
                whileHover={flyingId ? undefined : { scale: 1.05, y: -4 }}
                variants={{
                  idle: { x: 0, rotate: 0 },
                  correct: { x: 640, rotate: 6 },
                }}
                initial="idle"
                animate={flying ? "correct" : "idle"}
                transition={flying ? swipeSpring : cardSpring}
                onAnimationComplete={(definition) => {
                  if (definition === "correct") {
                    settle();
                  }
                }}
                className={cn(
                  printFont.className,
                  "relative flex h-40 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 text-6xl text-black shadow-[0_18px_40px_-28px_rgba(6,78,59,0.8)] outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30",
                  wrongId === letter.id && "border-red-300 bg-red-50 text-red-700",
                )}
                style={flying ? { willChange: "transform" } : undefined}
                dir="rtl"
                lang="he"
                aria-keyshortcuts={String(choice + 1)}
                aria-label={t("quizChoice", { number: choice + 1, name: letter.name })}
                onPointerEnter={() => preview(letter)}
                onFocus={() => preview(letter)}
                onClick={() => choose(letter)}
              >
                <PointedLetter letter={letter.letter} mark={patachMark} />
                {flying ? (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.38 }}
                    transition={swipeSpring}
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
    </div>
  );
}
