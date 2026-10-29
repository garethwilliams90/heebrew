import type { BasicWord } from "@/lib/learn/basic-words";
import type { GrammaticalGender, PartOfSpeech } from "@/lib/flashcards/types";
import { connectorLevels } from "@/lib/learn/connector-levels";
import {
  sentence,
  withExtras,
  word,
  type BuilderSentence,
  type HearCard,
  type HearLabel,
  type LocaleGloss,
} from "@/lib/learn/sentences";

export type TitlePiece = LocaleGloss | { he: string };

export type LevelStep =
  | { id: string; title: readonly TitlePiece[]; body: LocaleGloss; cards?: readonly HearCard[] }
  | { id: string; exam?: boolean; rounds: readonly BuilderSentence[] };

export type CurriculumLevelDef = {
  level: number;
  title: LocaleGloss;
  about: LocaleGloss;
  knownWords: readonly BasicWord[];
  steps: readonly LevelStep[];
};

const g = (en: string, fr: string, es: string): LocaleGloss => ({ en, fr, es });
const w = word;

const verb = "verb" as const;
const noun = "noun" as const;
const m = "masculine" as const;
const f = "feminine" as const;

function entry(
  id: string,
  hebrew: string,
  english: string,
  reading: string,
  partOfSpeech: PartOfSpeech,
  gender: GrammaticalGender | null,
): BasicWord {
  return { id, hebrew, english, reading, partOfSpeech, gender };
}

function forms(id: string, pointed: readonly string[], clips: readonly (string | undefined)[], examples: readonly string[]): HearCard[] {
  const labels = ["formMs", "formFs", "formMp", "formFp"] as const satisfies readonly HearLabel[];
  return pointed.map((hebrew, index) => ({
    id: `${id}-${labels[index]}`,
    hebrew,
    label: labels[index],
    example: examples[index],
    audio: clips[index],
  }));
}

function nounCard(id: string, hebrew: string, caption: LocaleGloss, audio?: string): HearCard {
  return { id, hebrew, caption, audio };
}

