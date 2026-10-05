const NIQQUD = /[\u0591-\u05C7]/;

export function stripNiqqud(value: string) {
  return value.replace(/[\u0591-\u05C7]/g, "");
}

export function hasNiqqud(value: string) {
  return NIQQUD.test(value);
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
