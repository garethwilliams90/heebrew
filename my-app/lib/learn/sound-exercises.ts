import { basicWords, type BasicWord } from "@/lib/learn/basic-words";
import { hebrewTokens, letterDistance, normalizeHebrew } from "@/lib/learn/hebrew-text";

export type SoundPrompt = {
  id: string;
  level: 1 | 2;
  hebrew: string;
  accept: readonly string[];
  knownWord?: BasicWord;
};

const noun = "noun" as const;
const masculine = "masculine" as const;

const gag = basicWords.find((word) => word.id === "gag");
const dag = basicWords.find((word) => word.id === "dag");

const aba: BasicWord = {
  id: "aba",
  hebrew: "אַבָּא",
  english: "father",
  reading: "aba",
  partOfSpeech: noun,
  gender: masculine,
};

const gad: BasicWord = {
  id: "gad",
  hebrew: "גַּד",
  english: "luck",
  reading: "gad",
  partOfSpeech: noun,
  gender: masculine,
};

const bad: BasicWord = {
  id: "bad",
  hebrew: "בַּד",
  english: "fabric",
  reading: "bad",
  partOfSpeech: noun,
  gender: masculine,
};

function prompt(
  id: string,
  level: 1 | 2,
  hebrew: string,
  extra: readonly string[] = [],
  knownWord?: BasicWord,
): SoundPrompt {
  const accept = [hebrew, normalizeHebrew(hebrew), ...extra];
  return { id, level, hebrew, accept, knownWord };
}

// Four Level 1 items use only א ב ג. Unpointed spellings are all distinct so
// Azure STT can grade them. Four Level 2 items add ד and ה.
export const soundPrompts: readonly SoundPrompt[] = [
  prompt("l1-bab", 1, "בַּב"),
  prompt("l1-aba", 1, "אַבָּא", ["אבא"], aba),
  prompt("l1-bag", 1, "בַּג"),
  prompt("l1-gag", 1, gag?.hebrew ?? "גַּג", ["גג"], gag),
  prompt("l2-gad", 2, "גַּד", ["גד"], gad),
  prompt("l2-ha", 2, "הַא", ["הא"]),
  prompt("l2-bad", 2, "בַּד", ["בד"], bad),
  prompt("l2-dag", 2, dag?.hebrew ?? "דָג", ["דג"], dag),
];

export const soundKnownWords: readonly BasicWord[] = [aba, gad, bad];

export function soundPromptById(id: string) {
  return soundPrompts.find((item) => item.id === id);
}

export function transcriptMatchesPrompt(prompt: SoundPrompt, transcript: string) {
  const allowed = new Set(prompt.accept.map((item) => normalizeHebrew(item)).filter(Boolean));
  return hebrewTokens(transcript).some((token) => allowed.has(token));
}

const CLOSE_DISTANCE = 2;

export function closestSoundPrompt(transcript: string, besides?: string) {
  const tokens = hebrewTokens(transcript);
  if (tokens.length === 0) {
    return null;
  }

  let best: SoundPrompt | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const item of soundPrompts) {
    if (item.id === besides) {
      continue;
    }
    const target = normalizeHebrew(item.hebrew);
    for (const token of tokens) {
      const distance = letterDistance(token, target);
      if (distance < bestDistance) {
        best = item;
        bestDistance = distance;
      }
    }
  }

  if (!best || bestDistance > CLOSE_DISTANCE) {
    return null;
  }

  return best;
}