const huA = "audio/-35c8cd77af8e82374a6109161fad2c5eb2c47631_2f4ba2df.mp3";
const hiA = "audio/-7fa10294b93e6513dcd207034a6016133b3909fc_4793d368.mp3";
const hemA = "audio/-8c319c5d1bed65c470ee702abbe35eeb672e3939_94e7668b.mp3";
const henA = "audio/-0d47678f715a386f5c3918f120722a05a6877d52_9b60008d.mp3";
const koneA = "audio/-5c67e48f017feccc2bec59e3d72fac75a051e3fe_7aaa03b3.mp3";
const konaA = "audio/-f1f7e71f1b158e9f8cf4b160b36d0cf94f0f5117_89b66d1d.mp3";
const konimA = "audio/-e9e0a9a861e613a3a88bcbd66696196eef7612f0_0b711c7e.mp3";
const konotA = "audio/-7c95c74b9b922ac30e445fc04548b1eae8a39cef_8a29753d.mp3";
const holechA = "audio/-7088997ab2b2c9bcea9d23962a1e7df933cda162_c163a9d0.mp3";
const holechetA = "audio/-a24f9f97dc0e3f3e08d61a5ed8fec04458df8d6d_5746c87c.mp3";
const holchimA = "audio/-b6fd63723cffcf7d6d3536cce6aa68923e11f6d2_d0dbaa16.mp3";
const holchotA = "audio/-e391526899fc530fe2eb181b7bc2fc366d79ff9b_31ad3aed.mp3";
const noseaA = "audio/-473ebf80b653ea4e4b9c907d675ed32e92e943eb_fe615c10.mp3";
const ozerA = "audio/-37c92ec148c33a6bd7df5f3302754924dd16f226_271fb972.mp3";
const ozeretA = "audio/-653f2525869940ad2574ce51ac2d60b0a6dcb7bb_ab577754.mp3";
const ozrimA = "audio/-b05d5163dc7d97efec2292d90e78d0bbc8cb9f2f_38fa3ac4.mp3";
const matanaA = "audio/-4259af82cea66dbceee7726233abdddeed2db3e5_8e965d40.mp3";
const kartisA = "audio/-6c32328352010467f6a65e7d55e2cc1206d2cd4a_75bdcb0e.mp3";
const kovaA = "audio/-09cb9e36569738b69df27105945d85adb03068b7_dd4197b0.mp3";
const parkA = "audio/-7f55103145ef374c040ebcd9a5d71cbd1d2eac18_41d5e6b7.mp3";
const avodaA = "audio/-5fc6b107f441e1b6af114691e39e94d1f67a9f6f_2c14c446.mp3";
const yamA = "audio/-0dbc32ddc05e9933a4c2b4362d6eb6d4d39d1de8_b9f069cb.mp3";
const irA = "audio/-b0906ab608b66021d5fa923a42f6cb1663da8fae_8e988834.mp3";
const otobusA = "audio/-abcc9b029bbb004b3dbd34c8c1b614005a59ffad_3cc23a11.mp3";
const mechonitA = "audio/-f204f8b66aed57e60e1ffef1fbf75e0bce0b7b42_5b920135.mp3";
const yeledA = "audio/-747fd4ee1a433f1d3986f5e04adfe8947e2ec6c8_5c6a1db6.mp3";
const yaldaA = "audio/-0b0c6ed68ee0e33ba1f85be49e49d11c36199b15_142cad92.mp3";
const morehA = "audio/-0f8efb6d86ddfe0c81b7b6f72e33e3f2c724be82_c38ae923.mp3";
const layeledA = "audio/-de05194ee84515ccbe09157d71f314d17c5a775b_e05c68fb.mp3";
const koreA = "audio/-e210f35fe851ae822d4253e44a3716a1b2a54f8b_8f1ee893.mp3";
const kotevA = "audio/-c64575fa7c49bfa9bd17f35c4af2a84f3004cf23_fe6ee44c.mp3";

const hu = w("הוא", "he", "il", "él", huA);
const hi = w("היא", "she", "elle", "ella", hiA);
const hem = w("הם", "they", "ils", "ellos", hemA);
const hen = w("הן", "they", "elles", "ellas", henA);
const et = w("את", "et", "et", "et");
const kone = w("קונה", "buys", "achète", "compra", koneA);
const kona = w("קונה", "buys", "achète", "compra", konaA);
const konim = w("קונים", "buy", "achètent", "compran", konimA);
const konot = w("קונות", "buy", "achètent", "compran", konotA);
const holech = w("הולך", "walks", "marche", "camina", holechA);
const holechet = w("הולכת", "walks", "marche", "camina", holechetA);
const holchim = w("הולכים", "walk", "marchent", "caminan", holchimA);
const holchot = w("הולכות", "walk", "marchent", "caminan", holchotA);
const nosea = w("נוסע", "travels", "voyage", "viaja", noseaA);
const nosaat = w("נוסעת", "travels", "voyage", "viaja");
const nosim = w("נוסעים", "travel", "voyagent", "viajan");
const nosaot = w("נוסעות", "travel", "voyagent", "viajan");
const ozer = w("עוזר", "helps", "aide", "ayuda", ozerA);
const ozeret = w("עוזרת", "helps", "aide", "ayuda", ozeretA);
const ozrim = w("עוזרים", "help", "aident", "ayudan", ozrimA);
const ozrot = w("עוזרות", "help", "aident", "ayudan");
const kore = w("קורא", "reads", "lit", "lee", koreA);
const kotev = w("כותב", "writes", "écrit", "escribe", kotevA);
const haMatana = w("המתנה", "the gift", "le cadeau", "el regalo");
const haKartis = w("הכרטיס", "the ticket", "le billet", "el billete");
const haKova = w("הכובע", "the hat", "le chapeau", "el sombrero");
const lePark = w("לפארק", "to the park", "au parc", "al parque");
const laAvoda = w("לעבודה", "to work", "au travail", "al trabajo");
const laYam = w("לים", "to the sea", "à la mer", "al mar");
const laIr = w("לעיר", "to the city", "à la ville", "a la ciudad");
const laYeled = w("לילד", "to the boy", "au garçon", "al niño", layeledA);
const laYalda = w("לילדה", "to the girl", "à la fille", "a la niña");
const laMoreh = w("למורה", "to the teacher", "au professeur", "al profesor");
const iton = w("עיתון", "newspaper", "journal", "periódico");
const mikhtav = w("מכתב", "letter", "lettre", "carta");

