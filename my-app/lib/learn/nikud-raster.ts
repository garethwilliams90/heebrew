import { printFont } from "@/components/alephbet/print-font";

const carrier = "\u05D3";

export type NikudImage = { url: string; width: number; height: number };

export async function rasterNikud(mark: string, tail: string): Promise<NikudImage | null> {
  await document.fonts.ready;
  const probe = document.createElement("span");
  probe.className = printFont.className;
  probe.textContent = carrier;
  probe.style.position = "absolute";
  probe.style.left = "-9999px";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();

  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const size = 280;
  const canvas = document.createElement("canvas");
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);
  ctx.font = `700 180px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#2563eb";
  ctx.direction = "rtl";
  const text = tail || `${carrier}${mark}`;
  ctx.fillText(text, size / 2, size / 2);
  if (!tail) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 8;
    ctx.strokeText(carrier, size / 2, size / 2);
    ctx.fillText(carrier, size / 2, size / 2);
    ctx.globalCompositeOperation = "source-over";
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 3; index < pixels.data.length; index += 4) {
      if (pixels.data[index] < 40) {
        pixels.data[index] = 0;
      }
    }
    ctx.putImageData(pixels, 0, 0);
  }

  const bounds = inkBounds(ctx, canvas.width, canvas.height);
  if (!bounds) {
    return null;
  }

  const pad = 8 * dpr;
  const left = Math.max(0, bounds.minX - pad);
  const top = Math.max(0, bounds.minY - pad);
  const width = Math.min(canvas.width - left, bounds.maxX - bounds.minX + pad * 2);
  const height = Math.min(canvas.height - top, bounds.maxY - bounds.minY + pad * 2);
  const cropped = document.createElement("canvas");
  cropped.width = width;
  cropped.height = height;
  cropped.getContext("2d")?.drawImage(canvas, left, top, width, height, 0, 0, width, height);
  return { url: cropped.toDataURL("image/png"), width: Math.round(width / dpr), height: Math.round(height / dpr) };
}

function inkBounds(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] < 20) {
        continue;
      }
      found = true;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  return found ? { minX, minY, maxX, maxY } : null;
}
