import { createDeck, saveCard } from "@/lib/flashcards/library";
import { createClient } from "@/lib/supabase/client";
import { basicWords, type BasicWord } from "@/lib/learn/basic-words";

const STORAGE_KEY = "webrew.known-words";
const DECK_TITLE = "Known words";
const DECK_ABOUT = "Words you learned in Webrew.";

export function readKnownWords(): BasicWord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object" || !("id" in item) || typeof item.id !== "string") {
        return [];
      }
      const word = basicWords.find((entry) => entry.id === item.id);
      return word ? [word] : [];
    });
  } catch {
    return [];
  }
}

function writeKnownWords(words: BasicWord[]) {
  const ids = words.map((word) => word.id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.map((id) => ({ id }))));
}

export async function rememberKnownWord(word: BasicWord) {
  const saved = readKnownWords();
  if (!saved.some((item) => item.id === word.id)) {
    writeKnownWords([...saved, word]);
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return;
  }

  const existing = await supabase
    .from("decks")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("title", DECK_TITLE)
    .limit(1)
    .maybeSingle();

  let deckId = typeof existing.data?.id === "string" ? existing.data.id : "";
  if (!deckId) {
    const created = await createDeck(DECK_TITLE, DECK_ABOUT);
    if (typeof created === "string" || !("id" in created)) {
      return;
    }
    deckId = created.id;
  }

  const duplicate = await supabase
    .from("cards")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("deck_id", deckId)
    .eq("hebrew", word.hebrew)
    .limit(1)
    .maybeSingle();

  if (duplicate.data?.id) {
    return;
  }

  await saveCard(deckId, null, {
    english: word.english,
    partOfSpeech: word.partOfSpeech,
    example: "",
    hebrew: word.hebrew,
    hebrewExample: "",
    gender: word.gender,
  });
}
