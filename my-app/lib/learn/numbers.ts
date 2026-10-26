import type { Flashcard } from "@/lib/flashcards/types";

export const numbersDeckId = "numbers";

export type NumberGroup = "digit" | "teen" | "round";

export type NumberWord = {
  id: string;
  value: number;
  group: NumberGroup;
  hebrew: string;
  transliteration: string;
  gloss: { en: string; fr: string; es: string };
};

const word = (
  id: string,
  value: number,
  group: NumberGroup,
  hebrew: string,
  transliteration: string,
  en: string,
  fr: string,
  es: string,
): NumberWord => ({ id, value, group, hebrew, transliteration, gloss: { en, fr, es } });

/**
 * Counting forms that match the number words already taught in the app
 * (שָׁלוֹשׁ, אַרְבַּע, …). This list is the numbers deck only.
 */
export const numberWords: readonly NumberWord[] = [
  word("n0", 0, "digit", "אֶפֶס", "efes", "zero", "zéro", "cero"),
  word("n1", 1, "digit", "אַחַת", "achat", "one", "un", "uno"),
  word("n2", 2, "digit", "שְׁתַּיִם", "shtayim", "two", "deux", "dos"),
  word("n3", 3, "digit", "שָׁלוֹשׁ", "shalosh", "three", "trois", "tres"),
  word("n4", 4, "digit", "אַרְבַּע", "arba", "four", "quatre", "cuatro"),
  word("n5", 5, "digit", "חָמֵשׁ", "hamesh", "five", "cinq", "cinco"),
  word("n6", 6, "digit", "שֵׁשׁ", "shesh", "six", "six", "seis"),
  word("n7", 7, "digit", "שֶׁבַע", "sheva", "seven", "sept", "siete"),
  word("n8", 8, "digit", "שְׁמוֹנֶה", "shmone", "eight", "huit", "ocho"),
  word("n9", 9, "digit", "תֵּשַׁע", "tesha", "nine", "neuf", "nueve"),
  word("n10", 10, "round", "עֶשֶׂר", "eser", "ten", "dix", "diez"),
  word("n11", 11, "teen", "אַחַת עֶשְׂרֵה", "achat esre", "eleven", "onze", "once"),
  word("n12", 12, "teen", "שְׁתֵּים עֶשְׂרֵה", "shtem esre", "twelve", "douze", "doce"),
  word("n13", 13, "teen", "שְׁלוֹשׁ עֶשְׂרֵה", "shlosh esre", "thirteen", "treize", "trece"),
  word("n14", 14, "teen", "אַרְבַּע עֶשְׂרֵה", "arba esre", "fourteen", "quatorze", "catorce"),
  word("n15", 15, "teen", "חֲמֵשׁ עֶשְׂרֵה", "hamesh esre", "fifteen", "quinze", "quince"),
  word("n16", 16, "teen", "שֵׁשׁ עֶשְׂרֵה", "shesh esre", "sixteen", "seize", "dieciséis"),
  word("n17", 17, "teen", "שְׁבַע עֶשְׂרֵה", "sheva esre", "seventeen", "dix-sept", "diecisiete"),
  word("n18", 18, "teen", "שְׁמוֹנֶה עֶשְׂרֵה", "shmone esre", "eighteen", "dix-huit", "dieciocho"),
  word("n19", 19, "teen", "תְּשַׁע עֶשְׂרֵה", "tesha esre", "nineteen", "dix-neuf", "diecinueve"),
  word("n20", 20, "round", "עֶשְׂרִים", "esrim", "twenty", "vingt", "veinte"),
  word("n30", 30, "round", "שְׁלוֹשִׁים", "shloshim", "thirty", "trente", "treinta"),
  word("n40", 40, "round", "אַרְבָּעִים", "arbaim", "forty", "quarante", "cuarenta"),
  word("n50", 50, "round", "חֲמִשִּׁים", "chamishim", "fifty", "cinquante", "cincuenta"),
  word("n60", 60, "round", "שִׁשִּׁים", "shishim", "sixty", "soixante", "sesenta"),
  word("n70", 70, "round", "שִׁבְעִים", "shivim", "seventy", "soixante-dix", "setenta"),
  word("n80", 80, "round", "שְׁמוֹנִים", "shmonim", "eighty", "quatre-vingts", "ochenta"),
  word("n90", 90, "round", "תִּשְׁעִים", "tishim", "ninety", "quatre-vingt-dix", "noventa"),
  word("n100", 100, "round", "מֵאָה", "meah", "one hundred", "cent", "cien"),
  word("n1000", 1000, "round", "אֶלֶף", "elef", "one thousand", "mille", "mil"),
];

export function numberGloss(word: NumberWord, locale: string) {
  if (locale === "fr") {
    return word.gloss.fr;
  }
  if (locale === "es") {
    return word.gloss.es;
  }
  return word.gloss.en;
}

export function toNumberCard(word: NumberWord, locale: string): Flashcard {
  return {
    id: word.id,
    english: numberGloss(word, locale),
    partOfSpeech: "noun",
    example: "",
    hebrew: word.hebrew,
    hebrewExample: "",
    gender: null,
  };
}
