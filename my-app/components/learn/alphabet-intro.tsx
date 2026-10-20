"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import useSound from "use-sound";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { PointedLetter } from "@/components/learn/pointed-letter";
import { Button, buttonVariants } from "@/components/ui/button";
import { LetterQuiz } from "@/components/learn/letter-quiz";
import { NikudInfo } from "@/components/learn/nikud-info";
import { Link } from "@/i18n/navigation";
import {
  alphabetLetters,
  nikudCue,
  nikudCycle,
  patachCue,
  type SpeechCue,
} from "@/lib/alephbet/intro-alphabet";
import type { LetterFact } from "@/lib/alephbet/letter-info";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";

const alphabet = alphabetLetters();
const firstFive = alphabet.slice(0, 5);
const levels = ["1.0", "1.1", "1.2", "1.3", "1.4"];
const startingNikud = [0, 2, 6, 5, 8];
const stepButton = "h-16 min-w-44 px-10 text-xl";
const letterSpring = { type: "spring" as const, bounce: 0.35, visualDuration: 0.22 };

const slide = {
  enter: (direction: number) => ({ y: direction > 0 ? 72 : -72, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({ y: direction > 0 ? -72 : 72, opacity: 0 }),
};

export function AlphabetIntro() {
  const t = useTranslations("Learn");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [busy, setBusy] = useState(false);
  const [passed, setPassed] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const [nikudIndex, setNikudIndex] = useState<Record<string, number>>(() =>
    Object.fromEntries(firstFive.map((letter, index) => [letter.id, startingNikud[index]])),
  );
  const [playSwitch] = useSound("/sounds/samples/switch-on.mp3", { volume: 0.5, interrupt: true });
  const request = useRef(0);
  const playing = useRef<HTMLAudioElement | null>(null);
  const pass = useRef(() => setPassed(true));

  useEffect(() => {
    const cues: SpeechCue[] = step >= 1 ? alphabet.map(patachCue) : [];
    if (step === 2) {
      for (const letter of firstFive) {
        cues.push(nikudCue(letter, nikudCycle[nikudIndex[letter.id] ?? 0].id));
      }
    }

    for (const cue of cues) {
      void loadSpeechClip(cue.text, cue.phoneme);
    }
  }, [step, nikudIndex]);

  async function playCue(cue: SpeechCue) {
    const id = request.current + 1;
    request.current = id;
    const audio = await loadSpeechClip(cue.text, cue.phoneme);
    if (!audio || id !== request.current) {
      if (!audio && id === request.current) {
        setSpeechError(true);
      }
      return;
    }

    if (playing.current && playing.current !== audio) {
      playing.current.pause();
      playing.current.currentTime = 0;
    }

    audio.currentTime = 0;
    playing.current = audio;
    setSpeechError(false);
    try {
      await audio.play();
    } catch {
      if (id === request.current) {
        setSpeechError(true);
      }
    }
  }

  function go(next: number) {
    if (busy || next === step || next < 0 || next > 4) {
      return;
    }

    setDirection(next > step ? 1 : -1);
    setBusy(true);
    window.setTimeout(() => setBusy(false), 700);
    if (next < 4) {
      setPassed(false);
    }
    setStep(next);
  }

  function cycleNikud(letter: LetterFact) {
    const next = ((nikudIndex[letter.id] ?? 0) + 1) % nikudCycle.length;
    setNikudIndex((current) => ({ ...current, [letter.id]: next }));
    void playCue(nikudCue(letter, nikudCycle[next].id));
  }

  const body =
    step === 3 ? t("patachBody") : step === 2 ? t("nikudBody") : step === 1 ? t("introBody") : t("introBody");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", bounce: 0.12, visualDuration: 0.4 }}
            className="flex w-full flex-1 flex-col items-center justify-center gap-8"
            onAnimationComplete={(definition) => {
              if (definition === "center") {
                setBusy(false);
              }
            }}
          >
            <p className="rounded-full border border-emerald-950/15 bg-white/80 px-4 py-1 text-sm font-semibold tracking-[0.18em] text-emerald-950 uppercase">
              {t("level", { id: levels[step] })}
            </p>
            <div className="max-w-xl text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">{t("introTitle")}</h1>
              {step < 4 ? <p className="mt-3 text-base text-emerald-900/80 sm:text-lg">{body}</p> : null}
              {step === 1 ? <p className="mt-2 text-sm text-emerald-800">{t("hoverHint")}</p> : null}
              {step === 2 ? (
                <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-emerald-800">
                  <span>{t("nikudHint")}</span>
                  <NikudInfo />
                </p>
              ) : null}
            </div>

            {step === 1 ? (
              <LetterRow letters={alphabet} cue={(letter) => patachCue(letter)} label={(letter) => t("hearPatach", { name: letter.name })} onPlay={playCue} />
            ) : null}
            {step === 2 ? (
              <LetterRow
                letters={firstFive}
                focused
                cue={(letter) => nikudCue(letter, nikudCycle[nikudIndex[letter.id] ?? 0].id)}
                nikud={(letter) => nikudCycle[nikudIndex[letter.id] ?? 0]}
                label={(letter) => {
                  const nikud = nikudCycle[nikudIndex[letter.id] ?? 0];
                  return t("withNikud", { name: letter.name, nikud: t(nikud.label) });
                }}
                onPlay={playCue}
                onActivate={cycleNikud}
              />
            ) : null}
            {step === 3 ? (
              <LetterRow
                letters={alphabet}
                cue={(letter) => patachCue(letter)}
                nikud={() => nikudCycle[1]}
                label={(letter) => t("hearPatach", { name: letter.name })}
                onPlay={playCue}
              />
            ) : null}
            {step === 4 && !passed ? <LetterQuiz letters={alphabet} onPlay={playCue} onPass={pass.current} /> : null}
            {step === 4 && passed ? <p className="max-w-xl text-center text-base text-emerald-900/80 sm:text-lg">{t("quizDone")}</p> : null}
            {speechError ? <p className="text-center text-sm text-emerald-900/70">{t("speechError")}</p> : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 pt-8">
        {step === 0 ? (
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), stepButton)} onClick={() => playSwitch()}>
            {t("back")}
          </Link>
        ) : (
          <Button
            type="button"
            variant="outline"
            className={stepButton}
            disabled={busy}
            onClick={() => {
              playSwitch();
              go(step - 1);
            }}
          >
            {t("back")}
          </Button>
        )}
        {step < 4 ? (
          <Button
            type="button"
            className={stepButton}
            disabled={busy}
            onClick={() => {
              playSwitch();
              go(step + 1);
            }}
          >
            {t("next")}
          </Button>
        ) : null}
      </div>
    </main>
  );
}

