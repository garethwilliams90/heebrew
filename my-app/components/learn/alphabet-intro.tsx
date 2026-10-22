"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { LetterIntro } from "@/components/learn/letter-intro";
import { LevelNav } from "@/components/learn/level-nav";
import { NikudDropQuiz } from "@/components/learn/nikud-drop-quiz";
import { SoundSpeak } from "@/components/learn/sound-speak";
import { ExperienceTube } from "@/components/learn/experience-tube";
import { NextLevelLink } from "@/components/learn/level-finish";
import { Button } from "@/components/ui/button";
import type { SpeechCue } from "@/lib/alephbet/intro-alphabet";
import { letterCatalog } from "@/lib/alephbet/letter-info";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { playAudio } from "@/lib/settings/master-volume";
import { completeCurriculumLevel, curriculumLevel, stageLevel } from "@/lib/learn/curriculum";
import { nikudPracticeLetters } from "@/lib/learn/nikud-drop";
import { soundPromptsForLevel } from "@/lib/learn/sound-exercises";
import { learnStages } from "@/lib/learn/stages";
import { markLearningStarted } from "@/lib/learn/started";
import { useLocalhost } from "@/components/learn/dev-level";
import { LevelFrame } from "@/components/learn/level-frame";
import { useRouter } from "@/i18n/navigation";

const levels = learnStages;
const levelOneLetters = ["aleph", "bet", "gimel"] as const;
const levelTwoLetters = ["dalet", "he"] as const;
const levelOnePrompts = soundPromptsForLevel(1);
const levelTwoPrompts = soundPromptsForLevel(2);

const slide = {
  enter: (direction: number) => ({ y: direction > 0 ? 72 : -72, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({ y: direction > 0 ? -72 : 72, opacity: 0 }),
};

function lettersByIds(ids: readonly string[]) {
  return ids.flatMap((id) => {
    const letter = letterCatalog.find((item) => item.id === id);
    return letter ? [letter] : [];
  });
}

export function AlphabetIntro({ initialStep = 0 }: { initialStep?: number }) {
  const t = useTranslations("Learn");
  const router = useRouter();
  const local = useLocalhost();
  const [step, setStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);
  const [busy, setBusy] = useState(false);

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

  async function playCue(cue: SpeechCue) {
    const audio = await loadSpeechClip(cue.text, cue.phoneme);
    if (!audio) {
      return;
    }
    audio.currentTime = 0;
    await playAudio(audio);
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
    setStep(next);
  }

  const stage = levels[step] ?? "1.0";
  const finished = stage === "1" || stage === "2" || curriculumLevel() > stageLevel(stage);
  const showNext = stage === "1.0" || stage === "2.0";

  function goStage(id: (typeof learnStages)[number]) {
    go(levels.indexOf(id));
  }

  return (
    <LevelFrame
      label={t("level", { id: stage })}
      finished={finished}
      aside={stage === "2" ? <ExperienceTube /> : null}
      footer={
        <LevelNav
          leading={
            local ? (
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
                  setStep(step + 1);
                }}
              >
                {t("skip")}
              </Button>
            ) : null
          }
          backHref={step === 0 ? "/" : undefined}
          onBack={step === 0 ? undefined : () => go(step - 1)}
          backDisabled={busy}
          onNext={showNext ? () => go(step + 1) : undefined}
          nextDisabled={busy}
        />
      }
    >
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
          {stage === "1.0" ? (
            <LetterIntro letters={lettersByIds(levelOneLetters)} onPlay={(cue) => void playCue(cue)} />
          ) : null}
          {stage === "1.1" ? (
            <NikudDropQuiz letterIds={nikudPracticeLetters[1]} onPlay={(cue) => void playCue(cue)} onPass={() => goStage("1.2")} />
          ) : null}
          {stage === "1.2" ? (
            <SoundSpeak
              items={levelOnePrompts}
              onPass={() => {
                completeCurriculumLevel(1);
                goStage("1");
              }}
            />
          ) : null}
          {stage === "1" ? (
            <div className="max-w-xl text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">{t("levelOneDoneTitle")}</h1>
              <p className="mt-3 text-base text-emerald-900/80 sm:text-lg">{t("levelOneDoneBody")}</p>
              <NextLevelLink level={1} />
            </div>
          ) : null}
          {stage === "2.0" ? (
            <LetterIntro letters={lettersByIds(levelTwoLetters)} onPlay={(cue) => void playCue(cue)} />
          ) : null}
          {stage === "2.1" ? (
            <NikudDropQuiz letterIds={nikudPracticeLetters[2]} onPlay={(cue) => void playCue(cue)} onPass={() => goStage("2.2")} />
          ) : null}
          {stage === "2.2" ? (
            <SoundSpeak
              items={levelTwoPrompts}
              onPass={() => {
                completeCurriculumLevel(2);
                goStage("2");
              }}
            />
          ) : null}
          {stage === "2" ? (
            <div className="flex max-w-xl flex-col items-center text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("levelClear", { level: 2 })}</h1>
              <p className="mt-3 text-base text-emerald-900/80 sm:text-lg">{t("levelTwoDoneBody")}</p>
              <NextLevelLink level={2} />
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </LevelFrame>
  );
}
