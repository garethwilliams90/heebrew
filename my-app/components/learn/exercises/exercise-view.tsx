"use client";

import { ComposeGap } from "@/components/learn/exercises/compose-gap";
import { Comprehend } from "@/components/learn/exercises/comprehend";
import { ConjugateChoice } from "@/components/learn/exercises/conjugate-choice";
import { DrawLetter } from "@/components/learn/exercises/draw-letter";
import { ListenRepeat } from "@/components/learn/exercises/listen-repeat";
import { NikudDropExercise, NikudRoundQuestion } from "@/components/learn/exercises/nikud-drop-exercise";
import { PictureWord } from "@/components/learn/exercises/picture-word";
import { ReadTranslation, WriteHebrew } from "@/components/learn/exercises/read-translation";
import { RecognizeSound } from "@/components/learn/exercises/recognize-sound";
import { SpellWord } from "@/components/learn/exercises/spell-word";
import type { ExamQuestion, ExerciseStep } from "@/lib/learn/pathway/types";

export function ExerciseView({ step, onPass, onMiss }: { step: ExerciseStep; onPass: () => void; onMiss?: () => void }) {
  if (step.type === "nikud-drop") {
    return <NikudDropExercise letterIds={step.letterIds} onPass={onPass} />;
  }
  if (step.type === "recognize-sound") {
    return <RecognizeSound items={step.items} onPass={onPass} onMiss={onMiss} />;
  }
  if (step.type === "listen-repeat") {
    return <ListenRepeat items={step.items} onPass={onPass} onMiss={onMiss} />;
  }
  if (step.type === "spell") {
    return <SpellWord items={step.items} onPass={onPass} onMiss={onMiss} />;
  }
  if (step.type === "compose-gap") {
    return <ComposeGap items={step.items} onPass={onPass} onMiss={onMiss} />;
  }
  if (step.type === "conjugate") {
    return <ConjugateChoice items={step.items} onPass={onPass} onMiss={onMiss} />;
  }
  if (step.type === "read") {
    return <ReadTranslation items={step.items} onPass={onPass} onMiss={onMiss} />;
  }
  if (step.type === "write") {
    return <WriteHebrew items={step.items} onPass={onPass} onMiss={onMiss} />;
  }
  if (step.type === "draw-letter") {
    return <DrawLetter letterIds={step.letterIds} onPass={onPass} />;
  }
  if (step.type === "picture-word") {
    return <PictureWord items={step.items} onPass={onPass} onMiss={onMiss} />;
  }
  return <Comprehend items={step.items} onPass={onPass} onMiss={onMiss} />;
}

export function ExamQuestionView({
  question,
  onPass,
  onMiss,
  hearts,
}: {
  question: ExamQuestion;
  onPass: () => void;
  onMiss?: () => void;
  hearts?: {
    halves: number;
    failed: boolean;
    loseHeart: (cost: number) => void;
    resetHearts: () => void;
  };
}) {
  if (question.type === "nikud-drop") {
    return <NikudRoundQuestion round={question.round} onPass={onPass} hearts={hearts} />;
  }
  if (question.type === "recognize-sound") {
    return <RecognizeSound items={[question.item]} onPass={onPass} onMiss={onMiss} />;
  }
  if (question.type === "listen-repeat") {
    return <ListenRepeat items={[question.item]} onPass={onPass} onMiss={onMiss} />;
  }
  if (question.type === "spell") {
    return <SpellWord items={[question.item]} onPass={onPass} onMiss={onMiss} />;
  }
  if (question.type === "compose-gap") {
    return <ComposeGap items={[question.item]} onPass={onPass} onMiss={onMiss} />;
  }
  if (question.type === "conjugate") {
    return <ConjugateChoice items={[question.item]} onPass={onPass} onMiss={onMiss} />;
  }
  if (question.type === "read") {
    return <ReadTranslation items={[question.item]} onPass={onPass} onMiss={onMiss} />;
  }
  if (question.type === "write") {
    return <WriteHebrew items={[question.item]} onPass={onPass} onMiss={onMiss} />;
  }
  if (question.type === "draw-letter") {
    return <DrawLetter letterIds={[question.letterId]} onPass={onPass} />;
  }
  if (question.type === "picture-word") {
    return <PictureWord items={[question.item]} onPass={onPass} onMiss={onMiss} />;
  }
  return <Comprehend items={[question.item]} onPass={onPass} onMiss={onMiss} />;
}
