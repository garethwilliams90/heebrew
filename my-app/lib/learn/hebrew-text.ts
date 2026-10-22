// Azure he-IL STT returns unpointed Hebrew. Compare on letters only so
// pointed prompts (אַבָּא) match transcripts (אבא). Niqqud, dagesh, punctuation,
// and non-Hebrew characters are stripped. NFC keeps letter identity stable.

const hebrewLetter = /[\u05D0-\u05EA]/u;

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
