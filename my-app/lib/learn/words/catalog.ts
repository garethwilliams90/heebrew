import type { BasicWord } from "@/lib/learn/basic-words";
import type { GrammaticalGender, PartOfSpeech } from "@/lib/flashcards/types";
import { isPartOfSpeech } from "@/lib/flashcards/types";
import entries from "@/lib/learn/words/catalog.json";

export type CatalogWord = {
  id: string;
  hebrew: string;
  niqqud: string;
  transliteration: string;
  en: string;
  fr: string;
  es: string;
  gender: GrammaticalGender | null;
  partOfSpeech: PartOfSpeech;
  audio: string | null;
};

function isGender(value: unknown): value is GrammaticalGender | null {
  return value === null || value === "masculine" || value === "feminine";
}

function readWord(value: unknown): CatalogWord | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.hebrew !== "string" ||
    typeof row.niqqud !== "string" ||
    typeof row.transliteration !== "string" ||
    typeof row.en !== "string" ||
    typeof row.fr !== "string" ||
    typeof row.es !== "string" ||
    typeof row.partOfSpeech !== "string" ||
    !isPartOfSpeech(row.partOfSpeech) ||
    !isGender(row.gender) ||
    !(row.audio === null || typeof row.audio === "string")
  ) {
    return null;
  }
  return {
    id: row.id,
    hebrew: row.hebrew,
    niqqud: row.niqqud,
    transliteration: row.transliteration,
    en: row.en,
    fr: row.fr,
    es: row.es,
    gender: row.gender,
    partOfSpeech: row.partOfSpeech,
    audio: row.audio,
  };
}

export const wordCatalog: readonly CatalogWord[] = entries.flatMap((entry) => {
  const word = readWord(entry);
  return word ? [word] : [];
});

const byId = new Map(wordCatalog.map((word) => [word.id, word]));

export function wordById(id: string) {
  return byId.get(id) ?? null;
}

export function requireWord(id: string) {
  const word = wordById(id);
  if (!word) {
    throw new Error(`Missing catalog word ${id}`);
  }
  return word;
}

export function toBasicWord(word: CatalogWord): BasicWord {
  return {
    id: word.id,
    hebrew: word.niqqud || word.hebrew,
    english: word.en,
    reading: word.transliteration,
    partOfSpeech: word.partOfSpeech,
    gender: word.gender,
  };
}
