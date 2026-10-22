export type Binyan = "paal" | "piel" | "hifil";
export type Tense = "past" | "present" | "future";
export type Person = "first" | "second" | "third";
export type Gender = "masculine" | "feminine" | "common";
export type Number = "singular" | "plural";

export type ConjugatedForm = {
  hebrew: string;
  tense: Tense;
  person: Person;
  gender: Gender;
  number: Number;
};

export type VerbRecord = {
  infinitive: string;
  root: string;
  binyan: Binyan;
  english: string;
  forms: ConjugatedForm[];
};

// Helper to create conjugated forms
function form(
  hebrew: string,
  tense: Tense,
  person: Person,
  gender: Gender,
  number: Number,
): ConjugatedForm {
  return { hebrew, tense, person, gender, number };
}

export const verbConjugations: VerbRecord[] = [
  // PA'AL VERBS
  {
    infinitive: "לִכְתֹּב",
    root: "כ-ת-ב",
    binyan: "paal",
    english: "write",
    forms: [
      // Past
      form("כָּתַבְתִּי", "past", "first", "common", "singular"),
      form("כָּתַבְתָּ", "past", "second", "masculine", "singular"),
      form("כָּתַבְתְּ", "past", "second", "feminine", "singular"),
      form("כָּתַב", "past", "third", "masculine", "singular"),
      form("כָּתְבָה", "past", "third", "feminine", "singular"),
      form("כָּתַבְנוּ", "past", "first", "common", "plural"),
      form("כְּתַבְתֶּם", "past", "second", "masculine", "plural"),
      form("כְּתַבְתֶּן", "past", "second", "feminine", "plural"),
      form("כָּתְבוּ", "past", "third", "common", "plural"),
      // Present
      form("כּוֹתֵב", "present", "third", "masculine", "singular"),
      form("כּוֹתֶבֶת", "present", "third", "feminine", "singular"),
      form("כּוֹתְבִים", "present", "third", "masculine", "plural"),
      form("כּוֹתְבוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֶכְתֹּב", "future", "first", "common", "singular"),
      form("תִּכְתֹּב", "future", "second", "masculine", "singular"),
      form("תִּכְתְּבִי", "future", "second", "feminine", "singular"),
      form("יִכְתֹּב", "future", "third", "masculine", "singular"),
      form("תִּכְתֹּב", "future", "third", "feminine", "singular"),
      form("נִכְתֹּב", "future", "first", "common", "plural"),
      form("תִּכְתְּבוּ", "future", "second", "common", "plural"),
      form("יִכְתְּבוּ", "future", "third", "common", "plural"),
    ],
  },
  {
    infinitive: "לִשְׁמֹר",
    root: "ש-מ-ר",
    binyan: "paal",
    english: "guard",
    forms: [
      // Past
      form("שָׁמַרְתִּי", "past", "first", "common", "singular"),
      form("שָׁמַרְתָּ", "past", "second", "masculine", "singular"),
      form("שָׁמַרְתְּ", "past", "second", "feminine", "singular"),
      form("שָׁמַר", "past", "third", "masculine", "singular"),
      form("שָׁמְרָה", "past", "third", "feminine", "singular"),
      form("שָׁמַרְנוּ", "past", "first", "common", "plural"),
      form("שְׁמַרְתֶּם", "past", "second", "masculine", "plural"),
      form("שְׁמַרְתֶּן", "past", "second", "feminine", "plural"),
      form("שָׁמְרוּ", "past", "third", "common", "plural"),
      // Present
      form("שׁוֹמֵר", "present", "third", "masculine", "singular"),
      form("שׁוֹמֶרֶת", "present", "third", "feminine", "singular"),
      form("שׁוֹמְרִים", "present", "third", "masculine", "plural"),
      form("שׁוֹמְרוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֶשְׁמֹר", "future", "first", "common", "singular"),
      form("תִּשְׁמֹר", "future", "second", "masculine", "singular"),
      form("תִּשְׁמְרִי", "future", "second", "feminine", "singular"),
      form("יִשְׁמֹר", "future", "third", "masculine", "singular"),
      form("תִּשְׁמֹר", "future", "third", "feminine", "singular"),
      form("נִשְׁמֹר", "future", "first", "common", "plural"),
      form("תִּשְׁמְרוּ", "future", "second", "common", "plural"),
      form("יִשְׁמְרוּ", "future", "third", "common", "plural"),
    ],
  },
  {
    infinitive: "לִלְבֹּשׁ",
    root: "ל-ב-ש",
    binyan: "paal",
    english: "wear",
    forms: [
      // Past
      form("לָבַשְׁתִּי", "past", "first", "common", "singular"),
      form("לָבַשְׁתָּ", "past", "second", "masculine", "singular"),
      form("לָבַשְׁתְּ", "past", "second", "feminine", "singular"),
      form("לָבַשׁ", "past", "third", "masculine", "singular"),
      form("לָבְשָׁה", "past", "third", "feminine", "singular"),
      form("לָבַשְׁנוּ", "past", "first", "common", "plural"),
      form("לְבַשְׁתֶּם", "past", "second", "masculine", "plural"),
      form("לְבַשְׁתֶּן", "past", "second", "feminine", "plural"),
      form("לָבְשׁוּ", "past", "third", "common", "plural"),
      // Present
      form("לוֹבֵשׁ", "present", "third", "masculine", "singular"),
      form("לוֹבֶשֶׁת", "present", "third", "feminine", "singular"),
      form("לוֹבְשִׁים", "present", "third", "masculine", "plural"),
      form("לוֹבְשׁוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֶלְבַּשׁ", "future", "first", "common", "singular"),
      form("תִּלְבַּשׁ", "future", "second", "masculine", "singular"),
      form("תִּלְבְּשִׁי", "future", "second", "feminine", "singular"),
      form("יִלְבַּשׁ", "future", "third", "masculine", "singular"),
      form("תִּלְבַּשׁ", "future", "third", "feminine", "singular"),
      form("נִלְבַּשׁ", "future", "first", "common", "plural"),
      form("תִּלְבְּשׁוּ", "future", "second", "common", "plural"),
      form("יִלְבְּשׁוּ", "future", "third", "common", "plural"),
    ],
  },
  // PI'EL VERBS
  {
    infinitive: "לְדַבֵּר",
    root: "ד-ב-ר",
    binyan: "piel",
    english: "speak",
    forms: [
      // Past
      form("דִּבַּרְתִּי", "past", "first", "common", "singular"),
      form("דִּבַּרְתָּ", "past", "second", "masculine", "singular"),
      form("דִּבַּרְתְּ", "past", "second", "feminine", "singular"),
      form("דִּבֵּר", "past", "third", "masculine", "singular"),
      form("דִּבְּרָה", "past", "third", "feminine", "singular"),
      form("דִּבַּרְנוּ", "past", "first", "common", "plural"),
      form("דִּבַּרְתֶּם", "past", "second", "masculine", "plural"),
      form("דִּבַּרְתֶּן", "past", "second", "feminine", "plural"),
      form("דִּבְּרוּ", "past", "third", "common", "plural"),
      // Present
      form("מְדַבֵּר", "present", "third", "masculine", "singular"),
      form("מְדַבֶּרֶת", "present", "third", "feminine", "singular"),
      form("מְדַבְּרִים", "present", "third", "masculine", "plural"),
      form("מְדַבְּרוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֲדַבֵּר", "future", "first", "common", "singular"),
      form("תְּדַבֵּר", "future", "second", "masculine", "singular"),
      form("תְּדַבְּרִי", "future", "second", "feminine", "singular"),
      form("יְדַבֵּר", "future", "third", "masculine", "singular"),
      form("תְּדַבֵּר", "future", "third", "feminine", "singular"),
      form("נְדַבֵּר", "future", "first", "common", "plural"),
      form("תְּדַבְּרוּ", "future", "second", "common", "plural"),
      form("יְדַבְּרוּ", "future", "third", "common", "plural"),
    ],
  },
  {
    infinitive: "לְשַׁבֵּר",
    root: "ש-ב-ר",
    binyan: "piel",
    english: "break",
    forms: [
      // Past
      form("שִׁבַּרְתִּי", "past", "first", "common", "singular"),
      form("שִׁבַּרְתָּ", "past", "second", "masculine", "singular"),
      form("שִׁבַּרְתְּ", "past", "second", "feminine", "singular"),
      form("שִׁבֵּר", "past", "third", "masculine", "singular"),
      form("שִׁבְּרָה", "past", "third", "feminine", "singular"),
      form("שִׁבַּרְנוּ", "past", "first", "common", "plural"),
      form("שִׁבַּרְתֶּם", "past", "second", "masculine", "plural"),
      form("שִׁבַּרְתֶּן", "past", "second", "feminine", "plural"),
      form("שִׁבְּרוּ", "past", "third", "common", "plural"),
      // Present
      form("מְשַׁבֵּר", "present", "third", "masculine", "singular"),
      form("מְשַׁבֶּרֶת", "present", "third", "feminine", "singular"),
      form("מְשַׁבְּרִים", "present", "third", "masculine", "plural"),
      form("מְשַׁבְּרוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֲשַׁבֵּר", "future", "first", "common", "singular"),
      form("תְּשַׁבֵּר", "future", "second", "masculine", "singular"),
      form("תְּשַׁבְּרִי", "future", "second", "feminine", "singular"),
      form("יְשַׁבֵּר", "future", "third", "masculine", "singular"),
      form("תְּשַׁבֵּר", "future", "third", "feminine", "singular"),
      form("נְשַׁבֵּר", "future", "first", "common", "plural"),
      form("תְּשַׁבְּרוּ", "future", "second", "common", "plural"),
      form("יְשַׁבְּרוּ", "future", "third", "common", "plural"),
    ],
  },
  {
    infinitive: "לְסַדֵּר",
    root: "ס-ד-ר",
    binyan: "piel",
    english: "arrange",
    forms: [
      // Past
      form("סִדַּרְתִּי", "past", "first", "common", "singular"),
      form("סִדַּרְתָּ", "past", "second", "masculine", "singular"),
      form("סִדַּרְתְּ", "past", "second", "feminine", "singular"),
      form("סִדֵּר", "past", "third", "masculine", "singular"),
      form("סִדְּרָה", "past", "third", "feminine", "singular"),
      form("סִדַּרְנוּ", "past", "first", "common", "plural"),
      form("סִדַּרְתֶּם", "past", "second", "masculine", "plural"),
      form("סִדַּרְתֶּן", "past", "second", "feminine", "plural"),
      form("סִדְּרוּ", "past", "third", "common", "plural"),
      // Present
      form("מְסַדֵּר", "present", "third", "masculine", "singular"),
      form("מְסַדֶּרֶת", "present", "third", "feminine", "singular"),
      form("מְסַדְּרִים", "present", "third", "masculine", "plural"),
      form("מְסַדְּרוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֲסַדֵּר", "future", "first", "common", "singular"),
      form("תְּסַדֵּר", "future", "second", "masculine", "singular"),
      form("תְּסַדְּרִי", "future", "second", "feminine", "singular"),
      form("יְסַדֵּר", "future", "third", "masculine", "singular"),
      form("תְּסַדֵּר", "future", "third", "feminine", "singular"),
      form("נְסַדֵּר", "future", "first", "common", "plural"),
      form("תְּסַדְּרוּ", "future", "second", "common", "plural"),
      form("יְסַדְּרוּ", "future", "third", "common", "plural"),
    ],
  },
  // HIF'IL VERBS
  {
    infinitive: "לְהַגְדִּיל",
    root: "ג-ד-ל",
    binyan: "hifil",
    english: "enlarge",
    forms: [
      // Past
      form("הִגְדַּלְתִּי", "past", "first", "common", "singular"),
      form("הִגְדַּלְתָּ", "past", "second", "masculine", "singular"),
      form("הִגְדַּלְתְּ", "past", "second", "feminine", "singular"),
      form("הִגְדִּיל", "past", "third", "masculine", "singular"),
      form("הִגְדִּילָה", "past", "third", "feminine", "singular"),
      form("הִגְדַּלְנוּ", "past", "first", "common", "plural"),
      form("הִגְדַּלְתֶּם", "past", "second", "masculine", "plural"),
      form("הִגְדַּלְתֶּן", "past", "second", "feminine", "plural"),
      form("הִגְדִּילוּ", "past", "third", "common", "plural"),
      // Present
      form("מַגְדִּיל", "present", "third", "masculine", "singular"),
      form("מַגְדִּילָה", "present", "third", "feminine", "singular"),
      form("מַגְדִּילִים", "present", "third", "masculine", "plural"),
      form("מַגְדִּילוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אַגְדִּיל", "future", "first", "common", "singular"),
      form("תַּגְדִּיל", "future", "second", "masculine", "singular"),
      form("תַּגְדִּילִי", "future", "second", "feminine", "singular"),
      form("יַגְדִּיל", "future", "third", "masculine", "singular"),
      form("תַּגְדִּיל", "future", "third", "feminine", "singular"),
      form("נַגְדִּיל", "future", "first", "common", "plural"),
      form("תַּגְדִּילוּ", "future", "second", "common", "plural"),
      form("יַגְדִּילוּ", "future", "third", "common", "plural"),
    ],
  },
  {
    infinitive: "לְהַזְכִּיר",
    root: "ז-כ-ר",
    binyan: "hifil",
    english: "remind",
    forms: [
      // Past
      form("הִזְכַּרְתִּי", "past", "first", "common", "singular"),
      form("הִזְכַּרְתָּ", "past", "second", "masculine", "singular"),
      form("הִזְכַּרְתְּ", "past", "second", "feminine", "singular"),
      form("הִזְכִּיר", "past", "third", "masculine", "singular"),
      form("הִזְכִּירָה", "past", "third", "feminine", "singular"),
      form("הִזְכַּרְנוּ", "past", "first", "common", "plural"),
      form("הִזְכַּרְתֶּם", "past", "second", "masculine", "plural"),
      form("הִזְכַּרְתֶּן", "past", "second", "feminine", "plural"),
      form("הִזְכִּירוּ", "past", "third", "common", "plural"),
      // Present
      form("מַזְכִּיר", "present", "third", "masculine", "singular"),
      form("מַזְכִּירָה", "present", "third", "feminine", "singular"),
      form("מַזְכִּירִים", "present", "third", "masculine", "plural"),
      form("מַזְכִּירוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אַזְכִּיר", "future", "first", "common", "singular"),
      form("תַּזְכִּיר", "future", "second", "masculine", "singular"),
      form("תַּזְכִּירִי", "future", "second", "feminine", "singular"),
      form("יַזְכִּיר", "future", "third", "masculine", "singular"),
      form("תַּזְכִּיר", "future", "third", "feminine", "singular"),
      form("נַזְכִּיר", "future", "first", "common", "plural"),
      form("תַּזְכִּירוּ", "future", "second", "common", "plural"),
      form("יַזְכִּירוּ", "future", "third", "common", "plural"),
    ],
  },
  {
    infinitive: "לְהַסְבִּיר",
    root: "ס-ב-ר",
    binyan: "hifil",
    english: "explain",
    forms: [
      // Past
      form("הִסְבַּרְתִּי", "past", "first", "common", "singular"),
      form("הִסְבַּרְתָּ", "past", "second", "masculine", "singular"),
      form("הִסְבַּרְתְּ", "past", "second", "feminine", "singular"),
      form("הִסְבִּיר", "past", "third", "masculine", "singular"),
      form("הִסְבִּירָה", "past", "third", "feminine", "singular"),
      form("הִסְבַּרְנוּ", "past", "first", "common", "plural"),
      form("הִסְבַּרְתֶּם", "past", "second", "masculine", "plural"),
      form("הִסְבַּרְתֶּן", "past", "second", "feminine", "plural"),
      form("הִסְבִּירוּ", "past", "third", "common", "plural"),
      // Present
      form("מַסְבִּיר", "present", "third", "masculine", "singular"),
      form("מַסְבִּירָה", "present", "third", "feminine", "singular"),
      form("מַסְבִּירִים", "present", "third", "masculine", "plural"),
      form("מַסְבִּירוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אַסְבִּיר", "future", "first", "common", "singular"),
      form("תַּסְבִּיר", "future", "second", "masculine", "singular"),
      form("תַּסְבִּירִי", "future", "second", "feminine", "singular"),
      form("יַסְבִּיר", "future", "third", "masculine", "singular"),
      form("תַּסְבִּיר", "future", "third", "feminine", "singular"),
      form("נַסְבִּיר", "future", "first", "common", "plural"),
      form("תַּסְבִּירוּ", "future", "second", "common", "plural"),
      form("יַסְבִּירוּ", "future", "third", "common", "plural"),
    ],
  },
];

// Helper to find a verb by infinitive
export function findVerb(infinitive: string): VerbRecord | undefined {
  return verbConjugations.find((v) => v.infinitive === infinitive);
}

// Helper to get a specific form
export function getForm(
  verb: VerbRecord,
  tense: Tense,
  person: Person,
  gender: Gender,
  number: Number,
): ConjugatedForm | undefined {
  return verb.forms.find(
    (f) =>
      f.tense === tense &&
      f.person === person &&
      (f.gender === gender || f.gender === "common") &&
      f.number === number,
  );
}
