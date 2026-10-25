import type { GrammaticalGender } from "@/lib/flashcards/types";
import type { LocaleGloss } from "@/lib/learn/sentences";

const pluralMasculine = /masculine plural|masculin pluriel|masculino plural/i;
const pluralFeminine = /feminine plural|féminin pluriel|femenino plural/i;
const masculine = /masculine|masculin|masculino/i;
const feminine = /feminine|féminin|femenino/i;
const writtenNote =
  /\s*\((?:masculine plural|feminine plural|masculine|feminine|masculin pluriel|féminin pluriel|masculin|féminin|masculino plural|femenino plural|masculino|femenino)\)/gi;

export function genderNote(gloss: LocaleGloss): { gender: GrammaticalGender; number: "singular" | "plural" } | null {
  const blob = `${gloss.en} ${gloss.fr} ${gloss.es}`;
  if (pluralMasculine.test(blob)) {
    return { gender: "masculine", number: "plural" };
  }
  if (pluralFeminine.test(blob)) {
    return { gender: "feminine", number: "plural" };
  }
  if (masculine.test(blob)) {
    return { gender: "masculine", number: "singular" };
  }
  if (feminine.test(blob)) {
    return { gender: "feminine", number: "singular" };
  }
  return null;
}

export function stripGenderNote(text: string) {
  return text.replace(writtenNote, "").replace(/\s{2,}/g, " ").trim();
}
