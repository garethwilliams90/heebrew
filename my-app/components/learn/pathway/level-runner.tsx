"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExerciseView } from "@/components/learn/exercises/exercise-view";
import { LessonSessionProvider, type LessonSession } from "@/components/learn/exercises/lesson-session";
import { usePracticeHearts } from "@/components/learn/use-practice-hearts";
import { IntroSlideView } from "@/components/learn/pathway/intro-slide";
import { useLocalhost } from "@/components/learn/dev-level";
import { LevelFrame } from "@/components/learn/level-frame";
import { LevelNav } from "@/components/learn/level-nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { gematria } from "@/lib/learn/gematria";
import { rememberKnownWord } from "@/lib/learn/known-words";
import { levelById, nextStop, sectionById } from "@/lib/learn/pathway/catalog";
import { exerciseAudioPaths, introAudioPaths, prefetchClips } from "@/lib/learn/pathway/prefetch-audio";
import { batchExercise } from "@/lib/learn/pathway/question-batch";
import { completeLevel, levelIsOpen, touchStudy } from "@/lib/learn/pathway/progress";
import type { ExerciseStep, IntroSlide } from "@/lib/learn/pathway/types";
import { glossOf } from "@/lib/learn/sentences";
import { toBasicWord, wordById } from "@/lib/learn/words/catalog";
import { cn } from "cn";

type Frame = { kind: "intro"; slide: IntroSlide } | { kind: "exercise"; step: ExerciseStep };

export function LevelRunner({ sectionId, levelId }: { sectionId: string; levelId: string }) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const local = useLocalhost();
  const level = levelById(levelId);
  const section = sectionById(sectionId);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [batchSeed, setBatchSeed] = useState<string | null>(null);
  const { halves, failed, loseHeart, resetHearts } = usePracticeHearts(5);

  useEffect(() => {
    setIndex(0);
    setDone(false);
    setAttempt(0);
    setBatchSeed(`${levelId}-${Date.now()}`);
    resetHearts();
  }, [levelId, resetHearts]);

  const frames: Frame[] = level
    ? [...level.intros.map((slide) => ({ kind: "intro" as const, slide })), ...level.exercises.map((step) => ({ kind: "exercise" as const, step }))]
    : [];

  useEffect(() => {
    const open = local || levelIsOpen(levelId);
    setAllowed(open);
    if (open && level) {
      touchStudy(level.sectionId);
    }
  }, [level, levelId, local]);

  useEffect(() => {
    if (!level || !batchSeed) {
      return;
    }

    const introCount = level.intros.length;
    const paths: string[] = [];
    const currentSlide = level.intros[index];
    const currentStep = level.exercises[index - introCount];

    if (index < introCount && currentSlide) {
      paths.push(...introAudioPaths(currentSlide));
    } else if (currentStep) {
      paths.push(...exerciseAudioPaths(batchExercise(currentStep, `${batchSeed}-${index}`)));
    }

    const nextSlide = level.intros[index + 1];
    const nextStep = level.exercises[index + 1 - introCount];
    if (index + 1 < introCount && nextSlide) {
      paths.push(...introAudioPaths(nextSlide));
    } else if (nextStep) {
      paths.push(...exerciseAudioPaths(nextStep));
    }

    prefetchClips(paths);
  }, [batchSeed, index, level]);

  const session = useMemo<LessonSession>(
    () => ({
      halves,
      failed,
      lives: 5,
      loseHeart,
      resetHearts,
      retry() {
        resetHearts();
        setBatchSeed(`${levelId}-${Date.now()}`);
        setAttempt((current) => current + 1);
      },
      spendHint() {
        if (failed || halves < 1) {
          return false;
        }
        loseHeart(1);
        return true;
      },
    }),
    [failed, halves, levelId, loseHeart, resetHearts],
  );

  if (!level || !section || level.sectionId !== section.id || allowed === null) {
    return null;
  }

  if (!allowed) {
    return (
      <LevelFrame label={level.badge ?? gematria(level.index + 1)} finished>
        <p className="text-center text-base text-emerald-900">{t("levelLocked")}</p>
      </LevelFrame>
    );
  }

  const activeLevel = level;
  const activeSection = section;
  const frame = frames[index];
  const label = activeLevel.badge ?? gematria(activeLevel.index + 1);
  const nextHref = nextStop(activeSection.id, activeLevel.id);

  function finishFrame() {
    if (index < frames.length - 1) {
      setIndex((current) => current + 1);
      return;
    }
    for (const id of activeLevel.knownWordIds) {
      const word = wordById(id);
      if (word) {
        void rememberKnownWord(toBasicWord(word));
      }
    }
    completeLevel(activeLevel.id);
    setDone(true);
  }

  return (
    <LevelFrame
      label={label}
      finished={done}
      footer={
        done || !frame || frame.kind === "exercise" ? null : (
          <LevelNav
            backHref={index === 0 ? "/" : undefined}
            onBack={index > 0 ? () => setIndex((current) => current - 1) : undefined}
            onNext={finishFrame}
          />
        )
      }
    >
      {done ? (
        <div className="flex max-w-xl flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("levelClear", { level: label })}</h1>
          <p className="text-emerald-800">{glossOf(activeLevel.title, locale)}</p>
          {nextHref === "/" ? null : (
            <Link href={nextHref} className={buttonVariants()}>
              {nextHref.includes("exam=1") ? t("examTitle") : t("nextLevel")}
            </Link>
          )}
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            {t("continueHome")}
          </Link>
        </div>
      ) : frame?.kind === "intro" ? (
        <IntroSlideView slide={frame.slide} />
      ) : frame?.kind === "exercise" && batchSeed ? (
        <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center gap-4">
          {frame.step.optional ? (
            <Button type="button" variant="ghost" onClick={finishFrame}>
              {t("speakSkip")}
            </Button>
          ) : null}
          <LessonSessionProvider value={session}>
            <ExerciseView
              key={`${index}-${attempt}-${batchSeed}`}
              step={batchExercise(frame.step, `${batchSeed}-${index}`)}
              nikudSeed={`${batchSeed}-nikud`}
              onPass={finishFrame}
              onMiss={() => loseHeart(2)}
            />
          </LessonSessionProvider>
        </div>
      ) : null}
    </LevelFrame>
  );
}