function LetterRow({
  letters,
  onPlay,
  cue,
  label,
  focused = false,
  nikud,
  onActivate,
}: {
  letters: readonly LetterFact[];
  onPlay: (cue: SpeechCue) => void;
  cue: (letter: LetterFact) => SpeechCue;
  label: (letter: LetterFact) => string;
  focused?: boolean;
  nikud?: (letter: LetterFact) => { mark: string; tail: string };
  onActivate?: (letter: LetterFact) => void;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center", focused ? "gap-4 sm:gap-8" : "gap-2 sm:gap-3")}>
      {letters.map((letter) => {
        const mark = nikud?.(letter);
        const spoken = cue(letter);

        return (
          <motion.button
            key={letter.id}
            type="button"
            whileHover={{ scale: 1.06, y: -4 }}
            transition={letterSpring}
            className={cn(
              printFont.className,
              "cursor-pointer rounded-2xl px-2 py-1 text-black outline-none hover:bg-white/80 focus-visible:ring-3 focus-visible:ring-emerald-700/30",
              focused ? "text-6xl sm:text-8xl" : "text-5xl sm:text-6xl lg:text-7xl",
            )}
            dir="rtl"
            lang="he"
            aria-label={label(letter)}
            onPointerEnter={() => onPlay(spoken)}
            onFocus={() => onPlay(spoken)}
            onClick={() => onActivate?.(letter)}
          >
            {mark ? <PointedLetter letter={letter.letter} mark={mark.mark} tail={mark.tail} /> : letter.letter}
          </motion.button>
        );
      })}
    </div>
  );
}
