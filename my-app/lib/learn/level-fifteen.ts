import type { BasicWord } from "@/lib/learn/basic-words";
import { assertGlosses, sentence, word, type BuilderSentence, type HearCard } from "@/lib/learn/sentences";

const kore = "audio/-e210f35fe851ae822d4253e44a3716a1b2a54f8b_8f1ee893.mp3";
const koret = "audio/-a13173ef91eccc4f629dec62ada0be4b634c24a5_9a31ed5d.mp3";
const korim = "audio/-d94908fd7510ab39789203057f571f15ee66593c_4706e7be.mp3";
const korot = "audio/-39430a12aac461db5a711c34d780c2f9b2df61c4_56f8f347.mp3";
const itonClip = "audio/-7d39625f82f8eedbca2110911810cfe99c8fa341_901bf746.mp3";
const mikhtavClip = "audio/-efee82d4f50440a3cf2f8f84244d9bf2a193349b_a7e38e5b.mp3";
const sipurClip = "audio/-a46e851d2a97e2104f425032d97fcd0fdeec0b85_53f96784.mp3";
const huClip = "audio/-35c8cd77af8e82374a6109161fad2c5eb2c47631_2f4ba2df.mp3";
const hiClip = "audio/-7fa10294b93e6513dcd207034a6016133b3909fc_4793d368.mp3";
const hemClip = "audio/-8c319c5d1bed65c470ee702abbe35eeb672e3939_94e7668b.mp3";
const henClip = "audio/-0d47678f715a386f5c3918f120722a05a6877d52_9b60008d.mp3";

const hu = word("הוא", "he", "il", "él", huClip);
const hi = word("היא", "she", "elle", "ella", hiClip);
const hem = word("הם", "they", "ils", "ellos", hemClip);
const hen = word("הן", "they", "elles", "ellas", henClip);
const koreWord = word("קורא", "reads", "lit", "lee", kore);
const koretWord = word("קוראת", "reads", "lit", "lee", koret);
const korimWord = word("קוראים", "read", "lisent", "leen", korim);
const korotWord = word("קוראות", "read", "lisent", "leen", korot);
const et = word("את", "et", "et", "et");
const haIton = word("העיתון", "the newspaper", "le journal", "el periódico");
const haMikhtav = word("המכתב", "the letter", "la lettre", "la carta");
const haSipur = word("הסיפור", "the story", "l'histoire", "la historia");

export const readForms: readonly HearCard[] = [
  { id: "kore", hebrew: "קוֹרֵא", label: "formMs", example: "הוא קורא עיתון", audio: kore },
  { id: "koret", hebrew: "קוֹרֵאת", label: "formFs", example: "היא קוראת מכתב", audio: koret },
  { id: "korim", hebrew: "קוֹרְאִים", label: "formMp", example: "הם קוראים סיפור", audio: korim },
  { id: "korot", hebrew: "קוֹרְאוֹת", label: "formFp", example: "הן קוראות עיתון", audio: korot },
];

export const readNouns: readonly HearCard[] = [
  { id: "iton", hebrew: "עִתּוֹן", label: "nounNewspaper", audio: itonClip },
  { id: "mikhtav", hebrew: "מִכְתָּב", label: "nounLetter", audio: mikhtavClip },
  { id: "sipur", hebrew: "סִּיפּוּר", label: "nounStory", audio: sipurClip },
];

const readPractice: readonly BuilderSentence[] = [
  sentence("hu-kore-iton", { en: "He is reading the newspaper", fr: "Il lit le journal", es: "Él lee el periódico" }, [hu, koreWord, et, haIton]),
  sentence("hi-koret-mikhtav", { en: "She is reading the letter", fr: "Elle lit la lettre", es: "Ella lee la carta" }, [hi, koretWord, et, haMikhtav]),
  sentence("hem-korim-sipur", { en: "They are reading the story", fr: "Ils lisent l'histoire", es: "Ellos leen la historia" }, [hem, korimWord, et, haSipur]),
  sentence("hen-korot-iton", { en: "They are reading the newspaper", fr: "Elles lisent le journal", es: "Ellas leen el periódico" }, [hen, korotWord, et, haIton]),
  sentence("hu-kore-sipur", { en: "He is reading the story", fr: "Il lit l'histoire", es: "Él lee la historia" }, [hu, koreWord, et, haSipur]),
  sentence("hi-koret-iton", { en: "She is reading the newspaper", fr: "Elle lit le journal", es: "Ella lee el periódico" }, [hi, koretWord, et, haIton]),
];

assertGlosses("15", readPractice);

export function fifteenReadPractice() {
  return [...readPractice];
}

export const fifteenKnownWords: readonly BasicWord[] = [
  { id: "likro", hebrew: "לִקְרוֹא", english: "to read", reading: "likro", partOfSpeech: "verb", gender: null },
  { id: "read-ms", hebrew: "קוֹרֵא", english: "he reads", reading: "kore", partOfSpeech: "verb", gender: "masculine" },
  { id: "read-fs", hebrew: "קוֹרֵאת", english: "she reads", reading: "koret", partOfSpeech: "verb", gender: "feminine" },
  { id: "read-mp", hebrew: "קוֹרְאִים", english: "they read", reading: "korim", partOfSpeech: "verb", gender: "masculine" },
  { id: "read-fp", hebrew: "קוֹרְאוֹת", english: "they read", reading: "korot", partOfSpeech: "verb", gender: "feminine" },
  { id: "iton", hebrew: "עיתון", english: "newspaper", reading: "iton", partOfSpeech: "noun", gender: "masculine" },
  { id: "mikhtav", hebrew: "מכתב", english: "letter", reading: "mikhtav", partOfSpeech: "noun", gender: "masculine" },
  { id: "sipur", hebrew: "סיפור", english: "story", reading: "sipur", partOfSpeech: "noun", gender: "masculine" },
];
