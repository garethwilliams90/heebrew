import type { QuizRound } from "@/components/learn/letter-quiz";

type Gloss = { en: string; fr: string; es: string };

type BankWord = {
  id: string;
  hebrew: string;
  gloss: Gloss;
};

const vowelMarks = ["\u05B7", "\u05B5", "\u05B4", "\u05B9", "\u05B6", "\u05BB"];
const vowelChar = /[\u05B4-\u05BB]/;

const words: readonly BankWord[] = [
  { id: "ima", hebrew: "אִמָּא", gloss: { en: "mom", fr: "maman", es: "mamá" } },
  { id: "aba", hebrew: "אַבָּא", gloss: { en: "dad", fr: "papa", es: "papá" } },
  { id: "sefer", hebrew: "סֵפֶר", gloss: { en: "book", fr: "livre", es: "libro" } },
  { id: "yeled", hebrew: "יֶלֶד", gloss: { en: "boy", fr: "garçon", es: "niño" } },
  { id: "kelev", hebrew: "כֶּלֶב", gloss: { en: "dog", fr: "chien", es: "perro" } },
  { id: "lechem", hebrew: "לֶחֶם", gloss: { en: "bread", fr: "pain", es: "pan" } },
  { id: "chalav", hebrew: "חָלָב", gloss: { en: "milk", fr: "lait", es: "leche" } },
  { id: "mayim", hebrew: "מַיִם", gloss: { en: "water", fr: "eau", es: "agua" } },
  { id: "bayit", hebrew: "בַּיִת", gloss: { en: "house", fr: "maison", es: "casa" } },
  { id: "gadol", hebrew: "גָּדוֹל", gloss: { en: "big", fr: "grand", es: "grande" } },
  { id: "katan", hebrew: "קָטָן", gloss: { en: "small", fr: "petit", es: "pequeño" } },
  { id: "yafe", hebrew: "יָפֶה", gloss: { en: "pretty", fr: "joli", es: "bonito" } },
  { id: "melech", hebrew: "מֶלֶךְ", gloss: { en: "king", fr: "roi", es: "rey" } },
  { id: "delet", hebrew: "דֶּלֶת", gloss: { en: "door", fr: "porte", es: "puerta" } },
  { id: "kise", hebrew: "כִּסֵּא", gloss: { en: "chair", fr: "chaise", es: "silla" } },
  { id: "ir", hebrew: "עִיר", gloss: { en: "city", fr: "ville", es: "ciudad" } },
  { id: "boker", hebrew: "בֹּקֶר", gloss: { en: "morning", fr: "matin", es: "mañana" } },
  { id: "erev", hebrew: "עֶרֶב", gloss: { en: "evening", fr: "soir", es: "tarde" } },
  { id: "shemesh", hebrew: "שֶׁמֶשׁ", gloss: { en: "sun", fr: "soleil", es: "sol" } },
  { id: "yareach", hebrew: "יָרֵחַ", gloss: { en: "moon", fr: "lune", es: "luna" } },
  { id: "eretz", hebrew: "אֶרֶץ", gloss: { en: "land", fr: "pays", es: "tierra" } },
  { id: "ochel", hebrew: "אֹכֶל", gloss: { en: "food", fr: "nourriture", es: "comida" } },
  { id: "basar", hebrew: "בָּשָׂר", gloss: { en: "meat", fr: "viande", es: "carne" } },
  { id: "gezer", hebrew: "גֶּזֶר", gloss: { en: "carrot", fr: "carotte", es: "zanahoria" } },
  { id: "chatul", hebrew: "חָתוּל", gloss: { en: "cat", fr: "chat", es: "gato" } },
  { id: "tsipor", hebrew: "צִפּוֹר", gloss: { en: "bird", fr: "oiseau", es: "pájaro" } },
  { id: "perach", hebrew: "פֶּרַח", gloss: { en: "flower", fr: "fleur", es: "flor" } },
  { id: "isha", hebrew: "אִשָּׁה", gloss: { en: "woman", fr: "femme", es: "mujer" } },
  { id: "ata", hebrew: "אַתָּה", gloss: { en: "you", fr: "toi", es: "tú" } },
  { id: "rotse", hebrew: "רוֹצֶה", gloss: { en: "wants", fr: "veut", es: "quiere" } },
  { id: "ohev", hebrew: "אוֹהֵב", gloss: { en: "loves", fr: "aime", es: "ama" } },
  { id: "ochel-verb", hebrew: "אוֹכֵל", gloss: { en: "eats", fr: "mange", es: "come" } },
  { id: "shote", hebrew: "שׁוֹתֶה", gloss: { en: "drinks", fr: "boit", es: "bebe" } },
  { id: "yoshev", hebrew: "יוֹשֵׁב", gloss: { en: "sits", fr: "est assis", es: "se sienta" } },
  { id: "holech", hebrew: "הוֹלֵךְ", gloss: { en: "walks", fr: "marche", es: "camina" } },
  { id: "chazak", hebrew: "חָזָק", gloss: { en: "strong", fr: "fort", es: "fuerte" } },
  { id: "mahir", hebrew: "מָהִיר", gloss: { en: "fast", fr: "rapide", es: "rápido" } },
  { id: "iti", hebrew: "אִטִּי", gloss: { en: "slow", fr: "lent", es: "lento" } },
  { id: "yashan", hebrew: "יָשָׁן", gloss: { en: "old", fr: "vieux", es: "viejo" } },
  { id: "chadash", hebrew: "חָדָשׁ", gloss: { en: "new", fr: "nouveau", es: "nuevo" } },
  { id: "gamal", hebrew: "גָּמָל", gloss: { en: "camel", fr: "chameau", es: "camello" } },
  { id: "davar", hebrew: "דָּבָר", gloss: { en: "thing", fr: "chose", es: "cosa" } },
  { id: "seder", hebrew: "סֵדֶר", gloss: { en: "order", fr: "ordre", es: "orden" } },
  { id: "chesed", hebrew: "חֶסֶד", gloss: { en: "kindness", fr: "bonté", es: "bondad" } },
  { id: "keter", hebrew: "כֶּתֶר", gloss: { en: "crown", fr: "couronne", es: "corona" } },
  { id: "nahar", hebrew: "נָהָר", gloss: { en: "river", fr: "rivière", es: "río" } },
  { id: "kova", hebrew: "כּוֹבַע", gloss: { en: "hat", fr: "chapeau", es: "sombrero" } },
  { id: "sipur", hebrew: "סִפּוּר", gloss: { en: "story", fr: "histoire", es: "cuento" } },
  { id: "limon", hebrew: "לִימוֹן", gloss: { en: "lemon", fr: "citron", es: "limón" } },
  { id: "kafe", hebrew: "קָפֶה", gloss: { en: "coffee", fr: "café", es: "café" } },
];

