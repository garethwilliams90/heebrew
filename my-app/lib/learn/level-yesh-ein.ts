import type { BasicWord } from "@/lib/learn/basic-words";
import { assertGlosses, sentence, takeSentences, word, type BuilderSentence, type HearCard } from "@/lib/learn/sentences";

// ============================================================================
// VOCABULARY PLACEHOLDER
// ============================================================================
// This file contains the structure for the Yesh/Ein (There is/There isn't) level.
// The caller will add vocabulary sentences here when they return.
//
// To add vocabulary:
// 1. Define word constants using word(hebrew, en, fr, es, audio?)
// 2. Add HearCard entries for yesh/ein concepts
// 3. Add sentence() calls in the exercise arrays below
//
// Core concepts:
// - יש (yesh - there is, there are)
// - אין (ein - there isn't, there aren't)
//
// Exercises included: 2, 3A, 3B, 5, 6, 7, 8
// (Note: Exercise 4 is intentionally skipped)
// ============================================================================

// Yesh and Ein concept cards
export const yeshEinForms: readonly HearCard[] = [
  // { id: "yesh", hebrew: "יֵשׁ", caption: { en: "there is, there are", fr: "il y a", es: "hay" } },
  // { id: "ein", hebrew: "אֵין", caption: { en: "there isn't, there aren't", fr: "il n'y a pas", es: "no hay" } },
];

// Exercise 2
const exercise2: readonly BuilderSentence[] = [
  // Add sentences here using yesh/ein
];

// Exercise 3A
const exercise3A: readonly BuilderSentence[] = [
  // Add sentences here using yesh/ein
];

// Exercise 3B
const exercise3B: readonly BuilderSentence[] = [
  // Add sentences here using yesh/ein
];

// Exercise 5
const exercise5: readonly BuilderSentence[] = [
  // Add sentences here using yesh/ein
];

// Exercise 6
const exercise6: readonly BuilderSentence[] = [
  // Add sentences here using yesh/ein
];

// Exercise 7
const exercise7: readonly BuilderSentence[] = [
  // Add sentences here using yesh/ein
];

// Exercise 8
const exercise8: readonly BuilderSentence[] = [
  // Add sentences here using yesh/ein
];

const allExercises = [...exercise2, ...exercise3A, ...exercise3B, ...exercise5, ...exercise6, ...exercise7, ...exercise8];

assertGlosses("yesh-ein", allExercises);

export const yeshEinBank: readonly BuilderSentence[] = allExercises;

// Separate practice functions for each exercise
export function yeshEinExercise2() {
  return takeSentences(exercise2, 3);
}

export function yeshEinExercise3A() {
  return takeSentences(exercise3A, 3);
}

export function yeshEinExercise3B() {
  return takeSentences(exercise3B, 3);
}

export function yeshEinExercise5() {
  return takeSentences(exercise5, 3);
}

export function yeshEinExercise6() {
  return takeSentences(exercise6, 3);
}

export function yeshEinExercise7() {
  return takeSentences(exercise7, 3);
}

export function yeshEinExercise8() {
  return takeSentences(exercise8, 3);
}

// Known words introduced in this level
export const yeshEinKnownWords: readonly BasicWord[] = [
  // { id: "yesh", hebrew: "יֵשׁ", english: "there is/are", reading: "yesh", partOfSpeech: "adverb", gender: null },
  // { id: "ein", hebrew: "אֵין", english: "there isn't/aren't", reading: "ein", partOfSpeech: "adverb", gender: null },
];
