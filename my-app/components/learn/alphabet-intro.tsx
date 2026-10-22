"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { LetterIntro } from "@/components/learn/letter-intro";
import { LevelClear } from "@/components/learn/level-clear";
import { LevelNav } from "@/components/learn/level-nav";
import { NikudDropQuiz } from "@/components/learn/nikud-drop-quiz";
import { SoundSpeak } from "@/components/learn/sound-speak";
import { ExperienceTube } from "@/components/learn/experience-tube";
import { Button } from "@/components/ui/button";
import { lettersByIds } from "@/lib/alephbet/letter-lookup";
import { playCue } from "@/lib/learn/play-cue";
import { completeCurriculumLevel, curriculumLevel, stageLevel } from "@/lib/learn/curriculum";
import { isLocalHost } from "@/lib/learn/local-host";
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
    if (isLocalHost()) {
      return;
    }
    const stage = levels[step];
    if (stage && stageLevel(stage) > curriculumLevel()) {
      router.replace("/");
    }
  }, [router, step]);

  function go(next: number) {
    const stage = levels[next];
    if (!isLocalHost() && stage && stageLevel(stage) > curriculumLevel()) {
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
            <LevelClear level={1} title={t("levelOneDoneTitle")} body={t("levelOneDoneBody")} />
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
            <LevelClear level={2} body={t("levelTwoDoneBody")} />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </LevelFrame>
  );
}
