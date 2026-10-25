import type { BasicWord } from "@/lib/learn/basic-words";
import type { GrammaticalGender, PartOfSpeech } from "@/lib/flashcards/types";
import {
  sentence,
  withExtras,
  word,
  type BuilderSentence,
  type HearCard,
  type LocaleGloss,
} from "@/lib/learn/sentences";
import type { CurriculumLevelDef, LevelStep, TitlePiece } from "@/lib/learn/later-levels";

const g = (en: string, fr: string, es: string): LocaleGloss => ({ en, fr, es });
const w = word;
const verb = "verb" as const;
const noun = "noun" as const;
const adjective = "adjective" as const;
const adverb = "adverb" as const;
const conjunction = "conjunction" as const;
const preposition = "preposition" as const;
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

function card(id: string, hebrew: string, en: string, fr: string, es: string, audio?: string): HearCard {
  return { id, hebrew, caption: g(en, fr, es), audio };
}

function line(id: string, en: string, fr: string, es: string, parts: Parameters<typeof sentence>[2]): BuilderSentence {
  return sentence(id, g(en, fr, es), parts);
}

function pieces(label: LocaleGloss, words: readonly string[]): TitlePiece[] {
  const title: TitlePiece[] = [label];
  words.forEach((word, index) => {
    if (index > 0) {
      title.push(g(", ", ", ", ", "));
    }
    title.push({ he: word });
  });
  return title;
}

function teach(
  level: number,
  title: LocaleGloss,
  about: LocaleGloss,
  knownWords: readonly BasicWord[],
  steps: readonly LevelStep[],
): CurriculumLevelDef {
  return { level, title, about, knownWords, steps };
}

const avalA = "audio/-85e22e7f9a82f26bcd5bcbe90ec761dd16a6b65a_539367e9.mp3";
const oA = "audio/-b475bfb8927f93e074b712aa7fdbe0ea2babe054_d9cadba3.mp3";
const kiA = "audio/-ae23e128f69050751bcfebf1217af148639f07e3_afc023ce.mp3";
const azA = "audio/-cbe8c819249de7be5b6b2487d6e820620de29a74_2b5dfce6.mp3";
const gamA = "audio/-0ae2f2b051990c4e07fc66b34e8f02033d90a5c8_691ff08e.mp3";
const rakA = "audio/-17bbb97ed96fdfc3831f2f0f5a3d785baebd0315_e0e0eae1.mp3";
const elaA = "audio/-4b752c0d8e9a46f40a47a3eda39782dc67078d65_425f9c1c.mp3";
const lifneiA = "audio/-fed94673c63f4c4ad9affca839d614374c3c60ac_c3d5b676.mp3";
const achareiA = "audio/-f6d63f9db8b7f8fb2fb5a497bec4170e75a8e42b_40975733.mp3";
const adA = "audio/-880eb4bb2a436333e10442154fca003a5a11b351_4848a470.mp3";
const meazA = "audio/-7e547f7ca23c618fad64d683c376b320b0e4b6b2_d30657da.mp3";
const beintayimA = "audio/-93a2345cd7d9dae4e8dba1edc188b47e7c2fa2b7_30103efa.mp3";
const bimiyuchadA = "audio/-d7fa41bc556058ae0719c0fd3b6362bf49942989_ee8e4e1e.mp3";
const lamrotA = "audio/-22444878476059474d58ae1d777be60e84f2932e_fd1b92c5.mp3";
const imA = "audio/-7d441bebf8b99933648d117e205f5d5a465668d0_fc0b8a5d.mp3";
const afiluA = "audio/-1a0744883f4829d9c4ef188636a23d7846bd538e_6b4065ec.mp3";
const biglalA = "audio/-bf24a5148c4e058bc77d1e5a570a8ff4a8c59585_3556ce20.mp3";
const etmolA = "audio/-916ac5a7665b425c2e8a5867f6b02d27b7a5be82_ebcba4df.mp3";
const macharA = "audio/-ce57c82ff3671988f6d7d10e40de1103c77f0615_16c1f330.mp3";
const karaA = "audio/-dda29feae4d07c3ffd2a91f25d5a171c4e2aa54b_10a422f0.mp3";
const katavA = "audio/-7508e91b7f4f7b14f7463dc8e374a8e679cd09d3_93b6b920.mp3";
const katvaA = "audio/-5aa0c21a952a6fb370f915b9c4bb0774de3d4b8a_f8a6ae72.mp3";
const halachA = "audio/-edf945c7290f73c168244f6a514d9933b7140a57_ce6a80ac.mp3";
const halchuA = "audio/-46990aa00672833a4597080c35455b7de71025e8_f0ff3cbd.mp3";
const achalA = "audio/-39f2e3f99ee2dcde18b52175f6e7eee20ab135f1_1f9e771e.mp3";
const achlaA = "audio/-47f675683db5409bbac2b5f5e1298e85e77624f6_e7bc3bb0.mp3";
const yikraA = "audio/-22f3f6142b8c4a01d23cff6acb3d41cbffe19c4d_7c23b35c.mp3";
const yikreuA = "audio/-4837c160fc91617c2076fddd774179908afb5c27_162c922d.mp3";
const tikhtovA = "audio/-87cdc19fb03c188bfc43f6d259b45a3beea5788a_9dc3ca4d.mp3";
const yelechA = "audio/-3f7b7195a2a4b5dd31ff132a964804ea293f86f5_289000fc.mp3";
const yelchuA = "audio/-a4e614ffc9ab9d639e637723cbc707110bd88962_7b94a13a.mp3";
const yochalA = "audio/-c29908206a4e087b3fe51c6893b413a7a77c6a00_cacbae78.mp3";
const tishteA = "audio/-e394801bd0db6186db053b0f6df75c0d2bdfd327_231b7e84.mp3";
const kafeA = "audio/-1d1a2dca7079c9af226749af5479d370c930ea78_6007296a.mp3";
const chatulA = "audio/-ebefd49e16d0bef09f9469f7f9eaae18e671da97_a7bb05d6.mp3";
const kelevA = "audio/-20c574d270fff8cbbbb03871c421c89834e23d70_c2a6eaf8.mp3";
const telefonA = "audio/-8470db52d06726f8b633be069999b7643517e617_00419e5d.mp3";
const chanutA = "audio/-516cd2f4e786e1cc9345159962d673a1c88a57a0_710503e0.mp3";
const mishpachaA = "audio/-118f0827ae244ce072da6ae436aeb6bb363d7daf_861bf8a0.mp3";
const chalonA = "audio/-2b3cf9cffb13cd72fbdccf8adfd0b5fbfb031f9f_e7ff8683.mp3";
const kesefA = "audio/-4789019bdac7435269f67efceb284bf2093be1cb_5d166354.mp3";
const machshevA = "audio/-6bf2955f27d3aa9e63f3a6a0b77bd23c8e24a8c4_76138d85.mp3";
const rakevetA = "audio/-35d8f94bdc8514b44fb53cfb6e074e10f9475bb4_aefc9ceb.mp3";
const matosA = "audio/-d7cd743219328ecace1333ca62cbf58b9a045549_e962d577.mp3";
const chederA = "audio/-77df7148bffdcf13cd1e2ce79e312307bd8978af_69ab95aa.mp3";
const mitaA = "audio/-c0ce66577ebf88a9467fd972a8d0d62ebc78a5b8_04d6204f.mp3";
const tikA = "audio/-eb94ca1d04c17292a0adef60dfb5f351aa48c441_31898447.mp3";
const shaonA = "audio/-451a12725dc131204ae92fc38f153c7edf0e7150_c4b7aff5.mp3";
const geshemA = "audio/-3950afae77b48097cceeb75cf62b1bf38f492756_70516c51.mp3";
const shelegA = "audio/-382a70471734e10768af4d08aea63ef071a94748_41b4836a.mp3";
const ananA = "audio/-3203c015a9a322fcb30b412041ab7f7b9043593b_7a23b117.mp3";
const bokerA = "audio/-0ae0efe747142991e96d1615546f220b91688fdf_173479c8.mp3";
const ayefA = "audio/-f19ecdb356dae09c2ec8cf8023e8c4030b7fbff0_ab98414a.mp3";
const ayefaA = "audio/-152794360bc71d2738c8b397a807d4abdd109d0c_3cf1b9bd.mp3";
const loA = "audio/-63db1ffe3aba7fbe507142223b45589d8615a7c3_f8ea9404.mp3";
const koreA = "audio/-e210f35fe851ae822d4253e44a3716a1b2a54f8b_8f1ee893.mp3";
const kotevA = "audio/-c64575fa7c49bfa9bd17f35c4af2a84f3004cf23_fe6ee44c.mp3";
const holechA = "audio/-7088997ab2b2c9bcea9d23962a1e7df933cda162_c163a9d0.mp3";
const holechetA = "audio/-a24f9f97dc0e3f3e08d61a5ed8fec04458df8d6d_5746c87c.mp3";
const ohevA = "audio/-5fcd6ba6450a1f2b3ca66848e772724d93f58cd2_daf79d27.mp3";
const ohevetA = "audio/-3b54f91c728ceeecb4beacdf391a85ed8dc88359_ab94b5ad.mp3";
const koneA = "audio/-5c67e48f017feccc2bec59e3d72fac75a051e3fe_7aaa03b3.mp3";
const konaA = "audio/-f1f7e71f1b158e9f8cf4b160b36d0cf94f0f5117_89b66d1d.mp3";

