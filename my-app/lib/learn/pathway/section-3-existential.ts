import { normalizeHebrew } from "@/lib/learn/hebrew-text";
import { seededOrder } from "@/lib/learn/pathway/order";
import {
  gloss,
  type ConjugateItem,
  type GapItem,
  type GapPiece,
  type Gloss,
  type PathwayLevel,
  type PathwaySection,
  type ReadItem,
  type RecognizeItem,
  type SpellItem,
  type SpokenItem,
} from "@/lib/learn/pathway/types";
import { requireWord } from "@/lib/learn/words/catalog";

// Keep a Hebrew phrase in order when it sits inside an English sentence.
function he(text: string) {
  return `\u2067${text}\u2069`;
}

function spoken(id: string): SpokenItem {
  const word = requireWord(id);
  return {
    id: word.id,
    hebrew: word.niqqud || word.hebrew,
    say: word.niqqud || word.hebrew,
    gloss: { en: word.en, fr: word.fr, es: word.es },
    audio: word.audio ?? undefined,
  };
}

function piece(id: string): GapPiece {
  const item = spoken(id);
  return { id: item.id, hebrew: item.hebrew, gloss: item.gloss, audio: item.audio };
}

function spelled(id: string): SpellItem {
  const item = spoken(id);
  const needed = [...normalizeHebrew(item.hebrew)];
  const extra = [..."אבגדהוזחטיכלמנסעפצקרשת"].filter((letter) => !needed.includes(letter));
  return { prompt: item, letters: seededOrder([...needed, ...extra.slice(0, 3)], id) };
}

function line(id: string, hebrew: string, en: string, fr: string, es: string): SpokenItem {
  return { id, hebrew, say: hebrew, gloss: gloss(en, fr, es) };
}

function recognizeLines(items: readonly SpokenItem[]): RecognizeItem[] {
  return items.map((item) => {
    const others = seededOrder(
      items.filter((choice) => choice.id !== item.id),
      item.id,
    ).slice(0, 2);
    return { prompt: item, choices: seededOrder([item, ...others], item.id) };
  });
}

function gap(id: string, say: string, translation: Gloss, tokens: GapItem["tokens"], extras: readonly GapPiece[]): GapItem {
  return { id, say, gloss: translation, tokens, extras };
}

function reading(id: string, hebrew: string, en: string, fr: string, es: string): ReadItem {
  return { id, hebrew, gloss: gloss(en, fr, es) };
}

function form(id: string, hebrew: string, en: string, fr: string, es: string): SpokenItem {
  return { id, hebrew, gloss: gloss(en, fr, es) };
}

function conjugate(
  id: string,
  before: string,
  after: string,
  translation: Gloss,
  choices: readonly SpokenItem[],
  answerId: string,
): ConjugateItem {
  return { id, before, after, gloss: translation, choices, answerId };
}

const yeshForms = [
  line("yesh-ani", "יֵשׁ לִי", "I have", "j'ai", "tengo"),
  line("yesh-ata", "יֵשׁ לְךָ", "you have (masculine)", "tu as (masculin)", "tienes (masculino)"),
  line("yesh-at", "יֵשׁ לָךְ", "you have (feminine)", "tu as (féminin)", "tienes (femenino)"),
  line("yesh-hu", "יֵשׁ לוֹ", "he has", "il a", "él tiene"),
  line("yesh-hi", "יֵשׁ לָהּ", "she has", "elle a", "ella tiene"),
];

const yeshHear = [
  spoken("yesh"),
  spoken("ein"),
  yeshForms[0],
  line("ein-li", "אֵין לִי", "I don't have", "je n'ai pas", "no tengo"),
  spoken("kelev"),
  spoken("mayim"),
];

const ageSentences = [
  line("age-20", "אֲנִי בֵּן עֶשְׂרִים", "I am 20 (masculine)", "j'ai 20 ans (masculin)", "tengo 20 años (masculino)"),
  line("age-7", "אֲנִי בַּת שֶׁבַע", "I am 7 (feminine)", "j'ai 7 ans (féminin)", "tengo 7 años (femenino)"),
  line("age-ask-m", "בֵּן כַּמָּה אַתָּה", "how old are you (masculine)", "quel âge as-tu (masculin)", "cuántos años tienes (masculino)"),
  line("age-ask-f", "בַּת כַּמָּה אַתְּ", "how old are you (feminine)", "quel âge as-tu (féminin)", "cuántos años tienes (femenino)"),
  line("age-1", "אֲנִי בֵּן שָׁנָה", "I am 1 (masculine)", "j'ai 1 an (masculin)", "tengo 1 año (masculino)"),
  line("age-30", "אֲנִי בַּת שְׁלוֹשִׁים", "I am 30 (feminine)", "j'ai 30 ans (féminin)", "tengo 30 años (femenino)"),
];

