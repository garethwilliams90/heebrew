export const partsOfSpeech = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "particle",
  "interjection",
  "phrase",
  "question",
] as const;

export type PartOfSpeech = (typeof partsOfSpeech)[number];

export function isPartOfSpeech(value: string): value is PartOfSpeech {
  return (partsOfSpeech as readonly string[]).includes(value);
}

export type GrammaticalGender = "masculine" | "feminine";

export type Flashcard = {
  id: string;
  english: string;
  partOfSpeech: PartOfSpeech;
  example: string;
  exampleBold?: [number, number][];
  hebrew: string;
  hebrewExample: string;
  hebrewExampleBold?: [number, number][];
  gender: GrammaticalGender | null;
  audioUrl?: string;
  exampleAudioUrl?: string;
};

export type RecallGrade = "dontKnow" | "know" | "knowWell" | "memorised";
