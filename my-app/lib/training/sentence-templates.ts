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
  // Level 1: Simple present tense sentences
  {
    id: "present-masc-sing-1",
    pattern: "הוּא {verb} סֵפֶר",
    verbRequirement: {
      tense: "present",
      person: "third",
      gender: "masculine",
      number: "singular",
    },
    level: 1,
    englishPattern: "He {verb} a book",
  },
  {
    id: "present-fem-sing-1",
    pattern: "הִיא {verb} מִכְתָּב",
    verbRequirement: {
      tense: "present",
      person: "third",
      gender: "feminine",
      number: "singular",
    },
    level: 1,
    englishPattern: "She {verb} a letter",
  },
  {
    id: "present-masc-plur-1",
    pattern: "הֵם {verb} עִבְרִית",
    verbRequirement: {
      tense: "present",
      person: "third",
      gender: "masculine",
      number: "plural",
    },
    level: 1,
    englishPattern: "They {verb} Hebrew",
  },
  {
    id: "present-fem-plur-1",
    pattern: "הֵן {verb} בַּבַּיִת",
    verbRequirement: {
      tense: "present",
      person: "third",
      gender: "feminine",
      number: "plural",
    },
    level: 1,
    englishPattern: "They (f) {verb} at home",
  },
  
  // Level 2: Past tense sentences
  {
    id: "past-first-sing-1",
    pattern: "אֶתְמוֹל אֲנִי {verb} אֶת הַשִּׁעוּר",
    verbRequirement: {
      tense: "past",
      person: "first",
      gender: "common",
      number: "singular",
    },
    level: 2,
    englishPattern: "Yesterday I {verb} the lesson",
  },
  {
    id: "past-second-masc-sing-1",
    pattern: "אַתָּה {verb} מִכְתָּב לַחֲבֵר",
    verbRequirement: {
      tense: "past",
      person: "second",
      gender: "masculine",
      number: "singular",
    },
    level: 2,
    englishPattern: "You {verb} a letter to a friend",
  },
  {
    id: "past-third-masc-sing-1",
    pattern: "דָּנִי {verb} אֶת הַדֶּלֶת",
    verbRequirement: {
      tense: "past",
      person: "third",
      gender: "masculine",
      number: "singular",
    },
    level: 2,
    englishPattern: "Danny {verb} the door",
  },
  {
    id: "past-third-fem-sing-1",
    pattern: "שָׂרָה {verb} סֵפֶר חָדָשׁ",
    verbRequirement: {
      tense: "past",
      person: "third",
      gender: "feminine",
      number: "singular",
    },
    level: 2,
    englishPattern: "Sarah {verb} a new book",
  },
  {
    id: "past-first-plur-1",
    pattern: "אֲנַחְנוּ {verb} אֶת הַחֶדֶר",
    verbRequirement: {
      tense: "past",
      person: "first",
      gender: "common",
      number: "plural",
    },
    level: 2,
    englishPattern: "We {verb} the room",
  },
  {
    id: "past-third-plur-1",
    pattern: "הַתַּלְמִידִים {verb} בַּכִּתָּה",
    verbRequirement: {
      tense: "past",
      person: "third",
      gender: "common",
      number: "plural",
    },
    level: 2,
    englishPattern: "The students {verb} in the class",
  },
  
  // Level 3: Future tense sentences
  {
    id: "future-first-sing-1",
    pattern: "מָחָר אֲנִי {verb} אֶת הַסִּפּוּר",
    verbRequirement: {
      tense: "future",
      person: "first",
      gender: "common",
      number: "singular",
    },
    level: 3,
    englishPattern: "Tomorrow I will {verb} the story",
  },
  {
    id: "future-second-masc-sing-1",
    pattern: "אַתָּה {verb} לָהּ אֶת הָאֱמֶת",
    verbRequirement: {
      tense: "future",
      person: "second",
      gender: "masculine",
      number: "singular",
    },
    level: 3,
    englishPattern: "You will {verb} her the truth",
  },
  {
    id: "future-second-fem-sing-1",
    pattern: "אַתְּ {verb} מִכְתָּב לַמּוֹרָה",
    verbRequirement: {
      tense: "future",
      person: "second",
      gender: "feminine",
      number: "singular",
    },
    level: 3,
    englishPattern: "You (f) will {verb} a letter to the teacher",
  },
  {
    id: "future-third-masc-sing-1",
    pattern: "הוּא {verb} אֶת הַבַּיִת",
    verbRequirement: {
      tense: "future",
      person: "third",
      gender: "masculine",
      number: "singular",
    },
    level: 3,
    englishPattern: "He will {verb} the house",
  },
  {
    id: "future-third-fem-sing-1",
    pattern: "הִיא {verb} לְיוֹסֵף עַל הַמְּסִבָּה",
    verbRequirement: {
      tense: "future",
      person: "third",
      gender: "feminine",
      number: "singular",
    },
    level: 3,
    englishPattern: "She will {verb} Yosef about the party",
  },
  {
    id: "future-first-plur-1",
    pattern: "אֲנַחְנוּ {verb} אֶת הַמִּשְׂרָד",
    verbRequirement: {
      tense: "future",
      person: "first",
      gender: "common",
      number: "plural",
    },
    level: 3,
    englishPattern: "We will {verb} the office",
  },
  {
    id: "future-second-plur-1",
    pattern: "אַתֶּם {verb} אֶת הַקּוּפְסָאוֹת",
    verbRequirement: {
      tense: "future",
      person: "second",
      gender: "common",
      number: "plural",
    },
    level: 3,
    englishPattern: "You (pl) will {verb} the boxes",
  },
  {
    id: "future-third-plur-1",
    pattern: "הֵם {verb} בַּפַּרְלָמֶנְט",
    verbRequirement: {
      tense: "future",
      person: "third",
      gender: "common",
      number: "plural",
    },
    level: 3,
    englishPattern: "They will {verb} in the parliament",
  },
];
