// A fixed set of letter + vowel cards. Israeli Hebrew reads these the same way every time.

const dagesh = "\u05BC";
const shinDot = "\u05C1";
const sinDot = "\u05C2";

export const nikudDeckId = "aleph-bet-nikud";

export type NikudCard = {
  id: string;
  glyph: string;
  sound: string;
  vowel: string;
};

type Vowel = {
  id: string;
  mark: string;
  sound: string;
  gutturalOnly?: boolean;
};

type Base = {
  id: string;
  letter: string;
  onset: string;
  dagesh?: boolean;
  shin?: boolean;
  sin?: boolean;
  guttural?: boolean;
};

const vowels: Vowel[] = [
  { id: "kamatz", mark: "\u05B8", sound: "a" },
  { id: "patach", mark: "\u05B7", sound: "a" },
  { id: "hatafKamatz", mark: "\u05B3", sound: "o", gutturalOnly: true },
  { id: "hatafPatach", mark: "\u05B2", sound: "a", gutturalOnly: true },
  { id: "segol", mark: "\u05B6", sound: "e" },
  { id: "tsere", mark: "\u05B5", sound: "e" },
  { id: "hatafSegol", mark: "\u05B1", sound: "e", gutturalOnly: true },
  { id: "hiriq", mark: "\u05B4", sound: "i" },
  { id: "holam", mark: "\u05B9", sound: "o" },
  { id: "kubutz", mark: "\u05BB", sound: "u" },
  { id: "shva", mark: "\u05B0", sound: "e" },
];

const bases: Base[] = [
  { id: "aleph", letter: "א", onset: "", guttural: true },
  { id: "bet", letter: "ב", onset: "b", dagesh: true },
  { id: "vet", letter: "ב", onset: "v" },
  { id: "gimel", letter: "ג", onset: "g" },
  { id: "dalet", letter: "ד", onset: "d" },
  { id: "he", letter: "ה", onset: "h", guttural: true },
  { id: "vav", letter: "ו", onset: "v" },
  { id: "zayin", letter: "ז", onset: "z" },
  { id: "chet", letter: "ח", onset: "kh", guttural: true },
  { id: "tet", letter: "ט", onset: "t" },
  { id: "yod", letter: "י", onset: "y" },
  { id: "kaf", letter: "כ", onset: "k", dagesh: true },
  { id: "khaf", letter: "כ", onset: "kh" },
  { id: "lamed", letter: "ל", onset: "l" },
  { id: "mem", letter: "מ", onset: "m" },
  { id: "nun", letter: "נ", onset: "n" },
  { id: "samekh", letter: "ס", onset: "s" },
  { id: "ayin", letter: "ע", onset: "", guttural: true },
  { id: "pe", letter: "פ", onset: "p", dagesh: true },
  { id: "fe", letter: "פ", onset: "f" },
  { id: "tsadi", letter: "צ", onset: "ts" },
  { id: "kuf", letter: "ק", onset: "k" },
  { id: "reish", letter: "ר", onset: "r" },
  { id: "shin", letter: "ש", onset: "sh", shin: true },
  { id: "sin", letter: "ש", onset: "s", sin: true },
  { id: "tav", letter: "ת", onset: "t" },
];

function glyphFor(base: Base, mark: string) {
  return `${base.letter}${base.shin ? shinDot : ""}${base.sin ? sinDot : ""}${base.dagesh ? dagesh : ""}${mark}`;
}

function buildNikudDeck(): NikudCard[] {
  const cards: NikudCard[] = [];

  for (const base of bases) {
    for (const vowel of vowels) {
      if (vowel.gutturalOnly && !base.guttural) {
        continue;
      }

      // Holam and kubutz on vav are the vowel letters וֹ and וּ, added below.
      if (base.id === "vav" && (vowel.id === "holam" || vowel.id === "kubutz")) {
        continue;
      }

      cards.push({
        id: `${base.id}-${vowel.id}`,
        glyph: glyphFor(base, vowel.mark),
        sound: `${base.onset}${vowel.sound}`,
        vowel: vowel.id,
      });
    }
  }

  cards.push(
    { id: "vav-holam", glyph: `ו${"\u05B9"}`, sound: "o", vowel: "holam" },
    { id: "vav-shuruk", glyph: `ו${dagesh}`, sound: "u", vowel: "shuruk" },
  );

  return cards;
}

export const nikudDeck: readonly NikudCard[] = buildNikudDeck();
