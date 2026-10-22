import type { BasicWord } from "@/lib/learn/basic-words";
import { assertGlosses, sentence, takeSentences, word, type BuilderSentence, type HearCard } from "@/lib/learn/sentences";

const hu = word("הוא", "he", "il", "él");
const hi = word("היא", "she", "elle", "ella");
const hem = word("הם", "they", "ils", "ellos");
const hen = word("הן", "they", "elles", "ellas");
const ochel = word("אוכל", "eats", "mange", "come");
const ochelet = word("אוכלת", "eats", "mange", "come");
const ochlim = word("אוכלים", "eat", "mangent", "comen");
const ochlot = word("אוכלות", "eat", "mangent", "comen");
const shoteh = word("שותה", "drinks", "boit", "bebe");
const shotim = word("שותים", "drink", "boivent", "beben");
const shotot = word("שותות", "drink", "boivent", "beben");
const lomed = word("לומד", "learns", "apprend", "aprende");
const lomedet = word("לומדת", "learns", "apprend", "aprende");
const lomdim = word("לומדים", "learn", "apprennent", "aprenden");
const lomdot = word("לומדות", "learn", "apprennent", "aprenden");
const et = word("את", "et", "et", "et");
const shokolad = word("שוקולד", "chocolate", "chocolat", "chocolate");
const hashokolad = word("השוקולד", "the chocolate", "le chocolat", "el chocolate");
const mayim = word("מים", "water", "eau", "agua");
const hamayim = word("המים", "the water", "l'eau", "el agua");
const chalav = word("חלב", "milk", "lait", "leche");
const hachalav = word("החלב", "the milk", "le lait", "la leche");
const lechem = word("לחם", "bread", "pain", "pan");
const halechem = word("הלחם", "the bread", "le pain", "el pan");
const hadag = word("הדג", "the fish", "le poisson", "el pez");
const hauga = word("העוגה", "the cake", "le gâteau", "el pastel");
const ivrit = word("עברית", "Hebrew", "hébreu", "hebreo");

export const eatForms: readonly HearCard[] = [
  { id: "ochel", hebrew: "אוֹכֵל", label: "formMs", example: "הוא אוכל שוקולד" },
  { id: "ochelet", hebrew: "אוֹכֶלֶת", label: "formFs", example: "היא אוכלת שוקולד" },
  { id: "ochlim", hebrew: "אוֹכְלִים", label: "formMp", example: "הם אוכלים שוקולד" },
  { id: "ochlot", hebrew: "אוֹכְלוֹת", label: "formFp", example: "הן אוכלות שוקולד" },
];

export const drinkForms: readonly HearCard[] = [
  { id: "shoteh-m", hebrew: "שׁוֹתֶה", label: "formMs", example: "הוא שותה מים" },
  { id: "shota-f", hebrew: "שׁוֹתָה", label: "formFs", example: "היא שותה מים" },
  { id: "shotim", hebrew: "שׁוֹתִים", label: "formMp", example: "הם שותים מים" },
  { id: "shotot", hebrew: "שׁוֹתוֹת", label: "formFp", example: "הן שותות מים" },
];

export const learnForms: readonly HearCard[] = [
  { id: "lomed", hebrew: "לוֹמֵד", label: "formMs", example: "הוא לומד עברית" },
  { id: "lomedet", hebrew: "לוֹמֶדֶת", label: "formFs", example: "היא לומדת עברית" },
  { id: "lomdim", hebrew: "לוֹמְדִים", label: "formMp", example: "הם לומדים עברית" },
  { id: "lomdot", hebrew: "לוֹמְדוֹת", label: "formFp", example: "הן לומדות עברית" },
];

export const etHaPair = {
  without: { hebrew: "הוא אוכל שוקולד", gloss: { en: "He is eating chocolate", fr: "Il mange du chocolat", es: "Él come chocolate" } },
  withEt: { hebrew: "הוא אוכל את השוקולד", gloss: { en: "He is eating the chocolate", fr: "Il mange le chocolat", es: "Él come el chocolate" } },
} as const;

