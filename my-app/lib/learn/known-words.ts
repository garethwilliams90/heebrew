import { createDeck, saveCard } from "@/lib/flashcards/library";
import { createClient } from "@/lib/supabase/client";
import { basicWords, type BasicWord } from "@/lib/learn/basic-words";
import { letterPairLevels, pairKnownWord } from "@/lib/learn/letter-pairs";
import { thirteenKnownWords } from "@/lib/learn/level-thirteen";
import { fourteenKnownWords } from "@/lib/learn/level-fourteen";
import { fifteenKnownWords } from "@/lib/learn/level-fifteen";
import { laterKnownWords } from "@/lib/learn/later-levels";
import { sixteenKnownWords } from "@/lib/learn/level-sixteen";
import { readingKnownWords } from "@/lib/learn/reading-levels";
import { soundKnownWords } from "@/lib/learn/sound-exercises";
import { toBasicWord, wordById } from "@/lib/learn/words/catalog";

// Every word the curriculum can teach. Ids are shared only when the Hebrew is the same.
const learnableWords: readonly BasicWord[] = [
  ...basicWords,
  ...soundKnownWords,
  ...letterPairLevels.flatMap((level) => level.words.map(pairKnownWord)),
  ...readingKnownWords,
  ...thirteenKnownWords,
  ...fourteenKnownWords,
  ...fifteenKnownWords,
  ...sixteenKnownWords,
  ...laterKnownWords,
];

const STORAGE_KEY = "webrew.known-words";
const DECK_TITLE = "Known words";
const DECK_ABOUT = "Words you learned in Webrew.";

const saving = new Map<string, Promise<void>>();
let deckRequest: Promise<string | null> | null = null;

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
      const listed = learnableWords.find((entry) => entry.id === item.id);
      if (listed) {
        return [listed];
      }
      const catalogWord = wordById(item.id);
      return catalogWord ? [toBasicWord(catalogWord)] : [];
    });
  } catch {
    return [];
  }
}

function writeKnownWords(words: BasicWord[]) {
  const ids = words.map((word) => word.id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.map((id) => ({ id }))));
}

export function rememberKnownWord(word: BasicWord) {
  const current = saving.get(word.id);
  if (current) {
    return current;
  }

  const job = storeKnownWord(word).finally(() => {
    saving.delete(word.id);
  });
  saving.set(word.id, job);
  return job;
}

async function knownDeckId() {
  deckRequest ??= findOrCreateKnownDeck().catch((error: unknown) => {
    deckRequest = null;
    throw error;
  });
  return deckRequest;
}

async function findOrCreateKnownDeck() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }

  const existing = await supabase
    .from("decks")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("title", DECK_TITLE)
    .order("created_at", { ascending: true })
    .limit(1);

  if (existing.error) {
    deckRequest = null;
    return null;
  }

  const id = existing.data?.[0]?.id;
  if (typeof id === "string") {
    return id;
  }

  const created = await createDeck(DECK_TITLE, DECK_ABOUT);
  if (typeof created === "string" || !("id" in created)) {
    deckRequest = null;
    return null;
  }

  return created.id;
}

async function storeKnownWord(word: BasicWord) {
  const saved = readKnownWords();
  if (!saved.some((item) => item.id === word.id)) {
    writeKnownWords([...saved, word]);
  }

  const deckId = await knownDeckId();
  if (!deckId) {
    return;
  }

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return;
  }

  const duplicate = await supabase
    .from("cards")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("deck_id", deckId)
    .eq("hebrew", word.hebrew)
    .limit(1);

  if (duplicate.data?.[0]?.id) {
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
