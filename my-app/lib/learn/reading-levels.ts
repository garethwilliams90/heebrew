import type { QuizRound } from "@/components/learn/letter-quiz";
import type { GrammaticalGender, PartOfSpeech } from "@/lib/flashcards/types";
import type { BasicWord } from "@/lib/learn/basic-words";

type Gloss = { en: string; fr: string; es: string };

type BankWord = {
  id: string;
  hebrew: string;
  gloss: Gloss;
  partOfSpeech: PartOfSpeech;
  gender: GrammaticalGender | null;
};

// One mark per sound, so no two choices in a question read the same way.
const soundMarks: Record<string, string> = {
  ah: "\u05B7",
  eh: "\u05B6",
  ee: "\u05B4",
  oh: "\u05B9",
  oo: "\u05BB",
};

const markSound: Record<string, string> = {
  "\u05B8": "ah",
  "\u05B7": "ah",
  "\u05B5": "eh",
  "\u05B6": "eh",
  "\u05B4": "ee",
  "\u05B9": "oh",
  "\u05BB": "oo",
};

const noun = "noun" as const;
const adjective = "adjective" as const;
const m = "masculine" as const;
const f = "feminine" as const;

const DAGESH = "\u05BC";
const DALET = "\u05D3";

function withoutDaletDagesh(hebrew: string) {
  return hebrew.replaceAll(`${DALET}${DAGESH}`, DALET);
}

