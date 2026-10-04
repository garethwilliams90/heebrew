import type { RecallGrade } from "@/lib/flashcards/types";

export function nextMastery(level: number, grade: RecallGrade) {
  if (grade === "dontKnow") {
    return Math.max(0, level - 1);
  }

  if (grade === "know") {
    return Math.min(6, level + 1);
  }

  if (grade === "knowWell") {
    return Math.min(6, level + 2);
  }

  return 6;
}
