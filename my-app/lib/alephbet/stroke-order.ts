import type { StrokePath } from "@/lib/alephbet/glyph-trace";

function stroke(...points: readonly (readonly [number, number])[]): StrokePath {
  return points;
}

// Block-letter strokes, right to left and top to bottom, in the order they are taught.
// Coordinates run from the left (0) to the right (1) and from the top (0) to the bottom (1).
const printStrokes: Record<string, readonly StrokePath[]> = {
  aleph: [
    stroke([0.8, 0.06], [0.46, 0.4]),
    stroke([0.32, 0.46], [0.16, 0.94]),
    stroke([0.16, 0.16], [0.86, 0.9]),
  ],
  bet: [stroke([0.84, 0.12], [0.16, 0.12]), stroke([0.8, 0.12], [0.82, 0.72], [0.24, 0.9])],
  gimel: [stroke([0.8, 0.16], [0.2, 0.16], [0.2, 0.52]), stroke([0.62, 0.18], [0.74, 0.94])],
  dalet: [stroke([0.86, 0.14], [0.14, 0.14]), stroke([0.76, 0.16], [0.76, 0.94])],
  he: [stroke([0.78, 0.1], [0.78, 0.94]), stroke([0.76, 0.14], [0.2, 0.14], [0.2, 0.42])],
  vav: [stroke([0.58, 0.06], [0.46, 0.7])],
  zayin: [stroke([0.82, 0.2], [0.16, 0.2]), stroke([0.64, 0.22], [0.52, 0.9])],
  chet: [stroke([0.76, 0.14], [0.76, 0.92]), stroke([0.74, 0.16], [0.22, 0.16], [0.22, 0.92])],
  tet: [
    stroke([0.4, 0.16], [0.24, 0.42], [0.3, 0.74], [0.52, 0.84]),
    stroke([0.5, 0.16], [0.8, 0.32], [0.8, 0.68], [0.48, 0.9]),
  ],
  yod: [stroke([0.66, 0.28], [0.4, 0.44])],
  kaf: [stroke([0.82, 0.14], [0.2, 0.18]), stroke([0.78, 0.16], [0.84, 0.52], [0.42, 0.92], [0.18, 0.74])],
  kafSofit: [stroke([0.74, 0.02], [0.24, 0.08]), stroke([0.66, 0.04], [0.58, 0.98])],
  lamed: [
    stroke([0.58, 0.02], [0.36, 0.28]),
    stroke([0.4, 0.3], [0.8, 0.36], [0.82, 0.68], [0.38, 0.94], [0.18, 0.72]),
  ],
  mem: [stroke([0.22, 0.18], [0.22, 0.55]), stroke([0.22, 0.2], [0.8, 0.16], [0.8, 0.7], [0.32, 0.9])],
  memSofit: [stroke([0.2, 0.14], [0.2, 0.86], [0.8, 0.86], [0.8, 0.14], [0.2, 0.14])],
  nun: [stroke([0.78, 0.26], [0.22, 0.3]), stroke([0.64, 0.28], [0.52, 0.98])],
  nunSofit: [stroke([0.58, 0.02], [0.46, 0.98])],
  samekh: [stroke([0.55, 0.14], [0.26, 0.32], [0.2, 0.6], [0.4, 0.9], [0.72, 0.84], [0.84, 0.5], [0.68, 0.2], [0.5, 0.14])],
  ayin: [
    stroke([0.72, 0.12], [0.84, 0.42], [0.68, 0.88]),
    stroke([0.48, 0.2], [0.22, 0.4], [0.2, 0.72], [0.46, 0.52]),
  ],
  pe: [stroke([0.34, 0.12], [0.34, 0.4]), stroke([0.34, 0.26], [0.78, 0.2], [0.84, 0.55], [0.52, 0.92], [0.22, 0.68])],
  peSofit: [stroke([0.72, 0.04], [0.28, 0.1], [0.26, 0.34]), stroke([0.62, 0.18], [0.56, 0.98])],
  tsadi: [stroke([0.8, 0.12], [0.54, 0.4], [0.72, 0.88]), stroke([0.42, 0.2], [0.24, 0.48], [0.34, 0.96])],
  tsadiSofit: [stroke([0.74, 0.04], [0.54, 0.26]), stroke([0.42, 0.1], [0.28, 0.32], [0.38, 0.98])],
  kuf: [
    stroke([0.78, 0.1], [0.32, 0.1], [0.26, 0.34], [0.55, 0.48], [0.78, 0.26]),
    stroke([0.36, 0.34], [0.3, 0.98]),
  ],
  reish: [stroke([0.84, 0.16], [0.18, 0.16]), stroke([0.74, 0.18], [0.74, 0.92])],
  shin: [stroke([0.84, 0.12], [0.62, 0.88]), stroke([0.55, 0.08], [0.46, 0.9]), stroke([0.2, 0.18], [0.38, 0.88])],
  tav: [stroke([0.84, 0.14], [0.16, 0.14], [0.2, 0.92]), stroke([0.72, 0.2], [0.76, 0.92])],
};

function withGeresh(base: readonly StrokePath[]): readonly StrokePath[] {
  const moved = base.map((path) => path.map(([x, y]) => [0.24 + x * 0.76, y] as const));
  return [...moved, stroke([0.14, 0.06], [0.03, 0.22])];
}

printStrokes.gimelGeresh = withGeresh(printStrokes.gimel);
printStrokes.zayinGeresh = withGeresh(printStrokes.zayin);
printStrokes.tsadiGeresh = withGeresh(printStrokes.tsadi);

export function strokesFor(letterId: string) {
  return printStrokes[letterId];
}