// Three-letter words. Wrong choices change the vowel under the first letter.
const words: readonly BankWord[] = [
  { id: "ima", hebrew: "אִמָּא", gloss: { en: "mom", fr: "maman", es: "mamá" }, partOfSpeech: noun, gender: f },
  { id: "aba", hebrew: "אַבָּא", gloss: { en: "dad", fr: "papa", es: "papá" }, partOfSpeech: noun, gender: m },
  { id: "sefer", hebrew: "סֵפֶר", gloss: { en: "book", fr: "livre", es: "libro" }, partOfSpeech: noun, gender: m },
  { id: "yeled", hebrew: "יֶלֶד", gloss: { en: "boy", fr: "garçon", es: "niño" }, partOfSpeech: noun, gender: m },
  { id: "kelev", hebrew: "כֶּלֶב", gloss: { en: "dog", fr: "chien", es: "perro" }, partOfSpeech: noun, gender: m },
  { id: "lechem", hebrew: "לֶחֶם", gloss: { en: "bread", fr: "pain", es: "pan" }, partOfSpeech: noun, gender: m },
  { id: "chalav", hebrew: "חָלָב", gloss: { en: "milk", fr: "lait", es: "leche" }, partOfSpeech: noun, gender: m },
  { id: "mayim", hebrew: "מַיִם", gloss: { en: "water", fr: "eau", es: "agua" }, partOfSpeech: noun, gender: m },
  { id: "bayit", hebrew: "בַּיִת", gloss: { en: "house", fr: "maison", es: "casa" }, partOfSpeech: noun, gender: m },
  { id: "katan", hebrew: "קָטָן", gloss: { en: "small", fr: "petit", es: "pequeño" }, partOfSpeech: adjective, gender: m },
  { id: "yafe", hebrew: "יָפֶה", gloss: { en: "pretty", fr: "joli", es: "bonito" }, partOfSpeech: adjective, gender: m },
  { id: "melech", hebrew: "מֶלֶךְ", gloss: { en: "king", fr: "roi", es: "rey" }, partOfSpeech: noun, gender: m },
  { id: "delet", hebrew: "דֶלֶת", gloss: { en: "door", fr: "porte", es: "puerta" }, partOfSpeech: noun, gender: f },
  { id: "kise", hebrew: "כִּסֵּא", gloss: { en: "chair", fr: "chaise", es: "silla" }, partOfSpeech: noun, gender: m },
  { id: "ir", hebrew: "עִיר", gloss: { en: "city", fr: "ville", es: "ciudad" }, partOfSpeech: noun, gender: f },
  { id: "boker", hebrew: "בֹּקֶר", gloss: { en: "morning", fr: "matin", es: "mañana" }, partOfSpeech: noun, gender: m },
  { id: "erev", hebrew: "עֶרֶב", gloss: { en: "evening", fr: "soir", es: "tarde" }, partOfSpeech: noun, gender: m },
  { id: "shemesh", hebrew: "שֶׁמֶשׁ", gloss: { en: "sun", fr: "soleil", es: "sol" }, partOfSpeech: noun, gender: f },
  { id: "yareach", hebrew: "יָרֵחַ", gloss: { en: "moon", fr: "lune", es: "luna" }, partOfSpeech: noun, gender: m },
  { id: "eretz", hebrew: "אֶרֶץ", gloss: { en: "land", fr: "pays", es: "tierra" }, partOfSpeech: noun, gender: f },
  { id: "ochel", hebrew: "אֹכֶל", gloss: { en: "food", fr: "nourriture", es: "comida" }, partOfSpeech: noun, gender: m },
  { id: "basar", hebrew: "בָּשָׂר", gloss: { en: "meat", fr: "viande", es: "carne" }, partOfSpeech: noun, gender: m },
  { id: "gezer", hebrew: "גֶּזֶר", gloss: { en: "carrot", fr: "carotte", es: "zanahoria" }, partOfSpeech: noun, gender: m },
  { id: "perach", hebrew: "פֶּרַח", gloss: { en: "flower", fr: "fleur", es: "flor" }, partOfSpeech: noun, gender: m },
  { id: "isha", hebrew: "אִשָּׁה", gloss: { en: "woman", fr: "femme", es: "mujer" }, partOfSpeech: noun, gender: f },
  { id: "ata", hebrew: "אַתָּה", gloss: { en: "you", fr: "toi", es: "tú" }, partOfSpeech: "pronoun", gender: m },
  { id: "chazak", hebrew: "חָזָק", gloss: { en: "strong", fr: "fort", es: "fuerte" }, partOfSpeech: adjective, gender: m },
  { id: "iti", hebrew: "אִטִּי", gloss: { en: "slow", fr: "lent", es: "lento" }, partOfSpeech: adjective, gender: m },
  { id: "yashan", hebrew: "יָשָׁן", gloss: { en: "old", fr: "vieux", es: "viejo" }, partOfSpeech: adjective, gender: m },
  { id: "chadash", hebrew: "חָדָשׁ", gloss: { en: "new", fr: "nouveau", es: "nuevo" }, partOfSpeech: adjective, gender: m },
  { id: "gamal", hebrew: "גָּמָל", gloss: { en: "camel", fr: "chameau", es: "camello" }, partOfSpeech: noun, gender: m },
  { id: "davar", hebrew: "דָבָר", gloss: { en: "thing", fr: "chose", es: "cosa" }, partOfSpeech: noun, gender: m },
  { id: "seder", hebrew: "סֵדֶר", gloss: { en: "order", fr: "ordre", es: "orden" }, partOfSpeech: noun, gender: m },
  { id: "chesed", hebrew: "חֶסֶד", gloss: { en: "kindness", fr: "bonté", es: "bondad" }, partOfSpeech: noun, gender: m },
  { id: "keter", hebrew: "כֶּתֶר", gloss: { en: "crown", fr: "couronne", es: "corona" }, partOfSpeech: noun, gender: m },
  { id: "nahar", hebrew: "נָהָר", gloss: { en: "river", fr: "rivière", es: "río" }, partOfSpeech: noun, gender: m },
  { id: "kafe", hebrew: "קָפֶה", gloss: { en: "coffee", fr: "café", es: "café" }, partOfSpeech: noun, gender: m },
  { id: "zahav", hebrew: "זָהָב", gloss: { en: "gold", fr: "or", es: "oro" }, partOfSpeech: noun, gender: m },
  { id: "kesef", hebrew: "כֶּסֶף", gloss: { en: "money", fr: "argent", es: "dinero" }, partOfSpeech: noun, gender: m },
  { id: "melach", hebrew: "מֶלַח", gloss: { en: "salt", fr: "sel", es: "sal" }, partOfSpeech: noun, gender: m },
  { id: "geshem", hebrew: "גֶּשֶׁם", gloss: { en: "rain", fr: "pluie", es: "lluvia" }, partOfSpeech: noun, gender: m },
  { id: "sheleg", hebrew: "שֶׁלֶג", gloss: { en: "snow", fr: "neige", es: "nieve" }, partOfSpeech: noun, gender: m },
  { id: "choref", hebrew: "חֹרֶף", gloss: { en: "winter", fr: "hiver", es: "invierno" }, partOfSpeech: noun, gender: m },
  { id: "kayitz", hebrew: "קַיִץ", gloss: { en: "summer", fr: "été", es: "verano" }, partOfSpeech: noun, gender: m },
  { id: "cheder", hebrew: "חֶדֶר", gloss: { en: "room", fr: "chambre", es: "habitación" }, partOfSpeech: noun, gender: m },
  { id: "regel", hebrew: "רֶגֶל", gloss: { en: "leg", fr: "jambe", es: "pierna" }, partOfSpeech: noun, gender: f },
  { id: "ozen", hebrew: "אֹזֶן", gloss: { en: "ear", fr: "oreille", es: "oreja" }, partOfSpeech: noun, gender: f },
  { id: "even", hebrew: "אֶבֶן", gloss: { en: "stone", fr: "pierre", es: "piedra" }, partOfSpeech: noun, gender: f },
  { id: "nachash", hebrew: "נָחָשׁ", gloss: { en: "snake", fr: "serpent", es: "serpiente" }, partOfSpeech: noun, gender: m },
  { id: "marak", hebrew: "מָרָק", gloss: { en: "soup", fr: "soupe", es: "sopa" }, partOfSpeech: noun, gender: m },
];

