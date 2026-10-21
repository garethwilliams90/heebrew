export type ConsonantLesson = {
  id: string;
  file: string;
  letter: string;
  readings: readonly string[];
  forms: readonly string[];
};

// Bet and kaf use the hard clip. Pe only has the soft clip in the set.
const lessons: readonly ConsonantLesson[] = [
  { id: "aleph", file: "01_alef_א.mp3", letter: "א", readings: ["ah", "a"], forms: ["אה", "הא", "אא"] },
  { id: "bet", file: "03_bet_hard_בּ.mp3", letter: "ב", readings: ["bah", "ba"], forms: ["בה", "בא"] },
  { id: "gimel", file: "04_gimel_ג.mp3", letter: "ג", readings: ["gah", "ga"], forms: ["גה", "גא"] },
  { id: "dalet", file: "05_dalet_ד.mp3", letter: "ד", readings: ["dah", "da"], forms: ["דה", "דא"] },
  { id: "he", file: "06_he_ה.mp3", letter: "ה", readings: ["hah", "ha"], forms: ["הה", "הא"] },
  { id: "vav", file: "07_vav_ו.mp3", letter: "ו", readings: ["vah", "va"], forms: ["וה", "וא"] },
  { id: "zayin", file: "08_zayin_ז.mp3", letter: "ז", readings: ["zah", "za"], forms: ["זה", "זא"] },
  { id: "chet", file: "09_het_ח.mp3", letter: "ח", readings: ["khah", "cha", "kh"], forms: ["חה", "חא"] },
  { id: "tet", file: "10_tet_ט.mp3", letter: "ט", readings: ["tah", "ta"], forms: ["טה", "טא"] },
  { id: "yod", file: "11_yod_י.mp3", letter: "י", readings: ["yah", "ya"], forms: ["יה", "יא"] },
  { id: "kaf", file: "13_kaf_hard_כּ.mp3", letter: "כ", readings: ["kah", "ka"], forms: ["כה", "כא"] },
  { id: "lamed", file: "14_lamed_ל.mp3", letter: "ל", readings: ["lah", "la"], forms: ["לה", "לא"] },
  { id: "mem", file: "15_mem_מ.mp3", letter: "מ", readings: ["mah", "ma"], forms: ["מה", "מא"] },
  { id: "nun", file: "16_nun_נ.mp3", letter: "נ", readings: ["nah", "na"], forms: ["נה", "נא"] },
  { id: "samekh", file: "17_samekh_ס.mp3", letter: "ס", readings: ["sah", "sa"], forms: ["סה", "סא"] },
  { id: "ayin", file: "18_ayin_ע.mp3", letter: "ע", readings: ["ah", "a"], forms: ["עה", "עא", "אה", "הא"] },
  { id: "pe", file: "19_pe_soft_פ.mp3", letter: "פ", readings: ["fah", "fa"], forms: ["פה", "פא"] },
  { id: "tsadi", file: "20_tsadi_צ.mp3", letter: "צ", readings: ["tsah", "tsa", "tzah"], forms: ["צה", "צא"] },
  { id: "kuf", file: "21_qof_ק.mp3", letter: "ק", readings: ["kah", "ka"], forms: ["קה", "קא"] },
  { id: "reish", file: "22_resh_ר.mp3", letter: "ר", readings: ["rah", "ra"], forms: ["רה", "רא"] },
  { id: "shin", file: "23_shin_ש.mp3", letter: "ש", readings: ["shah", "sha"], forms: ["שה", "שא"] },
  { id: "tav", file: "24_tav_ת.mp3", letter: "ת", readings: ["tah", "ta"], forms: ["תה", "תא"] },
];

const nikud = /[\u0591-\u05C7]/g;

export const consonantLessons = lessons;

export function consonantSrc(file: string) {
  return `/sounds/hebrew_letter_sounds_24_mp3s/${encodeURIComponent(file)}`;
}

export function normalizeSpeech(value: string) {
  return value.normalize("NFKC").replace(nikud, "").replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase();
}

const ahMark = /[\u05B7\u05B8]/;

export function saidWithAh(lesson: ConsonantLesson, transcript: string) {
  const compact = transcript.normalize("NFKC").replace(/\s+/g, "");
  const marked = compact.indexOf(lesson.letter);
  if (marked >= 0 && ahMark.test(compact.slice(marked + 1, marked + 3))) {
    return true;
  }

  const heard = normalizeSpeech(transcript);
  if (!heard) {
    return false;
  }

  const hebrew = heard.replace(/[^\u0590-\u05FF]/g, "");
  if (hebrew) {
    return lesson.forms.some((form) => normalizeSpeech(form) === hebrew);
  }

  const words = transcript.toLowerCase().match(/[a-z]+/g) ?? [];
  const target = lesson.readings[0] ?? "";
  const stem = target.replace(/ah$|a$/, "");
  return words.some((word) => soundsLikeAh(word, stem, lesson.readings));
}

function soundsLikeAh(word: string, stem: string, readings: readonly string[]) {
  const simple = word.replace(/uh$/, "a").replace(/ah$/, "a").replace(/er$/, "a");
  if (readings.some((reading) => reading.replace(/uh$/, "a").replace(/ah$/, "a") === simple)) {
    return true;
  }
  if (!stem) {
    return /^a+$/.test(simple);
  }
  return simple.startsWith(stem) && simple.length <= stem.length + 2 && simple.slice(stem.length).includes("a");
}
