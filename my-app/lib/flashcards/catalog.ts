import { isBuiltinDeck, type BuiltinDeckId } from "@/lib/flashcards/builtin";
import { readStoredCard, type StoredCard } from "@/lib/flashcards/merge";
import { createClient } from "@/lib/supabase/server";

export type CustomDeck = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

export type DeckEdit = {
  title: string;
  description: string;
};

export type CardTally = {
  hidden: number;
  added: number;
};

export type Library = {
  signedIn: boolean;
  decks: CustomDeck[];
  edits: Partial<Record<BuiltinDeckId, DeckEdit>>;
  tallies: Partial<Record<string, CardTally>>;
  storedCards: StoredCard[];
};

const emptyLibrary: Library = {
  signedIn: false,
  decks: [],
  edits: {},
  tallies: {},
  storedCards: [],
};

export async function loadLibrary(activeDeckId?: string): Promise<Library> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return emptyLibrary;
  }

  const [decksResult, editsResult, talliesResult, cardsResult] = await Promise.all([
    supabase
      .from("decks")
      .select("id, title, description, created_at")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false }),
    supabase.from("deck_edits").select("deck_id, title, description").eq("user_id", data.user.id),
    supabase.from("cards").select("deck_id, source_card_id, hidden").eq("user_id", data.user.id),
    activeDeckId
      ? supabase
          .from("cards")
          .select(
            "id, source_card_id, english, part_of_speech, example, hebrew, hebrew_example, gender, hidden, created_at",
          )
          .eq("user_id", data.user.id)
          .eq("deck_id", activeDeckId)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (decksResult.error || editsResult.error || talliesResult.error || cardsResult.error) {
    throw decksResult.error ?? editsResult.error ?? talliesResult.error ?? cardsResult.error;
  }

  const decks: CustomDeck[] = [];
  for (const row of decksResult.data ?? []) {
    if (typeof row.id === "string" && typeof row.title === "string") {
      decks.push({
        id: row.id,
        title: row.title,
        description: typeof row.description === "string" ? row.description : "",
        createdAt: typeof row.created_at === "string" ? row.created_at : "",
      });
    }
  }

  const edits: Library["edits"] = {};
  for (const row of editsResult.data ?? []) {
    if (
      typeof row.deck_id === "string" &&
      isBuiltinDeck(row.deck_id) &&
      typeof row.title === "string"
    ) {
      edits[row.deck_id] = {
        title: row.title,
        description: typeof row.description === "string" ? row.description : "",
      };
    }
  }

  const tallies: Library["tallies"] = {};
  for (const row of talliesResult.data ?? []) {
    if (typeof row.deck_id !== "string") {
      continue;
    }
    const tally = tallies[row.deck_id] ?? { hidden: 0, added: 0 };
    if (row.hidden === true && typeof row.source_card_id === "string") {
      tally.hidden += 1;
    } else if (row.hidden !== true && row.source_card_id == null) {
      tally.added += 1;
    }
    tallies[row.deck_id] = tally;
  }

  const storedCards = (cardsResult.data ?? []).flatMap((row) => {
    const card = readStoredCard(row);
    return card ? [card] : [];
  });

  return { signedIn: true, decks, edits, tallies, storedCards };
}
