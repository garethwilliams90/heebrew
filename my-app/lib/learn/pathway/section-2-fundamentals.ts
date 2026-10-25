import { normalizeHebrew } from "@/lib/learn/hebrew-text";
import { seededOrder } from "@/lib/learn/pathway/order";
import { gloss, type GapItem, type GapPiece, type Gloss, type PathwayLevel, type PathwaySection, type RecognizeItem, type SpellItem, type SpokenItem } from "@/lib/learn/pathway/types";
import { requireWord } from "@/lib/learn/words/catalog";

const otherVowels = gloss("different vowels", "autres voyelles", "otras vocales");

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
  const extra = [..."אבגדהוז"].filter((letter) => !needed.includes(letter));
  return { prompt: item, letters: seededOrder([...needed, ...extra.slice(0, 3)], id) };
}

function recognizeIds(ids: readonly string[]): RecognizeItem[] {
  return ids.map((id) => {
    const others = seededOrder(
      ids.filter((item) => item !== id),
      id,
    ).slice(0, 2);
    return {
      prompt: spoken(id),
      choices: seededOrder([id, ...others], `${id}-set`).map((choice) => spoken(choice)),
    };
  });
}

function line(id: string, hebrew: string, en: string, fr: string, es: string, audio?: string): SpokenItem {
  return { id, hebrew, say: hebrew, gloss: gloss(en, fr, es), audio };
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

const twoLetter: RecognizeItem[] = [
  {
    prompt: spoken("av"),
    choices: seededOrder(
      [spoken("av"), { id: "av-eh", hebrew: "אֵב", gloss: otherVowels }, { id: "av-oh", hebrew: "אֹב", gloss: otherVowels }],
      "av-hear",
    ),
  },
  {
    prompt: spoken("ba"),
    choices: seededOrder(
      [spoken("ba"), { id: "ba-eh", hebrew: "בֵּא", gloss: otherVowels }, { id: "ba-ee", hebrew: "בִּא", gloss: otherVowels }],
      "ba-hear",
    ),
  },
  {
    prompt: spoken("gag"),
    choices: seededOrder(
      [spoken("gag"), { id: "gag-eh", hebrew: "גֶּג", gloss: otherVowels }, { id: "gag-oh", hebrew: "גֹּג", gloss: otherVowels }],
      "gag-hear",
    ),
  },
  {
    prompt: spoken("dag"),
    choices: seededOrder(
      [spoken("dag"), { id: "dag-eh", hebrew: "דֵּג", gloss: otherVowels }, { id: "dag-ee", hebrew: "דִּג", gloss: otherVowels }],
      "dag-hear",
    ),
  },
  {
    prompt: spoken("bad"),
    choices: seededOrder(
      [spoken("bad"), { id: "bad-eh", hebrew: "בֵּד", gloss: otherVowels }, { id: "bad-oh", hebrew: "בֹּד", gloss: otherVowels }],
      "bad-hear",
    ),
  },
];

const pronouns = ["ani", "ata", "anachnu", "atem", "aten", "hu", "hi"] as const;

const helloLines = [
  line("hi-shalom", "שָׁלוֹם", "hello", "bonjour", "hola", requireWord("shalom").audio ?? undefined),
  line("hi-dan", "אָנִי דָּן", "I am Dan", "je suis Dan", "soy Dan"),
  line("hi-england", "אָנִי מֵאַנְגְּלִיָּה", "I am from England", "je viens d'Angleterre", "soy de Inglaterra"),
  line("hi-name", "קוֹרְאִים לִי דָּן", "my name is Dan", "je m'appelle Dan", "me llamo Dan"),
  line("hi-live-m", "אֵיפֹה אַתָּה גָּר", "where do you live (masculine)", "où habites-tu", "dónde vives"),
  line("hi-live-f", "אֵיפֹה אַתְּ גָּרָה", "where do you live (feminine)", "où habites-tu", "dónde vives"),
  line("hi-from-m", "מֵאֵיפֹה אַתָּה", "where are you from (masculine)", "d'où viens-tu", "de dónde eres"),
  line("hi-from-f", "מֵאֵיפֹה אַתְּ", "where are you from (feminine)", "d'où viens-tu", "de dónde eres"),
];

const howLines = [
  spoken("mah-shlomcha"),
  spoken("mah-shlomech"),
  line("how-ata", "אֵיךְ אַתָּה", "how are you (masculine)", "comment vas-tu", "cómo estás"),
  line("how-at", "אֵיךְ אַתְּ", "how are you (feminine)", "comment vas-tu", "cómo estás"),
];

const likeLines = [
  spoken("leehov"),
  spoken("ohev"),
  spoken("ohevet"),
  spoken("ohavim"),
  spoken("ohavot"),
  line("like-ice", "אָנִי אוֹהֵב גְּלִידָה", "I like ice cream", "j'aime la glace", "me gusta el helado"),
  line("like-fish", "הִיא אוֹהֶבֶת אֵת הַדָּג", "she likes the fish", "elle aime le poisson", "a ella le gusta el pez"),
];

const loveForms: { hebrew: string; en: string; fr: string; es: string }[] = [
  { hebrew: "אָנִי אוֹהֵב", en: "I love (masculine)", fr: "j'aime (masculin)", es: "amo (masculino)" },
  { hebrew: "אָנִי אוֹהֶבֶת", en: "I love (feminine)", fr: "j'aime (féminin)", es: "amo (femenino)" },
  { hebrew: "אַתָּה אוֹהֵב", en: "you love (masculine)", fr: "tu aimes (masculin)", es: "amas (masculino)" },
  { hebrew: "אַתְּ אוֹהֶבֶת", en: "you love (feminine)", fr: "tu aimes (féminin)", es: "amas (femenino)" },
  { hebrew: "הוּא אוֹהֵב", en: "he loves", fr: "il aime", es: "él ama" },
  { hebrew: "הִיא אוֹהֶבֶת", en: "she loves", fr: "elle aime", es: "ella ama" },
  { hebrew: "אֲנַחְנוּ אוֹהֲבִים", en: "we love (masculine plural)", fr: "nous aimons (masculin)", es: "amamos (masculino)" },
  { hebrew: "אֲנַחְנוּ אוֹהֲבוֹת", en: "we love (feminine plural)", fr: "nous aimons (féminin)", es: "amamos (femenino)" },
  { hebrew: "אַתֶּם אוֹהֲבִים", en: "you love (masculine plural)", fr: "vous aimez (masculin)", es: "amáis (masculino)" },
  { hebrew: "אַתֶּן אוֹהֲבוֹת", en: "you love (feminine plural)", fr: "vous aimez (féminin)", es: "amáis (femenino)" },
  { hebrew: "הֵם אוֹהֲבִים", en: "they love (masculine plural)", fr: "ils aiment", es: "ellos aman" },
  { hebrew: "הֵן אוֹהֲבוֹת", en: "they love (feminine plural)", fr: "elles aiment", es: "ellas aman" },
];

function samples(ids: readonly string[]) {
  return ids.map((id) => {
    const item = spoken(id);
    return { hebrew: item.hebrew, gloss: item.gloss, audio: item.audio, say: item.say };
  });
}

const levels: readonly PathwayLevel[] = [
  {
    id: "s2-l0",
    sectionId: "s2",
    index: 0,
    title: gloss("Two-letter words", "Mots de deux lettres", "Palabras de dos letras"),
    about: gloss(
      "Build words from the letters you know: father, comes, roof, fish, and cloth.",
      "Forme des mots avec les lettres connues : père, vient, toit, poisson et tissu.",
      "Forma palabras con las letras que conoces: padre, viene, techo, pez y tela.",
    ),
    mark: "אָב",
    knownWordIds: ["av", "ba", "gag", "dag", "bad"],
    intros: [
      {
        title: gloss("Two letters already say something", "Deux lettres disent déjà quelque chose", "Dos letras ya dicen algo"),
        body: gloss(
          "These words use only א through ה. Listen, then match the vowels you hear.",
          "Ces mots n'utilisent que א à ה. Écoute, puis retrouve les voyelles.",
          "Estas palabras solo usan de א a ה. Escucha y encuentra las vocales.",
        ),
        samples: samples(["av", "ba", "gag", "dag", "bad"]),
      },
    ],
    exercises: [
      { type: "nikud-drop", letterIds: ["aleph", "bet", "gimel", "dalet", "he"] },
      { type: "recognize-sound", items: twoLetter },
      { type: "listen-repeat", optional: true, items: ["av", "ba", "gag", "dag", "bad"].map((id) => spoken(id)) },
    ],
  },
  {
    id: "s2-l1",
    sectionId: "s2",
    index: 1,
    title: gloss("Pronouns", "Pronoms", "Pronombres"),
    about: gloss(
      "I, you, we, he, and she.",
      "Je, tu, nous, il et elle.",
      "Yo, tú, nosotros, él y ella.",
    ),
    mark: "אֲנִי",
    knownWordIds: [...pronouns],
    intros: [
      {
        title: gloss("Who is speaking?", "Qui parle ?", "¿Quién habla?"),
        body: gloss(
          "A pronoun tells you who does the action. You will hear each one, then spell it.",
          "Un pronom dit qui fait l'action. Tu vas entendre chacun, puis l'écrire.",
          "Un pronombre dice quién hace la acción. Oirás cada uno y luego lo escribirás.",
        ),
        samples: samples(pronouns),
      },
    ],
    exercises: [
      { type: "recognize-sound", items: recognizeIds(pronouns) },
      { type: "listen-repeat", optional: true, items: pronouns.map((id) => spoken(id)) },
      { type: "spell", items: pronouns.map((id) => spelled(id)) },
    ],
  },
  {
    id: "s2-l2",
    sectionId: "s2",
    index: 2,
    title: gloss("Introduce yourself", "Se présenter", "Preséntate"),
    about: gloss(
      "Hello, your name, where you are from, and where you live.",
      "Bonjour, ton nom, d'où tu viens et où tu habites.",
      "Hola, tu nombre, de dónde eres y dónde vives.",
    ),
    mark: "שָׁלוֹם",
    knownWordIds: ["shalom", "dan", "me-anglia", "anglia", "korim", "li", "eifo", "at", "gar", "gara", "me-eifo"],
    intros: [
      {
        title: gloss("Say hello", "Dire bonjour", "Di hola"),
        body: gloss(
          "דָּן stands in for a name. The icons show who the sentence is about.",
          "דָּן remplace un prénom. Les icônes montrent de qui parle la phrase.",
          "דָּן ocupa el lugar de un nombre. Los iconos muestran de quién habla la frase.",
        ),
        samples: helloLines.map((item) => ({ hebrew: item.hebrew, gloss: item.gloss, audio: item.audio, say: item.say })),
      },
    ],
    exercises: [
      { type: "recognize-sound", items: recognizeLines(helloLines) },
      { type: "listen-repeat", optional: true, items: helloLines },
      { type: "spell", items: ["shalom", "ani", "eifo", "gar", "dan"].map((id) => spelled(id)) },
      {
        type: "compose-gap",
        items: [
          gap("gap-dan", "אָנִי דָּן", gloss("I am Dan", "je suis Dan", "soy Dan"), [
            { ...piece("ani") },
            { ...piece("dan"), blank: true },
          ], [piece("shalom"), piece("gar")]),
          gap("gap-england", "אָנִי מֵאַנְגְּלִיָּה", gloss("I am from England", "je viens d'Angleterre", "soy de Inglaterra"), [
            { ...piece("ani") },
            { ...piece("me-anglia"), blank: true },
          ], [piece("glida"), piece("eifo")]),
          gap("gap-name", "קוֹרְאִים לִי דָּן", gloss("my name is Dan", "je m'appelle Dan", "me llamo Dan"), [
            { ...piece("korim") },
            { ...piece("li"), blank: true },
            { ...piece("dan") },
          ], [piece("ani"), piece("ata")]),
          gap("gap-live", "אֵיפֹה אַתָּה גָּר", gloss("where do you live", "où habites-tu", "dónde vives"), [
            { ...piece("eifo") },
            { ...piece("ata") },
            { ...piece("gar"), blank: true },
          ], [piece("gara"), piece("ohev")]),
          gap("gap-from", "מֵאֵיפֹה אַתְּ", gloss("where are you from", "d'où viens-tu", "de dónde eres"), [
            { ...piece("me-eifo") },
            { ...piece("at"), blank: true },
          ], [piece("ata"), piece("hu")]),
        ],
      },
    ],
  },
  {
    id: "s2-l3",
    sectionId: "s2",
    index: 3,
    title: gloss("How are you?", "Comment vas-tu ?", "¿Cómo estás?"),
    about: gloss(
      "מה שלומך and איך אתה.",
      "מה שלומך et איך אתה.",
      "מה שלומך e איך אתה.",
    ),
    mark: "מַה",
    knownWordIds: ["mah-shlomcha", "mah-shlomech", "shlomcha", "shlomech", "eich", "ma"],
    intros: [
      {
        title: gloss("Ask how someone is", "Demander des nouvelles", "Pregunta cómo está"),
        body: gloss(
          "שְׁלוֹמְךָ and שְׁלוֹמֵךְ ask how someone is. אֵיךְ אַתָּה and אֵיךְ אַתְּ ask the same thing.",
          "שְׁלוֹמְךָ et שְׁלוֹמֵךְ prennent des nouvelles. אֵיךְ אַתָּה et אֵיךְ אַתְּ posent la même question.",
          "שְׁלוֹמְךָ y שְׁלוֹמֵךְ preguntan cómo está alguien. אֵיךְ אַתָּה y אֵיךְ אַתְּ preguntan lo mismo.",
        ),
        samples: howLines.map((item) => ({ hebrew: item.hebrew, gloss: item.gloss, audio: item.audio, say: item.say })),
      },
    ],
    exercises: [
      { type: "recognize-sound", items: recognizeLines(howLines) },
      { type: "listen-repeat", optional: true, items: howLines },
      { type: "spell", items: ["eich", "ma", "ata", "at"].map((id) => spelled(id)) },
      {
        type: "compose-gap",
        items: [
          gap("gap-shlomcha", "מַה שְׁלוֹמְךָ", gloss("how are you (masculine)", "comment vas-tu", "cómo estás"), [
            { ...piece("ma") },
            { ...piece("shlomcha"), blank: true },
          ], [piece("shlomech"), piece("eifo")]),
          gap("gap-how-m", "אֵיךְ אַתָּה", gloss("how are you (masculine)", "comment vas-tu", "cómo estás"), [
            { ...piece("eich") },
            { ...piece("ata"), blank: true },
          ], [piece("at"), piece("ani")]),
          gap("gap-how-f", "אֵיךְ אַתְּ", gloss("how are you (feminine)", "comment vas-tu", "cómo estás"), [
            { ...piece("eich") },
            { ...piece("at"), blank: true },
          ], [piece("ata"), piece("hi")]),
        ],
      },
    ],
  },
  {
    id: "s2-l4",
    sectionId: "s2",
    index: 4,
    title: gloss("I like", "J'aime", "Me gusta"),
    about: gloss(
      "The present tense of לאהוב, and when a sentence needs את ה.",
      "Le présent de לאהוב, et quand une phrase prend את ה.",
      "El presente de לאהוב, y cuándo una frase lleva את ה.",
    ),
    mark: "אוֹהֵב",
    knownWordIds: ["leehov", "ohev", "ohevet", "ohavim", "ohavot", "glida", "et", "ha", "hadag", "hem", "hen"],
    intros: [
      {
        title: gloss("To love is לאהוב", "Aimer se dit לאהוב", "Amar se dice לאהוב"),
        body: gloss(
          "The infinitive is the to-form. The present changes with who is speaking.",
          "L'infinitif est la forme « aimer ». Le présent change selon qui parle.",
          "El infinitivo es la forma « amar ». El presente cambia según quién habla.",
        ),
        samples: loveForms.map((item) => ({ hebrew: item.hebrew, gloss: gloss(item.en, item.fr, item.es) })),
      },
      {
        title: gloss("את ה marks the", "את ה marque le défini", "את ה marca lo definido"),
        body: gloss(
          "Ice cream here is indefinite, so there is no את. The fish is definite, so the sentence takes את plus ה.",
          "La glace ici est indéfinie, donc pas de את. Le poisson est défini, donc la phrase prend את plus ה.",
          "El helado aquí es indefinido, así que no hay את. El pez es definido, así que la frase lleva את más ה.",
        ),
        samples: [
          { hebrew: "אָנִי אוֹהֵב גְּלִידָה", gloss: gloss("I like ice cream", "j'aime la glace", "me gusta el helado") },
          { hebrew: "הִיא אוֹהֶבֶת אֵת הַדָּג", gloss: gloss("she likes the fish", "elle aime le poisson", "a ella le gusta el pez") },
        ],
      },
    ],
    exercises: [
      { type: "recognize-sound", items: recognizeLines(likeLines) },
      { type: "listen-repeat", optional: true, items: likeLines },
      { type: "spell", items: ["ohev", "ohevet", "leehov", "glida"].map((id) => spelled(id)) },
      {
        type: "compose-gap",
        items: [
          gap("gap-ice", "אָנִי אוֹהֵב גְּלִידָה", gloss("I like ice cream", "j'aime la glace", "me gusta el helado"), [
            { ...piece("ani") },
            { ...piece("ohev"), blank: true },
            { ...piece("glida") },
          ], [piece("ohevet"), piece("ohavim"), piece("gar")]),
          gap("gap-fish", "הִיא אוֹהֶבֶת אֵת הַדָּג", gloss("she likes the fish", "elle aime le poisson", "a ella le gusta el pez"), [
            { ...piece("hi") },
            { ...piece("ohevet"), blank: true },
            { ...piece("et") },
            { ...piece("hadag") },
          ], [piece("ohev"), piece("gara"), piece("ohavot")]),
        ],
      },
      {
        type: "read",
        items: [
          {
            id: "read-ice",
            hebrew: "אָנִי אוֹהֵב גְּלִידָה",
            gloss: gloss("I like ice cream", "j'aime la glace", "me gusta el helado"),
          },
          {
            id: "read-fish",
            hebrew: "הִיא אוֹהֶבֶת אֵת הַדָּג",
            gloss: gloss("she likes the fish", "elle aime le poisson", "a ella le gusta el pez"),
          },
        ],
      },
    ],
  },
];

export const section2: PathwaySection = {
  id: "s2",
  index: 2,
  title: gloss("Hebrew 101", "Hébreu 101", "Hebreo 101"),
  about: gloss("Fundamentals", "Les bases", "Fundamentos"),
  levels,
  exam: {
    questions: 20,
    lives: 3,
    types: ["nikud-drop", "recognize-sound", "listen-repeat", "spell", "compose-gap", "read"],
  },
};
