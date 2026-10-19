import { letterCatalog } from "@/lib/alephbet/letter-info";

// One progress row per letter, stored beside the vocabulary decks.
export const letterDeckId = "aleph-bet";

export const spokenNames: Record<string, string> = Object.fromEntries(
  letterCatalog.map((item) => [item.letter, item.spoken]),
);

export const letters: Record<string, string> = Object.fromEntries(
  letterCatalog.map((item) => [item.letter, item.name]),
);

export type StudyLetter = {
  letter: string;
  name: string;
};

export function letterList(): StudyLetter[] {
  return letterCatalog.map((item) => ({ letter: item.letter, name: item.name }));
}

export function shuffleLetters<T>(items: readonly T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swap];
    next[swap] = current;
  }

  return next;
}
