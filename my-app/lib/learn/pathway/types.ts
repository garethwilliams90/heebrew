import type { LocaleGloss } from "@/lib/learn/sentences";
import type { NikudDropRound } from "@/lib/learn/nikud-drop";

export type Gloss = LocaleGloss;

export type ExerciseType =
  | "nikud-drop"
  | "recognize-sound"
  | "compose-gap"
  | "conjugate"
  | "listen-repeat"
  | "read"
  | "write"
  | "comprehend"
  | "spell"
  | "picture-word";

export type SpokenItem = {
  id: string;
  hebrew: string;
  say?: string;
  gloss: Gloss;
  audio?: string;
  letterId?: string;
};

export type RecognizeItem = {
  prompt: SpokenItem;
  choices: readonly SpokenItem[];
};

export type GapPiece = {
  id: string;
  hebrew: string;
  gloss: Gloss;
  audio?: string;
};

export type GapItem = {
  id: string;
  gloss: Gloss;
  say: string;
  audio?: string;
  tokens: readonly (GapPiece & { blank?: boolean })[];
  extras: readonly GapPiece[];
};

export type SpellItem = {
  prompt: SpokenItem;
  letters: readonly string[];
};

export type ReadItem = {
  id: string;
  hebrew: string;
  gloss: Gloss;
  audio?: string;
};

export type ConjugateItem = {
  id: string;
  before: string;
  after: string;
  gloss: Gloss;
  choices: readonly SpokenItem[];
  answerId: string;
};

export type PictureDirection = "picture-hebrew" | "english-hebrew" | "hebrew-english";

export type PictureWordItem = {
  id: string;
  direction: PictureDirection;
  answerId: string;
  choiceIds: readonly string[];
};

export type ComprehendItem = {
  id: string;
  hebrew: string;
  gloss: Gloss;
  audio?: string;
  question: Gloss;
  choices: readonly Gloss[];
  answer: number;
};

export type IntroSample = {
  hebrew: string;
  gloss: Gloss;
  audio?: string;
  letterId?: string;
  say?: string;
};

export type IntroSlide = {
  title: Gloss;
  body: Gloss;
  samples?: readonly IntroSample[];
  /** One nikud from the vowel walkthrough, shown on bet. */
  nikudId?: string;
  /** The last intro slide: every nikud on bet, together. */
  nikudOverview?: boolean;
};

export type ExerciseStep =
  | { type: "nikud-drop"; optional?: boolean; letterIds: readonly string[] }
  | { type: "recognize-sound"; optional?: boolean; items: readonly RecognizeItem[] }
  | { type: "listen-repeat"; optional?: boolean; items: readonly SpokenItem[] }
  | { type: "spell"; optional?: boolean; items: readonly SpellItem[] }
  | { type: "compose-gap"; optional?: boolean; items: readonly GapItem[] }
  | { type: "conjugate"; optional?: boolean; items: readonly ConjugateItem[] }
  | { type: "read"; optional?: boolean; items: readonly ReadItem[] }
  | { type: "write"; optional?: boolean; items: readonly ReadItem[] }
  | { type: "comprehend"; optional?: boolean; items: readonly ComprehendItem[] }
  | { type: "picture-word"; optional?: boolean; items: readonly PictureWordItem[] };

export type PathwayLevel = {
  id: string;
  sectionId: string;
  index: number;
  title: Gloss;
  about: Gloss;
  mark: string;
  /** Path and frame label when this level is not a numbered lesson. */
  badge?: string;
  intros: readonly IntroSlide[];
  exercises: readonly ExerciseStep[];
  knownWordIds: readonly string[];
};

export type PathwaySection = {
  id: string;
  index: number;
  title: Gloss;
  about: Gloss;
  levels: readonly PathwayLevel[];
  exam?: {
    questions: number;
    lives: number;
    types: readonly ExerciseType[];
  };
};

export type ExamQuestion =
  | { type: "nikud-drop"; round: NikudDropRound }
  | { type: "recognize-sound"; item: RecognizeItem }
  | { type: "listen-repeat"; item: SpokenItem }
  | { type: "spell"; item: SpellItem }
  | { type: "compose-gap"; item: GapItem }
  | { type: "conjugate"; item: ConjugateItem }
  | { type: "read"; item: ReadItem }
  | { type: "write"; item: ReadItem }
  | { type: "comprehend"; item: ComprehendItem }
  | { type: "picture-word"; item: PictureWordItem };

export function gloss(en: string, fr: string, es: string): Gloss {
  return { en, fr, es };
}
