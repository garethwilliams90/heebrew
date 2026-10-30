import type { GrammaticalGender, PartOfSpeech } from "@/lib/flashcards/types";
import { spokenKey } from "@/lib/stories/cues";
import { pairedTranscript } from "@/lib/stories/lines";

const FEMININE = /(?:ות|ית|ה|ת)$/u;
const MASCULINE_PLURAL = /ים$/u;

/** A best guess from the Hebrew ending. Singular unmarked words read as masculine. */
export function inferHebrewGender(phrase: string): GrammaticalGender | null {
  const head = spokenKey(phrase.trim().split(/\s+/)[0] ?? "");
  if (head.length < 2) {
    return null;
  }
  if (FEMININE.test(head)) {
    return "feminine";
  }
  if (MASCULINE_PLURAL.test(head)) {
    return "masculine";
  }
  return "masculine";
}

export function storyPartOfSpeech(phrase: string): PartOfSpeech {
  return phrase.trim().split(/\s+/).length > 1 ? "phrase" : "noun";
}

export function storyWordKey(phrase: string) {
  const key = spokenKey(phrase);
  return `story-${key || "word"}`.slice(0, 100);
}

/** The story line that contains the phrase, with its translation. */
export function exampleFromStory(hebrew: string, gloss: string, phrase: string) {
  const key = spokenKey(phrase);
  if (!key) {
    return null;
  }
  const line = pairedTranscript(hebrew, gloss).find((item) => spokenKey(item.hebrew).includes(key));
  if (!line) {
    return null;
  }
  return { hebrew: line.hebrew.slice(0, 400), gloss: line.gloss.slice(0, 400) };
}
