export function transcriptLines(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function pairedTranscript(hebrew: string, gloss: string) {
  const source = transcriptLines(hebrew);
  const target = transcriptLines(gloss);
  return source.map((line, index) => ({ hebrew: line, gloss: target[index] ?? "" }));
}

function bareWord(value: string) {
  return value.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

/** Search phrases from a flashcard label, longest first. Gender notes and a leading "to" are dropped. */
export function translationNeedles(label: string) {
  const needles = new Set<string>();
  for (const part of label.split("/")) {
    const cleaned = part.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
    if (cleaned.length > 2) {
      needles.add(cleaned.toLowerCase());
    }
    const dropped = cleaned.replace(/^to\s+/i, "");
    if (dropped.length > 2) {
      needles.add(dropped.toLowerCase());
    }
  }
  return [...needles].sort((left, right) => right.length - left.length);
}

export type GlossSlot = { words: { text: string; keyword: boolean }[] };

/** Places the translation under the Hebrew words, right to left, and marks flashcard meanings. */
export function glossUnderHebrew(hebrewTokens: string[], gloss: string, labels: string[]) {
  const words = gloss.trim().split(/\s+/).filter(Boolean);
  const slots: GlossSlot[] = hebrewTokens.map(() => ({ words: [] }));
  if (words.length === 0 || hebrewTokens.length === 0) {
    return slots;
  }
  const bare = words.map(bareWord);
  const keyword = words.map(() => false);
  for (const label of labels) {
    for (const needle of translationNeedles(label)) {
      const parts = needle.split(/\s+/).filter(Boolean);
      for (let index = 0; index <= bare.length - parts.length; index += 1) {
        if (parts.every((part, offset) => bare[index + offset] === part)) {
          for (let offset = 0; offset < parts.length; offset += 1) {
            keyword[index + offset] = true;
          }
        }
      }
    }
  }
  words.forEach((word, index) => {
    const slot = words.length === 1 ? 0 : Math.round((index * (hebrewTokens.length - 1)) / (words.length - 1));
    slots[slot]?.words.push({ text: word, keyword: keyword[index] === true });
  });
  return slots;
}
