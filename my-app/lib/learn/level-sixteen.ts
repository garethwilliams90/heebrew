import type { BasicWord } from "@/lib/learn/basic-words";
import { assertGlosses, sentence, word, type BuilderSentence, type HearCard } from "@/lib/learn/sentences";

const kotev = "audio/-c64575fa7c49bfa9bd17f35c4af2a84f3004cf23_fe6ee44c.mp3";
const kotevet = "audio/-7637dc79a0722cdf63f40336113e27725e413be5_13b92616.mp3";
const kotvim = "audio/-1a1958be945a30483089628683f550bdf64c46fe_c1c9b499.mp3";
const kotvot = "audio/-715089fbe4c54ce60ddd93f29d2ecc6c06ffc3f5_7aa9d6fd.mp3";
const ohev = "audio/-5fcd6ba6450a1f2b3ca66848e772724d93f58cd2_daf79d27.mp3";
const ohevet = "audio/-3b54f91c728ceeecb4beacdf391a85ed8dc88359_ab94b5ad.mp3";
const ohavim = "audio/-153cbbcd5ab99b8f26523e14abe650cae154a3cd_cb9b3323.mp3";
const ohavot = "audio/-c2b386460e1ee8f9f69196649225477604c45525_83b64612.mp3";
const shirClip = "audio/-2e5d77df08ae4692ab0416f7a4be94f827113b5c_207d33eb.mp3";
const muzikaClip = "audio/-3609b497a9b4ea8d74b7b3afeb39b7d8a9163e28_a53e3127.mp3";
const huClip = "audio/-35c8cd77af8e82374a6109161fad2c5eb2c47631_2f4ba2df.mp3";
const hiClip = "audio/-7fa10294b93e6513dcd207034a6016133b3909fc_4793d368.mp3";
const hemClip = "audio/-8c319c5d1bed65c470ee702abbe35eeb672e3939_94e7668b.mp3";
const henClip = "audio/-0d47678f715a386f5c3918f120722a05a6877d52_9b60008d.mp3";

const hu = word("הוא", "he", "il", "él", huClip);
const hi = word("היא", "she", "elle", "ella", hiClip);
const hem = word("הם", "they", "ils", "ellos", hemClip);
const hen = word("הן", "they", "elles", "ellas", henClip);
const kotevWord = word("כותב", "writes", "écrit", "escribe", kotev);
const kotevetWord = word("כותבת", "writes", "écrit", "escribe", kotevet);
const kotvimWord = word("כותבים", "write", "écrivent", "escriben", kotvim);
const kotvotWord = word("כותבות", "write", "écrivent", "escriben", kotvot);
const ohevWord = word("אוהב", "likes", "aime", "ama", ohev);
const ohevetWord = word("אוהבת", "likes", "aime", "ama", ohevet);
const ohavimWord = word("אוהבים", "like", "aiment", "aman", ohavim);
const ohavotWord = word("אוהבות", "like", "aiment", "aman", ohavot);
const et = word("את", "et", "et", "et");
const haMikhtav = word("המכתב", "the letter", "la lettre", "la carta");
const haSipur = word("הסיפור", "the story", "l'histoire", "la historia");
const haShir = word("השיר", "the song", "la chanson", "la canción");
const muzika = word("מוזיקה", "music", "musique", "música", muzikaClip);

export const writeForms: readonly HearCard[] = [
  { id: "kotev", hebrew: "כּוֹתֵב", label: "formMs", example: "הוא כותב מכתב", audio: kotev },
  { id: "kotevet", hebrew: "כּוֹתֶבֶת", label: "formFs", example: "היא כותבת סיפור", audio: kotevet },
  { id: "kotvim", hebrew: "כּוֹתְבִים", label: "formMp", example: "הם כותבים מכתב", audio: kotvim },
  { id: "kotvot", hebrew: "כּוֹתְבוֹת", label: "formFp", example: "הן כותבות סיפור", audio: kotvot },
];

