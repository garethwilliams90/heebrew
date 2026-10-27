import type { Flashcard } from "@/lib/flashcards/types";

export const numbersDeckId = "numbers";

export type NumberGroup = "digit" | "teen" | "round";

export type NumberWord = {
  id: string;
  value: number;
  group: NumberGroup;
  hebrew: string;
};

const word = (
  id: string,
  value: number,
  group: NumberGroup,
  hebrew: string,
): NumberWord => ({ id, value, group, hebrew });

/**
 * Counting forms in the same order as `public/numbers 2`:
 * zero through nine, ten through nineteen, the tens,
 * one hundred through nine hundred, then one thousand.
 */
export const numberWords: readonly NumberWord[] = [
  word("n0", 0, "digit", "אֶפֶס"),
  word("n1", 1, "digit", "אַחַת"),
  word("n2", 2, "digit", "שְׁתַּיִם"),
  word("n3", 3, "digit", "שָׁלוֹשׁ"),
  word("n4", 4, "digit", "אַרְבַּע"),
  word("n5", 5, "digit", "חָמֵשׁ"),
  word("n6", 6, "digit", "שֵׁשׁ"),
  word("n7", 7, "digit", "שֶׁבַע"),
  word("n8", 8, "digit", "שְׁמוֹנֶה"),
  word("n9", 9, "digit", "תֵּשַׁע"),
  word("n10", 10, "round", "עֶשֶׂר"),
  word("n11", 11, "teen", "אַחַת עֶשְׂרֵה"),
  word("n12", 12, "teen", "שְׁתֵּים עֶשְׂרֵה"),
  word("n13", 13, "teen", "שְׁלוֹשׁ עֶשְׂרֵה"),
  word("n14", 14, "teen", "אַרְבַּע עֶשְׂרֵה"),
  word("n15", 15, "teen", "חֲמֵשׁ עֶשְׂרֵה"),
  word("n16", 16, "teen", "שֵׁשׁ עֶשְׂרֵה"),
  word("n17", 17, "teen", "שְׁבַע עֶשְׂרֵה"),
  word("n18", 18, "teen", "שְׁמוֹנֶה עֶשְׂרֵה"),
  word("n19", 19, "teen", "תְּשַׁע עֶשְׂרֵה"),
  word("n20", 20, "round", "עֶשְׂרִים"),
  word("n30", 30, "round", "שְׁלוֹשִׁים"),
  word("n40", 40, "round", "אַרְבָּעִים"),
  word("n50", 50, "round", "חֲמִשִּׁים"),
  word("n60", 60, "round", "שִׁשִּׁים"),
  word("n70", 70, "round", "שִׁבְעִים"),
  word("n80", 80, "round", "שְׁמוֹנִים" ),
  word("n90", 90, "round", "תִּשְׁעִים"),
  word("n100", 100, "round", "מֵאָה"),
  word("n200", 200, "round", "מָאתַיִם"),
  word("n300", 300, "round", "שְׁלוֹשׁ מֵאוֹת"),
  word("n400", 400, "round", "אַרְבַּע מֵאוֹת"),
  word("n500", 500, "round", "חֲמֵשׁ מֵאוֹת"),
  word("n600", 600, "round", "שֵׁשׁ מֵאוֹת"),
  word("n700", 700, "round", "שְׁבַע מֵאוֹת"),
  word("n800", 800, "round", "שְׁמוֹנֶה מֵאוֹת"),
  word("n900", 900, "round", "תְּשַׁע מֵאוֹת"),
  word("n1000", 1000, "round", "אֶלֶף"),
];

const clipByHebrew = new Map(
  numberWords.map((entry, index) => [
    entry.hebrew,
    `/numbers%202/numbers_${String(index + 1).padStart(2, "0")}.mp3`,
  ]),
);

/** The recording in `public/numbers 2` for this spelling. */
export function numberRecording(hebrew: string) {
  return clipByHebrew.get(hebrew);
}



export function toNumberCard(word: NumberWord, locale: string): Flashcard {
  return {
    id: word.id,
    english: word.value.toString(),
    partOfSpeech: "noun",
    example: "",
    hebrew: word.hebrew,
    hebrewExample: "",
    gender: null,
    audioUrl: numberRecording(word.hebrew),
  };
}
