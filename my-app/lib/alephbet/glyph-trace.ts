// The tracing target is the font glyph itself. A hand-drawn stroke list drifts off
// the letter; these maps are measured from the pixels of the face on the card.

// plateSize is the size of the plate in pixels
// maskSize is the size of the mask in pixels
// scratchSize is the size of the scratch in pixels
// measureSize is the size of the measure in pixels
export const plateSize = 640;
export const maskSize = 320;

const scratchSize = 1600;
const measureSize = 240;

// One disconnected piece of the letter, such as the leg of he or a geresh.
export type StrokePart = {
  pixels: Uint32Array;
};

export type LetterGuide = {
  plate: HTMLCanvasElement;
  glyph: Uint8Array;
  room: Uint8Array;
  parts: readonly StrokePart[];
  penRadius: number;
};

type Box = { x: number; y: number; w: number; h: number };

const neighbors = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
] as const;

export function rasterizeLetter(letter: string, family: string, weight: string): LetterGuide | null {
  const face = (size: number) => `${weight} ${size}px ${family}`;
  const scratch = document.createElement("canvas");
  scratch.width = scratchSize;
  scratch.height = scratchSize;
  const measure = scratch.getContext("2d", { willReadFrequently: true });
  if (!measure) return null;

  measure.font = face(measureSize);
  measure.direction = "rtl";
  measure.textAlign = "center";
  measure.textBaseline = "middle";
  measure.fillStyle = "#000";
  measure.fillText(letter, scratchSize / 2, scratchSize / 2);

  const measured = alphaMask(measure.getImageData(0, 0, scratchSize, scratchSize).data, 128);
  const box = boxOf(measured, scratchSize);
  if (!box) return null;

  const scale = (plateSize * 0.84) / Math.max(box.w, box.h);
  const anchorX = plateSize / 2 - (box.x + box.w / 2 - scratchSize / 2) * scale;
  const anchorY = plateSize / 2 - (box.y + box.h / 2 - scratchSize / 2) * scale;

  const plate = document.createElement("canvas");
  plate.width = plateSize;
  plate.height = plateSize;
  const drawn = plate.getContext("2d", { willReadFrequently: true });
  if (!drawn) return null;

  drawn.font = face(measureSize * scale);
  drawn.direction = "rtl";
  drawn.textAlign = "center";
  drawn.textBaseline = "middle";
  drawn.fillStyle = "#000";
  drawn.fillText(letter, anchorX, anchorY);

  const plateImage = drawn.getImageData(0, 0, plateSize, plateSize);
  const glyph = downsample(plateImage.data, plateSize, maskSize);
  if (countOn(glyph) < 24) return null;

  const radius = strokeRadius(glyph);
  const spine = pruneSpurs(thin(glyph), Math.round(radius * 0.8));
  const target = countOn(spine) >= 24 ? spine : glyph;

  return {
    plate,
    glyph,
    room: dilate(glyph, Math.max(4, Math.round(radius * 0.4))),
    parts: strokeParts(glyph, target),
    penRadius: radius,
  };
}

// Each part is averaged, and every part has to reach the threshold. A single
// percentage of the whole letter lets the large stroke finish he or tsadi-geresh alone.
export function traceScore(parts: readonly StrokePart[], ink: Uint8Array, doneAt: number) {
  if (parts.length === 0) return { share: 0, done: false };

  let sum = 0;
  let done = true;
  for (const part of parts) {
    let hit = 0;
    const total = part.pixels.length;
    for (let index = 0; index < total; index += 1) {
      if (ink[part.pixels[index]]) hit += 1;
    }
    const share = total === 0 ? 0 : hit / total;
    sum += share;
    if (share < doneAt) done = false;
  }

  return { share: sum / parts.length, done };
}

export function contains(mask: Uint8Array, x: number, y: number) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || py < 0 || px >= maskSize || py >= maskSize) return false;
  return mask[py * maskSize + px] === 1;
}

export function segmentFits(room: Uint8Array, x0: number, y0: number, x1: number, y1: number) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    if (!contains(room, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false;
  }
  return true;
}

export function paintDisk(mask: Uint8Array, x: number, y: number, radius: number) {
  const cx = Math.round(x);
  const cy = Math.round(y);
  const reach = Math.ceil(radius);
  const limit = radius * radius;
  const y0 = Math.max(0, cy - reach);
  const y1 = Math.min(maskSize - 1, cy + reach);
  const x0 = Math.max(0, cx - reach);
  const x1 = Math.min(maskSize - 1, cx + reach);

  for (let py = y0; py <= y1; py += 1) {
    const dy = py - cy;
    const row = py * maskSize;
    for (let px = x0; px <= x1; px += 1) {
      const dx = px - cx;
      if (dx * dx + dy * dy <= limit) mask[row + px] = 1;
    }
  }
}

export function paintSegment(mask: Uint8Array, x0: number, y0: number, x1: number, y1: number, radius: number) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    paintDisk(mask, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, radius);
  }
}

