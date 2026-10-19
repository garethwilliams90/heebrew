const NIQQUD = /[\u0591-\u05C7]/;

export function stripNiqqud(value: string) {
  return value.replace(/[\u0591-\u05C7]/g, "");
}

export function hasNiqqud(value: string) {
  return NIQQUD.test(value);
}

export function withoutNiqqud(text: string, bold?: [number, number][]) {
  const shown = stripNiqqud(text);
  if (!bold?.length) {
    return { text: shown, bold: undefined as [number, number][] | undefined };
  }

  const at: number[] = [];
  let plain = 0;
  for (let index = 0; index <= text.length; index += 1) {
    at[index] = plain;
    if (index < text.length && !NIQQUD.test(text[index] ?? "")) {
      plain += 1;
    }
  }

  const next = bold
    .map(([start, end]) => [at[start] ?? 0, at[end] ?? shown.length] as [number, number])
    .filter(([start, end]) => end > start);

  return { text: shown, bold: next.length > 0 ? next : undefined };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function englishBold(text: string, word: string): [number, number][] | undefined {
  const needle = word.trim();
  if (!needle || !text) {
    return undefined;
  }

  const match = new RegExp(
    `(?<![\\p{L}\\p{M}])${escapeRegExp(needle)}(?![\\p{L}\\p{M}])`,
    "iu",
  ).exec(text);

  if (!match) {
    return undefined;
  }

  return [[match.index, match.index + match[0].length]];
}

export function hebrewBold(text: string, word: string): [number, number][] | undefined {
  const needle = stripNiqqud(word.trim());
  if (!needle || !text) {
    return undefined;
  }

  const plain: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    if (!NIQQUD.test(text[index] ?? "")) {
      plain.push(index);
    }
  }

  const at = stripNiqqud(text).indexOf(needle);
  const start = plain[at];
  const end = plain[at + needle.length - 1];
  if (at < 0 || start === undefined || end === undefined) {
    return undefined;
  }

  return [[start, end + 1]];
}