const buyForms = forms(
  "buy",
  ["קוֹנֶה", "קוֹנָה", "קוֹנִים", "קוֹנוֹת"],
  [koneA, konaA, konimA, konotA],
  ["הוא קונה מתנה", "היא קונה כרטיס", "הם קונים כובע", "הן קונות מתנה"],
);
const walkForms = forms(
  "walk",
  ["הוֹלֵךְ", "הוֹלֶכֶת", "הוֹלְכִים", "הוֹלְכוֹת"],
  [holechA, holechetA, holchimA, holchotA],
  ["הוא הולך לפארק", "היא הולכת לעבודה", "הם הולכים לים", "הן הולכות לפארק"],
);
const travelForms = forms(
  "travel",
  ["נוֹסֵעַ", "נוֹסַעַת", "נוֹסְעִים", "נוֹסְעוֹת"],
  [noseaA, undefined, undefined, undefined],
  ["הוא נוסע לעיר", "היא נוסעת לעיר", "הם נוסעים לים", "הן נוסעות לפארק"],
);
const helpForms = forms(
  "help",
  ["עוֹזֵר", "עוֹזֶרֶת", "עוֹזְרִים", "עוֹזְרוֹת"],
  [ozerA, ozeretA, ozrimA, undefined],
  ["הוא עוזר לילד", "היא עוזרת לילדה", "הם עוזרים למורה", "הן עוזרות לילד"],
);

function teach(
  level: number,
  title: LocaleGloss,
  about: LocaleGloss,
  knownWords: readonly BasicWord[],
  steps: readonly LevelStep[],
): CurriculumLevelDef {
  return { level, title, about, knownWords, steps };
}

function slide(id: string, title: readonly TitlePiece[], body: LocaleGloss, cards?: readonly HearCard[]): LevelStep {
  return { id, title, body, cards };
}

function drill(id: string, rounds: readonly BuilderSentence[], exam = false): LevelStep {
  return { id, rounds, exam };
}

const buyPractice = [
  sentence("hu-kone-matana", g("He is buying the gift", "Il achète le cadeau", "Él compra el regalo"), [hu, kone, et, haMatana]),
  sentence("hi-kona-kartis", g("She is buying the ticket", "Elle achète le billet", "Ella compra el billete"), [hi, kona, et, haKartis]),
  sentence("hem-konim-kova", g("They are buying the hat", "Ils achètent le chapeau", "Ellos compran el sombrero"), [hem, konim, et, haKova]),
  sentence("hen-konot-matana", g("They are buying the gift", "Elles achètent le cadeau", "Ellas compran el regalo"), [hen, konot, et, haMatana]),
];

const walkPractice = [
  sentence("hu-holech-park", g("He is walking to the park", "Il marche au parc", "Él camina al parque"), [hu, holech, lePark]),
  sentence("hi-holechet-avoda", g("She is walking to work", "Elle marche au travail", "Ella camina al trabajo"), [hi, holechet, laAvoda]),
  sentence("hem-holchim-yam", g("They are walking to the sea", "Ils marchent à la mer", "Ellos caminan al mar"), [hem, holchim, laYam]),
  sentence("hen-holchot-park", g("They are walking to the park", "Elles marchent au parc", "Ellas caminan al parque"), [hen, holchot, lePark]),
];