// Two respellings of the word, each with a first vowel that sounds unlike the real one and each other.
function otherPointings(hebrew: string) {
  const chars = [...withoutDaletDagesh(hebrew)];
  const index = chars.findIndex((char) => char in markSound);
  if (index < 0) {
    return [];
  }

  const own = markSound[chars[index]];
  return mix(Object.keys(soundMarks).filter((sound) => sound !== own))
    .slice(0, 2)
    .map((sound) => {
      const next = [...chars];
      next[index] = soundMarks[sound];
      return withoutDaletDagesh(next.join(""));
    });
}

function mix<T>(items: readonly T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swap];
    next[swap] = current;
  }
  return next;
}

function card(id: string, hebrew: string, name: string) {
  return { id, name, cue: { text: hebrew }, glyph: hebrew };
}

function glossOf(gloss: Gloss, locale: string) {
  if (locale === "fr" || locale === "es") {
    return gloss[locale];
  }
  return gloss.en;
}

export function wordRounds(locale: string): QuizRound[] {
  const rounds: QuizRound[] = [];
  for (const word of mix(words)) {
    const hebrew = withoutDaletDagesh(word.hebrew);
    const wrongs = otherPointings(hebrew);
    if (wrongs.length < 2) {
      continue;
    }
    const choices = mix([
      card(word.id, hebrew, glossOf(word.gloss, locale)),
      ...wrongs.map((alt, index) => card(`${word.id}-alt-${index}`, alt, glossOf(word.gloss, locale))),
    ]);
    rounds.push({ id: word.id, correctId: word.id, prompt: { text: hebrew }, choices });
    if (rounds.length >= 10) {
      break;
    }
  }
  return rounds;
}

export const readingKnownWords: readonly BasicWord[] = words.map((word) => ({
  id: word.id,
  hebrew: withoutDaletDagesh(word.hebrew),
  english: word.gloss.en,
  reading: word.id,
  partOfSpeech: word.partOfSpeech,
  gender: word.gender,
}));

export function readingRounds(locale: string): QuizRound[] {
  return wordRounds(locale);
}

export const readingLevels = [12] as const;
