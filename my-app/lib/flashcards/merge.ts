import { englishBold, hebrewBold } from "@/lib/flashcards/bold";
import { isPartOfSpeech, type Flashcard, type GrammaticalGender } from "@/lib/flashcards/types";

export type StoredCard = {
  id: string;
  sourceCardId: string | null;
  english: string;
  partOfSpeech: Flashcard["partOfSpeech"];
  example: string;
  hebrew: string;
  hebrewExample: string;
  gender: GrammaticalGender | null;
  hidden: boolean;
  createdAt: string;
};

function stripNiqqud(value: string) {
  return value.replace(/[\u0591-\u05C7]/g, "");
}

function sameHebrew(left: string, right: string) {
  return stripNiqqud(left).trim() === stripNiqqud(right).trim();
}

export function cardFromStored(row: StoredCard, original?: Flashcard): Flashcard {
  const hebrewChanged = original ? !sameHebrew(original.hebrew, row.hebrew) : true;
  const exampleChanged = original ? !sameHebrew(original.hebrewExample, row.hebrewExample) : true;

  return {
    id: original?.id ?? row.id,
    english: row.english,
    partOfSpeech: row.partOfSpeech,
    example: row.example,
    exampleBold: englishBold(row.example, row.english),
    hebrew: row.hebrew,
    hebrewExample: row.hebrewExample,
    hebrewExampleBold: hebrewBold(row.hebrewExample, row.hebrew),
    gender: row.gender,
    audioUrl: hebrewChanged ? undefined : original?.audioUrl,
    exampleAudioUrl: exampleChanged ? undefined : original?.exampleAudioUrl,
  };
}

export function mergeDeck(base: Flashcard[], stored: StoredCard[]) {
  const overrides = new Map<string, StoredCard>();
  const added: StoredCard[] = [];

  for (const row of stored) {
    if (row.sourceCardId) {
      overrides.set(row.sourceCardId, row);
    } else if (!row.hidden) {
      added.push(row);
    }
  }

  const cards = base.flatMap((card) => {
    const edit = overrides.get(card.id);
    if (!edit) {
      return [card];
    }
    if (edit.hidden) {
      return [];
    }
    return [cardFromStored(edit, card)];
  });

  added.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return [...cards, ...added.map((row) => cardFromStored(row))];
}

export function readStoredCard(row: {
  id?: unknown;
  source_card_id?: unknown;
  english?: unknown;
  part_of_speech?: unknown;
  example?: unknown;
  hebrew?: unknown;
  hebrew_example?: unknown;
  gender?: unknown;
  hidden?: unknown;
  created_at?: unknown;
}): StoredCard | null {
  if (
    typeof row.id !== "string" ||
    typeof row.english !== "string" ||
    typeof row.hebrew !== "string" ||
    typeof row.part_of_speech !== "string" ||
    !isPartOfSpeech(row.part_of_speech)
  ) {
    return null;
  }

  const gender = row.gender === "masculine" || row.gender === "feminine" ? row.gender : null;

  return {
    id: row.id,
    sourceCardId: typeof row.source_card_id === "string" ? row.source_card_id : null,
    english: row.english,
    partOfSpeech: row.part_of_speech,
    example: typeof row.example === "string" ? row.example : "",
    hebrew: row.hebrew,
    hebrewExample: typeof row.hebrew_example === "string" ? row.hebrew_example : "",
    gender,
    hidden: row.hidden === true,
    createdAt: typeof row.created_at === "string" ? row.created_at : "",
  };
}