const hu = w("הוא", "he", "il", "él");
const hi = w("היא", "she", "elle", "ella");
const hem = w("הם", "they", "ils", "ellos");
const hen = w("הן", "they", "elles", "ellas");
const et = w("את", "et", "et", "et");
const kore = w("קורא", "reads", "lit", "lee", koreA);
const kotev = w("כותב", "writes", "écrit", "escribe", kotevA);
const kotevet = w("כותבת", "writes", "écrit", "escribe");
const holech = w("הולך", "walks", "marche", "camina", holechA);
const holechet = w("הולכת", "walks", "marche", "camina", holechetA);
const ohev = w("אוהב", "likes", "aime", "ama", ohevA);
const ohevet = w("אוהבת", "likes", "aime", "ama", ohevetA);
const kone = w("קונה", "buys", "achète", "compra", koneA);
const kona = w("קונה", "buys", "achète", "compra", konaA);
const ayef = w("עייף", "tired", "fatigué", "cansado", ayefA);
const ayefa = w("עייפה", "tired", "fatiguée", "cansada", ayefaA);
const iton = w("עיתון", "newspaper", "journal", "periódico");
const mikhtav = w("מכתב", "letter", "lettre", "carta");
const lePark = w("לפארק", "to the park", "au parc", "al parque");
const laAvoda = w("לעבודה", "to work", "au travail", "al trabajo");
const ve = w("ו", "and", "et", "y");
const vehi = w("והיא", "and she", "et elle", "y ella");
const vehu = w("והוא", "and he", "et il", "y él");
const vegam = w("וגם", "and also", "et aussi", "y también");
const aval = w("אבל", "but", "mais", "pero", avalA);
const o = w("או", "or", "ou", "o", oA);
const ki = w("כי", "because", "parce que", "porque", kiA);
const az = w("אז", "so", "alors", "entonces", azA);
const gam = w("גם", "also", "aussi", "también", gamA);
const rak = w("רק", "only", "seulement", "solo", rakA);
const ela = w("אלא", "but rather", "mais plutôt", "sino", elaA);
const lakhen = w("לכן", "therefore", "donc", "por lo tanto");
const beetsem = w("בעצם", "actually", "en fait", "en realidad");
const kshehu = w("כשהוא", "when he", "quand il", "cuando él");
const lifneiShehu = w("לפני שהוא", "before he", "avant qu'il", "antes de que él");
const achareiShehi = w("אחרי שהיא", "after she", "après qu'elle", "después de que ella");
const bizmanShehu = w("בזמן שהוא", "while he", "pendant qu'il", "mientras él");
const adShehu = w("עד שהוא", "until he", "jusqu'à ce qu'il", "hasta que él");
const meazShehu = w("מאז שהוא", "since he", "depuis qu'il", "desde que él");
const veaz = w("ואז", "and then", "et ensuite", "y entonces");
const kodem = w("קודם כול", "first of all", "tout d'abord", "antes que nada");
const basof = w("בסוף", "in the end", "à la fin", "al final");
const beintayim = w("בינתיים", "meanwhile", "pendant ce temps", "mientras tanto", beintayimA);
const lemashal = w("למשל", "for example", "par exemple", "por ejemplo");
const klomar = w("כלומר", "that is", "c'est-à-dire", "es decir");
const zotOmeret = w("זאת אומרת", "that means", "ça veut dire", "eso quiere decir");
const bimiyuchad = w("במיוחד", "especially", "surtout", "especialmente", bimiyuchadA);
const benosaf = w("בנוסף", "in addition", "en plus", "además");
const chutz = w("חוץ מ", "apart from", "à part", "aparte de");
const lo = w("לא", "not", "ne... pas", "no", loA);
const lamrot = w("למרות ש", "even though", "même si", "aunque", lamrotA);
const lamrotZot = w("למרות זאת", "nevertheless", "néanmoins", "sin embargo");
const mitzad = w("מצד אחד", "on one hand", "d'un côté", "por un lado");
const mitzadSheni = w("מצד שני", "on the other hand", "de l'autre", "por otro lado");
const im = w("אם", "if", "si", "si", imA);
const acheret = w("אחרת", "otherwise", "sinon", "si no");
const afilu = w("אפילו", "even", "même", "incluso", afiluA);
const biglalShehu = w("בגלל שהוא", "because he", "parce qu'il", "porque él");
const biglalZe = w("בגלל זה", "because of that", "à cause de ça", "por eso");
const ketotsaa = w("כתוצאה מכך", "as a result", "en conséquence", "como resultado");
const bimkomShehu = w("במקום שהוא", "instead of him", "au lieu qu'il", "en lugar de que él");
const kedeiShehi = w("כדי שהיא", "so that she", "pour qu'elle", "para que ella");
const kafe = w("קפה", "coffee", "café", "café", kafeA);
const chatul = w("חתול", "cat", "chat", "gato", chatulA);
const kelev = w("כלב", "dog", "chien", "perro", kelevA);
const telefon = w("טלפון", "phone", "téléphone", "teléfono", telefonA);
const laChanut = w("לחנות", "to the shop", "au magasin", "a la tienda");
const haMishpacha = w("המשפחה", "the family", "la famille", "la familia");
const chalon = w("חלון", "window", "fenêtre", "ventana", chalonA);
const kesef = w("כסף", "money", "argent", "dinero", kesefA);
const machshev = w("מחשב", "computer", "ordinateur", "ordenador", machshevA);
const haRakevet = w("הרכבת", "the train", "le train", "el tren");
const haMatos = w("המטוס", "the plane", "l'avion", "el avión");
const haCheder = w("החדר", "the room", "la chambre", "la habitación");
const laMita = w("למיטה", "to bed", "au lit", "a la cama");
const tik = w("תיק", "bag", "sac", "bolso", tikA);
const shaon = w("שעון", "watch", "montre", "reloj", shaonA);
const geshem = w("גשם", "rain", "pluie", "lluvia", geshemA);
const sheleg = w("שלג", "snow", "neige", "nieve", shelegA);
const anan = w("ענן", "cloud", "nuage", "nube", ananA);
const etmol = w("אתמול", "yesterday", "hier", "ayer", etmolA);
const machar = w("מחר", "tomorrow", "demain", "mañana", macharA);
const baboker = w("בבוקר", "in the morning", "le matin", "por la mañana", bokerA);
const kara = w("קרא", "read", "a lu", "leyó", karaA);
const katva = w("כתבה", "wrote", "a écrit", "escribió", katvaA);
const halach = w("הלך", "walked", "a marché", "caminó", halachA);
const halchu = w("הלכו", "walked", "ont marché", "caminaron", halchuA);
const achal = w("אכל", "ate", "a mangé", "comió", achalA);
const achla = w("אכלה", "ate", "a mangé", "comió", achlaA);
const yikra = w("יקרא", "will read", "lira", "leerá", yikraA);
const yikreu = w("יקראו", "will read", "liront", "leerán", yikreuA);
const tikhtov = w("תכתוב", "will write", "écrira", "escribirá", tikhtovA);
const yelech = w("ילך", "will walk", "ira", "irá", yelechA);
const yelchu = w("ילכו", "will walk", "iront", "irán", yelchuA);
const yochal = w("יאכל", "will eat", "mangera", "comerá", yochalA);
const tishte = w("תשתה", "will drink", "boira", "beberá", tishteA);

