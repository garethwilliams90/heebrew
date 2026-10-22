import { BaseRepository, type RepositoryClient } from "./BaseRepository";
import type { GrammaticalGender, PartOfSpeech } from "@/lib/flashcards/types";

export type CardWrite = {
  english: string;
  partOfSpeech: PartOfSpeech;
  example: string;
  hebrew: string;
  hebrewExample: string;
  gender: GrammaticalGender | null;
};

export type CardRow = {
  user_id: string;
  deck_id: string;
  source_card_id: string | null;
  english: string;
  part_of_speech: PartOfSpeech;
  example: string;
  hebrew: string;
  hebrew_example: string;
  gender: GrammaticalGender | null;
  hidden: boolean;
};

export type WriteResult = {
  error: { message?: string } | null;
};

type FilterBuilder = PromiseLike<WriteResult> & {
  eq: (column: string, value: string) => FilterBuilder;
};

type CardsQuery = {
  insert: (row: CardRow) => PromiseLike<WriteResult>;
  update: (values: Partial<CardRow>) => FilterBuilder;
  upsert: (row: CardRow, options?: { onConflict?: string }) => PromiseLike<WriteResult>;
  delete: () => FilterBuilder;
};

export function toCardRow(
  deckId: string,
  userId: string,
  draft: CardWrite,
  sourceCardId: string | null,
  hidden = false,
): CardRow {
  return {
    user_id: userId,
    deck_id: deckId,
    source_card_id: sourceCardId,
    english: draft.english,
    part_of_speech: draft.partOfSpeech,
    example: draft.example,
    hebrew: draft.hebrew,
    hebrew_example: draft.hebrewExample,
    gender: draft.gender,
    hidden,
  };
}

/**
 * Cards table writes. `saveCard` uses insert/update/upsert. `removeCard`
 * still talks to Supabase directly until a later slice.
 */
export class CardRepository extends BaseRepository {
  constructor(supabase: RepositoryClient) {
    super("cards", supabase);
  }

  private cards() {
    return this.from() as CardsQuery;
  }

  insertNew(deckId: string, userId: string, draft: CardWrite) {
    return this.cards().insert(toCardRow(deckId, userId, draft, null));
  }

  updateOwned(userId: string, cardId: string, draft: CardWrite) {
    return this.cards()
      .update({
        english: draft.english,
        part_of_speech: draft.partOfSpeech,
        example: draft.example,
        hebrew: draft.hebrew,
        hebrew_example: draft.hebrewExample,
        gender: draft.gender,
        hidden: false,
      })
      .eq("user_id", userId)
      .eq("id", cardId);
  }

  upsertSource(deckId: string, userId: string, draft: CardWrite, sourceCardId: string, hidden = false) {
    return this.cards().upsert(toCardRow(deckId, userId, draft, sourceCardId, hidden), {
      onConflict: "user_id,deck_id,source_card_id",
    });
  }

  deleteOwned(userId: string, cardId: string) {
    return this.cards().delete().eq("user_id", userId).eq("id", cardId);
  }

  deleteByDeck(userId: string, deckId: string) {
    return this.cards().delete().eq("user_id", userId).eq("deck_id", deckId);
  }
}
