import type { BasicWord } from "@/lib/learn/basic-words";
import { assertGlosses, sentence, takeSentences, word, type BuilderSentence, type HearCard } from "@/lib/learn/sentences";

// ============================================================================
// VOCABULARY PLACEHOLDER
// ============================================================================
// This file contains the structure for the Age and Numbers level.
// The caller will add vocabulary sentences here when they return.
//
// To add vocabulary:
// 1. Define word constants using word(hebrew, en, fr, es, audio?)
// 2. Add HearCard entries for age forms in ageForms
// 3. Add sentence() calls in the practice arrays below
//
// Statement forms needed:
// - אני בן (ani ben - I am [age], masculine) + numbers
// - אני בת (ani bat - I am [age], feminine) + numbers
//
// Question forms needed:
// - בן כמה אתה? (ben kama ata - how old are you, to a male)
// - בת כמה את? (bat kama at - how old are you, to a female)
//
// Numbers: 0-9, building up to 100
// ============================================================================

// Age statement and question forms
export const ageForms: readonly HearCard[] = [
  // Statement forms:
  // { id: "ani-ben", hebrew: "אני בן", caption: { en: "I am (age), masculine", fr: "J'ai (âge), masculin", es: "Tengo (edad), masculino" } },
  // { id: "ani-bat", hebrew: "אני בת", caption: { en: "I am (age), feminine", fr: "J'ai (âge), féminin", es: "Tengo (edad), femenino" } },
  // 
  // Question forms:
  // { id: "ben-kama-ata", hebrew: "בן כמה אתה?", caption: { en: "How old are you? (to a male)", fr: "Quel âge as-tu? (à un homme)", es: "¿Cuántos años tienes? (a un hombre)" } },
  // { id: "bat-kama-at", hebrew: "בת כמה את?", caption: { en: "How old are you? (to a female)", fr: "Quel âge as-tu? (à une femme)", es: "¿Cuántos años tienes? (a una mujer)" } },
];

// Numbers 0-9 (basic)
export const basicNumbers: readonly HearCard[] = [
  // { id: "efes", hebrew: "אפס", caption: { en: "zero", fr: "zéro", es: "cero" } },
  // { id: "echad", hebrew: "אחד", caption: { en: "one", fr: "un", es: "uno" } },
  // { id: "shtayim", hebrew: "שתיים", caption: { en: "two", fr: "deux", es: "dos" } },
  // ... add through 9
];

// Practice sentences with age statements and questions
const practiceSentences: readonly BuilderSentence[] = [
  // Example structure (remove when adding real sentences):
  // sentence("ani-ben-esrim", { en: "I am 20 (masculine)", fr: "J'ai 20 ans (masculin)", es: "Tengo 20 años (masculino)" }, [ani, ben, esrim]),
  // sentence("ben-kama-ata", { en: "How old are you? (to male)", fr: "Quel âge as-tu?", es: "¿Cuántos años tienes?" }, [ben, kama, ata]),
];

assertGlosses("age", practiceSentences);

export const ageBank: readonly BuilderSentence[] = practiceSentences;

export function agePractice() {
  return takeSentences(practiceSentences, 6);
}

// Known words introduced in this level
export const ageKnownWords: readonly BasicWord[] = [
  // Numbers and age-related words
  // { id: "ben", hebrew: "בן", english: "son/age", reading: "ben", partOfSpeech: "noun", gender: "masculine" },
  // { id: "bat", hebrew: "בת", english: "daughter/age", reading: "bat", partOfSpeech: "noun", gender: "feminine" },
  // { id: "kama", hebrew: "כמה", english: "how many/how much", reading: "kama", partOfSpeech: "adverb", gender: null },
];
