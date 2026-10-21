export type SpeakVowel = "patach" | "segol" | "hiriq" | "kubutz" | "holam";

export type SpeakStep = {
  id: string;
  letterId: string;
  letter: string;
  file: string;
  vowel: SpeakVowel;
  mark: string;
  sound: string;
  consonant: string;
  accept: readonly string[];
  reject: readonly string[];
};

type VowelShape = {
  id: SpeakVowel;
  mark: string;
  sound: string;
  endings: readonly string[];
};

type LetterSound = {
  id: string;
  file: string;
  letter: string;
  consonant: string;
  stems: readonly string[];
};

const vowels: readonly VowelShape[] = [
  { id: "patach", mark: "\u05B7", sound: "ah", endings: ["ah", "a"] },
  { id: "segol", mark: "\u05B6", sound: "eh", endings: ["eh"] },
  { id: "hiriq", mark: "\u05B4", sound: "ee", endings: ["ee", "i"] },
  { id: "kubutz", mark: "\u05BB", sound: "oo", endings: ["oo", "u"] },
  { id: "holam", mark: "\u05B9", sound: "oh", endings: ["oh", "o"] },
];

const letters: readonly LetterSound[] = [
  { id: "aleph", file: "01_alef_א.mp3", letter: "א", consonant: "quiet", stems: [""] },
  { id: "bet", file: "03_bet_hard_בּ.mp3", letter: "ב", consonant: "b", stems: ["b"] },
  { id: "gimel", file: "04_gimel_ג.mp3", letter: "ג", consonant: "g", stems: ["g"] },
  { id: "dalet", file: "05_dalet_ד.mp3", letter: "ד", consonant: "d", stems: ["d"] },
  { id: "he", file: "06_he_ה.mp3", letter: "ה", consonant: "h", stems: ["h"] },
  { id: "vav", file: "07_vav_ו.mp3", letter: "ו", consonant: "v", stems: ["v"] },
  { id: "zayin", file: "08_zayin_ז.mp3", letter: "ז", consonant: "z", stems: ["z"] },
  { id: "chet", file: "09_het_ח.mp3", letter: "ח", consonant: "kh", stems: ["kh", "ch"] },
  { id: "tet", file: "10_tet_ט.mp3", letter: "ט", consonant: "t", stems: ["t"] },
  { id: "yod", file: "11_yod_י.mp3", letter: "י", consonant: "y", stems: ["y"] },
  { id: "kaf", file: "13_kaf_hard_כּ.mp3", letter: "כ", consonant: "k", stems: ["k"] },
  { id: "lamed", file: "14_lamed_ל.mp3", letter: "ל", consonant: "l", stems: ["l"] },
  { id: "mem", file: "15_mem_מ.mp3", letter: "מ", consonant: "m", stems: ["m"] },
  { id: "nun", file: "16_nun_נ.mp3", letter: "נ", consonant: "n", stems: ["n"] },
  { id: "samekh", file: "17_samekh_ס.mp3", letter: "ס", consonant: "s", stems: ["s"] },
  { id: "ayin", file: "18_ayin_ע.mp3", letter: "ע", consonant: "quiet", stems: [""] },
  { id: "pe", file: "19_pe_soft_פ.mp3", letter: "פ", consonant: "f", stems: ["f"] },
  { id: "tsadi", file: "20_tsadi_צ.mp3", letter: "צ", consonant: "ts", stems: ["ts", "tz"] },
  { id: "kuf", file: "21_qof_ק.mp3", letter: "ק", consonant: "k", stems: ["k"] },
  { id: "reish", file: "22_resh_ר.mp3", letter: "ר", consonant: "r", stems: ["r"] },
  { id: "shin", file: "23_shin_ש.mp3", letter: "ש", consonant: "sh", stems: ["sh"] },
  { id: "tav", file: "24_tav_ת.mp3", letter: "ת", consonant: "t", stems: ["t"] },
];

function tokens(stems: readonly string[], endings: readonly string[]) {
  return stems.flatMap((stem) => endings.map((ending) => `${stem}${ending}`));
}

function makeStep(letter: LetterSound, vowel: VowelShape): SpeakStep {
  const otherEndings = vowels.filter((item) => item.id !== vowel.id).flatMap((item) => item.endings);
  const accept = tokens(letter.stems, vowel.endings);
  const reject = tokens(letter.stems, [...otherEndings, "aw"]).filter((token) => token.length > 0 && !accept.includes(token));

  return {
    id: `${letter.id}-${vowel.id}`,
    letterId: letter.id,
    letter: letter.letter,
    file: letter.file,
    vowel: vowel.id,
    mark: vowel.mark,
    sound: `${letter.stems.find((stem) => stem.length > 0) ?? ""}${vowel.sound}`,
    consonant: letter.consonant,
    accept,
    reject,
  };
}

const gimel = letters.find((letter) => letter.id === "gimel");
if (!gimel) {
  throw new Error("Gimel is missing from the speak lessons");
}

const gimelGate = vowels.map((vowel) => makeStep(gimel, vowel));
const later = letters
  .filter((letter) => letter.id !== "gimel")
  .map((letter, index) => makeStep(letter, vowels[index % vowels.length]));

export const speakSteps: readonly SpeakStep[] = [...gimelGate, ...later];

export function consonantSrc(file: string) {
  return `/sounds/hebrew_letter_sounds_24_mp3s/${encodeURIComponent(file)}`;
}

export function saidSyllable(step: SpeakStep, transcript: string) {
  const words = transcript.toLowerCase().match(/[a-z]+/g) ?? [];
  if (words.some((word) => step.reject.includes(word))) {
    return false;
  }
  if (words.some((word) => step.accept.includes(word))) {
    return true;
  }

  const compact = transcript.normalize("NFKC").replace(/\s+/g, "");
  return compact.includes(step.letter) && compact.includes(step.mark);
}