const newWords = g("New words: ", "Mots nouveaux : ", "Palabras nuevas: ");

function wordsLevel(
  level: number,
  title: LocaleGloss,
  about: LocaleGloss,
  body: LocaleGloss,
  marks: readonly string[],
  cards: readonly HearCard[],
  knownWords: readonly BasicWord[],
  rounds: readonly BuilderSentence[],
): CurriculumLevelDef {
  return teach(level, title, about, knownWords, [
    { id: `${level}.1`, title: pieces(newWords, marks), body, cards },
    { id: `${level}.2`, rounds },
  ]);
}

const level22 = [
  line("22-coffee-and", "He buys coffee and she reads a newspaper", "Il achète un café et elle lit un journal", "Él compra un café y ella lee un periódico", [hu, kone, kafe, vehi, kore, iton]),
  line("22-park-but", "He walks to the park, but she walks to work", "Il marche au parc, mais elle marche au travail", "Él camina al parque, pero ella camina al trabajo", [hu, holech, lePark, aval, hi, holechet, laAvoda]),
  line("22-coffee-or", "He buys coffee, or she buys coffee", "Il achète un café, ou elle achète un café", "Él compra un café, o ella compra un café", [hu, kone, kafe, o, hi, kona, kafe]),
  line("22-and-read", "He buys coffee, and he reads a newspaper", "Il achète un café, et il lit un journal", "Él compra un café, y él lee un periódico", [hu, kone, kafe, vehu, kore, iton]),
];

const level23 = [
  line("23-because", "He buys coffee because he is tired", "Il achète un café parce qu'il est fatigué", "Él compra un café porque está cansado", [hu, kone, kafe, ki, hu, ayef]),
  line("23-so", "She is tired, so she reads a newspaper", "Elle est fatiguée, alors elle lit un journal", "Ella está cansada, entonces lee un periódico", [hi, ayefa, az, hi, kore, iton]),
  line("23-also", "He also buys coffee", "Il achète aussi un café", "Él también compra un café", [hu, gam, kone, kafe]),
  line("23-cat", "She likes a cat because she is tired", "Elle aime un chat parce qu'elle est fatiguée", "Ella ama un gato porque está cansada", [hi, ohevet, chatul, ki, hi, ayefa]),
];

const level24 = [
  line("24-only", "He only buys coffee", "Il achète seulement un café", "Él solo compra un café", [hu, kone, rak, kafe]),
  line("24-rather", "He does not like a cat, but rather a dog", "Il n'aime pas un chat, mais plutôt un chien", "Él no ama un gato, sino un perro", [hu, lo, ohev, chatul, ela, kelev]),
  line("24-therefore", "He is tired, therefore he reads", "Il est fatigué, donc il lit", "Él está cansado, por lo tanto lee", [hu, ayef, lakhen, hu, kore, iton]),
  line("24-dog", "She likes only a dog", "Elle aime seulement un chien", "Ella solo ama un perro", [hi, ohevet, rak, kelev]),
];

const level25 = [
  line("25-actually", "He is actually tired", "Il est en fait fatigué", "Él en realidad está cansado", [hu, beetsem, ayef]),
  line("25-when", "When he is tired, he reads a newspaper", "Quand il est fatigué, il lit un journal", "Cuando él está cansado, lee un periódico", [kshehu, ayef, hu, kore, iton]),
  line("25-before", "Before he walks to work, he buys coffee", "Avant d'aller au travail, il achète un café", "Antes de ir al trabajo, él compra un café", [lifneiShehu, holech, laAvoda, hu, kone, kafe]),
  line("25-phone", "She likes a phone when he is tired", "Elle aime un téléphone quand il est fatigué", "Ella ama un teléfono cuando él está cansado", [hi, ohevet, telefon, kshehu, ayef]),
];

const level26 = [
  line("26-after", "After she buys coffee, he walks to the shop", "Après qu'elle achète un café, il marche au magasin", "Después de que ella compra un café, él camina a la tienda", [achareiShehi, kona, kafe, hu, holech, laChanut]),
  line("26-while", "While he reads, she writes a letter", "Pendant qu'il lit, elle écrit une lettre", "Mientras él lee, ella escribe una carta", [bizmanShehu, kore, hi, kotevet, mikhtav]),
  line("26-until", "He walks to the park until he is tired", "Il marche au parc jusqu'à ce qu'il soit fatigué", "Él camina al parque hasta que está cansado", [hu, holech, lePark, adShehu, ayef]),
  line("26-shop", "She walks to the shop, and he buys coffee", "Elle marche au magasin, et il achète un café", "Ella camina a la tienda, y él compra un café", [hi, holechet, laChanut, vehu, kone, kafe]),
];

const level27 = [
  line("27-since", "Since he is tired, he reads a newspaper", "Depuis qu'il est fatigué, il lit un journal", "Desde que él está cansado, lee un periódico", [meazShehu, ayef, hu, kore, iton]),
  line("27-then", "He buys coffee, and then he walks to the park", "Il achète un café, et ensuite il marche au parc", "Él compra un café, y entonces camina al parque", [hu, kone, kafe, veaz, hu, holech, lePark]),
  line("27-first", "First of all, he likes the family", "Tout d'abord, il aime la famille", "Antes que nada, él ama a la familia", [kodem, hu, ohev, et, haMishpacha]),
  line("27-family", "She writes a letter, and then the family walks", "Elle écrit une lettre, et ensuite la famille marche", "Ella escribe una carta, y entonces la familia camina", [hi, kotevet, mikhtav, veaz, hu, holech, lePark]),
];

