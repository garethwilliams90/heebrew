import type { BasicWord } from "@/lib/learn/basic-words";
import { assertGlosses, sentence, takeSentences, word, type BuilderSentence, type HearCard } from "@/lib/learn/sentences";

const ze = word("זה", "this", "ceci", "esto");
const ele = word("אלה", "these", "ceux-ci", "estos");
const hu = word("הוא", "he", "il", "él");
const hi = word("היא", "she", "elle", "ella");
const anachnu = word("אנחנו", "we", "nous", "nosotros");
const atem = word("אתם", "you", "vous", "vosotros");
const aten = word("אתן", "you", "vous", "vosotras");
const hem = word("הם", "they", "ils", "ellos");
const hen = word("הן", "they", "elles", "ellas");
const ochel = word("אוכל", "eats", "mange", "come");
const ochelet = word("אוכלת", "eats", "mange", "come");
const ochlim = word("אוכלים", "eat", "mangent", "comen");
const ochlot = word("אוכלות", "eat", "mangent", "comen");
const et = word("את", "et", "et", "et");
const hakelev = word("הכלב", "the dog", "le chien", "el perro");
const hakelevim = word("הכלבים", "the dogs", "les chiens", "los perros");
const hasefer = word("הספר", "the book", "le livre", "el libro");
const hasefarim = word("הספרים", "the books", "les livres", "los libros");
const habayit = word("הבית", "the house", "la maison", "la casa");
const habatim = word("הבתים", "the houses", "les maisons", "las casas");
const hadag = word("הדג", "the fish", "le poisson", "el pez");
const hadagim = word("הדגים", "the fish", "les poissons", "los peces");
const halechem = word("הלחם", "the bread", "le pain", "el pan");
const hachatul = word("החתול", "the cat", "le chat", "el gato");
const hachatulim = word("החתולים", "the cats", "les chats", "los gatos");
const hayeled = word("הילד", "the boy", "le garçon", "el niño");
const hayeladim = word("הילדים", "the children", "les enfants", "los niños");
const hayeladot = word("הילדות", "the girls", "les filles", "las niñas");
const hauga = word("העוגה", "the cake", "le gâteau", "el pastel");
const haugot = word("העוגות", "the cakes", "les gâteaux", "los pasteles");
const hatapuz = word("התפוח", "the apple", "la pomme", "la manzana");
const sheli = word("שלי", "my", "à moi", "mío");
const shelo = word("שלו", "his", "à lui", "suyo");
const shela = word("שלה", "her", "à elle", "suyo");
const shelanu = word("שלנו", "our", "à nous", "nuestro");
const shelachem = word("שלכם", "your", "à vous", "vuestro");
const shelachen = word("שלכן", "your", "à vous", "vuestro");
const shelahem = word("שלהם", "their", "à eux", "suyo");
const shelahen = word("שלהן", "their", "à elles", "suyo");

export const thirteenIntroForms: readonly HearCard[] = [
  { id: "sheli", hebrew: "שֶׁלִּי", label: "shelMine" },
  { id: "shelcha", hebrew: "שֶׁלְּךָ", label: "shelYours" },
  { id: "shelo", hebrew: "שֶׁלּוֹ", label: "shelHis" },
  { id: "shela", hebrew: "שֶׁלָּהּ", label: "shelHers" },
  { id: "shelanu", hebrew: "שֶׁלָּנוּ", label: "shelOurs" },
  { id: "shelachem", hebrew: "שֶׁלָּכֶם", label: "shelYoursMen" },
  { id: "shelachen", hebrew: "שֶׁלָּכֶן", label: "shelYoursWomen" },
  { id: "shelahem", hebrew: "שֶׁלָּהֶם", label: "shelTheirsMen" },
  { id: "shelahen", hebrew: "שֶׁלָּהֶן", label: "shelTheirsWomen" },
];

export const thirteenStage1Forms: readonly HearCard[] = [
  { id: "sheli", hebrew: "שֶׁלִּי", label: "shelMine", example: "הכלב שלי" },
  { id: "shelo", hebrew: "שֶׁלּוֹ", label: "shelHis", example: "הכלב שלו" },
  { id: "shela", hebrew: "שֶׁלָּהּ", label: "shelHers", example: "הכלב שלה" },
];

export const thirteenStage2Forms: readonly HearCard[] = [
  { id: "shelanu", hebrew: "שֶׁלָּנוּ", label: "shelOurs", example: "הכלבים שלנו" },
  { id: "ze", hebrew: "זֶה", label: "zeThis", example: "זה הכלב" },
  { id: "ele", hebrew: "אֵלֶּה", label: "eleThese", example: "אלה הכלבים" },
];

export const thirteenStage3Forms: readonly HearCard[] = [
  { id: "shelachem", hebrew: "שֶׁלָּכֶם", label: "shelYoursMen", example: "הכלבים שלכם" },
  { id: "shelachen", hebrew: "שֶׁלָּכֶן", label: "shelYoursWomen", example: "הכלבים שלכן" },
];

