// Azure he-IL STT returns unpointed Hebrew. Compare on letters only so
// pointed prompts (אַבָּא) match transcripts (אבא). Niqqud, dagesh, punctuation,
// and non-Hebrew characters are stripped. NFC keeps letter identity stable.

const hebrewLetter = /[\u05D0-\u05EA]/u;
const hebrewPhrase = /[\u0590-\u05FF]+(?:\s+[\u0590-\u05FF]+)*/g;

/** Keep a Hebrew phrase in order when it sits inside an English sentence. */
export function isolateHebrew(text: string) {
  return text.replace(hebrewPhrase, (phrase) => `\u2067${phrase}\u2069`);
}

export function withoutNikud(text: string) {
  return text.normalize("NFC").replace(/[\u0591-\u05BD\u05BF-\u05C7]/gu, "");
}

// A sentence is clearer to the voice when each word is unpointed.
// A single word keeps its vowels.
export function speechText(text: string) {
  const parts = text.trim().split(/\s+/u);
  if (parts.length < 2) {
    return text;
  }
  return parts.map((part) => withoutNikud(part)).join(" ");
}

export function normalizeHebrew(text: string) {
  let letters = "";
  for (const char of text.normalize("NFC")) {
    if (hebrewLetter.test(char)) {
      letters += char;
    }
  }
  return letters;
}

export function hebrewTokens(text: string) {
  return text
    .split(/\s+/u)
    .map((token) => normalizeHebrew(token))
    .filter((token) => token.length > 0);
}

export function letterDistance(left: string, right: string) {
  const a = normalizeHebrew(left);
  const b = normalizeHebrew(right);
  const rows = a.length + 1;
  const cols = b.length + 1;
  const grid = new Array<number>(rows * cols);

  for (let row = 0; row < rows; row += 1) {
    grid[row * cols] = row;
  }
  for (let col = 0; col < cols; col += 1) {
    grid[col] = col;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const same = a[i - 1] === b[j - 1] ? 0 : 1;
      grid[i * cols + j] = Math.min(
        grid[(i - 1) * cols + j] + 1,
        grid[i * cols + j - 1] + 1,
        grid[(i - 1) * cols + j - 1] + same,
      );
    }
  }

  return grid[a.length * cols + b.length];
}

export type UtteranceGrade = "pass" | "close" | "miss";

// A full match passes. One wrong word, or one word a letter or two off, is close.
export function gradeUtterance(expected: string, transcript: string): UtteranceGrade {
  const want = hebrewTokens(expected);
  const heard = hebrewTokens(transcript);
  if (want.length === 0 || heard.length === 0) {
    return "miss";
  }
  if (want.length === heard.length && want.every((token, index) => token === heard[index])) {
    return "pass";
  }

  if (want.length === heard.length) {
    let misses = 0;
    for (let index = 0; index < want.length; index += 1) {
      const left = want[index];
      const right = heard[index];
      if (!left || !right || left === right) {
        continue;
      }
      if (letterDistance(left, right) > 2) {
        return "miss";
      }
      misses += 1;
    }
    if (misses === 1) {
      return "close";
    }
  }

  if (Math.abs(want.length - heard.length) === 1) {
    const shorter = want.length < heard.length ? want : heard;
    const longer = want.length < heard.length ? heard : want;
    let matched = 0;
    let skipped = 0;
    for (const token of longer) {
      if (shorter[matched] === token) {
        matched += 1;
      } else {
        skipped += 1;
      }
    }
    if (matched === shorter.length && skipped === 1) {
      return "close";
    }
  }

  return "miss";
}