const eatPractice: readonly BuilderSentence[] = [
  sentence("hu-ochel-et-shokolad", { en: "He is eating the chocolate", fr: "Il mange le chocolat", es: "Él come el chocolate" }, [hu, ochel, et, hashokolad]),
  sentence("hi-ochelet-et-shokolad", { en: "She is eating the chocolate", fr: "Elle mange le chocolat", es: "Ella come el chocolate" }, [hi, ochelet, et, hashokolad]),
  sentence("hem-ochlim-et-shokolad", { en: "They are eating the chocolate", fr: "Ils mangent le chocolat", es: "Ellos comen el chocolate" }, [hem, ochlim, et, hashokolad]),
  sentence("hen-ochlot-et-shokolad", { en: "They are eating the chocolate", fr: "Elles mangent le chocolat", es: "Ellas comen el chocolate" }, [hen, ochlot, et, hashokolad]),
];

const mixPractice: readonly BuilderSentence[] = [
  sentence("hu-ochel-et-shokolad-mix", { en: "He is eating the chocolate", fr: "Il mange le chocolat", es: "Él come el chocolate" }, [hu, ochel, et, hashokolad]),
  sentence("hi-ochelet-et-lechem", { en: "She is eating the bread", fr: "Elle mange le pain", es: "Ella come el pan" }, [hi, ochelet, et, halechem]),
  sentence("hem-ochlim-et-dag", { en: "They are eating the fish", fr: "Ils mangent le poisson", es: "Ellos comen el pez" }, [hem, ochlim, et, hadag]),
  sentence("hu-shoteh-mayim", { en: "He is drinking water", fr: "Il boit de l'eau", es: "Él bebe agua" }, [hu, shoteh, mayim]),
  sentence("hi-shota-et-chalav", { en: "She is drinking the milk", fr: "Elle boit le lait", es: "Ella bebe la leche" }, [hi, shoteh, et, hachalav]),
  sentence("hem-shotim-mayim", { en: "They are drinking water", fr: "Ils boivent de l'eau", es: "Ellos beben agua" }, [hem, shotim, mayim]),
  sentence("hu-lomed-ivrit", { en: "He is learning Hebrew", fr: "Il apprend l'hébreu", es: "Él aprende hebreo" }, [hu, lomed, ivrit]),
  sentence("hi-lomedet-ivrit", { en: "She is learning Hebrew", fr: "Elle apprend l'hébreu", es: "Ella aprende hebreo" }, [hi, lomedet, ivrit]),
  sentence("hem-lomdim-ivrit", { en: "They are learning Hebrew", fr: "Ils apprennent l'hébreu", es: "Ellos aprenden hebreo" }, [hem, lomdim, ivrit]),
  sentence("hen-ochlot-et-uga", { en: "They are eating the cake", fr: "Elles mangent le gâteau", es: "Ellas comen el pastel" }, [hen, ochlot, et, hauga]),
  sentence("hen-shotot-et-mayim", { en: "They are drinking the water", fr: "Elles boivent l'eau", es: "Ellas beben el agua" }, [hen, shotot, et, hamayim]),
  sentence("hen-lomdot-ivrit", { en: "They are learning Hebrew", fr: "Elles apprennent l'hébreu", es: "Ellas aprenden hebreo" }, [hen, lomdot, ivrit]),
  sentence("hu-ochel-shokolad", { en: "He is eating chocolate", fr: "Il mange du chocolat", es: "Él come chocolate" }, [hu, ochel, shokolad]),
  sentence("hi-ochelet-lechem", { en: "She is eating bread", fr: "Elle mange du pain", es: "Ella come pan" }, [hi, ochelet, lechem]),
  sentence("hu-shoteh-chalav", { en: "He is drinking milk", fr: "Il boit du lait", es: "Él bebe leche" }, [hu, shoteh, chalav]),
];

assertGlosses("14", [...eatPractice, ...mixPractice]);

export function fourteenEatPractice() {
  return [...eatPractice];
}

export function fourteenMixPractice() {
  return takeSentences(mixPractice, 10);
}

export const fourteenKnownWords: readonly BasicWord[] = [
  { id: "leechol", hebrew: "לֶאֱכוֹל", english: "to eat", reading: "leechol", partOfSpeech: "verb", gender: null },
  { id: "lishtot", hebrew: "לִשְׁתּוֹת", english: "to drink", reading: "lishtot", partOfSpeech: "verb", gender: null },
  { id: "lilmod", hebrew: "לִלְמוֹד", english: "to learn", reading: "lilmod", partOfSpeech: "verb", gender: null },
  { id: "shokolad", hebrew: "שוקולד", english: "chocolate", reading: "shokolad", partOfSpeech: "noun", gender: "masculine" },
  { id: "ivrit", hebrew: "עברית", english: "Hebrew", reading: "ivrit", partOfSpeech: "noun", gender: "feminine" },
];
