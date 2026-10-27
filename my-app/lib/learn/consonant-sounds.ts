import { lessonAudioUrl } from "@/lib/audio/lesson-audio";

export type ConsonantForm = {
  glyph: string;
  file: string | null;
  sound: string;
};

const dagesh = "\u05BC";

// These letters have two consonant sounds. Shin’s s sound uses the samekh clip.
// Undotted kaf is the same kh as chet, so that form uses the chet clip.
const forms: Record<string, readonly ConsonantForm[]> = {
  bet: [
    { glyph: "ב", file: "02_bet_soft.mp3", sound: "v" },
    { glyph: `ב${dagesh}`, file: "03_bet_hard.mp3", sound: "b" },
  ],
  kaf: [
    { glyph: "כ", file: "09_het.mp3", sound: "kh" },
    { glyph: `כ${dagesh}`, file: "13_kaf_hard.mp3", sound: "k" },
  ],
  shin: [
    { glyph: "ש\u05C1", file: "23_shin.mp3", sound: "sh" },
    { glyph: "ש\u05C2", file: "17_samekh.mp3", sound: "s" },
  ],
  pe: [
    { glyph: "פ", file: "19_pe_soft.mp3", sound: "f" },
    { glyph: `פ${dagesh}`, file: null, sound: "p" },
  ],
};

export function consonantForms(letterId: string) {
  return forms[letterId] ?? null;
}

const pairedLetters = new Set(["bet", "kaf", "pe", "shin"]);

// Bet, kaf, pe, and shin each have two readings. The chart shows both.
export function letterPair(letterId: string) {
  if (!pairedLetters.has(letterId)) {
    return null;
  }

  return forms[letterId] ?? null;
}

export function hasTwoSounds(letterId: string) {
  const pair = letterPair(letterId);
  return pair != null && new Set(pair.map((form) => form.sound)).size > 1;
}

const letters: readonly { id: string; file: string }[] = [
  { id: "aleph", file: "01_alef.mp3" },
  { id: "bet", file: "03_bet_hard.mp3" },
  { id: "gimel", file: "04_gimel.mp3" },
  { id: "dalet", file: "05_dalet.mp3" },
  { id: "he", file: "06_he.mp3" },
  { id: "vav", file: "07_vav.mp3" },
  { id: "zayin", file: "08_zayin.mp3" },
  { id: "chet", file: "09_het.mp3" },
  { id: "tet", file: "10_tet.mp3" },
  { id: "yod", file: "11_yod.mp3" },
  { id: "kaf", file: "13_kaf_hard.mp3" },
  { id: "lamed", file: "14_lamed.mp3" },
  { id: "mem", file: "15_mem.mp3" },
  { id: "nun", file: "16_nun.mp3" },
  { id: "samekh", file: "17_samekh.mp3" },
  { id: "ayin", file: "18_ayin.mp3" },
  { id: "pe", file: "19_pe_soft.mp3" },
  { id: "tsadi", file: "20_tsadi.mp3" },
  { id: "kuf", file: "21_qof.mp3" },
  { id: "reish", file: "22_resh.mp3" },
  { id: "shin", file: "23_shin.mp3" },
  { id: "tav", file: "24_tav.mp3" },
  { id: "kafSofit", file: "09_het.mp3" },
  { id: "memSofit", file: "15_mem.mp3" },
  { id: "nunSofit", file: "16_nun.mp3" },
  { id: "peSofit", file: "19_pe_soft.mp3" },
  { id: "tsadiSofit", file: "20_tsadi.mp3" },
];

export function consonantSrc(file: string) {
  return lessonAudioUrl(`letters/${file}`);
}

export function letterConsonantSrc(letterId: string) {
  const file = letters.find((letter) => letter.id === letterId)?.file;
  return file ? consonantSrc(file) : null;
}