export const thirteenStage4Forms: readonly HearCard[] = [
  { id: "shelahem", hebrew: "שֶׁלָּהֶם", label: "shelTheirsMen", example: "הכלבים שלהם" },
  { id: "shelahen", hebrew: "שֶׁלָּהֶן", label: "shelTheirsWomen", example: "הכלבים שלהן" },
];

const stage1: readonly BuilderSentence[] = [
  sentence("ze-kelev-sheli", { en: "This is my dog", fr: "C'est mon chien", es: "Este es mi perro" }, [ze, hakelev, sheli]),
  sentence("ze-sefer-shelo", { en: "This is his book", fr: "C'est son livre", es: "Este es su libro" }, [ze, hasefer, shelo]),
  sentence("ze-bayit-shela", { en: "This is her house", fr: "C'est sa maison", es: "Esta es su casa" }, [ze, habayit, shela]),
  sentence("hu-ochel-et-dag-sheli", { en: "He is eating my fish", fr: "Il mange mon poisson", es: "Él come mi pez" }, [hu, ochel, et, hadag, sheli]),
  sentence("hi-ochelet-et-lechem-shelo", { en: "She is eating his bread", fr: "Elle mange son pain", es: "Ella come su pan" }, [hi, ochelet, et, halechem, shelo]),
  sentence("ze-chatul-shela", { en: "This is her cat", fr: "C'est son chat", es: "Este es su gato" }, [ze, hachatul, shela]),
  sentence("hu-ochel-et-tapuz-sheli", { en: "He is eating my apple", fr: "Il mange ma pomme", es: "Él come mi manzana" }, [hu, ochel, et, hatapuz, sheli]),
  sentence("ze-yeled-shelo", { en: "This is his boy", fr: "C'est son garçon", es: "Este es su niño" }, [ze, hayeled, shelo]),
  sentence("hi-ochelet-et-uga-shela", { en: "She is eating her cake", fr: "Elle mange son gâteau", es: "Ella come su pastel" }, [hi, ochelet, et, hauga, shela]),
  sentence("ze-kelev-shelo", { en: "This is his dog", fr: "C'est son chien", es: "Este es su perro" }, [ze, hakelev, shelo]),
];

const stage2: readonly BuilderSentence[] = [
  sentence("ele-kelevim-shelanu", { en: "These are our dogs", fr: "Ce sont nos chiens", es: "Estos son nuestros perros" }, [ele, hakelevim, shelanu]),
  sentence("ele-sefarim-shelanu", { en: "These are our books", fr: "Ce sont nos livres", es: "Estos son nuestros libros" }, [ele, hasefarim, shelanu]),
  sentence("ele-yeladot-shelanu", { en: "These are our girls", fr: "Ce sont nos filles", es: "Estas son nuestras niñas" }, [ele, hayeladot, shelanu]),
  sentence("anachnu-ochlim-et-dagim-shelanu", { en: "We are eating our fish", fr: "Nous mangeons nos poissons", es: "Comemos nuestros peces" }, [anachnu, ochlim, et, hadagim, shelanu]),
  sentence("ele-batim-shelanu", { en: "These are our houses", fr: "Ce sont nos maisons", es: "Estas son nuestras casas" }, [ele, habatim, shelanu]),
  sentence("ele-chatulim-shelanu", { en: "These are our cats", fr: "Ce sont nos chats", es: "Estos son nuestros gatos" }, [ele, hachatulim, shelanu]),
  sentence("ze-bayit-shelanu", { en: "This is our house", fr: "C'est notre maison", es: "Esta es nuestra casa" }, [ze, habayit, shelanu]),
  sentence("ele-ugot-shelanu", { en: "These are our cakes", fr: "Ce sont nos gâteaux", es: "Estos son nuestros pasteles" }, [ele, haugot, shelanu]),
  sentence("anachnu-ochlim-et-lechem-shelanu", { en: "We are eating our bread", fr: "Nous mangeons notre pain", es: "Comemos nuestro pan" }, [anachnu, ochlim, et, halechem, shelanu]),
  sentence("ele-yeladim-shelanu", { en: "These are our children", fr: "Ce sont nos enfants", es: "Estos son nuestros niños" }, [ele, hayeladim, shelanu]),
];