const numberIds = ["efes", "shana", "shnatayim", "shalosh", "arba", "hamesh", "shesh", "sheva", "shmone", "tesha", "eser", "esrim", "shloshim", "meah"] as const;

const customerLines = [
  spoken("shalom"),
  line("ma-nishma", "מַה נִשְׁמָע", "how are you", "comment ça va", "cómo estás"),
  line("ma-kore", "מַה קוֹרֶה", "what's up", "quoi de neuf", "qué pasa"),
  line("efshar-order", "אֶפְשָׁר לְהַזְמִין", "can I order", "puis-je commander", "puedo pedir"),
  line("please-hafuch", "אֶפְשָׁר בְּבַקָּשָׁה הָפוּךְ", "can I have a hafuch please", "puis-je avoir un hafouch s'il vous plaît", "puedo pedir un hafuj por favor"),
  line("please-kal", "אֶפְשָׁר בְּבַקָּשָׁה קָפֶה קַל", "can I have a light coffee please", "puis-je avoir un café léger s'il vous plaît", "puedo pedir un café ligero por favor"),
  spoken("espresso"),
  spoken("ve-kruason"),
];

const waiterLines = [
  line("want-m", "מַה אַתָּה רוֹצֶה", "what do you want (masculine)", "que veux-tu (masculin)", "qué quieres (masculino)"),
  line("want-f", "מַה אַתְּ רוֹצָה", "what do you want (feminine)", "que veux-tu (féminin)", "qué quieres (femenino)"),
  line("sit-or-take", "זֶה לָשֶׁבֶת אוֹ לָקַחַת", "to sit in or take away", "sur place ou à emporter", "para tomar aquí o para llevar"),
  line("want-pl", "אַתֶּם רוֹצִים", "you want (masculine plural)", "vous voulez (masculin)", "ustedes quieren (masculino)"),
  line("want-fp", "אַתֶּן רוֹצוֹת", "you want (feminine plural)", "vous voulez (féminin)", "ustedes quieren (femenino)"),
  line("pay-pl", "אֵיךְ אַתֶּם מְשַׁלְּמִים", "how are you paying (plural)", "comment payez-vous", "cómo pagan"),
  line("pay-m", "אֵיךְ אַתָּה מְשַׁלֵּם", "how are you paying (masculine)", "comment paies-tu (masculin)", "cómo pagas (masculino)"),
  line("card-or-cash", "עִם אַשְׁרַאי אוֹ מְזוּמָן", "with card or cash", "par carte ou en espèces", "con tarjeta o en efectivo"),
];

