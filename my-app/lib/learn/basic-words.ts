import type { Flashcard, GrammaticalGender, PartOfSpeech } from "@/lib/flashcards/types";

export type BasicWord = {
  id: string;
  hebrew: string;
  english: string;
  reading: string;
  partOfSpeech: PartOfSpeech;
  gender: GrammaticalGender | null;
};

const noun = "noun" as const;
const particle = "particle" as const;
const adverb = "adverb" as const;
const m = "masculine" as const;
const f = "feminine" as const;

export const basicWords: BasicWord[] = [
  { id: "dag", hebrew: "דָג", english: "fish", reading: "dag", partOfSpeech: noun, gender: m },
  { id: "gag", hebrew: "גַּג", english: "roof", reading: "gag", partOfSpeech: noun, gender: m },
  { id: "ets", hebrew: "עֵץ", english: "tree", reading: "ets", partOfSpeech: noun, gender: m },
  { id: "shem", hebrew: "שֵׁם", english: "name", reading: "shem", partOfSpeech: noun, gender: m },
  { id: "ben", hebrew: "בֵּן", english: "son", reading: "ben", partOfSpeech: noun, gender: m },
  { id: "bat", hebrew: "בַּת", english: "daughter", reading: "bat", partOfSpeech: noun, gender: f },
  { id: "yad", hebrew: "יָד", english: "hand", reading: "yad", partOfSpeech: noun, gender: f },
  { id: "dam", hebrew: "דָם", english: "blood", reading: "dam", partOfSpeech: noun, gender: m },
  { id: "am", hebrew: "עַם", english: "people", reading: "am", partOfSpeech: noun, gender: m },
  { id: "lev", hebrew: "לֵב", english: "heart", reading: "lev", partOfSpeech: noun, gender: m },
  { id: "peh", hebrew: "פֶּה", english: "mouth", reading: "peh", partOfSpeech: noun, gender: m },
  { id: "mah", hebrew: "מָה", english: "what", reading: "mah", partOfSpeech: particle, gender: null },
  { id: "lo", hebrew: "לֹא", english: "no", reading: "lo", partOfSpeech: adverb, gender: null },
  { id: "ken", hebrew: "כֵּן", english: "yes", reading: "ken", partOfSpeech: adverb, gender: null },
  { id: "gan", hebrew: "גַּן", english: "garden", reading: "gan", partOfSpeech: noun, gender: m },
  { id: "av", hebrew: "אָב", english: "father", reading: "av", partOfSpeech: noun, gender: m },
  { id: "em", hebrew: "אֵם", english: "mother", reading: "em", partOfSpeech: noun, gender: f },
  { id: "ach", hebrew: "אָח", english: "brother", reading: "ach", partOfSpeech: noun, gender: m },
  { id: "chag", hebrew: "חַג", english: "festival", reading: "chag", partOfSpeech: noun, gender: m },
  { id: "har", hebrew: "הַר", english: "mountain", reading: "har", partOfSpeech: noun, gender: m },
  { id: "kol", hebrew: "כֹּל", english: "all", reading: "kol", partOfSpeech: noun, gender: m },
  { id: "rak", hebrew: "רַק", english: "only", reading: "rak", partOfSpeech: adverb, gender: null },
  { id: "gam", hebrew: "גַּם", english: "also", reading: "gam", partOfSpeech: adverb, gender: null },
  { id: "im", hebrew: "אִם", english: "if", reading: "im", partOfSpeech: particle, gender: null },
  { id: "al", hebrew: "עַל", english: "on", reading: "al", partOfSpeech: "preposition", gender: null },
  { id: "min", hebrew: "מִן", english: "from", reading: "min", partOfSpeech: "preposition", gender: null },
  { id: "ad", hebrew: "עַד", english: "until", reading: "ad", partOfSpeech: "preposition", gender: null },
  { id: "poh", hebrew: "פֹּה", english: "here", reading: "poh", partOfSpeech: adverb, gender: null },
  { id: "sham", hebrew: "שָׁם", english: "there", reading: "sham", partOfSpeech: adverb, gender: null },
  { id: "zeh", hebrew: "זֶה", english: "this", reading: "zeh", partOfSpeech: "pronoun", gender: m },
  { id: "mi", hebrew: "מִי", english: "who", reading: "mi", partOfSpeech: "pronoun", gender: null },
  { id: "kaf", hebrew: "כַּף", english: "spoon", reading: "kaf", partOfSpeech: noun, gender: f },
  { id: "ner", hebrew: "נֵר", english: "candle", reading: "ner", partOfSpeech: noun, gender: m },
  { id: "dan", hebrew: "דָן", english: "Dan", reading: "dan", partOfSpeech: noun, gender: m },
  { id: "rats", hebrew: "רָץ", english: "runs", reading: "rats", partOfSpeech: "verb", gender: m },
  { id: "ba", hebrew: "בָּא", english: "came", reading: "ba", partOfSpeech: "verb", gender: m },
  { id: "kar", hebrew: "קַר", english: "cold", reading: "kar", partOfSpeech: "adjective", gender: null },
  { id: "cham", hebrew: "חַם", english: "hot", reading: "cham", partOfSpeech: "adjective", gender: null },
  { id: "ra", hebrew: "רַע", english: "bad", reading: "ra", partOfSpeech: "adjective", gender: m },
  { id: "tal", hebrew: "טַל", english: "dew", reading: "tal", partOfSpeech: noun, gender: m },
  { id: "tsad", hebrew: "צַד", english: "side", reading: "tsad", partOfSpeech: noun, gender: m },
  { id: "daf", hebrew: "דַף", english: "page", reading: "daf", partOfSpeech: noun, gender: m },
  { id: "kan", hebrew: "קַן", english: "nest", reading: "kan", partOfSpeech: noun, gender: m },
  { id: "yam", hebrew: "יָם", english: "sea", reading: "yam", partOfSpeech: noun, gender: m },
  { id: "esh", hebrew: "אֵשׁ", english: "fire", reading: "esh", partOfSpeech: noun, gender: f },
  { id: "pat", hebrew: "פַּת", english: "bread", reading: "pat", partOfSpeech: noun, gender: f },
  { id: "gal", hebrew: "גַּל", english: "wave", reading: "gal", partOfSpeech: noun, gender: m },
  { id: "or", hebrew: "אוֹר", english: "light", reading: "or", partOfSpeech: noun, gender: m },
  { id: "dod", hebrew: "דוֹד", english: "uncle", reading: "dod", partOfSpeech: noun, gender: m },
  { id: "gur", hebrew: "גּוּר", english: "cub", reading: "gur", partOfSpeech: noun, gender: m },
];

export const sofitQuizIds = ["ets", "shem", "ben", "gan", "dam"] as const;

export function wordsByIds(ids: readonly string[]) {
  return ids.flatMap((id) => {
    const word = basicWords.find((item) => item.id === id);
    return word ? [word] : [];
  });
}

export function toFlashcard(word: BasicWord): Flashcard {
  return {
    id: `known-${word.id}`,
    english: word.english,
    partOfSpeech: word.partOfSpeech,
    example: "",
    hebrew: word.hebrew,
    hebrewExample: "",
    gender: word.gender,
  };
}