const stage3: readonly BuilderSentence[] = [
  sentence("ele-kelevim-shelachem", { en: "These are your dogs", fr: "Ce sont vos chiens", es: "Estos son vuestros perros" }, [ele, hakelevim, shelachem]),
  sentence("ele-sefarim-shelachen", { en: "These are your books", fr: "Ce sont vos livres", es: "Estos son vuestros libros" }, [ele, hasefarim, shelachen]),
  sentence("ele-batim-shelachem", { en: "These are your houses", fr: "Ce sont vos maisons", es: "Estas son vuestras casas" }, [ele, habatim, shelachem]),
  sentence("atem-ochlim-et-dag-shelachem", { en: "You are eating your fish", fr: "Vous mangez votre poisson", es: "Coméis vuestro pez" }, [atem, ochlim, et, hadag, shelachem]),
  sentence("aten-ochlot-et-uga-shelachen", { en: "You are eating your cake", fr: "Vous mangez votre gâteau", es: "Coméis vuestro pastel" }, [aten, ochlot, et, hauga, shelachen]),
  sentence("ele-yeladim-shelachem", { en: "These are your children", fr: "Ce sont vos enfants", es: "Estos son vuestros niños" }, [ele, hayeladim, shelachem]),
  sentence("ele-chatulim-shelachen", { en: "These are your cats", fr: "Ce sont vos chats", es: "Estos son vuestros gatos" }, [ele, hachatulim, shelachen]),
  sentence("ze-sefer-shelachem", { en: "This is your book", fr: "C'est votre livre", es: "Este es vuestro libro" }, [ze, hasefer, shelachem]),
  sentence("ele-ugot-shelachem", { en: "These are your cakes", fr: "Ce sont vos gâteaux", es: "Estos son vuestros pasteles" }, [ele, haugot, shelachem]),
  sentence("atem-ochlim-et-lechem-shelachem", { en: "You are eating your bread", fr: "Vous mangez votre pain", es: "Coméis vuestro pan" }, [atem, ochlim, et, halechem, shelachem]),
];

const stage4: readonly BuilderSentence[] = [
  sentence("ele-kelevim-shelahem", { en: "These are their dogs", fr: "Ce sont leurs chiens", es: "Estos son sus perros" }, [ele, hakelevim, shelahem]),
  sentence("ele-sefarim-shelahen", { en: "These are their books", fr: "Ce sont leurs livres", es: "Estos son sus libros" }, [ele, hasefarim, shelahen]),
  sentence("hem-ochlim-et-dag-shelahem", { en: "They are eating their fish", fr: "Ils mangent leur poisson", es: "Ellos comen su pez" }, [hem, ochlim, et, hadag, shelahem]),
  sentence("hen-ochlot-et-uga-shelahen", { en: "They are eating their cake", fr: "Elles mangent leur gâteau", es: "Ellas comen su pastel" }, [hen, ochlot, et, hauga, shelahen]),
  sentence("ele-batim-shelahem", { en: "These are their houses", fr: "Ce sont leurs maisons", es: "Estas son sus casas" }, [ele, habatim, shelahem]),
  sentence("ele-yeladim-shelahen", { en: "These are their children", fr: "Ce sont leurs enfants", es: "Estos son sus niños" }, [ele, hayeladim, shelahen]),
  sentence("ze-bayit-shelahem", { en: "This is their house", fr: "C'est leur maison", es: "Esta es su casa" }, [ze, habayit, shelahem]),
  sentence("ele-chatulim-shelahem", { en: "These are their cats", fr: "Ce sont leurs chats", es: "Estos son sus gatos" }, [ele, hachatulim, shelahem]),
  sentence("hem-ochlim-et-lechem-shelahem", { en: "They are eating their bread", fr: "Ils mangent leur pain", es: "Ellos comen su pan" }, [hem, ochlim, et, halechem, shelahem]),
  sentence("ele-yeladot-shelahen", { en: "These are their girls", fr: "Ce sont leurs filles", es: "Estas son sus niñas" }, [ele, hayeladot, shelahen]),
];

assertGlosses("13", [...stage1, ...stage2, ...stage3, ...stage4]);

export const thirteenBank: readonly BuilderSentence[] = [...stage1, ...stage2, ...stage3, ...stage4];

export function thirteenPractice(stage: 1 | 2 | 3 | 4) {
  const bank = stage === 1 ? stage1 : stage === 2 ? stage2 : stage === 3 ? stage3 : stage4;
  return takeSentences(bank, 6);
}

export const thirteenKnownWords: readonly BasicWord[] = [
  { id: "sheli", hebrew: "שֶׁלִּי", english: "mine", reading: "sheli", partOfSpeech: "pronoun", gender: null },
  { id: "shelo", hebrew: "שֶׁלּוֹ", english: "his", reading: "shelo", partOfSpeech: "pronoun", gender: "masculine" },
  { id: "shela", hebrew: "שֶׁלָּהּ", english: "hers", reading: "shela", partOfSpeech: "pronoun", gender: "feminine" },
  { id: "shelanu", hebrew: "שֶׁלָּנוּ", english: "ours", reading: "shelanu", partOfSpeech: "pronoun", gender: null },
  { id: "shelachem", hebrew: "שֶׁלָּכֶם", english: "yours", reading: "shelachem", partOfSpeech: "pronoun", gender: "masculine" },
  { id: "shelachen", hebrew: "שֶׁלָּכֶן", english: "yours", reading: "shelachen", partOfSpeech: "pronoun", gender: "feminine" },
  { id: "shelahem", hebrew: "שֶׁלָּהֶם", english: "theirs", reading: "shelahem", partOfSpeech: "pronoun", gender: "masculine" },
  { id: "shelahen", hebrew: "שֶׁלָּהֶן", english: "theirs", reading: "shelahen", partOfSpeech: "pronoun", gender: "feminine" },
];
