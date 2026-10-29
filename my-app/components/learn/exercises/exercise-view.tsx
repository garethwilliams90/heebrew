"use client";

import dynamic from "next/dynamic";
import { ExercisePlaceholder } from "@/components/loading/exercise-placeholder";
import type { ExamQuestion, ExerciseStep } from "@/lib/learn/pathway/types";

function exerciseFallback() {
  return <ExercisePlaceholder />;
}

const ComposeGap = dynamic(() => import("@/components/learn/exercises/compose-gap").then((mod) => mod.ComposeGap), {
  loading: exerciseFallback,
});
const Comprehend = dynamic(() => import("@/components/learn/exercises/comprehend").then((mod) => mod.Comprehend), {
  loading: exerciseFallback,
});
const ConjugateChoice = dynamic(
  () => import("@/components/learn/exercises/conjugate-choice").then((mod) => mod.ConjugateChoice),
  { loading: exerciseFallback },
);
const ListenRepeat = dynamic(
  () => import("@/components/learn/exercises/listen-repeat").then((mod) => mod.ListenRepeat),
  { loading: exerciseFallback },
);
const NikudDropExercise = dynamic(
  () => import("@/components/learn/exercises/nikud-drop-exercise").then((mod) => mod.NikudDropExercise),
  { loading: exerciseFallback },
);
const NikudRoundQuestion = dynamic(
  () => import("@/components/learn/exercises/nikud-drop-exercise").then((mod) => mod.NikudRoundQuestion),
  { loading: exerciseFallback },
);
const PictureWord = dynamic(() => import("@/components/learn/exercises/picture-word").then((mod) => mod.PictureWord), {
  loading: exerciseFallback,
});
const ReadTranslation = dynamic(
  () => import("@/components/learn/exercises/read-translation").then((mod) => mod.ReadTranslation),
  { loading: exerciseFallback },
);
const WriteHebrew = dynamic(
  () => import("@/components/learn/exercises/read-translation").then((mod) => mod.WriteHebrew),
  { loading: exerciseFallback },
);
const RecognizeSound = dynamic(
  () => import("@/components/learn/exercises/recognize-sound").then((mod) => mod.RecognizeSound),
  { loading: exerciseFallback },
);
const SpellWord = dynamic(() => import("@/components/learn/exercises/spell-word").then((mod) => mod.SpellWord), {
  loading: exerciseFallback,
});

export function ExerciseView({
  step,
  onPass,
  onMiss,
  nikudSeed,
}: {
  step: ExerciseStep;
  onPass: () => void;
  onMiss?: () => void;
  nikudSeed?: string;
}) {
  if (step.type === "nikud-drop") {
    return <NikudDropExercise letterIds={step.letterIds} seed={nikudSeed} onPass={onPass} />;
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
  if (question.type === "picture-word") {
    return <PictureWord items={[question.item]} onPass={onPass} onMiss={onMiss} />;
  }
  return <Comprehend items={[question.item]} onPass={onPass} onMiss={onMiss} />;
}