const level28 = [
  line("28-end", "In the end he walks to the park", "À la fin il marche au parc", "Al final él camina al parque", [basof, hu, holech, lePark]),
  line("28-meanwhile", "Meanwhile she reads a newspaper", "Pendant ce temps elle lit un journal", "Mientras tanto ella lee un periódico", [beintayim, hi, kore, iton]),
  line("28-example", "He likes coffee, for example", "Il aime le café, par exemple", "Él ama el café, por ejemplo", [hu, ohev, kafe, lemashal]),
  line("28-window", "She likes a window, for example", "Elle aime une fenêtre, par exemple", "Ella ama una ventana, por ejemplo", [hi, ohevet, chalon, lemashal]),
];

const level30 = [
  line("30-read", "He read a newspaper yesterday", "Il a lu un journal hier", "Él leyó un periódico ayer", [hu, kara, iton, etmol]),
  line("30-wrote", "She wrote a letter yesterday", "Elle a écrit une lettre hier", "Ella escribió una carta ayer", [hi, katva, mikhtav, etmol]),
  line("30-that-is", "He walked to the park, that is, he is tired", "Il a marché au parc, c'est-à-dire qu'il est fatigué", "Él caminó al parque, es decir, está cansado", [hu, halach, lePark, klomar, hu, ayef]),
  line("30-means", "She ate yesterday, that means she is tired", "Elle a mangé hier, ça veut dire qu'elle est fatiguée", "Ella comió ayer, eso quiere decir que está cansada", [hi, achla, etmol, zotOmeret, hi, ayefa]),
];

const level31 = [
  line("31-especially", "He likes money especially", "Il aime l'argent surtout", "Él ama el dinero especialmente", [hu, ohev, kesef, bimiyuchad]),
  line("31-addition", "In addition, he ate yesterday", "En plus, il a mangé hier", "Además, él comió ayer", [benosaf, hu, achal, etmol]),
  line("31-apart", "Apart from coffee, he reads a newspaper", "À part le café, il lit un journal", "Aparte del café, él lee un periódico", [chutz, kafe, hu, kore, iton]),
  line("31-money", "He walked to work yesterday, and she likes money", "Il a marché au travail hier, et elle aime l'argent", "Él caminó al trabajo ayer, y ella ama el dinero", [hu, halach, laAvoda, etmol, vehi, ohevet, kesef]),
];

const level32 = [
  line("32-both", "He likes both coffee and a computer", "Il aime à la fois le café et un ordinateur", "Él ama tanto el café como un ordenador", [hu, ohev, gam, kafe, vegam, machshev]),
  line("32-not-only", "He does not only read, but also writes", "Il ne lit pas seulement, mais il écrit aussi", "Él no solo lee, sino que también escribe", [hu, lo, rak, kore, ela, gam, kotev]),
  line("32-computer", "She buys a computer", "Elle achète un ordinateur", "Ella compra un ordenador", [hi, kona, machshev]),
  line("32-both-walk", "They walked to the park and also to work", "Ils ont marché au parc et aussi au travail", "Ellos caminaron al parque y también al trabajo", [hem, halchu, lePark, vegam, laAvoda]),
];

const level33 = [
  line("33-although", "He walked to work yesterday even though he is tired", "Il a marché au travail hier même s'il est fatigué", "Él caminó al trabajo ayer aunque está cansado", [hu, halach, laAvoda, etmol, lamrot, hu, ayef]),
  line("33-nevertheless", "He is tired. Nevertheless he reads", "Il est fatigué. Néanmoins il lit", "Él está cansado. Sin embargo lee", [hu, ayef, lamrotZot, hu, kore, iton]),
  line("33-train", "She likes the train even though she is tired", "Elle aime le train même si elle est fatiguée", "Ella ama el tren aunque está cansada", [hi, ohevet, et, haRakevet, lamrot, hi, ayefa]),
  line("33-ate", "He ate yesterday. Nevertheless he walks to the park", "Il a mangé hier. Néanmoins il marche au parc", "Él comió ayer. Sin embargo camina al parque", [hu, achal, etmol, lamrotZot, hu, holech, lePark]),
];

const level34 = [
  line("34-hands", "On one hand he is tired. On the other hand he walks", "D'un côté il est fatigué. De l'autre il marche", "Por un lado está cansado. Por otro lado camina", [mitzad, hu, ayef, mitzadSheni, hu, holech, lePark]),
  line("34-if", "If he is tired, he reads a newspaper", "S'il est fatigué, il lit un journal", "Si está cansado, lee un periódico", [im, hu, ayef, hu, kore, iton]),
  line("34-plane", "She likes the plane, and he read yesterday", "Elle aime l'avion, et il a lu hier", "Ella ama el avión, y él leyó ayer", [hi, ohevet, et, haMatos, vehu, kara, etmol]),
  line("34-if-train", "If she likes the train, she walks to the park", "Si elle aime le train, elle marche au parc", "Si ella ama el tren, camina al parque", [im, hi, ohevet, et, haRakevet, hi, holechet, lePark]),
];

const level35 = [
  line("35-if-then", "If he is tired, then he reads", "S'il est fatigué, alors il lit", "Si está cansado, entonces lee", [im, hu, ayef, az, hu, kore]),
  line("35-otherwise", "He buys coffee. Otherwise he walks to work", "Il achète un café. Sinon il marche au travail", "Él compra un café. Si no, camina al trabajo", [hu, kone, kafe, acheret, hu, holech, laAvoda]),
  line("35-even-if", "Even if he is tired, he walks to the park", "Même s'il est fatigué, il marche au parc", "Incluso si está cansado, camina al parque", [afilu, im, hu, ayef, hu, holech, lePark]),
  line("35-room", "She likes the room, so he read yesterday", "Elle aime la chambre, alors il a lu hier", "Ella ama la habitación, entonces él leyó ayer", [hi, ohevet, et, haCheder, az, hu, kara, etmol]),
];

const level36 = [
  line("36-because", "Because he is tired, he walked to bed", "Parce qu'il est fatigué, il a marché au lit", "Porque él está cansado, caminó a la cama", [biglalShehu, ayef, hu, halach, laMita]),
  line("36-that", "He is tired. Because of that he reads", "Il est fatigué. À cause de ça il lit", "Él está cansado. Por eso lee", [hu, ayef, biglalZe, hu, kore, iton]),
  line("36-result", "She wrote a letter yesterday. As a result she is tired", "Elle a écrit une lettre hier. En conséquence elle est fatiguée", "Ella escribió una carta ayer. Como resultado está cansada", [hi, katva, mikhtav, etmol, ketotsaa, hi, ayefa]),
  line("36-bed", "He walks to bed because he ate", "Il marche au lit parce qu'il a mangé", "Él camina a la cama porque comió", [hu, holech, laMita, ki, hu, achal]),
];

const level38 = [
  line("38-instead", "Instead of walking to work, he walks to the park", "Au lieu d'aller au travail, il marche au parc", "En lugar de ir al trabajo, él camina al parque", [bimkomShehu, holech, laAvoda, hu, holech, lePark]),
  line("38-bag", "She buys a bag, and he likes a watch", "Elle achète un sac, et il aime une montre", "Ella compra un bolso, y él ama un reloj", [hi, kona, tik, vehu, ohev, shaon]),
  line("38-yesterday", "He read a newspaper yesterday instead of writing", "Il a lu un journal hier au lieu d'écrire", "Él leyó un periódico ayer en lugar de escribir", [hu, kara, iton, etmol, bimkomShehu, kotev]),
  line("38-watch", "She likes a watch, so she walks to the shop", "Elle aime une montre, alors elle marche au magasin", "Ella ama un reloj, entonces camina a la tienda", [hi, ohevet, shaon, az, hi, holechet, laChanut]),
];

