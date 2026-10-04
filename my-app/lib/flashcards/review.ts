import type { RecallGrade } from "@/lib/flashcards/types";

export const SESSION_SIZE = 10;

export function buildStudySession<T extends { id: string }>(
  cards: T[],
  mastery: Record<string, number>,
) {
  return cards
    .map((card, order) => ({
      card,
      order,
      mastery: mastery[card.id] ?? 0,
    }))
    .sort((a, b) => a.mastery - b.mastery || a.order - b.order)
    .slice(0, SESSION_SIZE)
    .sort((a, b) => a.order - b.order)
    .map(({ card, mastery: level }) => ({ ...card, mastery: level }));
}

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
