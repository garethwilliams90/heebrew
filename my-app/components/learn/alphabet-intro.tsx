"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useCue } from "@/components/settings/use-cue";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { PointedLetter } from "@/components/learn/pointed-letter";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConsonantSpeak } from "@/components/learn/consonant-speak";
import { LetterQuiz } from "@/components/learn/letter-quiz";
import { NikudDropQuiz } from "@/components/learn/nikud-drop-quiz";
import { LevelTwo } from "@/components/learn/level-two";
import { ExperienceTube } from "@/components/learn/experience-tube";
import { LevelClose, NextLevelLink } from "@/components/learn/level-finish";
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
import { playAudio } from "@/lib/settings/master-volume";
import { completeCurriculumLevel, curriculumLevel, stageLevel } from "@/lib/learn/curriculum";
import { learnStages } from "@/lib/learn/stages";
import { markLearningStarted } from "@/lib/learn/started";
import { DevLevelControl, useLocalhost } from "@/components/learn/dev-level";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

const alphabet = alphabetLetters();
const dalet = alphabet.find((letter) => letter.id === "dalet");
const daletNikud = [nikudCycle[0], nikudCycle[2], nikudCycle[5], nikudCycle[6], nikudCycle[8]];
const levels = learnStages;
const stepButton = "h-12 min-w-36 px-8 text-lg";
const letterSpring = { type: "spring" as const, bounce: 0.35, visualDuration: 0.22 };

