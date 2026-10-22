import type { Tense, Person, Gender, Number } from "./verb-conjugations";

export type TemplateSlot = "verb" | "subject" | "object";

export type SentenceTemplate = {
  id: string;
  /** Hebrew sentence with {verb}, {subject}, {object} placeholders */
  pattern: string;
  /** Which verb form is needed */
  verbRequirement: {
    tense: Tense;
    person: Person;
    gender: Gender;
    number: Number;
  };
  /** Difficulty level: 1 (beginner) to 3 (advanced) */
  level: 1 | 2 | 3;
  /** English translation pattern for clarity */
  englishPattern: string;
};

export const sentenceTemplates: SentenceTemplate[] = [
  // Level 1: Simple present tense sentences with complete objects
  {
    id: "present-masc-sing-1",
    pattern: "הוּא {verb} סֵפֶר טוֹב",
    verbRequirement: {
      tense: "present",
      person: "third",
      gender: "masculine",
      number: "singular",
    },
    level: 1,
    englishPattern: "He {verb}s a good book",
  },
  {
    id: "present-fem-sing-1",
    pattern: "הִיא {verb} מִכְתָּב לַחֲבֵרָה",
    verbRequirement: {
      tense: "present",
      person: "third",
      gender: "feminine",
      number: "singular",
    },
    level: 1,
    englishPattern: "She {verb}s a letter to her friend",
  },
  {
    id: "present-masc-plur-1",
    pattern: "הֵם {verb} עִבְרִית בָּאוּלְפָּן",
    verbRequirement: {
      tense: "present",
      person: "third",
      gender: "masculine",
      number: "plural",
    },
    level: 1,
    englishPattern: "They {verb} Hebrew at the ulpan",
  },
  {
    id: "present-fem-plur-1",
    pattern: "הֵן {verb} בַּבַּיִת כָּל יוֹם",
    verbRequirement: {
      tense: "present",
      person: "third",
      gender: "feminine",
      number: "plural",
    },
    level: 1,
    englishPattern: "They (f) {verb} at home every day",
  },
  
  // Level 2: Past tense sentences
  {
    id: "past-first-sing-1",
    pattern: "אֶתְמוֹל אֲנִי {verb} אֶת הַשִּׁעוּר בָּעֶרֶב",
    verbRequirement: {
      tense: "past",
      person: "first",
      gender: "common",
      number: "singular",
    },
    level: 2,
    englishPattern: "Yesterday I {verb}d the lesson in the evening",
  },
  {
    id: "past-second-masc-sing-1",
    pattern: "אַתָּה {verb} מִכְתָּב יָפֶה לַחֲבֵר",
    verbRequirement: {
      tense: "past",
      person: "second",
      gender: "masculine",
      number: "singular",
    },
    level: 2,
    englishPattern: "You {verb}d a nice letter to a friend",
  },
  {
    id: "past-third-masc-sing-1",
    pattern: "דָּנִי {verb} אֶת הַדֶּלֶת בַּבֹּקֶר",
    verbRequirement: {
      tense: "past",
      person: "third",
      gender: "masculine",
      number: "singular",
    },
    level: 2,
    englishPattern: "Danny {verb}d the door in the morning",
  },
  {
    id: "past-third-fem-sing-1",
    pattern: "שָׂרָה {verb} סֵפֶר חָדָשׁ בַּחֲנוּת",
    verbRequirement: {
      tense: "past",
      person: "third",
      gender: "feminine",
      number: "singular",
    },
    level: 2,
    englishPattern: "Sarah {verb}d a new book at the store",
  },
  {
    id: "past-first-plur-1",
    pattern: "אֲנַחְנוּ {verb} אֶת הַחֶדֶר לִפְנֵי הָאוֹרְחִים",
    verbRequirement: {
      tense: "past",
      person: "first",
      gender: "common",
      number: "plural",
    },
    level: 2,
    englishPattern: "We {verb}d the room before the guests",
  },
  {
    id: "past-third-plur-1",
    pattern: "הַתַּלְמִידִים {verb} בַּכִּתָּה כָּל הַיּוֹם",
    verbRequirement: {
      tense: "past",
      person: "third",
      gender: "common",
      number: "plural",
    },
    level: 2,
    englishPattern: "The students {verb}d in the class all day",
  },
  
  // Level 3: Future tense sentences
  {
    id: "future-first-sing-1",
    pattern: "מָחָר אֲנִי {verb} אֶת הַסִּפּוּר לַיְלָדִים",
    verbRequirement: {
      tense: "future",
      person: "first",
      gender: "common",
      number: "singular",
    },
    level: 3,
    englishPattern: "Tomorrow I will {verb} the story to the children",
  },
  {
    id: "future-second-masc-sing-1",
    pattern: "אַתָּה {verb} לָהּ אֶת הָאֱמֶת מָחָר",
    verbRequirement: {
      tense: "future",
      person: "second",
      gender: "masculine",
      number: "singular",
    },
    level: 3,
    englishPattern: "You will {verb} her the truth tomorrow",
  },
  {
    id: "future-second-fem-sing-1",
    pattern: "אַתְּ {verb} מִכְתָּב לַמּוֹרָה בָּעֶרֶב",
    verbRequirement: {
      tense: "future",
      person: "second",
      gender: "feminine",
      number: "singular",
    },
    level: 3,
    englishPattern: "You (f) will {verb} a letter to the teacher in the evening",
  },
  {
    id: "future-third-masc-sing-1",
    pattern: "הוּא {verb} אֶת הַבַּיִת בַּקַּיִץ",
    verbRequirement: {
      tense: "future",
      person: "third",
      gender: "masculine",
      number: "singular",
    },
    level: 3,
    englishPattern: "He will {verb} the house in the summer",
  },
  {
    id: "future-third-fem-sing-1",
    pattern: "הִיא {verb} לְיוֹסֵף עַל הַמְּסִבָּה מָחָר",
    verbRequirement: {
      tense: "future",
      person: "third",
      gender: "feminine",
      number: "singular",
    },
    level: 3,
    englishPattern: "She will {verb} Yosef about the party tomorrow",
  },
  {
    id: "future-first-plur-1",
    pattern: "אֲנַחְנוּ {verb} אֶת הַמִּשְׂרָד בְּשָׁבוּעַ הַבָּא",
    verbRequirement: {
      tense: "future",
      person: "first",
      gender: "common",
      number: "plural",
    },
    level: 3,
    englishPattern: "We will {verb} the office next week",
  },
  {
    id: "future-second-plur-1",
    pattern: "אַתֶּם {verb} אֶת הַקּוּפְסָאוֹת בַּמַּחְסָן",
    verbRequirement: {
      tense: "future",
      person: "second",
      gender: "common",
      number: "plural",
    },
    level: 3,
    englishPattern: "You (pl) will {verb} the boxes in the warehouse",
  },
  {
    id: "future-third-plur-1",
    pattern: "הֵם {verb} בַּפַּרְלָמֶנְט עַל הַחֹק",
    verbRequirement: {
      tense: "future",
      person: "third",
      gender: "common",
      number: "plural",
    },
    level: 3,
    englishPattern: "They will {verb} in the parliament about the law",
  },
];
