import type { Flashcard } from "@/lib/flashcards/types";

export type CardSort = "az" | "za" | "newest" | "oldest" | "mastered" | "unknown";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0591-\u05C7]/g, "")
    .toLowerCase();
}

export function sortCards(
  cards: Flashcard[],
  sort: CardSort,
  mastery: Record<string, number>,
  query: string,
) {
  const needle = normalize(query.trim());
  const matched = needle
    ? cards.filter((card) =>
        normalize(`${card.english} ${card.hebrew} ${card.example} ${card.hebrewExample}`).includes(
          needle,
        ),
      )
    : cards;
  const addedAt = new Map(cards.map((card, index) => [card.id, index]));
  const sorted = [...matched];
  const byAdded = (a: Flashcard, b: Flashcard) => (addedAt.get(a.id) ?? 0) - (addedAt.get(b.id) ?? 0);
  const byEnglish = (a: Flashcard, b: Flashcard) =>
    a.english.localeCompare(b.english, "en", { sensitivity: "base" });

  if (sort === "newest" || sort === "oldest") {
    const direction = sort === "oldest" ? 1 : -1;
    sorted.sort((a, b) => direction * byAdded(a, b));
    return sorted;
  }

  if (sort === "mastered" || sort === "unknown") {
    const direction = sort === "unknown" ? 1 : -1;
    sorted.sort((a, b) => {
      const level = (mastery[a.id] ?? 0) - (mastery[b.id] ?? 0);
      if (level !== 0) {
        return direction * level;
      }

      return byAdded(a, b);
    });
    return sorted;
  }

  sorted.sort((a, b) => (sort === "za" ? byEnglish(b, a) : byEnglish(a, b)));
  return sorted;
}
