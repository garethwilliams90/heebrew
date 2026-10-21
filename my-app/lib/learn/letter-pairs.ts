import type { GrammaticalGender } from "@/lib/flashcards/types";
import type { BasicWord } from "@/lib/learn/basic-words";

export type PairGloss = {
  en: string;
  fr: string;
  es: string;
};

export type PairWord = {
  id: string;
  letterId: string;
  hebrew: string;
  gloss: PairGloss;
  gender: GrammaticalGender;
};

export type LetterPairLevel = {
  level: number;
  letterIds: readonly string[];
  words: readonly PairWord[];
};

const earlyIds = ["aleph", "bet", "gimel", "dalet", "he"] as const;

export const letterPairLevels: readonly LetterPairLevel[] = [
  {
    level: 3,
    letterIds: ["vav", "zayin"],
    words: [
      { id: "vered", letterId: "vav", hebrew: "וֶרֶד", gloss: { en: "rose", fr: "rose", es: "rosa" }, gender: "masculine" },
      { id: "zahav", letterId: "zayin", hebrew: "זָהָב", gloss: { en: "gold", fr: "or", es: "oro" }, gender: "masculine" },
    ],
  },
  {
    level: 4,
    letterIds: ["chet", "tet"],
    words: [
      { id: "chalav", letterId: "chet", hebrew: "חָלָב", gloss: { en: "milk", fr: "lait", es: "leche" }, gender: "masculine" },
      { id: "tal", letterId: "tet", hebrew: "טַל", gloss: { en: "dew", fr: "rosée", es: "rocío" }, gender: "masculine" },
    ],
  },
  {
    level: 5,
    letterIds: ["yod", "kaf"],
    words: [
      { id: "yad", letterId: "yod", hebrew: "יָד", gloss: { en: "hand", fr: "main", es: "mano" }, gender: "feminine" },
      { id: "kelev", letterId: "kaf", hebrew: "כֶּלֶב", gloss: { en: "dog", fr: "chien", es: "perro" }, gender: "masculine" },
      { id: "melech", letterId: "kaf", hebrew: "מֶלֶךְ", gloss: { en: "king", fr: "roi", es: "rey" }, gender: "masculine" },
    ],
  },
  {
    level: 6,
    letterIds: ["lamed", "mem"],
    words: [
      { id: "lechem", letterId: "lamed", hebrew: "לֶחֶם", gloss: { en: "bread", fr: "pain", es: "pan" }, gender: "masculine" },
      { id: "mayim", letterId: "mem", hebrew: "מַיִם", gloss: { en: "water", fr: "eau", es: "agua" }, gender: "masculine" },
      { id: "shalom", letterId: "mem", hebrew: "שָׁלוֹם", gloss: { en: "peace", fr: "paix", es: "paz" }, gender: "masculine" },
    ],
  },
  {
    level: 7,
    letterIds: ["nun", "samekh"],
    words: [
      { id: "ner", letterId: "nun", hebrew: "נֵר", gloss: { en: "candle", fr: "bougie", es: "vela" }, gender: "masculine" },
      { id: "sus", letterId: "samekh", hebrew: "סוּס", gloss: { en: "horse", fr: "cheval", es: "caballo" }, gender: "masculine" },
      { id: "gan", letterId: "nun", hebrew: "גַּן", gloss: { en: "garden", fr: "jardin", es: "jardín" }, gender: "masculine" },
    ],
  },
  {
    level: 8,
    letterIds: ["ayin", "pe"],
    words: [
      { id: "ayin-word", letterId: "ayin", hebrew: "עַיִן", gloss: { en: "eye", fr: "œil", es: "ojo" }, gender: "feminine" },
      { id: "peh", letterId: "pe", hebrew: "פֶּה", gloss: { en: "mouth", fr: "bouche", es: "boca" }, gender: "masculine" },
      { id: "af", letterId: "pe", hebrew: "אַף", gloss: { en: "nose", fr: "nez", es: "nariz" }, gender: "masculine" },
    ],
  },
  {
    level: 9,
    letterIds: ["tsadi", "kuf"],
    words: [
      { id: "tsel", letterId: "tsadi", hebrew: "צֵל", gloss: { en: "shadow", fr: "ombre", es: "sombra" }, gender: "masculine" },
      { id: "kol-voice", letterId: "kuf", hebrew: "קוֹל", gloss: { en: "voice", fr: "voix", es: "voz" }, gender: "masculine" },
      { id: "ets", letterId: "tsadi", hebrew: "עֵץ", gloss: { en: "tree", fr: "arbre", es: "árbol" }, gender: "masculine" },
    ],
  },
  {
    level: 10,
    letterIds: ["reish", "shin"],
    words: [
      { id: "rosh", letterId: "reish", hebrew: "רֹאשׁ", gloss: { en: "head", fr: "tête", es: "cabeza" }, gender: "masculine" },
      { id: "shem", letterId: "shin", hebrew: "שֵׁם", gloss: { en: "name", fr: "nom", es: "nombre" }, gender: "masculine" },
    ],
  },
  {
    level: 11,
    letterIds: ["tav"],
    words: [{ id: "bat", letterId: "tav", hebrew: "בַּת", gloss: { en: "daughter", fr: "fille", es: "hija" }, gender: "feminine" }],
  },
];

export function letterPair(level: number) {
  return letterPairLevels.find((item) => item.level === level) ?? null;
}

export function pairKnownWord(word: PairWord): BasicWord {
  return {
    id: word.id,
    hebrew: word.hebrew,
    english: word.gloss.en,
    reading: word.id,
    partOfSpeech: "noun",
    gender: word.gender,
  };
}

export function lettersThrough(level: number) {
  const ids = new Set<string>(earlyIds);
  for (const item of letterPairLevels) {
    if (item.level <= level) {
      for (const id of item.letterIds) {
        ids.add(id);
      }
    }
  }
  return ids;
}
