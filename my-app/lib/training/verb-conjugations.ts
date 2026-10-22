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

  // Additional PA'AL VERBS
  {
    infinitive: "לִקְרֹא",
    root: "ק-ר-א",
    binyan: "paal",
    english: "read",
    forms: [
      // Past
      form("קָרָאתִי", "past", "first", "common", "singular"),
      form("קָרָאתָ", "past", "second", "masculine", "singular"),
      form("קָרָאת", "past", "second", "feminine", "singular"),
      form("קָרָא", "past", "third", "masculine", "singular"),
      form("קָרְאָה", "past", "third", "feminine", "singular"),
      form("קָרָאנוּ", "past", "first", "common", "plural"),
      form("קְרָאתֶם", "past", "second", "masculine", "plural"),
      form("קְרָאתֶן", "past", "second", "feminine", "plural"),
      form("קָרְאוּ", "past", "third", "common", "plural"),
      // Present
      form("קוֹרֵא", "present", "third", "masculine", "singular"),
      form("קוֹרֵאת", "present", "third", "feminine", "singular"),
      form("קוֹרְאִים", "present", "third", "masculine", "plural"),
      form("קוֹרְאוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֶקְרָא", "future", "first", "common", "singular"),
      form("תִּקְרָא", "future", "second", "masculine", "singular"),
      form("תִּקְרְאִי", "future", "second", "feminine", "singular"),
      form("יִקְרָא", "future", "third", "masculine", "singular"),
      form("תִּקְרָא", "future", "third", "feminine", "singular"),
      form("נִקְרָא", "future", "first", "common", "plural"),
      form("תִּקְרְאוּ", "future", "second", "common", "plural"),
      form("יִקְרְאוּ", "future", "third", "common", "plural"),
    ],
  },
  {
    infinitive: "לֶאֱכֹל",
    root: "א-כ-ל",
    binyan: "paal",
    english: "eat",
    forms: [
      // Past
      form("אָכַלְתִּי", "past", "first", "common", "singular"),
      form("אָכַלְתָּ", "past", "second", "masculine", "singular"),
      form("אָכַלְתְּ", "past", "second", "feminine", "singular"),
      form("אָכַל", "past", "third", "masculine", "singular"),
      form("אָכְלָה", "past", "third", "feminine", "singular"),
      form("אָכַלְנוּ", "past", "first", "common", "plural"),
      form("אֲכַלְתֶּם", "past", "second", "masculine", "plural"),
      form("אֲכַלְתֶּן", "past", "second", "feminine", "plural"),
      form("אָכְלוּ", "past", "third", "common", "plural"),
      // Present
      form("אוֹכֵל", "present", "third", "masculine", "singular"),
      form("אוֹכֶלֶת", "present", "third", "feminine", "singular"),
      form("אוֹכְלִים", "present", "third", "masculine", "plural"),
      form("אוֹכְלוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֹכַל", "future", "first", "common", "singular"),
      form("תֹּאכַל", "future", "second", "masculine", "singular"),
      form("תֹּאכְלִי", "future", "second", "feminine", "singular"),
      form("יֹאכַל", "future", "third", "masculine", "singular"),
      form("תֹּאכַל", "future", "third", "feminine", "singular"),
      form("נֹאכַל", "future", "first", "common", "plural"),
      form("תֹּאכְלוּ", "future", "second", "common", "plural"),
      form("יֹאכְלוּ", "future", "third", "common", "plural"),
    ],
  },
  {
    infinitive: "לִשְׁתּוֹת",
    root: "ש-ת-ה",
    binyan: "paal",
    english: "drink",
    forms: [
      // Past
      form("שָׁתִיתִי", "past", "first", "common", "singular"),
      form("שָׁתִיתָ", "past", "second", "masculine", "singular"),
      form("שָׁתִית", "past", "second", "feminine", "singular"),
      form("שָׁתָה", "past", "third", "masculine", "singular"),
      form("שָׁתְתָה", "past", "third", "feminine", "singular"),
      form("שָׁתִינוּ", "past", "first", "common", "plural"),
      form("שְׁתִיתֶם", "past", "second", "masculine", "plural"),
      form("שְׁתִיתֶן", "past", "second", "feminine", "plural"),
      form("שָׁתוּ", "past", "third", "common", "plural"),
      // Present
      form("שׁוֹתֶה", "present", "third", "masculine", "singular"),
      form("שׁוֹתָה", "present", "third", "feminine", "singular"),
      form("שׁוֹתִים", "present", "third", "masculine", "plural"),
      form("שׁוֹתוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֶשְׁתֶּה", "future", "first", "common", "singular"),
      form("תִּשְׁתֶּה", "future", "second", "masculine", "singular"),
      form("תִּשְׁתִּי", "future", "second", "feminine", "singular"),
      form("יִשְׁתֶּה", "future", "third", "masculine", "singular"),
      form("תִּשְׁתֶּה", "future", "third", "feminine", "singular"),
      form("נִשְׁתֶּה", "future", "first", "common", "plural"),
      form("תִּשְׁתּוּ", "future", "second", "common", "plural"),
      form("יִשְׁתּוּ", "future", "third", "common", "plural"),
    ],
  },
  {
    infinitive: "לָלֶכֶת",
    root: "ה-ל-ך",
    binyan: "paal",
    english: "go",
    forms: [
      // Past
      form("הָלַכְתִּי", "past", "first", "common", "singular"),
      form("הָלַכְתָּ", "past", "second", "masculine", "singular"),
      form("הָלַכְתְּ", "past", "second", "feminine", "singular"),
      form("הָלַךְ", "past", "third", "masculine", "singular"),
      form("הָלְכָה", "past", "third", "feminine", "singular"),
      form("הָלַכְנוּ", "past", "first", "common", "plural"),
      form("הֲלַכְתֶּם", "past", "second", "masculine", "plural"),
      form("הֲלַכְתֶּן", "past", "second", "feminine", "plural"),
      form("הָלְכוּ", "past", "third", "common", "plural"),
      // Present
      form("הוֹלֵךְ", "present", "third", "masculine", "singular"),
      form("הוֹלֶכֶת", "present", "third", "feminine", "singular"),
      form("הוֹלְכִים", "present", "third", "masculine", "plural"),
      form("הוֹלְכוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֵלֵךְ", "future", "first", "common", "singular"),
      form("תֵּלֵךְ", "future", "second", "masculine", "singular"),
      form("תֵּלְכִי", "future", "second", "feminine", "singular"),
      form("יֵלֵךְ", "future", "third", "masculine", "singular"),
      form("תֵּלֵךְ", "future", "third", "feminine", "singular"),
      form("נֵלֵךְ", "future", "first", "common", "plural"),
      form("תֵּלְכוּ", "future", "second", "common", "plural"),
      form("יֵלְכוּ", "future", "third", "common", "plural"),
    ],
  },

  // Additional PI'EL VERBS
  {
    infinitive: "לְבַשֵּׁל",
    root: "ב-ש-ל",
    binyan: "piel",
    english: "cook",
    forms: [
      // Past
      form("בִּשַּׁלְתִּי", "past", "first", "common", "singular"),
      form("בִּשַּׁלְתָּ", "past", "second", "masculine", "singular"),
      form("בִּשַּׁלְתְּ", "past", "second", "feminine", "singular"),
      form("בִּשֵּׁל", "past", "third", "masculine", "singular"),
      form("בִּשְּׁלָה", "past", "third", "feminine", "singular"),
      form("בִּשַּׁלְנוּ", "past", "first", "common", "plural"),
      form("בִּשַּׁלְתֶּם", "past", "second", "masculine", "plural"),
      form("בִּשַּׁלְתֶּן", "past", "second", "feminine", "plural"),
      form("בִּשְּׁלוּ", "past", "third", "common", "plural"),
      // Present
      form("מְבַשֵּׁל", "present", "third", "masculine", "singular"),
      form("מְבַשֶּׁלֶת", "present", "third", "feminine", "singular"),
      form("מְבַשְּׁלִים", "present", "third", "masculine", "plural"),
      form("מְבַשְּׁלוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֲבַשֵּׁל", "future", "first", "common", "singular"),
      form("תְּבַשֵּׁל", "future", "second", "masculine", "singular"),
      form("תְּבַשְּׁלִי", "future", "second", "feminine", "singular"),
      form("יְבַשֵּׁל", "future", "third", "masculine", "singular"),
      form("תְּבַשֵּׁל", "future", "third", "feminine", "singular"),
      form("נְבַשֵּׁל", "future", "first", "common", "plural"),
      form("תְּבַשְּׁלוּ", "future", "second", "common", "plural"),
      form("יְבַשְּׁלוּ", "future", "third", "common", "plural"),
    ],
  },
  {
    infinitive: "לְנַסּוֹת",
    root: "נ-ס-ה",
    binyan: "piel",
    english: "try",
    forms: [
      // Past
      form("נִסִּיתִי", "past", "first", "common", "singular"),
      form("נִסִּיתָ", "past", "second", "masculine", "singular"),
      form("נִסִּית", "past", "second", "feminine", "singular"),
      form("נִסָּה", "past", "third", "masculine", "singular"),
      form("נִסְּתָה", "past", "third", "feminine", "singular"),
      form("נִסִּינוּ", "past", "first", "common", "plural"),
      form("נִסִּיתֶם", "past", "second", "masculine", "plural"),
      form("נִסִּיתֶן", "past", "second", "feminine", "plural"),
      form("נִסּוּ", "past", "third", "common", "plural"),
      // Present
      form("מְנַסֶּה", "present", "third", "masculine", "singular"),
      form("מְנַסָּה", "present", "third", "feminine", "singular"),
      form("מְנַסִּים", "present", "third", "masculine", "plural"),
      form("מְנַסּוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אֲנַסֶּה", "future", "first", "common", "singular"),
      form("תְּנַסֶּה", "future", "second", "masculine", "singular"),
      form("תְּנַסִּי", "future", "second", "feminine", "singular"),
      form("יְנַסֶּה", "future", "third", "masculine", "singular"),
      form("תְּנַסֶּה", "future", "third", "feminine", "singular"),
      form("נְנַסֶּה", "future", "first", "common", "plural"),
      form("תְּנַסּוּ", "future", "second", "common", "plural"),
      form("יְנַסּוּ", "future", "third", "common", "plural"),
    ],
  },

  // Additional HIF'IL VERBS
  {
    infinitive: "לְהָבִיא",
    root: "ב-ו-א",
    binyan: "hifil",
    english: "bring",
    forms: [
      // Past
      form("הֵבֵאתִי", "past", "first", "common", "singular"),
      form("הֵבֵאתָ", "past", "second", "masculine", "singular"),
      form("הֵבֵאת", "past", "second", "feminine", "singular"),
      form("הֵבִיא", "past", "third", "masculine", "singular"),
      form("הֵבִיאָה", "past", "third", "feminine", "singular"),
      form("הֵבֵאנוּ", "past", "first", "common", "plural"),
      form("הֲבֵאתֶם", "past", "second", "masculine", "plural"),
      form("הֲבֵאתֶן", "past", "second", "feminine", "plural"),
      form("הֵבִיאוּ", "past", "third", "common", "plural"),
      // Present
      form("מֵבִיא", "present", "third", "masculine", "singular"),
      form("מְבִיאָה", "present", "third", "feminine", "singular"),
      form("מְבִיאִים", "present", "third", "masculine", "plural"),
      form("מְבִיאוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אָבִיא", "future", "first", "common", "singular"),
      form("תָּבִיא", "future", "second", "masculine", "singular"),
      form("תָּבִיאִי", "future", "second", "feminine", "singular"),
      form("יָבִיא", "future", "third", "masculine", "singular"),
      form("תָּבִיא", "future", "third", "feminine", "singular"),
      form("נָבִיא", "future", "first", "common", "plural"),
      form("תָּבִיאוּ", "future", "second", "common", "plural"),
      form("יָבִיאוּ", "future", "third", "common", "plural"),
    ],
  },
  {
    infinitive: "לְהַתְחִיל",
    root: "ח-ל-ל",
    binyan: "hifil",
    english: "begin",
    forms: [
      // Past
      form("הִתְחַלְתִּי", "past", "first", "common", "singular"),
      form("הִתְחַלְתָּ", "past", "second", "masculine", "singular"),
      form("הִתְחַלְתְּ", "past", "second", "feminine", "singular"),
      form("הִתְחִיל", "past", "third", "masculine", "singular"),
      form("הִתְחִילָה", "past", "third", "feminine", "singular"),
      form("הִתְחַלְנוּ", "past", "first", "common", "plural"),
      form("הִתְחַלְתֶּם", "past", "second", "masculine", "plural"),
      form("הִתְחַלְתֶּן", "past", "second", "feminine", "plural"),
      form("הִתְחִילוּ", "past", "third", "common", "plural"),
      // Present
      form("מַתְחִיל", "present", "third", "masculine", "singular"),
      form("מַתְחִילָה", "present", "third", "feminine", "singular"),
      form("מַתְחִילִים", "present", "third", "masculine", "plural"),
      form("מַתְחִילוֹת", "present", "third", "feminine", "plural"),
      // Future
      form("אַתְחִיל", "future", "first", "common", "singular"),
      form("תַּתְחִיל", "future", "second", "masculine", "singular"),
      form("תַּתְחִילִי", "future", "second", "feminine", "singular"),
      form("יַתְחִיל", "future", "third", "masculine", "singular"),
      form("תַּתְחִיל", "future", "third", "feminine", "singular"),
      form("נַתְחִיל", "future", "first", "common", "plural"),
      form("תַּתְחִילוּ", "future", "second", "common", "plural"),
      form("יַתְחִילוּ", "future", "third", "common", "plural"),
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