const travelPractice = [
  sentence("hu-nosea-ir", g("He is traveling to the city", "Il voyage à la ville", "Él viaja a la ciudad"), [hu, nosea, laIr]),
  sentence("hi-nosaat-ir", g("She is traveling to the city", "Elle voyage à la ville", "Ella viaja a la ciudad"), [hi, nosaat, laIr]),
  sentence("hem-nosim-yam", g("They are traveling to the sea", "Ils voyagent à la mer", "Ellos viajan al mar"), [hem, nosim, laYam]),
  sentence("hen-nosaot-park", g("They are traveling to the park", "Elles voyagent au parc", "Ellas viajan al parque"), [hen, nosaot, lePark]),
];

const helpPractice = [
  sentence("hu-ozer-yeled", g("He is helping the boy", "Il aide le garçon", "Él ayuda al niño"), [hu, ozer, laYeled]),
  sentence("hi-ozeret-yalda", g("She is helping the girl", "Elle aide la fille", "Ella ayuda a la niña"), [hi, ozeret, laYalda]),
  sentence("hem-ozrim-moreh", g("They are helping the teacher", "Ils aident le professeur", "Ellos ayudan al profesor"), [hem, ozrim, laMoreh]),
  sentence("hen-ozrot-yeled", g("They are helping the boy", "Elles aident le garçon", "Ellas ayudan al niño"), [hen, ozrot, laYeled]),
];

const earlyPool = [holech, lePark, kone, haKova, nosea, laYam, ozer, laYeled, kore, iton, kotev, mikhtav];

function examRounds(rounds: readonly BuilderSentence[], pool: readonly ReturnType<typeof w>[]) {
  return rounds.map((round) => {
    const used = new Set(round.words.map((part) => part.hebrew));
    const extras = pool.filter((part) => !used.has(part.hebrew)).slice(0, 2);
    return withExtras(round, extras);
  });
}

const examTitle = g("Exam", "Examen", "Examen");
const examAbout = g(
  "Three lives, no hint, and extra words that do not belong.",
  "Trois vies, pas d'indice, et des mots en trop.",
  "Tres vidas, sin pista, y palabras que no hacen falta.",
);
const examBody = g(
  "Build each sentence. A wrong answer costs one life. Some words are not part of the sentence.",
  "Construisez chaque phrase. Une erreur coûte une vie. Certains mots ne font pas partie de la phrase.",
  "Arma cada frase. Un error cuesta una vida. Algunas palabras no forman parte de la frase.",
);

