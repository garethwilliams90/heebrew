import type { BasicWord } from "@/lib/learn/basic-words";
import { assertGlosses, sentence, takeSentences, word, type BuilderSentence, type HearCard } from "@/lib/learn/sentences";

// ============================================================================
// VOCABULARY PLACEHOLDER
// ============================================================================
// This file contains the structure for the Ahava (Love/Like) level.
// The caller will add vocabulary sentences here when they return.
//
// To add vocabulary:
// 1. Define word constants using word(hebrew, en, fr, es, audio?)
// 2. Add HearCard entries for verb forms in loveForms
// 3. Add sentence() calls in the practice arrays below
// ============================================================================

// Present tense forms of לאהוב (to love/like)
// TODO: Add audio paths from bundle if available
export const loveForms: readonly HearCard[] = [
  // { id: "ohev", hebrew: "אוֹהֵב", label: "formMs" }, // he loves/likes (masculine singular)
  // { id: "ohevet", hebrew: "אוֹהֶבֶת", label: "formFs" }, // she loves/likes (feminine singular)
  // { id: "ohavim", hebrew: "אוֹהֲבִים", label: "formMp" }, // they love/like (masculine plural)
  // { id: "ohavot", hebrew: "אוֹהֲבוֹת", label: "formFp" }, // they love/like (feminine plural)
];

// Practice sentences using לאהוב
// TODO: Add sentences here following the pattern:
// sentence("id", { en: "...", fr: "...", es: "..." }, [word1, word2, ...])
const practiceSentences: readonly BuilderSentence[] = [
  // Example structure (remove when adding real sentences):
  // sentence("ani-ohev-ochel", { en: "I like food", fr: "J'aime la nourriture", es: "Me gusta la comida" }, [ani, ohev, ochel]),
];

assertGlosses("ahava", practiceSentences);

export const ahavaBank: readonly BuilderSentence[] = practiceSentences;

export function ahavaPractice() {
  return takeSentences(practiceSentences, 6);
}

// Known words introduced in this level
export const ahavaKnownWords: readonly BasicWord[] = [
  // Example structure (remove when adding real words):
  // { id: "ohev", hebrew: "אוֹהֵב", english: "loves", reading: "ohev", partOfSpeech: "verb", gender: "masculine" },
];