const slide = {
  enter: (direction: number) => ({ y: direction > 0 ? 72 : -72, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({ y: direction > 0 ? -72 : 72, opacity: 0 }),
};

export function AlphabetIntro({ initialStep = 0 }: { initialStep?: number }) {
  const t = useTranslations("Learn");
  const router = useRouter();
  const local = useLocalhost();
  const [step, setStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);
  const [busy, setBusy] = useState(false);
  const [passed, setPassed] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const [held, setHeld] = useState<"back" | "next" | null>(null);
  const playSwitch = useCue("/sounds/samples/switch-on.mp3");
  const request = useRef(0);
  const playing = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    markLearningStarted();
  }, []);

  useEffect(() => {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return;
    }
    const stage = levels[step];
    if (stage && stageLevel(stage) > curriculumLevel()) {
      router.replace("/");
    }
  }, [router, step]);

  const canNext = step === 0 || step === 2 || step === 3 || (step > 6 && step < 11) || step === 12;
  const goRef = useRef<(next: number) => void>(() => {});
  const playRef = useRef(playSwitch);
  playRef.current = playSwitch;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea")) {
        return;
      }

      const forward = event.key === "ArrowRight";
      const backward = event.key === "ArrowLeft";
      if (!forward && !backward) {
        return;
      }

      event.preventDefault();
      if (event.type === "keydown") {
        if (event.repeat) {
          return;
        }
        if (forward && canNext) {
          setHeld("next");
        }
        if (backward) {
          setHeld("back");
        }
        return;
      }

      setHeld(null);
      if (busy) {
        return;
      }
      if (forward && canNext) {
        playRef.current();
        goRef.current(step + 1);
      }
      if (backward) {
        playRef.current();
        if (step === 0) {
          router.push("/");
          return;
        }
        goRef.current(step - 1);
      }
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [busy, canNext, router, step]);

  useEffect(() => {
    const cues: SpeechCue[] = step >= 1 ? alphabet.map(patachCue) : [];
    if (step === 2 && dalet) {
      for (const nikud of daletNikud) {
        cues.push(nikudCue(dalet, nikud.id));
      }
    }

    for (const cue of cues) {
      void loadSpeechClip(cue.text, cue.phoneme);
    }
  }, [step]);

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
      await playAudio(audio);
    } catch {
      if (id === request.current) {
        setSpeechError(true);
      }
    }
  }

  function go(next: number) {
    const stage = levels[next];
    const host = typeof window === "undefined" ? "" : window.location.hostname;
    const localHost = host === "localhost" || host === "127.0.0.1";
    if (!localHost && stage && stageLevel(stage) > curriculumLevel()) {
      return;
    }
    if (busy || next === step || next < 0 || next >= levels.length) {
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

  goRef.current = go;

  const body = step === 3 ? t("patachBody") : t("introBody");

  return (
    <main className="relative p-4 z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-[2rem] bg-white/55 shadow-[0_24px_60px_-36px_rgba(6,78,59,0.45)] backdrop-blur-md">
      <header className="relative flex shrink-0 items-center justify-center py-1">
        <p className="rounded-full border border-emerald-950/15 bg-white/80 px-4 py-1 text-sm font-semibold tracking-[0.18em] text-emerald-950 uppercase">
          {t("level", { id: levels[step] })}
        </p>
        <LevelClose
          finished={step === 6 || passed || curriculumLevel() > stageLevel(levels[step] ?? "1")}
          className="absolute top-0 right-0 z-20"
        />
      </header>
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
        <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", bounce: 0.12, visualDuration: 0.4 }}
            className="flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden"
            onAnimationComplete={(definition) => {
              if (definition === "center") {
                setBusy(false);
              }
            }}
          >
            {step < 5 && step !== 1 ? (
            <div className="max-w-xl text-center">
              {step === 3 ? (
                <h1 className="flex items-center justify-center gap-3 text-emerald-950">
                  <span className={cn(printFont.className, "text-7xl leading-none text-blue-600")} dir="rtl" lang="he">
                    ◌ַ
                  </span>
                  <span className="text-4xl font-semibold sm:text-5xl">- ah</span>
                </h1>
              ) : (
                <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">{t("introTitle")}</h1>
              )}
              {step === 2 ? (
                <p className="mt-2 text-base text-emerald-900/80 sm:text-lg">
                  {t.rich("nikudBody", {
                    bold: (chunks) => <strong className="font-semibold text-emerald-950">{chunks}</strong>,
                    blue: (chunks) => <strong className="font-semibold text-blue-600">{chunks}</strong>,
                  })}
                </p>
              ) : step < 4 ? (
                <p className="mt-2 text-base text-emerald-900/80 sm:text-lg">{body}</p>
              ) : null}
            </div>
            ) : null}

            {step === 1 ? <ConsonantSpeak onPass={() => go(2)} /> : null}
            {step === 2 && dalet ? (
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {daletNikud.map((nikud) => (
                  <motion.button
                    key={nikud.id}
                    type="button"
                    whileHover={{ scale: 1.06, y: -4 }}
                    transition={letterSpring}
                    className={cn(printFont.className, "cursor-pointer rounded-2xl px-2 py-1 text-6xl text-black outline-none hover:bg-white/80 focus-visible:ring-3 focus-visible:ring-emerald-700/30 sm:text-7xl")}
                    dir="rtl"
                    lang="he"
                    aria-label={t("withNikud", { name: dalet.name, nikud: t(nikud.label) })}
                    onClick={() => void playCue(nikudCue(dalet, nikud.id))}
                  >
                    <PointedLetter letter={dalet.letter} mark={nikud.mark} tail={nikud.tail} />
                  </motion.button>
                ))}
              </div>
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
            {step === 4 ? <LetterQuiz letters={alphabet} onPlay={playCue} onPass={() => go(5)} /> : null}
            {step === 5 ? (
              <NikudDropQuiz
                onPlay={playCue}
                onPass={() => {
                  completeCurriculumLevel(1);
                  go(6);
                }}
              />
            ) : null}
            {step === 6 ? (
              <div className="max-w-xl text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">{t("levelOneDoneTitle")}</h1>
                <p className="mt-3 text-base text-emerald-900/80 sm:text-lg">{t("levelOneDoneBody")}</p>
                <NextLevelLink level={1} />
              </div>
            ) : null}
            {step === 7 ? <LevelTwo part="outline" onPass={() => go(8)} /> : null}
            {step === 8 ? <LevelTwo part="fish" onPass={() => go(9)} /> : null}
            {step === 9 ? <LevelTwo part="sofit" onPass={() => go(10)} /> : null}
            {step === 10 ? <LevelTwo part="sofitPairs" onPass={() => go(11)} /> : null}
            {step === 11 ? <LevelTwo part="sofitQuiz" onPass={() => go(12)} /> : null}
            {step === 12 ? <LevelTwo part="vowels" onPass={() => go(13)} /> : null}
            {step === 13 && !passed ? (
              <LevelTwo
                part="words"
                onPass={() => {
                  completeCurriculumLevel(2);
                  setPassed(true);
                }}
              />
            ) : null}
            {step === 13 && passed ? (
              <div className="flex max-w-xl flex-col items-center text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("levelClear", { level: 2 })}</h1>
                <p className="mt-3 text-base text-emerald-900/80 sm:text-lg">{t("wordsDone")}</p>
                <NextLevelLink level={2} />
              </div>
            ) : null}
            {speechError ? <p className="text-center text-sm text-emerald-900/70">{t("speechError")}</p> : null}
          </motion.div>
        </AnimatePresence>
        </div>
        {step === 13 && passed ? <ExperienceTube /> : null}
      </div>

      <div className="flex shrink-0 items-center justify-center gap-4 py-3">
        {local ? (
          <Button
            type="button"
            variant="outline"
            className="h-16 px-6 text-xl"
            onClick={() => {
              if (step >= levels.length - 1) {
                return;
              }
              setDirection(1);
              setBusy(false);
              setPassed(false);
              setStep(step + 1);
            }}
          >
            {t("skip")}
          </Button>
        ) : null}
        <motion.span animate={{ scale: held === "back" ? 0.96 : 1 }} transition={{ type: "spring", bounce: 0.05, visualDuration: 0.12 }}>
          {step === 0 ? (
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }), stepButton)} onClick={() => playSwitch()}>
              <ArrowLeftIcon className="size-6" /> {t("back")}
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
              <ArrowLeftIcon className="size-6" /> {t("back")}
            </Button>
          )}
        </motion.span>
        {canNext ? (
          <motion.span animate={{ scale: held === "next" ? 0.96 : 1 }} transition={{ type: "spring", bounce: 0.05, visualDuration: 0.12 }}>
            <Button
              type="button"
              className={stepButton}
              disabled={busy}
              onClick={() => {
                playSwitch();
                go(step + 1);
              }}
            >
              {t("next")} <ArrowRightIcon className="size-6" />
            </Button>
          </motion.span>
        ) : null}
      </div>
      <DevLevelControl />
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
  fontClass = printFont.className,
}: {
  letters: readonly LetterFact[];
  onPlay: (cue: SpeechCue) => void;
  cue: (letter: LetterFact) => SpeechCue;
  label: (letter: LetterFact) => string;
  focused?: boolean;
  nikud?: (letter: LetterFact) => { mark: string; tail: string };
  onActivate?: (letter: LetterFact) => void;
  fontClass?: string;
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
              fontClass,
              "cursor-pointer rounded-2xl px-2 py-1 text-black outline-none hover:bg-white/80 focus-visible:ring-3 focus-visible:ring-emerald-700/30",
              focused ? "text-6xl sm:text-8xl" : "text-5xl sm:text-6xl lg:text-7xl",
            )}
            dir="rtl"
            lang="he"
            aria-label={label(letter)}
            onPointerEnter={() => onPlay(spoken)}
            onFocus={() => {
              if (onActivate) {
                return;
              }
              onPlay(spoken);
            }}
            onClick={() => onActivate?.(letter)}
          >
            {mark ? <PointedLetter letter={letter.letter} mark={mark.mark} tail={mark.tail} /> : letter.letter}
          </motion.button>
        );
      })}
    </div>
  );
}
