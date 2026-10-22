export type LocaleGloss = { en: string; fr: string; es: string };

export type SentenceWord = {
  id: string;
  hebrew: string;
  gloss: LocaleGloss;
};

export type BuilderSentence = {
  id: string;
  hebrew: string;
  gloss: LocaleGloss;
  words: readonly SentenceWord[];
};

export type HearLabel =
  | "shelMine"
  | "shelYours"
  | "shelHis"
  | "shelHers"
  | "shelOurs"
  | "shelYoursMen"
  | "shelYoursWomen"
  | "shelTheirsMen"
  | "shelTheirsWomen"
  | "zeThis"
  | "eleThese"
  | "formMs"
  | "formFs"
  | "formMp"
  | "formFp";

export type HearCard = {
  id: string;
  hebrew: string;
  example?: string;
  label: HearLabel;
};

export function glossOf(gloss: LocaleGloss, locale: string) {
  if (locale === "fr" || locale === "es") {
    return gloss[locale];
  }
  return gloss.en;
}

export function mix<T>(items: readonly T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swap];
    next[swap] = current;
  }
  return next;
}

export function takeSentences(bank: readonly BuilderSentence[], count: number) {
  return mix(bank).slice(0, Math.min(count, bank.length));
}

const missing: string[] = [];

export function sentence(id: string, gloss: LocaleGloss, parts: readonly { hebrew: string; gloss: LocaleGloss }[]): BuilderSentence {
  return {
    id,
    hebrew: parts.map((part) => part.hebrew).join(" "),
    gloss,
    words: parts.map((part, index) => ({
      id: `${id}-${index}`,
      hebrew: part.hebrew,
      gloss: part.gloss,
    })),
  };
}

export function word(hebrew: string, en: string, fr: string, es: string) {
  return { hebrew, gloss: { en, fr, es } };
}

export function assertGlosses(label: string, items: readonly BuilderSentence[]) {
  for (const item of items) {
    if (!item.words.length) {
      missing.push(`${label}:${item.id}:empty`);
    }
  }
  if (missing.length) {
    throw new Error(`Sentence bank ${missing.join(", ")}`);
  }
}
