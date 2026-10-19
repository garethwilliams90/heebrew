const HEBREW = /\p{Script=Hebrew}/u;
const LATIN = /\p{Script=Latin}/u;

export const ANKI_TEXT_LIMIT = 200;
export const ANKI_EXAMPLE_LIMIT = 400;
export const ANKI_NOTE_LIMIT = 5000;
export const ANKI_PACKAGE_LIMIT = 200 * 1024 * 1024;

export type AnkiIssue = "missing-english" | "missing-hebrew" | "ambiguous" | "too-long" | "empty";

export type AnkiField = {
  name: string;
  text: string;
};

const IGNORED_NAME =
  /gender|part of speech|\bpos\b|\btags?\b|frequency|hint|image|picture|mnemonic|translit|pronunciation|romanization/i;
const EXAMPLE_NAME = /example|sentence|context|\busage\b/i;
const AUDIO_NAME = /audio|sound|media|pronunciation/i;
const SOUND = /\[sound:([^\]]+)\]/gi;

export function plainAnkiText(value: string) {
  const withoutSounds = value.replace(/\[sound:[^\]]*\]/gi, " ");
  const withoutCloze = withoutSounds.replace(/\{\{c\d+::([\s\S]*?)\}\}/g, (_match, inner: string) => {
    const hint = inner.indexOf("::");
    return hint === -1 ? inner : inner.slice(0, hint);
  });
  const withoutBlocks = withoutCloze.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
  const withBreaks = withoutBlocks.replace(/<br\s*\/?>/gi, " ").replace(/<\/(p|div|li|tr|h[1-6])>/gi, " ");
  const withoutTags = withBreaks.replace(/<[^>]+>/g, " ");

  return decodeEntities(withoutTags).replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_match, digits: string) => codePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, digits: string) => codePoint(Number.parseInt(digits, 16)));
}

function codePoint(code: number) {
  if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) {
    return "";
  }

  return String.fromCodePoint(code);
}

function ignored(field: AnkiField) {
  return !HEBREW.test(field.text) && IGNORED_NAME.test(field.name);
}

export function issueFor(
  english: string,
  hebrew: string,
  example = "",
  hebrewExample = "",
): AnkiIssue | null {
  const nextEnglish = english.trim();
  const nextHebrew = hebrew.trim();
  const nextExample = example.trim();
  const nextHebrewExample = hebrewExample.trim();

  if (!nextEnglish && !nextHebrew && !nextExample && !nextHebrewExample) {
    return "empty";
  }

  const hebrewScript = HEBREW.test(nextHebrew);
  const englishScript = LATIN.test(nextEnglish);

  if (!nextHebrew || !hebrewScript) {
    return "missing-hebrew";
  }

  if (!nextEnglish || !englishScript) {
    return "missing-english";
  }

  if (LATIN.test(nextHebrew) || HEBREW.test(nextEnglish)) {
    return "ambiguous";
  }

  if (
    (nextExample && (!LATIN.test(nextExample) || HEBREW.test(nextExample))) ||
    (nextHebrewExample && (!HEBREW.test(nextHebrewExample) || LATIN.test(nextHebrewExample)))
  ) {
    return "ambiguous";
  }

  if (
    nextEnglish.length > ANKI_TEXT_LIMIT ||
    nextHebrew.length > ANKI_TEXT_LIMIT ||
    nextExample.length > ANKI_EXAMPLE_LIMIT ||
    nextHebrewExample.length > ANKI_EXAMPLE_LIMIT
  ) {
    return "too-long";
  }

  return null;
}

type RichField = AnkiField & {
  sounds: string[];
};