const level39 = [
  line("39-rain", "He likes rain, but she likes snow", "Il aime la pluie, mais elle aime la neige", "Él ama la lluvia, pero ella ama la nieve", [hu, ohev, geshem, aval, hi, ohevet, sheleg]),
  line("39-cloud", "She likes a cloud, for example", "Elle aime un nuage, par exemple", "Ella ama una nube, por ejemplo", [hi, ohevet, anan, lemashal]),
  line("39-past-rain", "He walked to the park yesterday even though he likes rain", "Il a marché au parc hier même s'il aime la pluie", "Él caminó al parque ayer aunque ama la lluvia", [hu, halach, lePark, etmol, lamrot, hu, ohev, geshem]),
  line("39-snow", "They walked yesterday, and she likes snow", "Ils ont marché hier, et elle aime la neige", "Ellos caminaron ayer, y ella ama la nieve", [hem, halchu, etmol, vehi, ohevet, sheleg]),
];

const level40 = [
  line("40-will-read", "He will read a newspaper tomorrow", "Il lira un journal demain", "Él leerá un periódico mañana", [hu, yikra, iton, machar]),
  line("40-will-write", "She will write a letter tomorrow morning", "Elle écrira une lettre demain matin", "Ella escribirá una carta mañana por la mañana", [hi, tikhtov, mikhtav, machar, baboker]),
  line("40-so-that", "He buys coffee so that she will drink tomorrow", "Il achète un café pour qu'elle boive demain", "Él compra un café para que ella beba mañana", [hu, kone, kafe, kedeiShehi, tishte, machar]),
  line("40-will-go", "They will walk to the park tomorrow morning", "Ils iront au parc demain matin", "Ellos irán al parque mañana por la mañana", [hem, yelchu, lePark, machar, baboker]),
];

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

function exam(level: number, rounds: readonly BuilderSentence[], pool: readonly ReturnType<typeof w>[]): CurriculumLevelDef {
  return teach(level, examTitle, examAbout, [], [
    { id: `${level}.1`, title: [examTitle], body: examBody },
    {
      id: `${level}.2`,
      exam: true,
      rounds: rounds.map((round) => {
        const used = new Set(round.words.map((part) => part.hebrew));
        return withExtras(round, pool.filter((part) => !used.has(part.hebrew)).slice(0, 2));
      }),
    },
  ]);
}

