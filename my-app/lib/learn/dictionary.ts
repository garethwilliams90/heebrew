import { saveCard } from "@/lib/flashcards/library";
import type { GrammaticalGender, PartOfSpeech } from "@/lib/flashcards/types";
import { learnableWords } from "@/lib/learn/known-words";
import type { LocaleGloss } from "@/lib/learn/sentences";
import { wordCatalog } from "@/lib/learn/words/catalog";
import { createClient } from "@/lib/supabase/client";

export type DictionaryEntry = {
  id: string;
  hebrew: string;
  transliteration: string;
  gloss: LocaleGloss;
  audio: string | null;
  partOfSpeech: PartOfSpeech;
  gender: GrammaticalGender | null;
};

export type DeckChoice = {
  id: string;
  title: string;
};

function catalogEntry(word: (typeof wordCatalog)[number]): DictionaryEntry {
  return {
    id: word.id,
    hebrew: word.niqqud || word.hebrew,
    transliteration: word.transliteration,
    gloss: { en: word.en, fr: word.fr, es: word.es },
    audio: word.audio,
    partOfSpeech: word.partOfSpeech,
    gender: word.gender,
  };
}

function learnableEntry(word: (typeof learnableWords)[number]): DictionaryEntry {
  return {
    id: word.id,
    hebrew: word.hebrew,
    transliteration: word.reading,
    gloss: { en: word.english, fr: word.english, es: word.english },
    audio: null,
    partOfSpeech: word.partOfSpeech,
    gender: word.gender,
  };
}

const byId = new Map<string, DictionaryEntry>();
for (const word of wordCatalog) {
  byId.set(word.id, catalogEntry(word));
}
for (const word of learnableWords) {
  if (!byId.has(word.id)) {
    byId.set(word.id, learnableEntry(word));
  }
}

export const dictionaryWords: readonly DictionaryEntry[] = [...byId.values()].sort((left, right) =>
  left.gloss.en.localeCompare(right.gloss.en),
);

export async function loadCustomDecks(): Promise<DeckChoice[] | "signed-out" | "error"> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return "signed-out";
  }

  const result = await supabase
    .from("decks")
    .select("id, title")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  if (result.error) {
    return "error";
  }

  return (result.data ?? []).flatMap((row) =>
    typeof row.id === "string" && typeof row.title === "string" ? [{ id: row.id, title: row.title }] : [],
  );
}

export async function addWordToDeck(
  deckId: string,
  word: DictionaryEntry,
): Promise<"ok" | "duplicate" | "signed-out" | "error"> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return "signed-out";
  }

  const existing = await supabase
    .from("cards")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("deck_id", deckId)
    .eq("hebrew", word.hebrew)
    .limit(1);

  if (existing.error) {
    return "error";
  }
  if (existing.data?.[0]?.id) {
    return "duplicate";
  }

  const saved = await saveCard(deckId, null, {
    english: word.gloss.en,
    partOfSpeech: word.partOfSpeech,
    example: "",
    hebrew: word.hebrew,
    hebrewExample: "",
    gender: word.gender,
  });

  return saved === "ok" ? "ok" : saved;
}