export const curriculumLevels: readonly CurriculumLevelDef[] = [
  teach(
    17,
    g("Buying", "Acheter", "Comprar"),
    g("The את verb קונה, with a gift, a ticket, and a hat.", "Le verbe את קונה, avec un cadeau, un billet et un chapeau.", "El verbo את קונה, con un regalo, un billete y un sombrero."),
    [
      entry("w-liknot", "לִקְנוֹת", "to buy", "liknot", verb, null),
      entry("w-kone", "קוֹנֶה", "he buys", "kone", verb, m),
      entry("w-kona", "קוֹנָה", "she buys", "kona", verb, f),
      entry("w-konim", "קוֹנִים", "they buy", "konim", verb, m),
      entry("w-konot", "קוֹנוֹת", "they buy", "konot", verb, f),
      entry("w-matana", "מתנה", "gift", "matana", noun, f),
      entry("w-kartis", "כרטיס", "ticket", "kartis", noun, m),
      entry("w-kova", "כובע", "hat", "kova", noun, m),
    ],
    [
      slide("17.1", [g("To buy: ", "Acheter : ", "Comprar: "), { he: "לקנות" }], g("קונה takes את, like אוכל. Hear the four present forms.", "קונה prend את, comme אוכל. Écoutez les quatre formes au présent.", "קונה lleva את, como אוכל. Escucha las cuatro formas en presente."), buyForms),
      slide("17.2", [g("New words: ", "Mots nouveaux : ", "Palabras nuevas: "), { he: "מתנה" }, g(", ", ", ", ", "), { he: "כרטיס" }, g(", and ", " et ", " y "), { he: "כובע" }], g("Hear each noun, then buy them in a sentence.", "Écoutez chaque nom, puis achetez-les dans une phrase.", "Escucha cada sustantivo y luego cómpralos en una frase."), [
        nounCard("matana", "מַתָּנָה", g("gift, feminine", "cadeau, féminin", "regalo, femenino"), matanaA),
        nounCard("kartis", "כַּרְטִיס", g("ticket, masculine", "billet, masculin", "billete, masculino"), kartisA),
        nounCard("kova", "כּוֹבַע", g("hat, masculine", "chapeau, masculin", "sombrero, masculino"), kovaA),
      ]),
      drill("17.3", buyPractice),
    ],
  ),
  teach(
    18,
    g("Walking", "Marcher", "Caminar"),
    g("The ל verb הולך, with the park, work, and the sea.", "Le verbe ל הולך, avec le parc, le travail et la mer.", "El verbo ל הולך, con el parque, el trabajo y el mar."),
    [
      entry("w-lalechet", "לָלֶכֶת", "to walk", "lalechet", verb, null),
      entry("w-holech", "הוֹלֵךְ", "he walks", "holech", verb, m),
      entry("w-holechet", "הוֹלֶכֶת", "she walks", "holechet", verb, f),
      entry("w-holchim", "הוֹלְכִים", "they walk", "holchim", verb, m),
      entry("w-holchot", "הוֹלְכוֹת", "they walk", "holchot", verb, f),
      entry("w-park", "פארק", "park", "park", noun, m),
      entry("w-avoda", "עבודה", "work", "avoda", noun, f),
      entry("w-yam", "ים", "sea", "yam", noun, m),
    ],
    [
      slide("18.1", [g("To walk: ", "Marcher : ", "Caminar: "), { he: "ללכת" }], g("הולך takes ל, not את. ל joins the place: לפארק, לעבודה, לים.", "הולך prend ל, pas את. ל se colle au lieu : לפארק, לעבודה, לים.", "הולך lleva ל, no את. ל se une al lugar: לפארק, לעבודה, לים."), walkForms),
      slide("18.2", [g("New words: ", "Mots nouveaux : ", "Palabras nuevas: "), { he: "פארק" }, g(", ", ", ", ", "), { he: "עבודה" }, g(", and ", " et ", " y "), { he: "ים" }], g("Hear the places, then walk to them.", "Écoutez les lieux, puis marchez-y.", "Escucha los lugares y luego camina hacia ellos."), [
        nounCard("park", "פַּארְק", g("park, masculine", "parc, masculin", "parque, masculino"), parkA),
        nounCard("avoda", "עֲבוֹדָה", g("work, feminine", "travail, féminin", "trabajo, femenino"), avodaA),
        nounCard("yam", "יָם", g("sea, masculine", "mer, masculin", "mar, masculino"), yamA),
      ]),
      drill("18.3", walkPractice),
    ],
  ),
  teach(
    19,
    g("Traveling", "Voyager", "Viajar"),
    g("The ל verb נוסע, with the city, the bus, and the car.", "Le verbe ל נוסע, avec la ville, le bus et la voiture.", "El verbo ל נוסע, con la ciudad, el autobús y el coche."),
    [
      entry("w-linsoa", "לִנְסוֹעַ", "to travel", "linsoa", verb, null),
      entry("w-nosea", "נוֹסֵעַ", "he travels", "nosea", verb, m),
      entry("w-nosaat", "נוֹסַעַת", "she travels", "nosaat", verb, f),
      entry("w-nosim", "נוֹסְעִים", "they travel", "nosim", verb, m),
      entry("w-nosaot", "נוֹסְעוֹת", "they travel", "nosaot", verb, f),
      entry("w-ir", "עיר", "city", "ir", noun, f),
      entry("w-otobus", "אוטובוס", "bus", "otobus", noun, m),
      entry("w-mechonit", "מכונית", "car", "mechonit", noun, f),
    ],
    [
      slide("19.1", [g("To travel: ", "Voyager : ", "Viajar: "), { he: "לנסוע" }], g("נוסע also takes ל. The place still joins to ל.", "נוסע prend aussi ל. Le lieu se colle encore à ל.", "נוסע también lleva ל. El lugar sigue unido a ל."), travelForms),
      slide("19.2", [g("New words: ", "Mots nouveaux : ", "Palabras nuevas: "), { he: "עיר" }, g(", ", ", ", ", "), { he: "אוטובוס" }, g(", and ", " et ", " y "), { he: "מכונית" }], g("Hear the city, the bus, and the car.", "Écoutez la ville, le bus et la voiture.", "Escucha la ciudad, el autobús y el coche."), [
        nounCard("ir", "עִיר", g("city, feminine", "ville, féminin", "ciudad, femenino"), irA),
        nounCard("otobus", "אוֹטוֹבּוּס", g("bus, masculine", "bus, masculin", "autobús, masculino"), otobusA),
        nounCard("mechonit", "מְכוֹנִית", g("car, feminine", "voiture, féminin", "coche, femenino"), mechonitA),
      ]),
      drill("19.3", travelPractice),
    ],
  ),
  teach(
    20,
    g("Helping", "Aider", "Ayudar"),
    g("The ל verb עוזר, with a boy, a girl, and a teacher.", "Le verbe ל עוזר, avec un garçon, une fille et un professeur.", "El verbo ל עוזר, con un niño, una niña y un profesor."),
    [
      entry("w-laazor", "לַעֲזֹר", "to help", "laazor", verb, null),
      entry("w-ozer", "עוֹזֵר", "he helps", "ozer", verb, m),
      entry("w-ozeret", "עוֹזֶרֶת", "she helps", "ozeret", verb, f),
      entry("w-ozrim", "עוֹזְרִים", "they help", "ozrim", verb, m),
      entry("w-ozrot", "עוֹזְרוֹת", "they help", "ozrot", verb, f),
      entry("w-yeled", "ילד", "boy", "yeled", noun, m),
      entry("w-yalda", "ילדה", "girl", "yalda", noun, f),
      entry("w-moreh", "מורה", "teacher", "moreh", noun, m),
    ],
    [
      slide("20.1", [g("To help: ", "Aider : ", "Ayudar: "), { he: "לעזור" }], g("עוזר takes ל before the person: לילד, לילדה, למורה.", "עוזר prend ל devant la personne : לילד, לילדה, למורה.", "עוזר lleva ל antes de la persona: לילד, לילדה, למורה."), helpForms),
      slide("20.2", [g("New words: ", "Mots nouveaux : ", "Palabras nuevas: "), { he: "ילד" }, g(", ", ", ", ", "), { he: "ילדה" }, g(", and ", " et ", " y "), { he: "מורה" }], g("Hear the people, then help them.", "Écoutez les personnes, puis aidez-les.", "Escucha a las personas y luego ayúdalas."), [
        nounCard("yeled", "יֶלֶד", g("boy, masculine", "garçon, masculin", "niño, masculino"), yeledA),
        nounCard("yalda", "יַלְדָּה", g("girl, feminine", "fille, féminin", "niña, femenino"), yaldaA),
        nounCard("moreh", "מוֹרֶה", g("teacher, masculine", "professeur, masculin", "profesor, masculino"), morehA),
      ]),
      drill("20.3", helpPractice),
    ],
  ),
  teach(21, examTitle, examAbout, [], [
    slide("21.1", [examTitle], examBody),
    drill("21.2", examRounds([...buyPractice, ...walkPractice.slice(0, 2)], earlyPool), true),
  ]),
  ...connectorLevels,
];

export const laterKnownWords: readonly BasicWord[] = curriculumLevels.flatMap((level) => level.knownWords);
