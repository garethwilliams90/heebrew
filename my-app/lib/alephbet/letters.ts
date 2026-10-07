// Spoken Hebrew names. The voice reads these, including the final (sofit) forms.
export const spokenNames: Record<string, string> = {
  א: "אָלֶף",
  ב: "בֵּת",
  ג: "גימֶל",
  ד: "דָלֶת",
  ה: "הֵא",
  ו: "וָו",
  ז: "זַיִן",
  ח: "חֵת",
  ט: "טֵת",
  י: "יוּד",
  כ: "כַּף",
  ך: "כַּף סוֹפִית",
  ל: "לָמֵד",
  מ: "מֵם",
  ם: "מֵם סוֹפִית",
  נ: "נוּן",
  ן: "נוּן סוֹפִית",
  ס: "סָמֶךְ",
  ע: "עַיִן",
  פ: "פֵּא",
  ף: "פֵּא סוֹפִית",
  צ: "צַדי",
  ץ: "צַדי סוֹפִית",
  ק: "קוּף",
  ר: "רֵישׁ",
  ש: "שִׁן",
  ת: "תָו",
};

// Hebrew alphabet in dictionary order, with each letter's phonetic name.
export const letters = {
  א: "aleph",
  ב: "bet",
  ג: "gimel",
  ד: "dalet",
  ה: "he",
  ו: "vav",
  ז: "zayin",
  ח: "chet",
  ט: "tet",
  י: "yod",
  כ: "kaf",
  ך: "kaf sofit",
  ל: "lamed",
  מ: "mem",
  ם: "mem sofit",
  נ: "nun",
  ן: "nun sofit",
  ס: "samekh",
  ע: "ain",
  פ: "pe",
  ף: "pe sofit",
  צ: "tsadi",
  ץ: "tsadi sofit",
  ק: "kuf",
  ר: "reish",
  ש: "shin",
  ת: "tav",
} as const;

// One progress row per letter, stored beside the vocabulary decks.
export const letterDeckId = "aleph-bet";

export type StudyLetter = {
  letter: string;
  name: string;
};

export function letterList(): StudyLetter[] {
  return Object.entries(letters).map(([letter, name]) => ({ letter, name }));
}

export function shuffleLetters<T>(items: readonly T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swap];
    next[swap] = current;
  }

  return next;
}