function alphaMask(data: Uint8ClampedArray, threshold: number) {
  const mask = new Uint8Array(data.length / 4);
  for (let index = 0; index < mask.length; index += 1) {
    mask[index] = data[index * 4 + 3] >= threshold ? 1 : 0;
  }
  return mask;
}

function downsample(data: Uint8ClampedArray, from: number, to: number) {
  const mask = new Uint8Array(to * to);
  const step = from / to;
  for (let y = 0; y < to; y += 1) {
    const sy = Math.min(from - 1, Math.round(y * step + step / 2));
    for (let x = 0; x < to; x += 1) {
      const sx = Math.min(from - 1, Math.round(x * step + step / 2));
      mask[y * to + x] = data[(sy * from + sx) * 4 + 3] >= 128 ? 1 : 0;
    }
  }
  return mask;
}

function boxOf(mask: Uint8Array, size: number): Box | null {
  let minX = size;
  let minY = size;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < size; y += 1) {
    const row = y * size;
    for (let x = 0; x < size; x += 1) {
      if (!mask[row + x]) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function countOn(mask: Uint8Array) {
  let total = 0;
  for (let index = 0; index < mask.length; index += 1) total += mask[index];
  return total;
}

// Split the glyph into blobs that do not touch. A speck of antialiasing is dropped.
function strokeParts(glyph: Uint8Array, spine: Uint8Array): StrokePart[] {
  const labels = new Int16Array(glyph.length);
  labels.fill(-1);
  const sizes: number[] = [];
  const stack: number[] = [];

  for (let start = 0; start < glyph.length; start += 1) {
    if (!glyph[start] || labels[start] !== -1) continue;
    const id = sizes.length;
    let size = 0;
    labels[start] = id;
    stack.push(start);

    while (stack.length > 0) {
      const index = stack.pop() ?? 0;
      size += 1;
      const x = index % maskSize;
      const y = (index - x) / maskSize;
      for (const [dx, dy] of neighbors) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= maskSize || ny >= maskSize) continue;
        const next = ny * maskSize + nx;
        if (!glyph[next] || labels[next] !== -1) continue;
        labels[next] = id;
        stack.push(next);
      }
    }

    sizes.push(size);
  }

  const largest = sizes.reduce((max, size) => Math.max(max, size), 0);
  const minimum = Math.max(40, Math.round(largest * 0.02));
  const kept = sizes.map((size) => size >= minimum);
  const spineBuckets: number[][] = [];
  const glyphBuckets: number[][] = [];
  for (let id = 0; id < sizes.length; id += 1) {
    if (!kept[id]) continue;
    spineBuckets[id] = [];
    glyphBuckets[id] = [];
  }

  for (let index = 0; index < glyph.length; index += 1) {
    const id = labels[index];
    if (id < 0 || !kept[id]) continue;
    glyphBuckets[id].push(index);
    if (spine[index]) spineBuckets[id].push(index);
  }

  const parts: StrokePart[] = [];
  for (let id = 0; id < sizes.length; id += 1) {
    if (!kept[id]) continue;
    const pixels = spineBuckets[id].length >= 12 ? spineBuckets[id] : glyphBuckets[id];
    parts.push({ pixels: Uint32Array.from(pixels) });
  }

  return parts.length > 0 ? parts : [{ pixels: indexesOf(spine) }];
}

function indexesOf(mask: Uint8Array) {
  const pixels: number[] = [];
  for (let index = 0; index < mask.length; index += 1) {
    if (mask[index]) pixels.push(index);
  }
  return Uint32Array.from(pixels);
}

function dilate(mask: Uint8Array, radius: number) {
  const out = new Uint8Array(mask.length);
  const limit = radius * radius;
  for (let y = 0; y < maskSize; y += 1) {
    for (let x = 0; x < maskSize; x += 1) {
      if (!mask[y * maskSize + x]) continue;
      const y0 = Math.max(0, y - radius);
      const y1 = Math.min(maskSize - 1, y + radius);
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(maskSize - 1, x + radius);
      for (let py = y0; py <= y1; py += 1) {
        const dy = py - y;
        const row = py * maskSize;
        for (let px = x0; px <= x1; px += 1) {
          const dx = px - x;
          if (dx * dx + dy * dy <= limit) out[row + px] = 1;
        }
      }
    }
  }
  return out;
}

