export type SpokenWord = {
  text: string;
  startMs: number;
  endMs: number;
};

export type WordCue = {
  startMs: number;
  endMs: number;
};

const NIQQUD = /[\u0591-\u05C7]/g;

export function spokenKey(value: string) {
  return value.normalize("NFD").replace(NIQQUD, "").replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase();
}

export function transcriptTokenLines(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(/\s+/).filter(Boolean));
}

export function alignCues(tokens: string[], spoken: SpokenWord[], durationMs: number): WordCue[] {
  if (tokens.length === 0) {
    return [];
  }
  const matched = spoken.length > 0 ? matchSpoken(tokens, spoken) : null;
  if (matched) {
    return matched;
  }
  if (durationMs > 0) {
    return spreadCues(tokens, durationMs);
  }
  return [];
}

export function spreadCues(tokens: string[], durationMs: number): WordCue[] {
  const weights = tokens.map((token) => Math.max(1, spokenKey(token).length || token.length));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = 0;
  return weights.map((weight) => {
    const startMs = Math.round((cursor / total) * durationMs);
    cursor += weight;
    const endMs = Math.max(startMs + 1, Math.round((cursor / total) * durationMs));
    return { startMs, endMs };
  });
}

export function activeToken(cues: WordCue[], timeMs: number) {
  if (cues.length === 0 || timeMs < cues[0].startMs) {
    return -1;
  }
  const exact = cues.findIndex((cue) => timeMs >= cue.startMs && timeMs < cue.endMs);
  if (exact >= 0) {
    return exact;
  }
  let last = -1;
  for (let index = 0; index < cues.length; index += 1) {
    if (cues[index].startMs <= timeMs) {
      last = index;
    }
  }
  return last;
}

const HEBREW_PREFIX = /^[והבכלמש]{1,2}$/;

function sameSpokenWord(token: string, part: string) {
  if (!token || !part) {
    return false;
  }
  if (token === part) {
    return true;
  }
  if (part.length < 2 || token.length <= part.length || token.length > part.length + 2) {
    return false;
  }
  return token.endsWith(part) && HEBREW_PREFIX.test(token.slice(0, token.length - part.length));
}

export function keywordMarks(tokens: string[], words: { phrase: string; label: string }[]) {
  const marks = tokens.map(() => null as string | null);
  const keys = tokens.map(spokenKey);
  const ordered = [...words].sort((left, right) => right.phrase.length - left.phrase.length);
  for (const word of ordered) {
    const parts = word.phrase.trim().split(/\s+/).map(spokenKey).filter(Boolean);
    if (parts.length === 0) {
      continue;
    }
    for (let index = 0; index <= keys.length - parts.length; index += 1) {
      if (parts.every((part, offset) => sameSpokenWord(keys[index + offset] ?? "", part))) {
        for (let offset = 0; offset < parts.length; offset += 1) {
          if (!marks[index + offset]) {
            marks[index + offset] = word.label;
          }
        }
      }
    }
  }
  return marks;
}

export function keywordMask(tokens: string[], phrases: string[]) {
  return keywordMarks(
    tokens,
    phrases.map((phrase) => ({ phrase, label: phrase })),
  ).map((label) => label !== null);
}

function matchSpoken(tokens: string[], spoken: SpokenWord[]) {
  const cues = tokens.map(() => ({ startMs: 0, endMs: 0 }));
  let speech = 0;
  let hits = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const key = spokenKey(tokens[index] ?? "");
    if (!key) {
      continue;
    }
    let found = -1;
    for (let wordIndex = speech; wordIndex < spoken.length; wordIndex += 1) {
      if (spokenKey(spoken[wordIndex]?.text ?? "") === key) {
        found = wordIndex;
        break;
      }
    }
    if (found < 0) {
      continue;
    }
    hits += 1;
    cues[index] = { startMs: spoken[found].startMs, endMs: spoken[found].endMs };
    speech = found + 1;
  }
  const comparable = Math.min(tokens.filter((token) => spokenKey(token)).length, spoken.length);
  if (comparable === 0 || hits < comparable * 0.5) {
    return null;
  }
  return fillGaps(cues, spoken[spoken.length - 1]?.endMs ?? 0);
}

function fillGaps(cues: WordCue[], endMs: number) {
  const next = cues.map((cue) => ({ ...cue }));
  let index = 0;
  while (index < next.length) {
    if (next[index].endMs > next[index].startMs) {
      index += 1;
      continue;
    }
    const start = index;
    while (index < next.length && next[index].endMs <= next[index].startMs) {
      index += 1;
    }
    const left = start > 0 ? next[start - 1].endMs : 0;
    const right = index < next.length ? next[index].startMs : Math.max(endMs, left + 1);
    const count = index - start;
    const span = Math.max(right - left, count);
    for (let offset = 0; offset < count; offset += 1) {
      const startMs = Math.round(left + (span * offset) / count);
      const finish = Math.round(left + (span * (offset + 1)) / count);
      next[start + offset] = { startMs, endMs: Math.max(finish, startMs + 1) };
    }
  }
  return next;
}

export function readCues(value: unknown): WordCue[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const startMs = (item as { startMs?: unknown }).startMs;
    const endMs = (item as { endMs?: unknown }).endMs;
    if (typeof startMs !== "number" || typeof endMs !== "number" || endMs <= startMs) {
      return [];
    }
    return [{ startMs, endMs }];
  });
}
