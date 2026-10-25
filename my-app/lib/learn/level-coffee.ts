import type { BasicWord } from "@/lib/learn/basic-words";
import { assertGlosses, sentence, takeSentences, word, type BuilderSentence, type HearCard } from "@/lib/learn/sentences";

// ============================================================================
// VOCABULARY PLACEHOLDER
// ============================================================================
// This file contains the structure for the Coffee Shop Interaction level.
// The caller will add vocabulary sentences here when they return.
//
// To add vocabulary:
// 1. Define word constants using word(hebrew, en, fr, es, audio?)
// 2. Add HearCard entries for customer and waiter phrases
// 3. Add sentence() calls in the practice arrays below
//
// Customer side sentences:
// - שלום (shalom - hello)
// - מה נשמע (ma nishma - how are you) or מה קורה (ma koreh - what's up)
// - אפשר להזמין (efshar lehazmin - can I order)
// - אפשר בבקשה הפוך (efshar bevakasha hafuch - can I have a hafuch please)
// - אפשר בבקשה קפה קל (efshar bevakasha kafe kal - can I have a light coffee please)
// - אספרסו (espresso)
// - וקרואסון (ve kuason - and a croissant)
//
// Waiter/waitress side sentences:
// - מה אתה רוצה (ma ata rotzeh - what do you want, masculine)
// - מה את רוצה (ma at rotza - what do you want, feminine)
// - זה לשבת או לקחת (ze leshevet o liktoach - is this to sit in or take away)
// - אתם רוצים (atem rotzim - you want, plural)
// - איך אתם משלמים (eich atem meshalmim - how are you paying, plural)
// - איך אתה משלם (eich ata meshalem - how are you paying, masculine)
// - עם אשראי או מזומן (im ashray o mezuman - with card or cash)
// ============================================================================

// Customer phrases
export const customerPhrases: readonly HearCard[] = [
  // { id: "shalom", hebrew: "שלום", caption: { en: "hello", fr: "bonjour", es: "hola" } },
  // { id: "ma-nishma", hebrew: "מה נשמע", caption: { en: "how are you?", fr: "comment ça va?", es: "¿cómo estás?" } },
  // { id: "ma-koreh", hebrew: "מה קורה", caption: { en: "what's up?", fr: "quoi de neuf?", es: "¿qué pasa?" } },
  // { id: "efshar-lehazmin", hebrew: "אפשר להזמין", caption: { en: "can I order?", fr: "puis-je commander?", es: "¿puedo pedir?" } },
  // { id: "efshar-hafuch", hebrew: "אפשר בבקשה הפוך", caption: { en: "can I have a hafuch please", fr: "puis-je avoir un hafuch s'il vous plaît", es: "¿puedo tener un hafuch por favor?" } },
  // { id: "efshar-kafe-kal", hebrew: "אפשר בבקשה קפה קל", caption: { en: "can I have a light coffee please", fr: "puis-je avoir un café léger s'il vous plaît", es: "¿puedo tener un café claro por favor?" } },
  // { id: "espresso", hebrew: "אספרסו", caption: { en: "espresso", fr: "espresso", es: "espresso" } },
  // { id: "ve-kuason", hebrew: "וקרואסון", caption: { en: "and a croissant", fr: "et un croissant", es: "y un croissant" } },
];

// Waiter/waitress phrases
export const waiterPhrases: readonly HearCard[] = [
  // { id: "ma-ata-rotzeh", hebrew: "מה אתה רוצה", caption: { en: "what do you want? (masculine)", fr: "que veux-tu? (masculin)", es: "¿qué quieres? (masculino)" } },
  // { id: "ma-at-rotza", hebrew: "מה את רוצה", caption: { en: "what do you want? (feminine)", fr: "que veux-tu? (féminin)", es: "¿qué quieres? (femenino)" } },
  // { id: "ze-leshevet-liktoach", hebrew: "זה לשבת או לקחת", caption: { en: "to sit in or take away?", fr: "sur place ou à emporter?", es: "¿para tomar aquí o para llevar?" } },
  // { id: "atem-rotzim", hebrew: "אתם רוצים", caption: { en: "you want (plural)", fr: "vous voulez (pluriel)", es: "ustedes quieren (plural)" } },
  // { id: "eich-atem-meshalmim", hebrew: "איך אתם משלמים", caption: { en: "how are you paying? (plural)", fr: "comment payez-vous? (pluriel)", es: "¿cómo pagan? (plural)" } },
  // { id: "eich-ata-meshalem", hebrew: "איך אתה משלם", caption: { en: "how are you paying? (masculine)", fr: "comment payes-tu? (masculin)", es: "¿cómo pagas? (masculino)" } },
  // { id: "im-ashray-mezuman", hebrew: "עם אשראי או מזומן", caption: { en: "with card or cash?", fr: "par carte ou en espèces?", es: "¿con tarjeta o en efectivo?" } },
];

// Practice sentences - full coffee shop interactions
const practiceSentences: readonly BuilderSentence[] = [
  // Example structure (remove when adding real sentences):
  // sentence("greeting", { en: "Hello, how are you?", fr: "Bonjour, comment ça va?", es: "Hola, ¿cómo estás?" }, [shalom, ma, nishma]),
  // Add complete interaction sequences mixing customer and waiter phrases
];

assertGlosses("coffee", practiceSentences);

export const coffeeBank: readonly BuilderSentence[] = practiceSentences;

export function coffeePractice() {
  return takeSentences(practiceSentences, 8);
}

// Known words introduced in this level
export const coffeeKnownWords: readonly BasicWord[] = [
  // Coffee shop vocabulary
  // { id: "shalom", hebrew: "שלום", english: "hello", reading: "shalom", partOfSpeech: "interjection", gender: null },
  // { id: "kafe", hebrew: "קפה", english: "coffee", reading: "kafe", partOfSpeech: "noun", gender: "masculine" },
  // { id: "kuason", hebrew: "קרואסון", english: "croissant", reading: "kuason", partOfSpeech: "noun", gender: "masculine" },
];