const possessives = [
  { he: "שֶׁלִּי", en: "my", fr: { m: "mon", f: "ma" }, es: { m: "mi", f: "mi" } },
  { he: "שֶׁלְּךָ", en: "your", fr: { m: "ton", f: "ta" }, es: { m: "tu", f: "tu" } },
  { he: "שֶׁלּוֹ", en: "his", fr: { m: "son", f: "sa" }, es: { m: "su", f: "su" } },
  { he: "שֶׁלָּהּ", en: "her", fr: { m: "son", f: "sa" }, es: { m: "su", f: "su" } },
  { he: "שֶׁלָּנוּ", en: "our", fr: { m: "notre", f: "notre" }, es: { m: "nuestro", f: "nuestra" } },
  { he: "שֶׁלָּכֶם", en: "your", fr: { m: "votre", f: "votre" }, es: { m: "vuestro", f: "vuestra" } },
  { he: "שֶׁלָּכֶן", en: "your", fr: { m: "votre", f: "votre" }, es: { m: "vuestro", f: "vuestra" } },
];

const nouns = [
  { he: "הַכֶּלֶב", en: "dog", fr: "chien", es: "perro", gender: "m" as const },
  { he: "הַחָתוּל", en: "cat", fr: "chat", es: "gato", gender: "m" as const },
  { he: "הַדָּג", en: "fish", fr: "poisson", es: "pez", gender: "m" as const },
  { he: "הַלֶּחֶם", en: "bread", fr: "pain", es: "pan", gender: "m" as const },
  { he: "הַסֵּפֶר", en: "book", fr: "livre", es: "libro", gender: "m" as const },
  { he: "הַבַּיִת", en: "house", fr: "maison", es: "casa", gender: "f" as const },
];

const verbPairs = [
  { m: "אוֹהֵב", f: "אוֹהֶבֶת", en: "loves", fr: "aime", es: "ama" },
  { m: "אוֹכֵל", f: "אוֹכֶלֶת", en: "eats", fr: "mange", es: "come" },
  { m: "שׁוֹתֶה", f: "שׁוֹתֶה", en: "drinks", fr: "boit", es: "bebe" },
  { m: "רוֹצֶה", f: "רוֹצָה", en: "wants", fr: "veut", es: "quiere" },
  { m: "רוֹאֶה", f: "רוֹאָה", en: "sees", fr: "voit", es: "ve" },
];

