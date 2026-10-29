const LEVEL_ID = /^[a-z0-9-]{1,32}$/;

export type LessonExampleInput = {
  hebrew: string;
  en: string;
  fr: string;
  es: string;
};

export type LessonInput = {
  conceptHe: string;
  conceptEn: string;
  conceptFr: string;
  conceptEs: string;
  titleEn: string;
  titleFr: string;
  titleEs: string;
  bodyEn: string;
  bodyFr: string;
  bodyEs: string;
  examples: LessonExampleInput[];
  levelIds: string[];
};

function text(value: unknown, max: number) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length > max || trimmed.includes("\0")) {
    return null;
  }
  return trimmed;
}

function glossFields(value: unknown, max: number) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Record<string, unknown>;
  const en = text(row.en, max);
  const fr = text(row.fr, max);
  const es = text(row.es, max);
  if (en === null || fr === null || es === null) {
    return null;
  }
  return { en, fr, es };
}

export type ParsedLesson = LessonInput | { clear: true; levelIds: string[] };

/** Owner form payload. A clear result drops the lesson text and keeps the chosen levels. */
export function parseLessonInput(value: unknown): ParsedLesson | "invalid" {
  if (!value || typeof value !== "object") {
    return "invalid";
  }
  const row = value as Record<string, unknown>;
  const conceptHe = text(row.conceptHe, 80);
  const concept = glossFields(
    { en: row.conceptEn, fr: row.conceptFr, es: row.conceptEs },
    120,
  );
  const title = glossFields({ en: row.titleEn, fr: row.titleFr, es: row.titleEs }, 160);
  const body = glossFields({ en: row.bodyEn, fr: row.bodyFr, es: row.bodyEs }, 8000);
  if (conceptHe === null || !concept || !title || !body || !Array.isArray(row.examples) || !Array.isArray(row.levelIds)) {
    return "invalid";
  }
  if (row.examples.length > 8 || row.levelIds.length > 40) {
    return "invalid";
  }

  const examples: LessonExampleInput[] = [];
  for (const item of row.examples) {
    if (!item || typeof item !== "object") {
      return "invalid";
    }
    const example = item as Record<string, unknown>;
    const hebrew = text(example.hebrew, 200);
    const gloss = glossFields({ en: example.en, fr: example.fr, es: example.es }, 400);
    if (hebrew === null || !gloss) {
      return "invalid";
    }
    if (!hebrew && !gloss.en && !gloss.fr && !gloss.es) {
      continue;
    }
    if (!hebrew || !gloss.en) {
      return "invalid";
    }
    examples.push({ hebrew, ...gloss });
  }

  const levelIds: string[] = [];
  for (const id of row.levelIds) {
    if (typeof id !== "string" || !LEVEL_ID.test(id) || levelIds.includes(id)) {
      return "invalid";
    }
    levelIds.push(id);
  }

  const started = Boolean(conceptHe || concept.en || title.en || body.en || examples.length > 0);
  if (!started) {
    return { clear: true, levelIds };
  }
  if (!title.en || !body.en || (!concept.en && !conceptHe)) {
    return "invalid";
  }

  return {
    conceptHe,
    conceptEn: concept.en,
    conceptFr: concept.fr,
    conceptEs: concept.es,
    titleEn: title.en,
    titleFr: title.fr,
    titleEs: title.es,
    bodyEn: body.en,
    bodyFr: body.fr,
    bodyEs: body.es,
    examples,
    levelIds,
  };
}

export function lessonIsVisible(lesson: { title: { en: string }; body: { en: string } }) {
  return Boolean(lesson.title.en.trim() || lesson.body.en.trim());
}
