import type { BasicWord } from "@/lib/learn/basic-words";
import { assertGlosses, sentence, takeSentences, word, type BuilderSentence, type HearCard } from "@/lib/learn/sentences";

// ============================================================================
// VOCABULARY PLACEHOLDER
// ============================================================================
// This file contains the structure for the Ratzon (Want) level.
// The caller will add vocabulary sentences here when they return.
//
// To add vocabulary:
// 1. Define word constants using word(hebrew, en, fr, es, audio?)
// 2. Add HearCard entries for verb forms in wantForms
// 3. Add sentence() calls in the practice arrays below
//
// Present tense forms needed:
// - אני רוצה (ani rotze - I want, masculine)
// - רוצה (rotze - wants, masculine)
// - רוצים (rotzim - want, masculine plural)
// - רוצות (rotzot - want, feminine plural)
//
// Example sentence: אני רוצה אוכל (ani rotze okhel - I want food)
// ============================================================================

// Present tense forms of לרצות (to want)
export const wantForms: readonly HearCard[] = [
  // { id: "rotze", hebrew: "רוֹצֶה", label: "formMs" }, // wants (masculine singular)
  // { id: "rotza", hebrew: "רוֹצָה", label: "formFs" }, // wants (feminine singular)
  // { id: "rotzim", hebrew: "רוֹצִים", label: "formMp" }, // want (masculine plural)
  // { id: "rotzot", hebrew: "רוֹצוֹת", label: "formFp" }, // want (feminine plural)
];

// Practice sentences using לרצות
const practiceSentences: readonly BuilderSentence[] = [
  // Example structure (remove when adding real sentences):
  // sentence("ani-rotze-ochel", { en: "I want food", fr: "Je veux de la nourriture", es: "Quiero comida" }, [ani, rotze, ochel]),
  // Add more sentences covering all forms: rotze, rotza, rotzim, rotzot
];

assertGlosses("ratzon", practiceSentences);

export const ratzonBank: readonly BuilderSentence[] = practiceSentences;

export function ratzonPractice() {
  return takeSentences(practiceSentences, 6);
}

// Known words introduced in this level
export const ratzonKnownWords: readonly BasicWord[] = [
  // Example structure (remove when adding real words):
  // { id: "rotze", hebrew: "רוֹצֶה", english: "want", reading: "rotze", partOfSpeech: "verb", gender: "masculine" },
];
