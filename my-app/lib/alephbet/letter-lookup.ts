import { letterCatalog, type LetterFact } from "@/lib/alephbet/letter-info";

export const letterById = new Map(letterCatalog.map((item) => [item.id, item]));

export function lettersByIds(ids: readonly string[]): LetterFact[] {
  return ids.flatMap((id) => {
    const letter = letterById.get(id);
    return letter ? [letter] : [];
  });
}