export const connectorLevels: readonly CurriculumLevelDef[] = [
  wordsLevel(
    22,
    g("And, but, or", "Et, mais, ou", "Y, pero, o"),
    g("ו, אבל, and או, plus קפה.", "ו, אבל et או, et קפה.", "ו, אבל y או, y קפה."),
    g("ו joins the next word: והיא. אבל means but. או means or.", "ו se colle au mot suivant : והיא. אבל veut dire mais. או veut dire ou.", "ו se une a la palabra siguiente: והיא. אבל significa pero. או significa o."),
    ["ו", "אבל", "או", "קפה"],
    [
      card("ve", "וְ", "and. It joins the next word", "et. Il se colle au mot suivant", "y. Se une a la palabra siguiente"),
      card("aval", "אֲבָל", "but", "mais", "pero", avalA),
      card("o", "אוֹ", "or", "ou", "o", oA),
      card("kafe", "קָפֶה", "coffee, masculine", "café, masculin", "café, masculino", kafeA),
    ],
    [
      entry("w-ve", "ו", "and", "ve", conjunction, null),
      entry("w-aval", "אבל", "but", "aval", conjunction, null),
      entry("w-o", "או", "or", "o", conjunction, null),
      entry("w-kafe", "קפה", "coffee", "kafe", noun, m),
    ],
    level22,
  ),
  wordsLevel(
    23,
    g("Because, so, also", "Parce que, alors, aussi", "Porque, entonces, también"),
    g("כי, אז, and גם, plus עייף.", "כי, אז et גם, et עייף.", "כי, אז y גם, y עייף."),
    g("כי gives a reason. אז gives a result. גם means also. A man is עייף and a woman is עייפה.", "כי donne une raison. אז donne un résultat. גם veut dire aussi. Un homme est עייף et une femme est עייפה.", "כי da una razón. אז da un resultado. גם significa también. Un hombre es עייף y una mujer es עייפה."),
    ["כי", "אז", "גם", "עייף"],
    [
      card("ki", "כִּי", "because", "parce que", "porque", kiA),
      card("az", "אָז", "so", "alors", "entonces", azA),
      card("gam", "גַּם", "also", "aussi", "también", gamA),
      card("ayef", "עָיֵף", "tired, masculine", "fatigué, masculin", "cansado, masculino", ayefA),
      card("ayefa", "עֲיֵפָה", "tired, feminine", "fatiguée, féminin", "cansada, femenino", ayefaA),
      card("chatul", "חָתוּל", "cat, masculine", "chat, masculin", "gato, masculino", chatulA),
    ],
    [
      entry("w-ki", "כי", "because", "ki", conjunction, null),
      entry("w-az", "אז", "so", "az", conjunction, null),
      entry("w-gam", "גם", "also", "gam", adverb, null),
      entry("w-ayef", "עייף", "tired", "ayef", adjective, m),
      entry("w-ayefa", "עייפה", "tired", "ayefa", adjective, f),
      entry("w-chatul", "חתול", "cat", "chatul", noun, m),
    ],
    level23,
  ),
  wordsLevel(
    24,
    g("Only, but rather, therefore", "Seulement, mais plutôt, donc", "Solo, sino, por lo tanto"),
    g("רק, אלא, and לכן, plus כלב.", "רק, אלא et לכן, et כלב.", "רק, אלא y לכן, y כלב."),
    g("רק means only. אלא means but rather, often after לא. לכן means therefore.", "רק veut dire seulement. אלא veut dire mais plutôt, souvent après לא. לכן veut dire donc.", "רק significa solo. אלא significa sino, a menudo después de לא. לכן significa por lo tanto."),
    ["רק", "אלא", "לכן", "לא", "כלב"],
    [
      card("rak", "רַק", "only", "seulement", "solo", rakA),
      card("ela", "אֶלָּא", "but rather", "mais plutôt", "sino", elaA),
      card("lakhen", "לָכֵן", "therefore", "donc", "por lo tanto"),
      card("kelev", "כֶּלֶב", "dog, masculine", "chien, masculin", "perro, masculino", kelevA),
      card("lo", "לֹא", "not", "ne... pas", "no", loA),
    ],
    [
      entry("w-rak", "רק", "only", "rak", adverb, null),
      entry("w-ela", "אלא", "but rather", "ela", conjunction, null),
      entry("w-lakhen", "לכן", "therefore", "lakhen", conjunction, null),
      entry("w-lo", "לא", "not", "lo", adverb, null),
      entry("w-kelev", "כלב", "dog", "kelev", noun, m),
    ],
    level24,
  ),
  wordsLevel(
    25,
    g("Actually, when, before", "En fait, quand, avant", "En realidad, cuando, antes"),
    g("בעצם, כש, and לפני ש, plus טלפון.", "בעצם, כש et לפני ש, et טלפון.", "בעצם, כש y לפני ש, y טלפון."),
    g("בעצם means actually. כש means when, and it joins the next word. לפני ש means before.", "בעצם veut dire en fait. כש veut dire quand, et il se colle au mot suivant. לפני ש veut dire avant.", "בעצם significa en realidad. כש significa cuando, y se une a la palabra siguiente. לפני ש significa antes."),
    ["בעצם", "כש", "לפני ש", "טלפון"],
    [
      card("beetsem", "בְּעֶצֶם", "actually", "en fait", "en realidad"),
      card("kshe", "כְּשֶׁ", "when", "quand", "cuando"),
      card("lifnei", "לִפְנֵי", "before", "avant", "antes", lifneiA),
      card("telefon", "טֶלֶפוֹן", "phone, masculine", "téléphone, masculin", "teléfono, masculino", telefonA),
    ],
    [
      entry("w-beetsem", "בעצם", "actually", "beetsem", adverb, null),
      entry("w-kshe", "כש", "when", "kshe", conjunction, null),
      entry("w-lifnei", "לפני ש", "before", "lifnei she", conjunction, null),
      entry("w-telefon", "טלפון", "phone", "telefon", noun, m),
    ],
    level25,
  ),
  wordsLevel(
    26,
    g("After, while, until", "Après, pendant, jusqu'à", "Después, mientras, hasta"),
    g("אחרי ש, בזמן ש, and עד ש, plus חנות.", "אחרי ש, בזמן ש et עד ש, et חנות.", "אחרי ש, בזמן ש y עד ש, y חנות."),
    g("אחרי ש means after. בזמן ש means while. עד ש means until. ל joins חנות: לחנות.", "אחרי ש veut dire après. בזמן ש veut dire pendant. עד ש veut dire jusqu'à. ל se colle à חנות : לחנות.", "אחרי ש significa después. בזמן ש significa mientras. עד ש significa hasta. ל se une a חנות: לחנות."),
    ["אחרי ש", "בזמן ש", "עד ש", "חנות"],
    [
      card("acharei", "אַחֲרֵי", "after", "après", "después", achareiA),
      card("bizman", "בִּזְמַן שֶׁ", "while", "pendant que", "mientras"),
      card("ad", "עַד", "until", "jusqu'à", "hasta", adA),
      card("chanut", "חֲנוּת", "shop, feminine", "magasin, féminin", "tienda, femenino", chanutA),
    ],
    [
      entry("w-acharei", "אחרי ש", "after", "acharei she", conjunction, null),
      entry("w-bizman", "בזמן ש", "while", "bizman she", conjunction, null),
      entry("w-ad", "עד ש", "until", "ad she", conjunction, null),
      entry("w-chanut", "חנות", "shop", "chanut", noun, f),
    ],
    level26,
  ),
  wordsLevel(
    27,
    g("Since, and then, first", "Depuis, et ensuite, d'abord", "Desde, y entonces, primero"),
    g("מאז ש, ואז, and קודם כול, plus משפחה.", "מאז ש, ואז et קודם כול, et משפחה.", "מאז ש, ואז y קודם כול, y משפחה."),
    g("מאז ש means since. ואז means and then. קודם כול means first of all.", "מאז ש veut dire depuis. ואז veut dire et ensuite. קודם כול veut dire tout d'abord.", "מאז ש significa desde. ואז significa y entonces. קודם כול significa antes que nada."),
    ["מאז ש", "ואז", "קודם כול", "משפחה"],
    [
      card("meaz", "מֵאָז", "since", "depuis", "desde", meazA),
      card("veaz", "וְאָז", "and then", "et ensuite", "y entonces"),
      card("kodem", "קֹדֶם כֹּל", "first of all", "tout d'abord", "antes que nada"),
      card("mishpacha", "מִשְׁפָּחָה", "family, feminine", "famille, féminin", "familia, femenino", mishpachaA),
    ],
    [
      entry("w-meaz", "מאז ש", "since", "meaz she", conjunction, null),
      entry("w-veaz", "ואז", "and then", "veaz", conjunction, null),
      entry("w-kodem", "קודם כול", "first of all", "kodem kol", adverb, null),
      entry("w-mishpacha", "משפחה", "family", "mishpacha", noun, f),
    ],
    level27,
  ),
  wordsLevel(
    28,
    g("In the end, meanwhile, for example", "À la fin, pendant ce temps, par exemple", "Al final, mientras tanto, por ejemplo"),
    g("בסוף, בינתיים, and למשל, plus חלון.", "בסוף, בינתיים et למשל, et חלון.", "בסוף, בינתיים y למשל, y חלון."),
    g("בסוף means in the end. בינתיים means meanwhile. למשל means for example.", "בסוף veut dire à la fin. בינתיים veut dire pendant ce temps. למשל veut dire par exemple.", "בסוף significa al final. בינתיים significa mientras tanto. למשל significa por ejemplo."),
    ["בסוף", "בינתיים", "למשל", "חלון"],
    [
      card("basof", "בַּסּוֹף", "in the end", "à la fin", "al final"),
      card("beintayim", "בֵּינְתַיִם", "meanwhile", "pendant ce temps", "mientras tanto", beintayimA),
      card("lemashal", "לְמָשָׁל", "for example", "par exemple", "por ejemplo"),
      card("chalon", "חַלּוֹן", "window, masculine", "fenêtre, masculin", "ventana, masculino", chalonA),
    ],
    [
      entry("w-basof", "בסוף", "in the end", "basof", adverb, null),
      entry("w-beintayim", "בינתיים", "meanwhile", "beintayim", adverb, null),
      entry("w-lemashal", "למשל", "for example", "lemashal", adverb, null),
      entry("w-chalon", "חלון", "window", "chalon", noun, m),
    ],
    level28,
  ),
  exam(29, [level22[0], level23[0], level24[2], level26[1], level27[1], level28[2]], [aval, kafe, ayef, lePark, telefon, chalon]),
  wordsLevel(
    30,
    g("Past tense", "Passé", "Pasado"),
    g("Past forms of verbs you know, plus כלומר and זאת אומרת.", "Les formes du passé des verbes connus, plus כלומר et זאת אומרת.", "Las formas del pasado de verbos conocidos, más כלומר y זאת אומרת."),
    g("The past says what already happened. אתמול means yesterday. כלומר means that is. זאת אומרת means that means.", "Le passé dit ce qui s'est déjà passé. אתמול veut dire hier. כלומר veut dire c'est-à-dire. זאת אומרת veut dire ça veut dire.", "El pasado dice lo que ya pasó. אתמול significa ayer. כלומר significa es decir. זאת אומרת significa eso quiere decir."),
    ["קרא", "כתבה", "הלך", "אתמול", "כלומר", "זאת אומרת"],
    [
      card("kara", "קָרָא", "he read", "il a lu", "él leyó", karaA),
      card("katva", "כָּתְבָה", "she wrote", "elle a écrit", "ella escribió", katvaA),
      card("halach", "הָלַךְ", "he walked", "il a marché", "él caminó", halachA),
      card("achal", "אָכַל", "he ate", "il a mangé", "él comió", achalA),
      card("etmol", "אֶתְמוֹל", "yesterday", "hier", "ayer", etmolA),
      card("klomar", "כְּלוֹמַר", "that is", "c'est-à-dire", "es decir"),
      card("zot", "זֹאת אוֹמֶרֶת", "that means", "ça veut dire", "eso quiere decir"),
    ],
    [
      entry("w-kara", "קָרָא", "he read", "kara", verb, m),
      entry("w-katva", "כָּתְבָה", "she wrote", "katva", verb, f),
      entry("w-katav", "כָּתַב", "he wrote", "katav", verb, m),
      entry("w-halach", "הָלַךְ", "he walked", "halach", verb, m),
      entry("w-halchu", "הָלְכוּ", "they walked", "halchu", verb, m),
      entry("w-achal", "אָכַל", "he ate", "achal", verb, m),
      entry("w-achla", "אָכְלָה", "she ate", "achla", verb, f),
      entry("w-etmol", "אתמול", "yesterday", "etmol", adverb, null),
      entry("w-klomar", "כלומר", "that is", "klomar", conjunction, null),
      entry("w-zot-omeret", "זאת אומרת", "that means", "zot omeret", conjunction, null),
    ],
    level30,
  ),
  wordsLevel(
    31,
    g("Especially, in addition, apart from", "Surtout, en plus, à part", "Especialmente, además, aparte"),
    g("במיוחד, בנוסף, and חוץ מ, plus כסף.", "במיוחד, בנוסף et חוץ מ, et כסף.", "במיוחד, בנוסף y חוץ מ, y כסף."),
    g("במיוחד means especially. בנוסף means in addition. חוץ מ means apart from.", "במיוחד veut dire surtout. בנוסף veut dire en plus. חוץ מ veut dire à part.", "במיוחד significa especialmente. בנוסף significa además. חוץ מ significa aparte de."),
    ["במיוחד", "בנוסף", "חוץ מ", "כסף"],
    [
      card("bimiyuchad", "בִּמְיֻחָד", "especially", "surtout", "especialmente", bimiyuchadA),
      card("benosaf", "בְּנוֹסָף", "in addition", "en plus", "además"),
      card("chutz", "חוּץ מִ", "apart from", "à part", "aparte de"),
      card("kesef", "כֶּסֶף", "money, masculine", "argent, masculin", "dinero, masculino", kesefA),
    ],
    [
      entry("w-bimiyuchad", "במיוחד", "especially", "bimiyuchad", adverb, null),
      entry("w-benosaf", "בנוסף", "in addition", "benosaf", adverb, null),
      entry("w-chutz", "חוץ מ", "apart from", "chutz mi", preposition, null),
      entry("w-kesef", "כסף", "money", "kesef", noun, m),
    ],
    level31,
  ),
  wordsLevel(
    32,
    g("Both, and not only", "Les deux, et pas seulement", "Ambos, y no solo"),
    g("גם... וגם... and לא רק... אלא גם..., plus מחשב.", "גם... וגם... et לא רק... אלא גם..., et מחשב.", "גם... וגם... y לא רק... אלא גם..., y מחשב."),
    g("גם... וגם... means both... and... לא רק... אלא גם... means not only... but also...", "גם... וגם... veut dire à la fois... et... לא רק... אלא גם... veut dire non seulement... mais aussi...", "גם... וגם... significa tanto... como... לא רק... אלא גם... significa no solo... sino también..."),
    ["גם", "וגם", "לא רק", "מחשב"],
    [
      card("gam-2", "גַּם", "also", "aussi", "también", gamA),
      card("vegam", "וְגַם", "and also", "et aussi", "y también"),
      card("lo-rak", "לֹא רַק", "not only", "non seulement", "no solo"),
      card("machshev", "מַחְשֵׁב", "computer, masculine", "ordinateur, masculin", "ordenador, masculino", machshevA),
    ],
    [
      entry("w-vegam", "וגם", "and also", "vegam", conjunction, null),
      entry("w-lo-rak", "לא רק", "not only", "lo rak", adverb, null),
      entry("w-machshev", "מחשב", "computer", "machshev", noun, m),
    ],
    level32,
  ),
  wordsLevel(
    33,
    g("Even though, nevertheless", "Même si, néanmoins", "Aunque, sin embargo"),
    g("למרות ש and למרות זאת, plus רכבת.", "למרות ש et למרות זאת, et רכבת.", "למרות ש y למרות זאת, y רכבת."),
    g("למרות ש means even though. למרות זאת means nevertheless.", "למרות ש veut dire même si. למרות זאת veut dire néanmoins.", "למרות ש significa aunque. למרות זאת significa sin embargo."),
    ["למרות ש", "למרות זאת", "רכבת"],
    [
      card("lamrot", "לַמְרוֹת שֶׁ", "even though", "même si", "aunque", lamrotA),
      card("lamrot-zot", "לַמְרוֹת זֹאת", "nevertheless", "néanmoins", "sin embargo"),
      card("rakevet", "רַכֶּבֶת", "train, feminine", "train, féminin", "tren, femenino", rakevetA),
    ],
    [
      entry("w-lamrot", "למרות ש", "even though", "lamrot she", conjunction, null),
      entry("w-lamrot-zot", "למרות זאת", "nevertheless", "lamrot zot", adverb, null),
      entry("w-rakevet", "רכבת", "train", "rakevet", noun, f),
    ],
    level33,
  ),
  wordsLevel(
    34,
    g("On one hand, if", "D'un côté, si", "Por un lado, si"),
    g("מצד אחד... מצד שני... and אם, plus מטוס.", "מצד אחד... מצד שני... et אם, et מטוס.", "מצד אחד... מצד שני... y אם, y מטוס."),
    g("מצד אחד... מצד שני... means on one hand... on the other hand... אם means if.", "מצד אחד... מצד שני... veut dire d'un côté... de l'autre... אם veut dire si.", "מצד אחד... מצד שני... significa por un lado... por otro lado... אם significa si."),
    ["מצד אחד", "מצד שני", "אם", "מטוס"],
    [
      card("mitzad", "מִצַּד אֶחָד", "on one hand", "d'un côté", "por un lado"),
      card("mitzad-2", "מִצַּד שֵׁנִי", "on the other hand", "de l'autre", "por otro lado"),
      card("im", "אִם", "if", "si", "si", imA),
      card("matos", "מָטוֹס", "plane, masculine", "avion, masculin", "avión, masculino", matosA),
    ],
    [
      entry("w-mitzad", "מצד אחד", "on one hand", "mitzad echad", adverb, null),
      entry("w-mitzad-sheni", "מצד שני", "on the other hand", "mitzad sheni", adverb, null),
      entry("w-im", "אם", "if", "im", conjunction, null),
      entry("w-matos", "מטוס", "plane", "matos", noun, m),
    ],
    level34,
  ),
  wordsLevel(
    35,
    g("If then, otherwise, even if", "Si alors, sinon, même si", "Si entonces, si no, incluso si"),
    g("אם... אז..., אחרת, and אפילו אם, plus חדר.", "אם... אז..., אחרת et אפילו אם, et חדר.", "אם... אז..., אחרת y אפילו אם, y חדר."),
    g("אם... אז... means if... then... אחרת means otherwise. אפילו אם means even if.", "אם... אז... veut dire si... alors... אחרת veut dire sinon. אפילו אם veut dire même si.", "אם... אז... significa si... entonces... אחרת significa si no. אפילו אם significa incluso si."),
    ["אם", "אז", "אחרת", "אפילו אם", "חדר"],
    [
      card("im-2", "אִם", "if", "si", "si", imA),
      card("az-2", "אָז", "then", "alors", "entonces", azA),
      card("acheret", "אַחֶרֶת", "otherwise", "sinon", "si no"),
      card("afilu", "אֲפִילוּ אִם", "even if", "même si", "incluso si"),
      card("cheder", "חֶדֶר", "room, masculine", "chambre, masculin", "habitación, masculino", chederA),
    ],
    [
      entry("w-acheret", "אחרת", "otherwise", "acheret", adverb, null),
      entry("w-afilu", "אפילו אם", "even if", "afilu im", conjunction, null),
      entry("w-cheder", "חדר", "room", "cheder", noun, m),
    ],
    level35,
  ),
  wordsLevel(
    36,
    g("Because, that's why, as a result", "Parce que, c'est pourquoi, en conséquence", "Porque, por eso, como resultado"),
    g("בגלל ש, בגלל זה, and כתוצאה מכך, plus מיטה.", "בגלל ש, בגלל זה et כתוצאה מכך, et מיטה.", "בגלל ש, בגלל זה y כתוצאה מכך, y מיטה."),
    g("בגלל ש means because. בגלל זה means because of that. כתוצאה מכך means as a result.", "בגלל ש veut dire parce que. בגלל זה veut dire à cause de ça. כתוצאה מכך veut dire en conséquence.", "בגלל ש significa porque. בגלל זה significa por eso. כתוצאה מכך significa como resultado."),
    ["בגלל ש", "בגלל זה", "כתוצאה מכך", "מיטה"],
    [
      card("biglal", "בִּגְלַל", "because of", "à cause de", "por", biglalA),
      card("biglal-ze", "בִּגְלַל זֶה", "because of that", "à cause de ça", "por eso"),
      card("ketotsaa", "כְּתוֹצָאָה מִכָּךְ", "as a result", "en conséquence", "como resultado"),
      card("mita", "מִטָּה", "bed, feminine", "lit, féminin", "cama, femenino", mitaA),
    ],
    [
      entry("w-biglal", "בגלל ש", "because", "biglal she", conjunction, null),
      entry("w-biglal-ze", "בגלל זה", "because of that", "biglal ze", conjunction, null),
      entry("w-ketotsaa", "כתוצאה מכך", "as a result", "ketotsaa mikach", adverb, null),
      entry("w-mita", "מיטה", "bed", "mita", noun, f),
    ],
    level36,
  ),
  exam(37, [level30[0], level31[0], level32[1], level33[0], level34[1], level36[1]], [etmol, kesef, machshev, lamrot, im, laMita]),
  wordsLevel(
    38,
    g("Instead of", "Au lieu de", "En lugar de"),
    g("במקום ש, plus תיק and שעון.", "במקום ש, et תיק et שעון.", "במקום ש, y תיק y שעון."),
    g("במקום ש means instead of. The second idea is what did not happen.", "במקום ש veut dire au lieu de. La seconde idée est ce qui ne s'est pas passé.", "במקום ש significa en lugar de. La segunda idea es lo que no pasó."),
    ["במקום ש", "תיק", "שעון"],
    [
      card("bimkom", "בִּמְקוֹם שֶׁ", "instead of", "au lieu de", "en lugar de"),
      card("tik", "תִּיק", "bag, masculine", "sac, masculin", "bolso, masculino", tikA),
      card("shaon", "שָׁעוֹן", "watch, masculine", "montre, masculin", "reloj, masculino", shaonA),
    ],
    [
      entry("w-bimkom", "במקום ש", "instead of", "bimkom she", conjunction, null),
      entry("w-tik", "תיק", "bag", "tik", noun, m),
      entry("w-shaon", "שעון", "watch", "shaon", noun, m),
    ],
    level38,
  ),
  wordsLevel(
    39,
    g("Weather", "Le temps", "El tiempo"),
    g("גשם, שלג, and ענן, with the past and the connectors you know.", "גשם, שלג et ענן, avec le passé et les connecteurs connus.", "גשם, שלג y ענן, con el pasado y los conectores que ya sabes."),
    g("Hear the weather words, then use them with a connector.", "Écoutez les mots du temps, puis utilisez-les avec un connecteur.", "Escucha las palabras del tiempo y úsalas con un conector."),
    ["גשם", "שלג", "ענן"],
    [
      card("geshem", "גֶּשֶׁם", "rain, masculine", "pluie, masculin", "lluvia, masculino", geshemA),
      card("sheleg", "שֶׁלֶג", "snow, masculine", "neige, masculin", "nieve, masculino", shelegA),
      card("anan", "עָנָן", "cloud, masculine", "nuage, masculin", "nube, masculino", ananA),
    ],
    [
      entry("w-geshem", "גשם", "rain", "geshem", noun, m),
      entry("w-sheleg", "שלג", "snow", "sheleg", noun, m),
      entry("w-anan", "ענן", "cloud", "anan", noun, m),
    ],
    level39,
  ),
  wordsLevel(
    40,
    g("Future tense", "Futur", "Futuro"),
    g("Future forms, מחר, and כדי ש.", "Les formes du futur, מחר, et כדי ש.", "Las formas del futuro, מחר, y כדי ש."),
    g("The future says what has not happened yet. מחר means tomorrow. בבוקר means in the morning. כדי ש means so that.", "Le futur dit ce qui n'est pas encore arrivé. מחר veut dire demain. בבוקר veut dire le matin. כדי ש veut dire pour que.", "El futuro dice lo que todavía no pasó. מחר significa mañana. בבוקר significa por la mañana. כדי ש significa para que."),
    ["יקרא", "תכתוב", "ילכו", "מחר", "כדי ש"],
    [
      card("yikra", "יִקְרָא", "he will read", "il lira", "él leerá", yikraA),
      card("yikreu", "יִקְרְאוּ", "they will read", "ils liront", "ellos leerán", yikreuA),
      card("tikhtov", "תִּכְתּוֹב", "she will write", "elle écrira", "ella escribirá", tikhtovA),
      card("yelech", "יֵלֵךְ", "he will walk", "il ira", "él irá", yelechA),
      card("yochal", "יֹאכַל", "he will eat", "il mangera", "él comerá", yochalA),
      card("machar", "מָחָר", "tomorrow", "demain", "mañana", macharA),
      card("boker", "בֹּקֶר", "morning, masculine", "matin, masculin", "mañana, masculino", bokerA),
      card("kedei", "כְּדֵי שֶׁ", "so that", "pour que", "para que"),
    ],
    [
      entry("w-yikra", "יִקְרָא", "he will read", "yikra", verb, m),
      entry("w-yikreu", "יִקְרְאוּ", "they will read", "yikreu", verb, m),
      entry("w-tikhtov", "תִּכְתּוֹב", "she will write", "tikhtov", verb, f),
      entry("w-yelech", "יֵלֵךְ", "he will walk", "yelech", verb, m),
      entry("w-yelchu", "יֵלְכוּ", "they will walk", "yelchu", verb, m),
      entry("w-yochal", "יֹאכַל", "he will eat", "yochal", verb, m),
      entry("w-tishte", "תִּשְׁתֶּה", "she will drink", "tishte", verb, f),
      entry("w-machar", "מחר", "tomorrow", "machar", adverb, null),
      entry("w-boker", "בוקר", "morning", "boker", noun, m),
      entry("w-kedei", "כדי ש", "so that", "kedei she", conjunction, null),
    ],
    level40,
  ),
];
