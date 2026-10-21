// Anglicised sounds and example words for the alphabet chart.
// Descriptions and glosses live in messages, in the same example order.

const geresh = "\u05F3";

export type LetterExample = {
  word: string;
  reading: string;
};

export type LetterKind = "letter" | "sofit" | "loan";

export type LetterFact = {
  id: string;
  letter: string;
  name: string;
  spoken: string;
  sound: string;
  kind: LetterKind;
  alphabet: number | null;
  base: number | null;
  value: number | null;
  examples: readonly [LetterExample, LetterExample, LetterExample];
};

export const letterCatalog: readonly LetterFact[] = [
  {
    id: "aleph",
    letter: "א",
    name: "aleph",
    spoken: "אָלֶף",
    sound: "a",
    kind: "letter",
    alphabet: 1,
    base: null,
    value: 1,
    examples: [
      { word: "אַבָּא", reading: "aba" },
      { word: "אֲגַם", reading: "agam" },
      { word: "אֶל", reading: "el" },
    ],
  },
  {
    id: "bet",
    letter: "ב",
    name: "bet",
    spoken: "בֵּת",
    sound: "b · v",
    kind: "letter",
    alphabet: 2,
    base: null,
    value: 2,
    examples: [
      { word: "בַּיִת", reading: "bayit" },
      { word: "אֲבָל", reading: "aval" },
      { word: "כּוֹכָב", reading: "kokhav" },
    ],
  },
  {
    id: "gimel",
    letter: "ג",
    name: "gimel",
    spoken: "גימֶל",
    sound: "g",
    kind: "letter",
    alphabet: 3,
    base: null,
    value: 3,
    examples: [
      { word: "גָּמָל", reading: "gamal" },
      { word: "גַּן", reading: "gan" },
      { word: "גָּדוֹל", reading: "gadol" },
    ],
  },
  {
    id: "dalet",
    letter: "ד",
    name: "dalet",
    spoken: "דָלֶת",
    sound: "d",
    kind: "letter",
    alphabet: 4,
    base: null,
    value: 4,
    examples: [
      { word: "דָג", reading: "dag" },
      { word: "דֶּלֶת", reading: "delet" },
      { word: "דֹב", reading: "dov" },
    ],
  },
  {
    id: "he",
    letter: "ה",
    name: "he",
    spoken: "הֵא",
    sound: "h",
    kind: "letter",
    alphabet: 5,
    base: null,
    value: 5,
    examples: [
      { word: "הַר", reading: "har" },
      { word: "הֵם", reading: "hem" },
      { word: "מָה", reading: "ma" },
    ],
  },
  {
    id: "vav",
    letter: "ו",
    name: "vav",
    spoken: "וָו",
    sound: "v · o · u",
    kind: "letter",
    alphabet: 6,
    base: null,
    value: 6,
    examples: [
      { word: "וֶרֶד", reading: "vered" },
      { word: "שָׁלוֹם", reading: "shalom" },
      { word: "רוּחַ", reading: "ruach" },
    ],
  },
  {
    id: "zayin",
    letter: "ז",
    name: "zayin",
    spoken: "זַיִן",
    sound: "z",
    kind: "letter",
    alphabet: 7,
    base: null,
    value: 7,
    examples: [
      { word: "זַיִת", reading: "zayit" },
      { word: "זָהָב", reading: "zahav" },
      { word: "זְמַן", reading: "zman" },
    ],
  },
  {
    id: "chet",
    letter: "ח",
    name: "chet",
    spoken: "חֵת",
    sound: "kh",
    kind: "letter",
    alphabet: 8,
    base: null,
    value: 8,
    examples: [
      { word: "חָתוּל", reading: "khatul" },
      { word: "לֶחֶם", reading: "lekhem" },
      { word: "שָׂמֵחַ", reading: "sameach" },
    ],
  },
  {
    id: "tet",
    letter: "ט",
    name: "tet",
    spoken: "טֵת",
    sound: "t",
    kind: "letter",
    alphabet: 9,
    base: null,
    value: 9,
    examples: [
      { word: "טוֹב", reading: "tov" },
      { word: "מָטוֹס", reading: "matos" },
      { word: "קָטָן", reading: "katan" },
    ],
  },
  {
    id: "yod",
    letter: "י",
    name: "yod",
    spoken: "יוּד",
    sound: "y · i",
    kind: "letter",
    alphabet: 10,
    base: null,
    value: 10,
    examples: [
      { word: "יָד", reading: "yad" },
      { word: "יָם", reading: "yam" },
      { word: "בַּיִת", reading: "bayit" },
    ],
  },
  {
    id: "kaf",
    letter: "כ",
    name: "kaf",
    spoken: "כַּף",
    sound: "k · kh",
    kind: "letter",
    alphabet: 11,
    base: null,
    value: 20,
    examples: [
      { word: "כֶּלֶב", reading: "kelev" },
      { word: "כֵּן", reading: "ken" },
      { word: "אָכַל", reading: "akhal" },
    ],
  },
  {
    id: "kafSofit",
    letter: "ך",
    name: "kaf sofit",
    spoken: "כַּף סוֹפִית",
    sound: "kh",
    kind: "sofit",
    alphabet: null,
    base: 11,
    value: 20,
    examples: [
      { word: "מֶלֶךְ", reading: "melekh" },
      { word: "דֶּרֶךְ", reading: "derekh" },
      { word: "הוֹלֵךְ", reading: "holekh" },
    ],
  },
  {
    id: "lamed",
    letter: "ל",
    name: "lamed",
    spoken: "לָמֵד",
    sound: "l",
    kind: "letter",
    alphabet: 12,
    base: null,
    value: 30,
    examples: [
      { word: "לֵב", reading: "lev" },
      { word: "לֶחֶם", reading: "lekhem" },
      { word: "לַיְלָה", reading: "layla" },
    ],
  },
  {
    id: "mem",
    letter: "מ",
    name: "mem",
    spoken: "מֵם",
    sound: "m",
    kind: "letter",
    alphabet: 13,
    base: null,
    value: 40,
    examples: [
      { word: "מַיִם", reading: "mayim" },
      { word: "אִמָּא", reading: "ima" },
      { word: "מֶלֶךְ", reading: "melekh" },
    ],
  },
  {
    id: "memSofit",
    letter: "ם",
    name: "mem sofit",
    spoken: "מֵם סוֹפִית",
    sound: "m",
    kind: "sofit",
    alphabet: null,
    base: 13,
    value: 40,
    examples: [
      { word: "שָׁלוֹם", reading: "shalom" },
      { word: "אָדָם", reading: "adam" },
      { word: "יוֹם", reading: "yom" },
    ],
  },
  {
    id: "nun",
    letter: "נ",
    name: "nun",
    spoken: "נוּן",
    sound: "n",
    kind: "letter",
    alphabet: 14,
    base: null,
    value: 50,
    examples: [
      { word: "נֵר", reading: "ner" },
      { word: "נָחָשׁ", reading: "nakhash" },
      { word: "נָהָר", reading: "nahar" },
    ],
  },
  {
    id: "nunSofit",
    letter: "ן",
    name: "nun sofit",
    spoken: "נוּן סוֹפִית",
    sound: "n",
    kind: "sofit",
    alphabet: null,
    base: 14,
    value: 50,
    examples: [
      { word: "זְמַן", reading: "zman" },
      { word: "כֵּן", reading: "ken" },
      { word: "נַגָּן", reading: "nagan" },
    ],
  },
  {
    id: "samekh",
    letter: "ס",
    name: "samekh",
    spoken: "סָמֶךְ",
    sound: "s",
    kind: "letter",
    alphabet: 15,
    base: null,
    value: 60,
    examples: [
      { word: "סוּס", reading: "sus" },
      { word: "סֵפֶר", reading: "sefer" },
      { word: "כֶּסֶף", reading: "kesef" },
    ],
  },
  {
    id: "ayin",
    letter: "ע",
    name: "ayin",
    spoken: "עַיִן",
    sound: "a",
    kind: "letter",
    alphabet: 16,
    base: null,
    value: 70,
    examples: [
      { word: "עַיִן", reading: "ayin" },
      { word: "עוֹף", reading: "of" },
      { word: "עֵץ", reading: "etz" },
    ],
  },
  {
    id: "pe",
    letter: "פ",
    name: "pe",
    spoken: "פֵּא",
    sound: "p · f",
    kind: "letter",
    alphabet: 17,
    base: null,
    value: 80,
    examples: [
      { word: "פֶּה", reading: "pe" },
      { word: "פֶּרַח", reading: "perach" },
      { word: "סֵפֶר", reading: "sefer" },
    ],
  },
  {
    id: "peSofit",
    letter: "ף",
    name: "pe sofit",
    spoken: "פֵּא סוֹפִית",
    sound: "f",
    kind: "sofit",
    alphabet: null,
    base: 17,
    value: 80,
    examples: [
      { word: "סוֹף", reading: "sof" },
      { word: "כֶּסֶף", reading: "kesef" },
      { word: "אַף", reading: "af" },
    ],
  },
  {
    id: "tsadi",
    letter: "צ",
    name: "tsadi",
    spoken: "צַדי",
    sound: "ts",
    kind: "letter",
    alphabet: 18,
    base: null,
    value: 90,
    examples: [
      { word: "צֶבַע", reading: "tseva" },
      { word: "צָהֹב", reading: "tsahov" },
      { word: "צִפּוֹר", reading: "tsipor" },
    ],
  },
  {
    id: "tsadiSofit",
    letter: "ץ",
    name: "tsadi sofit",
    spoken: "צַדי סוֹפִית",
    sound: "ts",
    kind: "sofit",
    alphabet: null,
    base: 18,
    value: 90,
    examples: [
      { word: "עֵץ", reading: "etz" },
      { word: "קַיִץ", reading: "kayitz" },
      { word: "אֶרֶץ", reading: "eretz" },
    ],
  },
  {
    id: "kuf",
    letter: "ק",
    name: "kuf",
    spoken: "קוּף",
    sound: "k",
    kind: "letter",
    alphabet: 19,
    base: null,
    value: 100,
    examples: [
      { word: "קוֹל", reading: "kol" },
      { word: "קָטָן", reading: "katan" },
      { word: "קַר", reading: "kar" },
    ],
  },
  {
    id: "reish",
    letter: "ר",
    name: "reish",
    spoken: "רֵישׁ",
    sound: "r",
    kind: "letter",
    alphabet: 20,
    base: null,
    value: 200,
    examples: [
      { word: "רֹאשׁ", reading: "rosh" },
      { word: "אוֹר", reading: "or" },
      { word: "עִיר", reading: "ir" },
    ],
  },
  {
    id: "shin",
    letter: "ש",
    name: "shin",
    spoken: "שִׁן",
    sound: "sh · s",
    kind: "letter",
    alphabet: 21,
    base: null,
    value: 300,
    examples: [
      { word: "שָׁלוֹם", reading: "shalom" },
      { word: "שֶׁמֶשׁ", reading: "shemesh" },
      { word: "שָׂדֶה", reading: "sade" },
    ],
  },
  {
    id: "tav",
    letter: "ת",
    name: "tav",
    spoken: "תָו",
    sound: "t",
    kind: "letter",
    alphabet: 22,
    base: null,
    value: 400,
    examples: [
      { word: "תּוֹדָה", reading: "toda" },
      { word: "תּוּת", reading: "tut" },
      { word: "בַּיִת", reading: "bayit" },
    ],
  },
  {
    id: "gimelGeresh",
    letter: `ג${geresh}`,
    name: "gimel geresh",
    spoken: "גִּימֶל גֶּרֶשׁ",
    sound: "j",
    kind: "loan",
    alphabet: null,
    base: null,
    value: null,
    examples: [
      { word: `ג${geresh}ינס`, reading: "jins" },
      { word: `ג${geresh}ונגל`, reading: "jungel" },
      { word: `ג${geresh}ירפה`, reading: "jirafa" },
    ],
  },
  {
    id: "zayinGeresh",
    letter: `ז${geresh}`,
    name: "zayin geresh",
    spoken: "זַיִן גֶּרֶשׁ",
    sound: "zh",
    kind: "loan",
    alphabet: null,
    base: null,
    value: null,
    examples: [
      { word: `ז${geresh}קט`, reading: "zhaket" },
      { word: `בז${geresh}`, reading: "bezh" },
      { word: `ז${geresh}אנר`, reading: "zhaner" },
    ],
  },
  {
    id: "tsadiGeresh",
    letter: `צ${geresh}`,
    name: "tsadi geresh",
    spoken: "צַדִּי גֶּרֶשׁ",
    sound: "ch",
    kind: "loan",
    alphabet: null,
    base: null,
    value: null,
    examples: [
      { word: `צ${geresh}יפס`, reading: "chips" },
      { word: `צ${geresh}ק`, reading: "chek" },
      { word: `צ${geresh}אט`, reading: "chat" },
    ],
  },
];

const hebrewMark = /[\u0591-\u05C7]/;

// Keeps vowel marks with the consonant they belong to, so the highlight stays one cluster.
export function highlightLetter(word: string, letter: string): { text: string; hit: boolean }[] {
  const chars = Array.from(word);
  const target = Array.from(letter);
  const parts: { text: string; hit: boolean }[] = [];
  let index = 0;

  while (index < chars.length) {
    const head = chars.slice(index, index + target.length).join("");
    if (head === letter) {
      let end = index + target.length;
      while (end < chars.length && hebrewMark.test(chars[end])) {
        end += 1;
      }
      parts.push({ text: chars.slice(index, end).join(""), hit: true });
      index = end;
      continue;
    }

    let end = index + 1;
    while (end < chars.length && chars.slice(end, end + target.length).join("") !== letter) {
      end += 1;
    }
    parts.push({ text: chars.slice(index, end).join(""), hit: false });
    index = end;
  }

  return parts;
}