/** Picks the English and Hebrew, and keeps an example or recording when the note already has one. */
export function readAnkiNote(fields: AnkiField[]) {
  const rich = fields.map((field) => ({
    name: field.name.trim() || "Field",
    text: plainAnkiText(field.text),
    sounds: soundNames(field.text),
  }));
  const cleaned = rich
    .filter((field) => field.text.length > 0)
    .map((field) => ({ name: field.name, text: field.text }));
  const language = rich.filter((field) => field.text.length > 0 && !ignored(field));
  const examples = language.filter((field) => isSideField(field, language));
  const useful = language.filter((field) => !examples.includes(field));
  const hebrew = useful.filter((field) => HEBREW.test(field.text) && !LATIN.test(field.text));
  const english = useful.filter((field) => LATIN.test(field.text) && !HEBREW.test(field.text));
  const mixed = useful.filter((field) => HEBREW.test(field.text) && LATIN.test(field.text));

  let englishText = "";
  let hebrewText = "";
  let issue: AnkiIssue | null = null;

  if (useful.length === 0) {
    issue = "empty";
  } else if (hebrew.length === 1 && english.length === 1) {
    englishText = english[0].text;
    hebrewText = hebrew[0].text;
    if (englishText.length > ANKI_TEXT_LIMIT || hebrewText.length > ANKI_TEXT_LIMIT) {
      issue = "too-long";
    }
  } else if (hebrew.length === 0 && english.length === 0) {
    issue = "ambiguous";
    englishText = mixed[0]?.text ?? "";
    hebrewText = mixed[0]?.text ?? "";
  } else if (hebrew.length === 0) {
    issue = "missing-hebrew";
    englishText = english[0]?.text ?? mixed[0]?.text ?? "";
  } else if (english.length === 0) {
    issue = "missing-english";
    hebrewText = hebrew[0]?.text ?? mixed[0]?.text ?? "";
  } else {
    issue = "ambiguous";
    englishText = english[0]?.text ?? "";
    hebrewText = hebrew[0]?.text ?? "";
  }

  const exampleText = pickExample(examples);
  const sounds = assignSounds(useful, examples, rich.filter((field) => AUDIO_NAME.test(field.name)));

  return {
    fields: cleaned,
    english: englishText,
    hebrew: hebrewText,
    example: exampleText.example,
    hebrewExample: exampleText.hebrewExample,
    audioFile: sounds.word,
    exampleAudioFile: sounds.example,
    issue: issue ?? issueFor(englishText, hebrewText, exampleText.example, exampleText.hebrewExample),
  };
}

function soundNames(value: string) {
  return [...value.matchAll(SOUND)]
    .map((match) => match[1]?.trim() ?? "")
    .filter((name) => name.length > 0);
}

function isSideField(field: RichField, fields: RichField[]) {
  const namedExample = EXAMPLE_NAME.test(field.name) && !AUDIO_NAME.test(field.name);
  if (!namedExample) {
    return false;
  }

  const others = fields.filter((other) => other !== field && !EXAMPLE_NAME.test(other.name) && !AUDIO_NAME.test(other.name));
  const hebrew = HEBREW.test(field.text);
  const latin = LATIN.test(field.text);
  const hebrewCovered = !hebrew || others.some((other) => HEBREW.test(other.text) && !LATIN.test(other.text));
  const latinCovered = !latin || others.some((other) => LATIN.test(other.text) && !HEBREW.test(other.text));
  return hebrewCovered && latinCovered;
}

function pickExample(fields: RichField[]) {
  let example = "";
  let hebrewExample = "";

  for (const field of fields) {
    if (AUDIO_NAME.test(field.name) && !EXAMPLE_NAME.test(field.name)) {
      continue;
    }

    const parts = splitLanguages(field.text);
    if (!example && parts.english) {
      example = parts.english;
    }
    if (!hebrewExample && parts.hebrew) {
      hebrewExample = parts.hebrew;
    }
  }

  return { example, hebrewExample };
}

function splitLanguages(text: string) {
  const hebrew = HEBREW.test(text);
  const latin = LATIN.test(text);
  if (hebrew && !latin) {
    return { english: "", hebrew: text };
  }
  if (latin && !hebrew) {
    return { english: text, hebrew: "" };
  }
  if (!hebrew && !latin) {
    return { english: "", hebrew: "" };
  }

  return {
    english: text.replace(/\p{Script=Hebrew}/gu, " ").replace(/\s+/g, " ").trim(),
    hebrew: text.replace(/\p{Script=Latin}/gu, " ").replace(/\s+/g, " ").trim(),
  };
}

function assignSounds(words: RichField[], examples: RichField[], audioFields: RichField[]) {
  let exampleAudio =
    firstSound(examples) ?? firstSound(audioFields.filter((field) => EXAMPLE_NAME.test(field.name)));
  const used = new Set(exampleAudio ? [exampleAudio] : []);
  const wordAudio =
    firstUnused([...words, ...audioFields.filter((field) => !EXAMPLE_NAME.test(field.name))], used) ??
    firstUnused(examples, used);
  const hasExample = examples.some((field) => field.text.length > 0);

  if (!exampleAudio && hasExample) {
    exampleAudio = firstUnused(
      [...words, ...audioFields],
      new Set(wordAudio ? [wordAudio] : []),
    );
  }

  return {
    word: wordAudio,
    example: exampleAudio && exampleAudio !== wordAudio ? exampleAudio : null,
  };
}

function firstSound(fields: RichField[]) {
  for (const field of fields) {
    if (field.sounds[0]) {
      return field.sounds[0];
    }
  }

  return null;
}

function firstUnused(fields: RichField[], used: Set<string>) {
  for (const field of fields) {
    const sound = field.sounds.find((name) => !used.has(name));
    if (sound) {
      return sound;
    }
  }

  return null;
}