function retarget(hebrew: string, vowel: string) {
  const chars = [...hebrew];
  const index = chars.findIndex((char) => vowelChar.test(char));
  if (index < 0) {
    const letter = chars.findIndex((char) => /[\u05D0-\u05EA]/.test(char));
    if (letter < 0) {
      return hebrew;
    }
    chars.splice(letter + 1, 0, vowel);
    return chars.join("");
  }
  chars[index] = vowel;
  return chars.join("");
}

function otherPointings(hebrew: string) {
  const found: string[] = [];
  for (const vowel of vowelMarks) {
    const next = retarget(hebrew, vowel);
    if (next !== hebrew && !found.includes(next)) {
      found.push(next);
    }
    if (found.length === 2) {
      break;
    }
  }
  while (found.length < 2) {
    const vowel = vowelMarks[found.length];
    const chars = [...hebrew];
    const letter = chars.findIndex((char) => /[\u05D0-\u05EA]/.test(char));
    chars.splice(Math.max(0, letter) + 1 + found.length, 0, vowel);
    found.push(chars.join(""));
  }
  return found;
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
  return mix(words)
    .slice(0, 8)
    .map((word) => {
      const wrongs = otherPointings(word.hebrew);
      const choices = mix([
        card(word.id, word.hebrew, glossOf(word.gloss, locale)),
        ...wrongs.map((hebrew, index) => card(`${word.id}-alt-${index}`, hebrew, glossOf(word.gloss, locale))),
      ]);
      return { id: word.id, correctId: word.id, prompt: { text: word.hebrew }, choices };
    });
}

type Sentence = { id: string; hebrew: string; gloss: Gloss };

function sentenceBank(): Sentence[] {
  const bank: Sentence[] = [];
  nouns.forEach((noun, nounIndex) => {
    possessives.forEach((owner, ownerIndex) => {
      const hebrew = `זֶה ${noun.he} ${owner.he}`;
      bank.push({
        id: `ze-${nounIndex}-${ownerIndex}`,
        hebrew,
        gloss: {
          en: `This is ${owner.en} ${noun.en}`,
          fr: `C'est ${owner.fr[noun.gender]} ${noun.fr}`,
          es: `${noun.gender === "f" ? "Esta es" : "Este es"} ${owner.es[noun.gender]} ${noun.es}`,
        },
      });
    });
  });
  return bank.slice(0, 40);
}

function verbBank(): Sentence[] {
  const subjects = [
    { he: "הוּא", en: "He", fr: "Il", es: "Él", gender: "m" as const },
    { he: "הִיא", en: "She", fr: "Elle", es: "Ella", gender: "f" as const },
  ];
  const bank: Sentence[] = [];
  subjects.forEach((subject) => {
    verbPairs.forEach((verb, verbIndex) => {
      nouns.forEach((noun, nounIndex) => {
        possessives.slice(0, 4).forEach((owner, ownerIndex) => {
          const action = subject.gender === "f" ? verb.f : verb.m;
          bank.push({
            id: `verb-${subject.gender}-${verbIndex}-${nounIndex}-${ownerIndex}`,
            hebrew: `${subject.he} ${action} אֶת ${noun.he} ${owner.he}`,
            gloss: {
              en: `${subject.en} ${verb.en} ${owner.en} ${noun.en}`,
              fr: `${subject.fr} ${verb.fr} ${owner.fr[noun.gender]} ${noun.fr}`,
              es: `${subject.es} ${verb.es} ${owner.es[noun.gender]} ${noun.es}`,
            },
          });
        });
      });
    });
  });
  return bank.slice(0, 40);
}

function sentenceRounds(bank: readonly Sentence[], locale: string): QuizRound[] {
  return mix(bank)
    .slice(0, 8)
    .map((item) => {
      const others = mix(bank.filter((entry) => entry.id !== item.id)).slice(0, 2);
      const choices = mix([
        card(item.id, item.hebrew, glossOf(item.gloss, locale)),
        ...others.map((entry) => card(entry.id, entry.hebrew, glossOf(entry.gloss, locale))),
      ]);
      return { id: item.id, correctId: item.id, prompt: { text: item.hebrew }, choices };
    });
}

export function readingRounds(level: number, locale: string): QuizRound[] {
  if (level === 13) {
    return sentenceRounds(sentenceBank(), locale);
  }
  if (level === 14) {
    return sentenceRounds(verbBank(), locale);
  }
  return wordRounds(locale);
}

export const readingLevels = [12, 13, 14] as const;
