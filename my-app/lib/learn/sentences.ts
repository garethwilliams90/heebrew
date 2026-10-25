export type LocaleGloss = { en: string; fr: string; es: string };

export type SentenceWord = {
  id: string;
  hebrew: string;
  gloss: LocaleGloss;
  /** Path under the Duolingo bundle, such as `audio/clip.mp3`. Absent words use Azure speech. */
  audio?: string;
};

export type BuilderSentence = {
  id: string;
  hebrew: string;
  gloss: LocaleGloss;
  words: readonly SentenceWord[];
  /** Known words mixed into the bank that are not part of the sentence. */
  extras?: readonly SentenceWord[];
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
  | "formFp"
  | "nounNewspaper"
  | "nounLetter"
  | "nounStory"
  | "nounSong"
  | "nounMusic";

export type HearCard = {
  id: string;
  hebrew: string;
  example?: string;
  /** Verb-form cards use a form label. Other cards use `caption`. */
  label?: HearLabel;
  caption?: LocaleGloss;
  /** Path under the Duolingo bundle. When set, the hear button plays this clip instead of the example. */
  audio?: string;
};

export function withExtras(item: BuilderSentence, extras: readonly { hebrew: string; gloss: LocaleGloss; audio?: string }[]): BuilderSentence {
  return {
    ...item,
    extras: extras.map((extra, index) => ({
      id: `${item.id}-x${index}`,
      hebrew: extra.hebrew,
      gloss: extra.gloss,
      audio: extra.audio,
    })),
  };
}

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

export function sentence(
  id: string,
  gloss: LocaleGloss,
  parts: readonly { hebrew: string; gloss: LocaleGloss; audio?: string }[],
): BuilderSentence {
  return {
    id,
    hebrew: parts.map((part) => part.hebrew).join(" "),
    gloss,
    words: parts.map((part, index) => ({
      id: `${id}-${index}`,
      hebrew: part.hebrew,
      gloss: part.gloss,
      audio: part.audio,
    })),
  };
}

export function word(hebrew: string, en: string, fr: string, es: string, audio?: string) {
  return { hebrew, gloss: { en, fr, es }, ...(audio ? { audio } : {}) };
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