// Distance from each ink pixel to the nearest empty pixel. The high end is the stroke's half-width.
function strokeRadius(glyph: Uint8Array) {
  const dist = new Float32Array(glyph.length);
  const far = maskSize * 2;
  for (let index = 0; index < glyph.length; index += 1) dist[index] = glyph[index] ? far : 0;

  for (let y = 0; y < maskSize; y += 1) {
    for (let x = 0; x < maskSize; x += 1) {
      const index = y * maskSize + x;
      if (!glyph[index]) continue;
      let best = dist[index];
      if (x > 0) best = Math.min(best, dist[index - 1] + 1);
      if (y > 0) best = Math.min(best, dist[index - maskSize] + 1);
      if (x > 0 && y > 0) best = Math.min(best, dist[index - maskSize - 1] + 1.4142);
      if (x + 1 < maskSize && y > 0) best = Math.min(best, dist[index - maskSize + 1] + 1.4142);
      dist[index] = best;
    }
  }

  for (let y = maskSize - 1; y >= 0; y -= 1) {
    for (let x = maskSize - 1; x >= 0; x -= 1) {
      const index = y * maskSize + x;
      if (!glyph[index]) continue;
      let best = dist[index];
      if (x + 1 < maskSize) best = Math.min(best, dist[index + 1] + 1);
      if (y + 1 < maskSize) best = Math.min(best, dist[index + maskSize] + 1);
      if (x + 1 < maskSize && y + 1 < maskSize) best = Math.min(best, dist[index + maskSize + 1] + 1.4142);
      if (x > 0 && y + 1 < maskSize) best = Math.min(best, dist[index + maskSize - 1] + 1.4142);
      dist[index] = best;
    }
  }

  const values: number[] = [];
  for (let index = 0; index < glyph.length; index += 1) {
    if (glyph[index]) values.push(dist[index]);
  }
  values.sort((left, right) => left - right);
  const radius = values[Math.min(values.length - 1, Math.round((values.length - 1) * 0.7))] ?? 8;
  return Math.max(5, Math.min(24, radius));
}

function thin(mask: Uint8Array) {
  const current = new Uint8Array(mask);
  const boxed = boxOf(current, maskSize);
  if (!boxed) return current;

  const clear: number[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let step = 0; step < 2; step += 1) {
      clear.length = 0;
      const y0 = Math.max(1, boxed.y);
      const y1 = Math.min(maskSize - 2, boxed.y + boxed.h);
      const x0 = Math.max(1, boxed.x);
      const x1 = Math.min(maskSize - 2, boxed.x + boxed.w);
      for (let y = y0; y <= y1; y += 1) {
        for (let x = x0; x <= x1; x += 1) {
          const index = y * maskSize + x;
          if (!current[index]) continue;
          const ring = ringAt(current, x, y);
          const links = ring[0] + ring[1] + ring[2] + ring[3] + ring[4] + ring[5] + ring[6] + ring[7];
          if (links < 2 || links > 6 || transitions(ring) !== 1) continue;
          const north = ring[0];
          const east = ring[2];
          const south = ring[4];
          const west = ring[6];
          if (step === 0) {
            if (north && east && south) continue;
            if (east && south && west) continue;
          } else if ((north && east && west) || (north && south && west)) {
            continue;
          }
          clear.push(index);
        }
      }
      if (clear.length > 0) {
        changed = true;
        for (const index of clear) current[index] = 0;
      }
    }
  }

  return current;
}

function ringAt(mask: Uint8Array, x: number, y: number) {
  const ring = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let index = 0; index < neighbors.length; index += 1) {
    const [dx, dy] = neighbors[index];
    ring[index] = mask[(y + dy) * maskSize + (x + dx)];
  }
  return ring;
}

function transitions(ring: number[]) {
  let changes = 0;
  for (let index = 0; index < ring.length; index += 1) {
    if (ring[index] === 0 && ring[(index + 1) % ring.length] === 1) changes += 1;
  }
  return changes;
}

function degree(mask: Uint8Array, x: number, y: number) {
  let links = 0;
  for (const [dx, dy] of neighbors) {
    if (mask[(y + dy) * maskSize + (x + dx)]) links += 1;
  }
  return links;
}

// Drops short branches that thinning leaves on curves, and keeps real strokes.
function pruneSpurs(mask: Uint8Array, keep: number) {
  const current = new Uint8Array(mask);
  let removed = true;

  while (removed) {
    removed = false;
    for (let y = 1; y < maskSize - 1; y += 1) {
      for (let x = 1; x < maskSize - 1; x += 1) {
        if (!current[y * maskSize + x] || degree(current, x, y) !== 1) continue;
        const trail: number[] = [];
        let cx = x;
        let cy = y;
        let previous = -1;
        let spur = false;

        for (let step = 0; step < keep; step += 1) {
          const here = cy * maskSize + cx;
          if (!current[here]) break;
          trail.push(here);
          const next: number[] = [];
          for (const [dx, dy] of neighbors) {
            const nx = cx + dx;
            const ny = cy + dy;
            const index = ny * maskSize + nx;
            if (current[index] && index !== previous) next.push(index);
          }
          if (next.length !== 1) break;
          previous = here;
          const following = next[0];
          cx = following % maskSize;
          cy = Math.floor(following / maskSize);
          if (degree(current, cx, cy) >= 3) {
            spur = true;
            break;
          }
        }

        if (!spur) continue;
        for (const index of trail) current[index] = 0;
        removed = true;
      }
    }
  }

  return current;
}