export const loveForms: readonly HearCard[] = [
  { id: "ohev", hebrew: "אוֹהֵב", label: "formMs", example: "הוא אוהב שיר", audio: ohev },
  { id: "ohevet", hebrew: "אוֹהֶבֶת", label: "formFs", example: "היא אוהבת שיר", audio: ohevet },
  { id: "ohavim", hebrew: "אוֹהֲבִים", label: "formMp", example: "הם אוהבים מוזיקה", audio: ohavim },
  { id: "ohavot", hebrew: "אוֹהֲבוֹת", label: "formFp", example: "הן אוהבות מוזיקה", audio: ohavot },
];

export const loveNouns: readonly HearCard[] = [
  { id: "shir", hebrew: "שִׁיר", label: "nounSong", audio: shirClip },
  { id: "muzika", hebrew: "מוּזִיקָה", label: "nounMusic", audio: muzikaClip },
];

const mixPractice: readonly BuilderSentence[] = [
  sentence("hu-kotev-mikhtav", { en: "He is writing the letter", fr: "Il écrit la lettre", es: "Él escribe la carta" }, [hu, kotevWord, et, haMikhtav]),
  sentence("hi-ohevet-shir", { en: "She likes the song", fr: "Elle aime la chanson", es: "Ella ama la canción" }, [hi, ohevetWord, et, haShir]),
  sentence("hem-kotvim-mikhtav", { en: "They are writing the letter", fr: "Ils écrivent la lettre", es: "Ellos escriben la carta" }, [hem, kotvimWord, et, haMikhtav]),
  sentence("hem-ohavim-muzika", { en: "They like music", fr: "Ils aiment la musique", es: "Ellos aman la música" }, [hem, ohavimWord, muzika]),
  sentence("hi-kotevet-sipur", { en: "She is writing the story", fr: "Elle écrit l'histoire", es: "Ella escribe la historia" }, [hi, kotevetWord, et, haSipur]),
  sentence("hu-ohev-shir", { en: "He likes the song", fr: "Il aime la chanson", es: "Él ama la canción" }, [hu, ohevWord, et, haShir]),
  sentence("hen-kotvot-sipur", { en: "They are writing the story", fr: "Elles écrivent l'histoire", es: "Ellas escriben la historia" }, [hen, kotvotWord, et, haSipur]),
  sentence("hen-ohavot-muzika", { en: "They like music", fr: "Elles aiment la musique", es: "Ellas aman la música" }, [hen, ohavotWord, muzika]),
];

assertGlosses("16", mixPractice);

export function sixteenMixPractice() {
  return [...mixPractice];
}

export const sixteenKnownWords: readonly BasicWord[] = [
  { id: "likhtov", hebrew: "לִכְתּוֹב", english: "to write", reading: "likhtov", partOfSpeech: "verb", gender: null },
  { id: "write-ms", hebrew: "כּוֹתֵב", english: "he writes", reading: "kotev", partOfSpeech: "verb", gender: "masculine" },
  { id: "write-fs", hebrew: "כּוֹתֶבֶת", english: "she writes", reading: "kotevet", partOfSpeech: "verb", gender: "feminine" },
  { id: "write-mp", hebrew: "כּוֹתְבִים", english: "they write", reading: "kotvim", partOfSpeech: "verb", gender: "masculine" },
  { id: "write-fp", hebrew: "כּוֹתְבוֹת", english: "they write", reading: "kotvot", partOfSpeech: "verb", gender: "feminine" },
  { id: "leehov", hebrew: "לֶאֱהֹב", english: "to like", reading: "leehov", partOfSpeech: "verb", gender: null },
  { id: "like-ms", hebrew: "אוֹהֵב", english: "he likes", reading: "ohev", partOfSpeech: "verb", gender: "masculine" },
  { id: "like-fs", hebrew: "אוֹהֶבֶת", english: "she likes", reading: "ohevet", partOfSpeech: "verb", gender: "feminine" },
  { id: "like-mp", hebrew: "אוֹהֲבִים", english: "they like", reading: "ohavim", partOfSpeech: "verb", gender: "masculine" },
  { id: "like-fp", hebrew: "אוֹהֲבוֹת", english: "they like", reading: "ohavot", partOfSpeech: "verb", gender: "feminine" },
  { id: "shir", hebrew: "שיר", english: "song", reading: "shir", partOfSpeech: "noun", gender: "masculine" },
  { id: "muzika", hebrew: "מוזיקה", english: "music", reading: "muzika", partOfSpeech: "noun", gender: "feminine" },
];