const levels: readonly PathwayLevel[] = [
  {
    id: "s3-l0",
    sectionId: "s3",
    index: 0,
    title: gloss("There is, there isn't", "Il y a, il n'y a pas", "Hay, no hay"),
    about: gloss(
      `${he("יש")} means something is there. ${he("אין")} means it is not. ${he("יש לי")} means I have.`,
      `${he("יש")} dit que quelque chose est là. ${he("אין")} dit que non. ${he("יש לי")} veut dire j'ai.`,
      `${he("יש")} dice que algo está. ${he("אין")} dice que no. ${he("יש לי")} significa tengo.`,
    ),
    mark: "יֵשׁ",
    knownWordIds: ["yesh", "ein", "li", "lecha", "lach", "lo", "lah", "mayim", "lechem", "kelev", "bayit", "sefer"],
    intros: [
      {
        title: gloss(`${he("יש")} and ${he("אין")}`, `${he("יש")} et ${he("אין")}`, `${he("יש")} y ${he("אין")}`),
        body: gloss(
          `${he("יש")} means there is. ${he("אין")} means there isn't. In everyday Hebrew these words are usually written without nikud.`,
          `${he("יש")} veut dire il y a. ${he("אין")} veut dire il n'y a pas. Au quotidien, ces mots s'écrivent en général sans nikoud.`,
          `${he("יש")} significa hay. ${he("אין")} significa no hay. En el hebreo de cada día, estas palabras suelen escribirse sin niqud.`,
        ),
        samples: [
          { hebrew: "יֵשׁ דָּג", gloss: gloss("there is a fish", "il y a un poisson", "hay un pez") },
          { hebrew: "אֵין גְּלִידָה", gloss: gloss("there is no ice cream", "il n'y a pas de glace", "no hay helado") },
          { hebrew: "יֵשׁ סֵפֶר", gloss: gloss("there is a book", "il y a un livre", "hay un libro") },
          { hebrew: "אֵין בַּיִת", gloss: gloss("there is no house", "il n'y a pas de maison", "no hay casa") },
        ],
      },
      {
        title: gloss(`${he("יש לי")} means I have`, `${he("יש לי")} veut dire j'ai`, `${he("יש לי")} significa tengo`),
        body: gloss(
          `${he("ל")} joins the person. ${he("לי")} is I, ${he("לך")} is you, ${he("לו")} is he, ${he("לה")} is she. ${he("אין לי")} means I don't have.`,
          `${he("ל")} se colle à la personne. ${he("לי")} c'est moi, ${he("לך")} c'est toi, ${he("לו")} c'est lui, ${he("לה")} c'est elle. ${he("אין לי")} veut dire je n'ai pas.`,
          `${he("ל")} se une a la persona. ${he("לי")} es yo, ${he("לך")} es tú, ${he("לו")} es él, ${he("לה")} es ella. ${he("אין לי")} significa no tengo.`,
        ),
        samples: [
          ...yeshForms.map((item) => ({ hebrew: item.hebrew, gloss: item.gloss })),
          { hebrew: "אֵין לִי לֶחֶם", gloss: gloss("I don't have bread", "je n'ai pas de pain", "no tengo pan") },
        ],
      },
    ],
    exercises: [
      { type: "recognize-sound", items: recognizeLines(yeshHear) },
      {
        type: "compose-gap",
        items: [
          gap("gap-yesh-dag", "יֵשׁ דָּג", gloss("there is a fish", "il y a un poisson", "hay un pez"), [
            { ...piece("yesh"), blank: true },
            { ...piece("dag") },
          ], [piece("ein"), piece("glida")]),
          gap("gap-ein-glida", "אֵין גְּלִידָה", gloss("there is no ice cream", "il n'y a pas de glace", "no hay helado"), [
            { ...piece("ein"), blank: true },
            { ...piece("glida") },
          ], [piece("yesh"), piece("kelev")]),
          gap("gap-yesh-li-kelev", "יֵשׁ לִי כֶּלֶב", gloss("I have a dog", "j'ai un chien", "tengo un perro"), [
            { ...piece("yesh") },
            { ...piece("li"), blank: true },
            { ...piece("kelev") },
          ], [piece("lo"), piece("lah")]),
          gap("gap-ein-li-lechem", "אֵין לִי לֶחֶם", gloss("I don't have bread", "je n'ai pas de pain", "no tengo pan"), [
            { ...piece("ein"), blank: true },
            { ...piece("li") },
            { ...piece("lechem"), blank: true },
          ], [piece("yesh"), piece("mayim")]),
          gap("gap-yesh-lo-sefer", "יֵשׁ לוֹ סֵפֶר", gloss("he has a book", "il a un livre", "él tiene un libro"), [
            { ...piece("yesh") },
            { ...piece("lo"), blank: true },
            { ...piece("sefer") },
          ], [piece("lah"), piece("lecha")]),
          gap("gap-yesh-lah-mayim", "יֵשׁ לָהּ מַיִם", gloss("she has water", "elle a de l'eau", "ella tiene agua"), [
            { ...piece("yesh") },
            { ...piece("lah"), blank: true },
            { ...piece("mayim") },
          ], [piece("lo"), piece("bayit")]),
        ],
      },
      {
        type: "conjugate",
        items: [
          conjugate("fit-ani", "אֲנִי,", "כֶּלֶב", gloss("I have a dog", "j'ai un chien", "tengo un perro"), [
            form("fit-ani-li", "יֵשׁ לִי", "I have", "j'ai", "tengo"),
            form("fit-ani-lecha", "יֵשׁ לְךָ", "you have (masculine)", "tu as", "tienes"),
            form("fit-ani-lo", "יֵשׁ לוֹ", "he has", "il a", "él tiene"),
            form("fit-ani-lah", "יֵשׁ לָהּ", "she has", "elle a", "ella tiene"),
          ], "fit-ani-li"),
          conjugate("fit-ata", "אַתָּה,", "לֶחֶם", gloss("you have bread", "tu as du pain", "tienes pan"), [
            form("fit-ata-li", "יֵשׁ לִי", "I have", "j'ai", "tengo"),
            form("fit-ata-lecha", "יֵשׁ לְךָ", "you have (masculine)", "tu as", "tienes"),
            form("fit-ata-lach", "יֵשׁ לָךְ", "you have (feminine)", "tu as", "tienes"),
            form("fit-ata-lo", "יֵשׁ לוֹ", "he has", "il a", "él tiene"),
          ], "fit-ata-lecha"),
          conjugate("fit-at", "אַתְּ,", "מַיִם", gloss("you have water", "tu as de l'eau", "tienes agua"), [
            form("fit-at-lach", "יֵשׁ לָךְ", "you have (feminine)", "tu as", "tienes"),
            form("fit-at-lecha", "יֵשׁ לְךָ", "you have (masculine)", "tu as", "tienes"),
            form("fit-at-lah", "יֵשׁ לָהּ", "she has", "elle a", "ella tiene"),
            form("fit-at-li", "יֵשׁ לִי", "I have", "j'ai", "tengo"),
          ], "fit-at-lach"),
          conjugate("fit-hu", "הוּא,", "סֵפֶר", gloss("he has a book", "il a un livre", "él tiene un libro"), [
            form("fit-hu-lo", "יֵשׁ לוֹ", "he has", "il a", "él tiene"),
            form("fit-hu-lah", "יֵשׁ לָהּ", "she has", "elle a", "ella tiene"),
            form("fit-hu-li", "יֵשׁ לִי", "I have", "j'ai", "tengo"),
            form("fit-hu-lecha", "יֵשׁ לְךָ", "you have (masculine)", "tu as", "tienes"),
          ], "fit-hu-lo"),
          conjugate("fit-hi", "הִיא,", "בַּיִת", gloss("she has a house", "elle a une maison", "ella tiene una casa"), [
            form("fit-hi-lah", "יֵשׁ לָהּ", "she has", "elle a", "ella tiene"),
            form("fit-hi-lo", "יֵשׁ לוֹ", "he has", "il a", "él tiene"),
            form("fit-hi-li", "יֵשׁ לִי", "I have", "j'ai", "tengo"),
            form("fit-hi-lach", "יֵשׁ לָךְ", "you have (feminine)", "tu as", "tienes"),
          ], "fit-hi-lah"),
        ],
      },
      {
        type: "read",
        items: [
          reading("read-yesh-dag", "יֵשׁ דָּג", "there is a fish", "il y a un poisson", "hay un pez"),
          reading("read-ein-glida", "אֵין גְּלִידָה", "there is no ice cream", "il n'y a pas de glace", "no hay helado"),
          reading("read-yesh-li", "יֵשׁ לִי כֶּלֶב", "I have a dog", "j'ai un chien", "tengo un perro"),
          reading("read-ein-bayit", "אֵין בַּיִת", "there is no house", "il n'y a pas de maison", "no hay casa"),
        ],
      },
      {
        type: "write",
        items: [
          reading("write-sefer", "יֵשׁ סֵפֶר", "there is a book", "il y a un livre", "hay un libro"),
          reading("write-mayim", "יֵשׁ לִי מַיִם", "I have water", "j'ai de l'eau", "tengo agua"),
          reading("write-lah", "יֵשׁ לָהּ מַיִם", "she has water", "elle a de l'eau", "ella tiene agua"),
          reading("write-ein-lechem", "אֵין לִי לֶחֶם", "I don't have bread", "je n'ai pas de pain", "no tengo pan"),
        ],
      },
      {
        type: "comprehend",
        items: [
          {
            id: "ask-dog",
            hebrew: "יֵשׁ לִי כֶּלֶב",
            gloss: gloss("I have a dog", "j'ai un chien", "tengo un perro"),
            question: gloss("What do I have?", "Qu'est-ce que j'ai ?", "¿Qué tengo?"),
            choices: [
              gloss("a dog", "un chien", "un perro"),
              gloss("bread", "du pain", "pan"),
              gloss("a book", "un livre", "un libro"),
            ],
            answer: 0,
          },
          {
            id: "ask-water",
            hebrew: "אֵין מַיִם",
            gloss: gloss("there is no water", "il n'y a pas d'eau", "no hay agua"),
            question: gloss("Is there water?", "Est-ce qu'il y a de l'eau ?", "¿Hay agua?"),
            choices: [
              gloss("no", "non", "no"),
              gloss("yes", "oui", "sí"),
              gloss("I have a dog", "j'ai un chien", "tengo un perro"),
            ],
            answer: 0,
          },
          {
            id: "ask-book",
            hebrew: "יֵשׁ לוֹ סֵפֶר",
            gloss: gloss("he has a book", "il a un livre", "él tiene un libro"),
            question: gloss("Who has a book?", "Qui a un livre ?", "¿Quién tiene un libro?"),
            choices: [
              gloss("he", "lui", "él"),
              gloss("she", "elle", "ella"),
              gloss("I", "moi", "yo"),
            ],
            answer: 0,
          },
        ],
      },
      { type: "spell", items: ["yesh", "ein", "kelev", "mayim", "sefer", "bayit"].map((id) => spelled(id)) },
    ],
  },
  {
    id: "s3-l1",
    sectionId: "s3",
    index: 1,
    title: gloss("Age and numbers", "L'âge et les nombres", "La edad y los números"),
    about: gloss(
      `${he("אני בן")} for a man, ${he("אני בת")} for a woman, then the number. ${he("בן כמה אתה")} asks a man his age.`,
      `${he("אני בן")} pour un homme, ${he("אני בת")} pour une femme, puis le nombre. ${he("בן כמה אתה")} demande son âge à un homme.`,
      `${he("אני בן")} para un hombre, ${he("אני בת")} para una mujer, y luego el número. ${he("בן כמה אתה")} pregunta la edad a un hombre.`,
    ),
    mark: "בֵּן",
    knownWordIds: ["ben", "bat", "kama", ...numberIds],
    intros: [
      {
        title: gloss("Say your age", "Dire son âge", "Di tu edad"),
        body: gloss(
          `A man says ${he("אני בן")} and a woman says ${he("אני בת")}, then the number. One year is ${he("שנה")}. Two years is ${he("שנתיים")}. ${he("בן כמה אתה")} asks a man. ${he("בת כמה את")} asks a woman.`,
          `Un homme dit ${he("אני בן")} et une femme dit ${he("אני בת")}, puis le nombre. Un an se dit ${he("שנה")}. Deux ans se dit ${he("שנתיים")}. ${he("בן כמה אתה")} s'adresse à un homme. ${he("בת כמה את")} s'adresse à une femme.`,
          `Un hombre dice ${he("אני בן")} y una mujer dice ${he("אני בת")}, y luego el número. Un año es ${he("שנה")}. Dos años es ${he("שנתיים")}. ${he("בן כמה אתה")} se lo preguntas a un hombre. ${he("בת כמה את")} se lo preguntas a una mujer.`,
        ),
        samples: ageSentences.map((item) => ({ hebrew: item.hebrew, gloss: item.gloss })),
      },
      {
        title: gloss("The numbers", "Les nombres", "Los números"),
        body: gloss(
          `These are the number words that follow ${he("בן")} and ${he("בת")}. ${he("אפס")} is zero. ${he("מאה")} is one hundred.`,
          `Ce sont les nombres qui suivent ${he("בן")} et ${he("בת")}. ${he("אפס")} est zéro. ${he("מאה")} est cent.`,
          `Estos son los números que van después de ${he("בן")} y ${he("בת")}. ${he("אפס")} es cero. ${he("מאה")} es cien.`,
        ),
        samples: numberIds.map((id) => {
          const item = spoken(id);
          return { hebrew: item.hebrew, gloss: item.gloss, audio: item.audio, say: item.say };
        }),
      },
    ],
    exercises: [
      { type: "recognize-sound", items: recognizeLines(ageSentences) },
      { type: "listen-repeat", optional: true, items: ageSentences },
      { type: "spell", items: ["ben", "bat", "kama", "shalosh", "esrim", "meah", "efes", "sheva"].map((id) => spelled(id)) },
      {
        type: "compose-gap",
        items: [
          gap("gap-age-20", "אֲנִי בֵּן עֶשְׂרִים", gloss("I am 20 (masculine)", "j'ai 20 ans (masculin)", "tengo 20 años (masculino)"), [
            { ...piece("ani") },
            { ...piece("ben"), blank: true },
            { ...piece("esrim") },
          ], [piece("bat"), piece("yesh")]),
          gap("gap-age-7", "אֲנִי בַּת שֶׁבַע", gloss("I am 7 (feminine)", "j'ai 7 ans (féminin)", "tengo 7 años (femenino)"), [
            { ...piece("ani") },
            { ...piece("bat"), blank: true },
            { ...piece("sheva") },
          ], [piece("ben"), piece("shana")]),
          gap("gap-age-10", "אֲנִי בֵּן עֶשֶׂר", gloss("I am 10 (masculine)", "j'ai 10 ans (masculin)", "tengo 10 años (masculino)"), [
            { ...piece("ani") },
            { ...piece("ben") },
            { ...piece("eser"), blank: true },
          ], [piece("esrim"), piece("shalosh")]),
          gap("gap-ask-m", "בֵּן כַּמָּה אַתָּה", gloss("how old are you (masculine)", "quel âge as-tu (masculin)", "cuántos años tienes (masculino)"), [
            { ...piece("ben") },
            { ...piece("kama"), blank: true },
            { ...piece("ata") },
          ], [piece("bat"), piece("shana")]),
          gap("gap-ask-f", "בַּת כַּמָּה אַתְּ", gloss("how old are you (feminine)", "quel âge as-tu (féminin)", "cuántos años tienes (femenino)"), [
            { ...piece("bat"), blank: true },
            { ...piece("kama") },
            { ...piece("at") },
          ], [piece("ben"), piece("ata")]),
          gap("gap-age-30", "אֲנִי בַּת שְׁלוֹשִׁים", gloss("I am 30 (feminine)", "j'ai 30 ans (féminin)", "tengo 30 años (femenino)"), [
            { ...piece("ani") },
            { ...piece("bat") },
            { ...piece("shloshim"), blank: true },
          ], [piece("esrim"), piece("meah")]),
        ],
      },
      {
        type: "conjugate",
        items: [
          conjugate("age-ata", "אַתָּה", "עֶשְׂרִים", gloss("you are 20 (masculine)", "tu as 20 ans", "tienes 20 años"), [
            spoken("ben"),
            spoken("bat"),
            spoken("yesh"),
            spoken("shana"),
          ], "ben"),
          conjugate("age-at", "אַתְּ", "שֶׁבַע", gloss("you are 7 (feminine)", "tu as 7 ans", "tienes 7 años"), [
            spoken("bat"),
            spoken("ben"),
            spoken("ein"),
            spoken("kama"),
          ], "bat"),
          conjugate("age-hu", "הוּא", "שָׁנָה", gloss("he is 1", "il a 1 an", "él tiene 1 año"), [
            spoken("ben"),
            spoken("bat"),
            spoken("shnatayim"),
            spoken("eser"),
          ], "ben"),
          conjugate("age-hi", "הִיא", "שְׁלוֹשִׁים", gloss("she is 30", "elle a 30 ans", "ella tiene 30 años"), [
            spoken("bat"),
            spoken("ben"),
            spoken("esrim"),
            spoken("meah"),
          ], "bat"),
        ],
      },
      {
        type: "read",
        items: [
          reading("read-age-20", "אֲנִי בֵּן עֶשְׂרִים", "I am 20", "j'ai 20 ans", "tengo 20 años"),
          reading("read-age-7", "אֲנִי בַּת שֶׁבַע", "I am 7", "j'ai 7 ans", "tengo 7 años"),
          reading("read-ask-m", "בֵּן כַּמָּה אַתָּה", "how old are you", "quel âge as-tu", "cuántos años tienes"),
          reading("read-age-1", "אֲנִי בֵּן שָׁנָה", "I am 1", "j'ai 1 an", "tengo 1 año"),
        ],
      },
      {
        type: "write",
        items: [
          reading("write-age-10", "אֲנִי בֵּן עֶשֶׂר", "I am 10 (masculine)", "j'ai 10 ans (masculin)", "tengo 10 años (masculino)"),
          reading("write-age-30", "אֲנִי בַּת שְׁלוֹשִׁים", "I am 30 (feminine)", "j'ai 30 ans (féminin)", "tengo 30 años (femenino)"),
          reading("write-ask-f", "בַּת כַּמָּה אַתְּ", "how old are you (feminine)", "quel âge as-tu (féminin)", "cuántos años tienes (femenino)"),
          reading("write-age-2", "אֲנִי בֵּן שְׁנָתַיִם", "I am 2 (masculine)", "j'ai 2 ans (masculin)", "tengo 2 años (masculino)"),
        ],
      },
    ],
  },
  {
    id: "s3-l2",
    sectionId: "s3",
    index: 2,
    title: gloss("Ordering coffee", "Commander un café", "Pedir un café"),
    about: gloss(
      "A short exchange at a café: hello, an order, sit or take away, and card or cash.",
      "Un court échange au café : bonjour, une commande, sur place ou à emporter, carte ou espèces.",
      "Un intercambio corto en un café: hola, un pedido, aquí o para llevar, tarjeta o efectivo.",
    ),
    mark: "קָפֶה",
    knownWordIds: [
      "nishma",
      "kore",
      "efshar",
      "lehazmin",
      "bevakasha",
      "hafuch",
      "kafe",
      "kal",
      "espresso",
      "kruason",
      "ve-kruason",
      "rotze",
      "rotza",
      "rotzim",
      "rotzot",
      "ze",
      "leshevet",
      "o",
      "likachat",
      "meshalem",
      "meshalmim",
      "im",
      "ashray",
      "mezuman",
    ],
    intros: [
      {
        title: gloss("What you say", "Ce que tu dis", "Lo que dices"),
        body: gloss(
          `These are the customer's lines. ${he("אפשר")} asks if you may. ${he("בבקשה")} is please. A hafuch is a coffee with milk. ${he("קפה קר")} is a light coffee. ${he("וקרואסון")} adds a croissant.`,
          `Ce sont les phrases du client. ${he("אפשר")} demande la permission. ${he("בבקשה")} veut dire s'il vous plaît. Un hafouch est un café au lait. ${he("קפה קר")} est un café léger. ${he("וקרואסון")} ajoute un croissant.`,
          `Estas son las frases del cliente. ${he("אפשר")} pide permiso. ${he("בבקשה")} significa por favor. Un hafuj es un café con leche. ${he("קפה קר")} es un café ligero. ${he("וקרואסון")} añade un cruasán.`,
        ),
        samples: customerLines.map((item) => ({ hebrew: item.hebrew, gloss: item.gloss, audio: item.audio, say: item.say })),
      },
      {
        title: gloss("What the café says", "Ce que dit le café", "Lo que dice el café"),
        body: gloss(
          `${he("רוצה")} matches who is ordering: ${he("אתה רוצה")}, ${he("את רוצה")}, ${he("אתם רוצים")}, ${he("אתן רוצות")}. Then the café asks if it is to sit or take away, and how you are paying.`,
          `${he("רוצה")} s'accorde avec qui commande : ${he("אתה רוצה")}, ${he("את רוצה")}, ${he("אתם רוצים")}, ${he("אתן רוצות")}. Puis le café demande sur place ou à emporter, et comment tu paies.`,
          `${he("רוצה")} concuerda con quien pide: ${he("אתה רוצה")}, ${he("את רוצה")}, ${he("אתם רוצים")}, ${he("אתן רוצות")}. Luego el café pregunta si es para tomar aquí o para llevar, y cómo pagas.`,
        ),
        samples: waiterLines.map((item) => ({ hebrew: item.hebrew, gloss: item.gloss, audio: item.audio, say: item.say })),
      },
    ],
    exercises: [
      { type: "recognize-sound", items: recognizeLines([...customerLines, ...waiterLines]) },
      {
        type: "listen-repeat",
        optional: true,
        items: [customerLines[3], customerLines[4], waiterLines[2], waiterLines[7]].filter((item): item is SpokenItem => Boolean(item)),
      },
      {
        type: "compose-gap",
        items: [
          gap("gap-nishma", "מַה נִשְׁמָע", gloss("how are you", "comment ça va", "cómo estás"), [
            { ...piece("ma") },
            { ...piece("nishma"), blank: true },
          ], [piece("kore"), piece("shalom")]),
          gap("gap-order", "אֶפְשָׁר לְהַזְמִין", gloss("can I order", "puis-je commander", "puedo pedir"), [
            { ...piece("efshar") },
            { ...piece("lehazmin"), blank: true },
          ], [piece("bevakasha"), piece("kafe")]),
          gap("gap-hafuch", "אֶפְשָׁר בְּבַקָּשָׁה הָפוּךְ", gloss("can I have a hafuch please", "puis-je avoir un hafouch s'il vous plaît", "puedo pedir un hafuj por favor"), [
            { ...piece("efshar") },
            { ...piece("bevakasha") },
            { ...piece("hafuch"), blank: true },
          ], [piece("kafe"), piece("espresso")]),
          gap("gap-kal", "אֶפְשָׁר בְּבַקָּשָׁה קָפֶה קַל", gloss("can I have a light coffee please", "puis-je avoir un café léger s'il vous plaît", "puedo pedir un café ligero por favor"), [
            { ...piece("efshar") },
            { ...piece("bevakasha") },
            { ...piece("kafe") },
            { ...piece("kal"), blank: true },
          ], [piece("hafuch"), piece("kruason")]),
          gap("gap-sit", "זֶה לָשֶׁבֶת אוֹ לָקַחַת", gloss("to sit in or take away", "sur place ou à emporter", "para tomar aquí o para llevar"), [
            { ...piece("ze") },
            { ...piece("leshevet"), blank: true },
            { ...piece("o") },
            { ...piece("likachat"), blank: true },
          ], [piece("rotze"), piece("kafe")]),
          gap("gap-pay", "עִם אַשְׁרַאי אוֹ מְזוּמָן", gloss("with card or cash", "par carte ou en espèces", "con tarjeta o en efectivo"), [
            { ...piece("im") },
            { ...piece("ashray"), blank: true },
            { ...piece("o") },
            { ...piece("mezuman") },
          ], [piece("kafe"), piece("hafuch")]),
        ],
      },
      {
        type: "conjugate",
        items: [
          conjugate("want-ata", "מַה אַתָּה", "", gloss("what do you want (masculine)", "que veux-tu", "qué quieres"), [
            spoken("rotze"),
            spoken("rotza"),
            spoken("rotzim"),
            spoken("rotzot"),
          ], "rotze"),
          conjugate("want-at", "מַה אַתְּ", "", gloss("what do you want (feminine)", "que veux-tu", "qué quieres"), [
            spoken("rotza"),
            spoken("rotze"),
            spoken("rotzot"),
            spoken("rotzim"),
          ], "rotza"),
          conjugate("want-atem", "אַתֶּם", "קָפֶה", gloss("you want coffee", "vous voulez un café", "ustedes quieren café"), [
            spoken("rotzim"),
            spoken("rotze"),
            spoken("rotza"),
            spoken("rotzot"),
          ], "rotzim"),
          conjugate("pay-ata", "אֵיךְ אַתָּה", "", gloss("how are you paying (masculine)", "comment paies-tu", "cómo pagas"), [
            spoken("meshalem"),
            spoken("meshalmim"),
            spoken("rotze"),
            spoken("leshevet"),
          ], "meshalem"),
        ],
      },
      {
        type: "read",
        items: [
          reading("read-order", "אֶפְשָׁר לְהַזְמִין", "can I order", "puis-je commander", "puedo pedir"),
          reading("read-hafuch", "אֶפְשָׁר בְּבַקָּשָׁה הָפוּךְ", "can I have a hafuch please", "puis-je avoir un hafouch s'il vous plaît", "puedo pedir un hafuj por favor"),
          reading("read-pay", "עִם אַשְׁרַאי אוֹ מְזוּמָן", "with card or cash", "par carte ou en espèces", "con tarjeta o en efectivo"),
          reading("read-sit", "זֶה לָשֶׁבֶת אוֹ לָקַחַת", "to sit in or take away", "sur place ou à emporter", "para tomar aquí o para llevar"),
        ],
      },
      {
        type: "comprehend",
        items: [
          {
            id: "ask-hafuch",
            hebrew: "אֶפְשָׁר בְּבַקָּשָׁה הָפוּךְ",
            gloss: gloss("can I have a hafuch please", "puis-je avoir un hafouch", "puedo pedir un hafuj"),
            question: gloss("What does the customer want?", "Que veut le client ?", "¿Qué quiere el cliente?"),
            choices: [
              gloss("a hafuch", "un hafouch", "un hafuj"),
              gloss("cash", "des espèces", "efectivo"),
              gloss("to sit down", "s'asseoir", "sentarse"),
            ],
            answer: 0,
          },
          {
            id: "ask-pay",
            hebrew: "אֵיךְ אַתָּה מְשַׁלֵּם",
            gloss: gloss("how are you paying", "comment paies-tu", "cómo pagas"),
            question: gloss("What is the café asking?", "Que demande le café ?", "¿Qué pregunta el café?"),
            choices: [
              gloss("how you are paying", "comment tu paies", "cómo pagas"),
              gloss("what you want", "ce que tu veux", "qué quieres"),
              gloss("your name", "ton nom", "tu nombre"),
            ],
            answer: 0,
          },
          {
            id: "ask-sit",
            hebrew: "זֶה לָשֶׁבֶת אוֹ לָקַחַת",
            gloss: gloss("to sit in or take away", "sur place ou à emporter", "para tomar aquí o para llevar"),
            question: gloss("What is the choice?", "Quel est le choix ?", "¿Cuál es la opción?"),
            choices: [
              gloss("to sit or take away", "sur place ou à emporter", "aquí o para llevar"),
              gloss("card or cash", "carte ou espèces", "tarjeta o efectivo"),
              gloss("coffee or a croissant", "café ou croissant", "café o cruasán"),
            ],
            answer: 0,
          },
        ],
      },
      { type: "spell", items: ["kafe", "hafuch", "rotze", "efshar", "kal", "ze"].map((id) => spelled(id)) },
    ],
  },
];

export const section3: PathwaySection = {
  id: "s3",
  index: 3,
  title: gloss("Existential concepts", "Concepts d'existence", "Conceptos de existencia"),
  about: gloss(`${he("יש")}, age, and a café`, `${he("יש")}, l'âge et un café`, `${he("יש")}, la edad y un café`),
  levels,
  exam: {
    questions: 20,
    lives: 3,
    types: ["recognize-sound", "listen-repeat", "spell", "compose-gap", "conjugate", "read", "write", "comprehend"],
  },
};
