export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "particle"
  | "interjection"
  | "phrase"
  | "question";

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
