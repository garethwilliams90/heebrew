import { letterCatalog, type LetterFact } from "@/lib/alephbet/letter-info";

const shva = "\u05B0";
const patach = "\u05B7";
const dagesh = "\u05BC";
const shinDot = "\u05C1";

// Azure reads a lone Hebrew letter as its name (aleph, gimel). These phones force the consonant.
const consonant: Record<string, string> = {
  aleph: "a",
  bet: "b",
  gimel: "g",
  dalet: "d",
  he: "h",
  vav: "v",
  zayin: "z",
  chet: "x",
  tet: "t",
  yod: "j",
  kaf: "k",
  lamed: "l",
  mem: "m",
  nun: "n",
  samekh: "s",
  ayin: "ʔ",
  pe: "p",
  tsadi: "t͡s",
  kuf: "k",
  reish: "ʁ",
  shin: "ʃ",
  tav: "t",
};

type Vowel = "none" | "a" | "e" | "i" | "o" | "u";

const nikudVowel: Record<string, Vowel> = {
  kamatz: "a",
  patach: "a",
  tsere: "e",
  segol: "e",
  shva: "none",
  hiriq: "i",
  holam: "o",
  holamVav: "o",
  kubutz: "u",
  shuruk: "u",
};

export function alphabetLetters(): LetterFact[] {
  return letterCatalog.filter((item) => item.kind === "letter");
}

function grapheme(letter: LetterFact, mark = "") {
  const extra = letter.id === "shin" ? shinDot : letter.id === "bet" || letter.id === "kaf" || letter.id === "pe" ? dagesh : "";
  return `${letter.letter}${extra}${mark}`;
}

function syllable(letter: LetterFact, vowel: Vowel) {
  if (letter.id === "aleph") {
    return vowel === "none" ? "a" : vowel;
  }

  if (letter.id === "ayin") {
    return vowel === "none" ? "ʔa" : `ʔ${vowel}`;
  }

  const sound = consonant[letter.id] ?? "";
  return vowel === "none" ? sound : `${sound}${vowel}`;
}

const lessonPhonemes = new Set(
  alphabetLetters().flatMap((letter) =>
    (["none", "a", "e", "i", "o", "u"] as const).map((vowel) => syllable(letter, vowel)),
  ),
);

export function isLessonPhoneme(value: string) {
  return lessonPhonemes.has(value);
}

export type SpeechCue = {
  text: string;
  phoneme: string;
};

export function consonantCue(letter: LetterFact): SpeechCue {
  return { text: grapheme(letter, shva), phoneme: syllable(letter, "none") };
}

export function nikudCue(letter: LetterFact, nikudId: string): SpeechCue {
  const step = nikudCycle.find((item) => item.id === nikudId) ?? nikudCycle[0];
  const vowel = nikudVowel[step.id] ?? "a";
  return { text: grapheme(letter, `${step.mark}${step.tail}`), phoneme: syllable(letter, vowel) };
}

export function patachCue(letter: LetterFact): SpeechCue {
  return { text: grapheme(letter, patach), phoneme: syllable(letter, "a") };
}

export const nikudCycle = [
  { id: "kamatz", label: "nikudKamatz", mark: "\u05B8", tail: "" },
  { id: "patach", label: "nikudPatach", mark: patach, tail: "" },
  { id: "tsere", label: "nikudTsere", mark: "\u05B5", tail: "" },
  { id: "segol", label: "nikudSegol", mark: "\u05B6", tail: "" },
  { id: "shva", label: "nikudShva", mark: shva, tail: "" },
  { id: "hiriq", label: "nikudHiriq", mark: "\u05B4", tail: "" },
  { id: "kubutz", label: "nikudKubutz", mark: "\u05BB", tail: "" },
  { id: "shuruk", label: "nikudShuruk", mark: "", tail: "\u05D5\u05BC" },
  { id: "holam", label: "nikudHolam", mark: "\u05B9", tail: "" },
  { id: "holamVav", label: "nikudHolamVav", mark: "", tail: "\u05D5\u05B9" },
] as const;

export const focusNikud = [nikudCycle[0], nikudCycle[2], nikudCycle[4], nikudCycle[5], nikudCycle[8]] as const;

export const patachMark = patach;
