import { seededOrder } from "@/lib/learn/pathway/order";
import type { ExerciseStep } from "@/lib/learn/pathway/types";

/** How many questions a level asks in one sitting. */
export const LEVEL_QUESTION_COUNT = 6;

export function takeLevelQuestions<T>(items: readonly T[], seed: string) {
  if (items.length <= LEVEL_QUESTION_COUNT) {
    return [...items];
  }
  return seededOrder(items, seed).slice(0, LEVEL_QUESTION_COUNT);
}

/** Keeps a short step whole. A longer step asks six questions this time. */
export function batchExercise(step: ExerciseStep, seed: string): ExerciseStep {
  switch (step.type) {
    case "nikud-drop":
      return step;
    case "recognize-sound":
      return { ...step, items: takeLevelQuestions(step.items, seed) };
    case "listen-repeat":
      return { ...step, items: takeLevelQuestions(step.items, seed) };
    case "spell":
      return { ...step, items: takeLevelQuestions(step.items, seed) };
    case "compose-gap":
      return { ...step, items: takeLevelQuestions(step.items, seed) };
    case "conjugate":
      return { ...step, items: takeLevelQuestions(step.items, seed) };
    case "read":
      return { ...step, items: takeLevelQuestions(step.items, seed) };
    case "write":
      return { ...step, items: takeLevelQuestions(step.items, seed) };
    case "comprehend":
      return { ...step, items: takeLevelQuestions(step.items, seed) };
    case "picture-word":
      return { ...step, items: takeLevelQuestions(step.items, seed) };
  }
}
