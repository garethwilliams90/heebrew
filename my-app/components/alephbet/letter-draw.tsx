"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  contains,
  maskSize,
  paintDisk,
  paintSegment,
  plateSize,
  rasterizeLetter,
  segmentFits,
  traceScore,
  withStrokeOrder,
  type LetterGuide,
  type OrderedStroke,
  type StrokePath,
} from "@/lib/alephbet/glyph-trace";

const doneAt = 0.8;
const strokeDoneAt = 0.72;
const inkColor = "#047857";
const missColor = "#b91c1c";

type Point = { x: number; y: number };

export function LetterDraw({
  letter,
  fontClassName,
  paths,
  onComplete,
  embedded = false,
}: {
  letter: string;
  fontClassName: string;
  paths?: readonly StrokePath[];
  onComplete?: () => void;
  embedded?: boolean;
}) {
  const t = useTranslations("AlephBet");
  const probeRef = useRef<HTMLSpanElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement>(null);
  const guideRef = useRef<LetterGuide | null>(null);
  const inkRef = useRef<Uint8Array | null>(null);
  const draftRef = useRef<Uint8Array | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);
  const strokeRef = useRef<Point[]>([]);
  const lastRef = useRef<Point | null>(null);
  const drawingRef = useRef(false);
  const doneRef = useRef(false);
  const lockedRef = useRef(false);
  const missTimer = useRef<number | null>(null);
  const paintedAt = useRef(0);
  const strokeIndexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const [ready, setReady] = useState(false);
  const [percent, setPercent] = useState(0);
  const [miss, setMiss] = useState(false);
  const [done, setDone] = useState(false);
  const [strokeIndex, setStrokeIndex] = useState(0);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancel = false;
    const probe = probeRef.current;
    guideRef.current = null;
    doneRef.current = false;
    drawingRef.current = false;
    strokeIndexRef.current = 0;
    setReady(false);
    setDone(false);
    setMiss(false);
    setPercent(0);
    setStrokeIndex(0);

    async function prepare() {
      if (!probe) return;
      const style = getComputedStyle(probe);
      const family = style.fontFamily;
      const weight = style.fontWeight;
      try {
        await document.fonts.load(`${weight} ${plateSize}px ${family}`, letter);
      } catch {
        // The face can still be one the browser has already loaded.
      }
      await document.fonts.ready;
      if (cancel) return;

      const raster = rasterizeLetter(letter, family, weight);
      const guideCanvas = guideCanvasRef.current;
      const inkCanvas = inkCanvasRef.current;
      if (!raster || !guideCanvas || !inkCanvas || cancel) return;

      const guide = paths && paths.length > 0 ? withStrokeOrder(raster, paths) : raster;
      guideRef.current = guide;
      inkRef.current = new Uint8Array(maskSize * maskSize);
      if (guide.order) {
        paintOrderedGuide(guideCanvas, guide, 0);
      } else {
        paintPlate(guideCanvas, guide.plate, "rgba(6, 78, 59, 0.45)");
      }
      inkCanvas.getContext("2d")?.clearRect(0, 0, plateSize, plateSize);
      setReady(true);
    }

    void prepare();
    return () => {
      cancel = true;
      if (missTimer.current !== null) window.clearTimeout(missTimer.current);
    };
  }, [letter, fontClassName, paths]);

  useEffect(() => {
    const guide = guideRef.current;
    const canvas = guideCanvasRef.current;
    if (!ready || !guide?.order || !canvas) return;
    paintOrderedGuide(canvas, guide, strokeIndex);
  }, [ready, strokeIndex]);

  function publish(share: number, force = false) {
    const next = Math.round(share * 100);
    const now = performance.now();
    if (!force && now - paintedAt.current < 90) return;
    paintedAt.current = now;
    setPercent((current) => (current === next ? current : next));
  }

  function currentStroke() {
    return guideRef.current?.order?.[strokeIndexRef.current] ?? null;
  }

  function finishLetter() {
    const guide = guideRef.current;
    const guideCanvas = guideCanvasRef.current;
    if (guide && guideCanvas) paintPlate(guideCanvas, guide.plate, inkColor);
    inkCanvasRef.current?.getContext("2d")?.clearRect(0, 0, plateSize, plateSize);
    doneRef.current = true;
    setDone(true);
    onCompleteRef.current?.();
  }

  function advanceStroke() {
    const guide = guideRef.current;
    const order = guide?.order;
    if (!order) {
      finishLetter();
      return;
    }
    const next = strokeIndexRef.current + 1;
    if (next >= order.length) {
      finishLetter();
      return;
    }
    strokeIndexRef.current = next;
    setStrokeIndex(next);
    setPercent(0);
  }

  function resetAll() {
    const guide = guideRef.current;
    const guideCanvas = guideCanvasRef.current;
    const inkCanvas = inkCanvasRef.current;
    if (missTimer.current !== null) {
      window.clearTimeout(missTimer.current);
      missTimer.current = null;
    }
    drawingRef.current = false;
    doneRef.current = false;
    lockedRef.current = false;
    strokeIndexRef.current = 0;
    if (guide) inkRef.current = new Uint8Array(maskSize * maskSize);
    if (guide && guideCanvas) {
      if (guide.order) paintOrderedGuide(guideCanvas, guide, 0);
      else paintPlate(guideCanvas, guide.plate, "rgba(6, 78, 59, 0.45)");
    }
    inkCanvas?.getContext("2d")?.clearRect(0, 0, plateSize, plateSize);
    setMiss(false);
    setDone(false);
    setPercent(0);
    setStrokeIndex(0);
  }

  function failStroke() {
    const guide = guideRef.current;
    const canvas = inkCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    const shot = snapshotRef.current;
    drawingRef.current = false;
    lockedRef.current = true;
    if (ctx && shot && guide) {
      ctx.putImageData(shot, 0, 0);
      trace(ctx, guide, strokeRef.current, missColor);
    }
    setMiss(true);
    if (missTimer.current !== null) window.clearTimeout(missTimer.current);
    missTimer.current = window.setTimeout(() => {
      if (ctx && shot) ctx.putImageData(shot, 0, 0);
      lockedRef.current = false;
      setMiss(false);
      const committed = inkRef.current;
      const current = guideRef.current;
      const ordered = current?.order?.[strokeIndexRef.current];
      if (committed && ordered) publish(traceScore([{ pixels: ordered.pixels }], committed, strokeDoneAt).share, true);
      else if (committed && current) publish(traceScore(current.parts, committed, doneAt).share, true);
      missTimer.current = null;
    }, 320);
  }

  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const guide = guideRef.current;
    const committed = inkRef.current;
    const canvas = inkCanvasRef.current;
    if (!guide || !committed || !canvas || doneRef.current || lockedRef.current || event.button !== 0) return;

    const point = pointFrom(event);
    const ordered = currentStroke();
    if (ordered) {
      if (!startsOnStroke(point, ordered, guide.startReach)) {
        if (contains(guide.glyph, point.x, point.y)) {
          setMiss(true);
          window.setTimeout(() => setMiss(false), 280);
        }
        return;
      }
    } else if (!contains(guide.glyph, point.x, point.y)) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // A lost pointer can refuse capture. The stroke still follows the events we do get.
    }
    snapshotRef.current = ctx.getImageData(0, 0, plateSize, plateSize);
    draftRef.current = committed.slice();
    strokeRef.current = [point];
    lastRef.current = point;
    drawingRef.current = true;
    trace(ctx, guide, [point], inkColor);
    paintDisk(draftRef.current, point.x, point.y, guide.penRadius);
    const target = ordered ? [{ pixels: ordered.pixels }] : guide.parts;
    publish(traceScore(target, draftRef.current, ordered ? strokeDoneAt : doneAt).share);
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const guide = guideRef.current;
    const draft = draftRef.current;
    const last = lastRef.current;
    const canvas = inkCanvasRef.current;
    if (!drawingRef.current || !guide || !draft || !last || !canvas) return;

    const point = pointFrom(event);
    const ordered = currentStroke();
    const room = ordered ? ordered.room : guide.room;
    if (!segmentFits(room, last.x, last.y, point.x, point.y)) {
      strokeRef.current.push(point);
      failStroke();
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = plateSize / maskSize;
    stylePen(ctx, guide, inkColor);
    ctx.beginPath();
    ctx.moveTo(last.x * scale, last.y * scale);
    ctx.lineTo(point.x * scale, point.y * scale);
    ctx.stroke();
    paintSegment(draft, last.x, last.y, point.x, point.y, guide.penRadius);
    strokeRef.current.push(point);
    lastRef.current = point;
    const target = ordered ? [{ pixels: ordered.pixels }] : guide.parts;
    publish(traceScore(target, draft, ordered ? strokeDoneAt : doneAt).share);
  }

  function onPointerUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const guide = guideRef.current;
    const draft = draftRef.current;
    if (!guide || !draft) return;

    inkRef.current = draft;
    const ordered = currentStroke();
    if (ordered) {
      const score = traceScore([{ pixels: ordered.pixels }], draft, strokeDoneAt);
      publish(score.share, true);
      if (score.done) advanceStroke();
      return;
    }

    const score = traceScore(guide.parts, draft, doneAt);
    publish(score.share, true);
    if (score.done) finishLetter();
  }

  const orderedStroke = ready ? guideRef.current?.order?.[strokeIndex] : null;
  const strokeCount = guideRef.current?.order?.length ?? 0;
  const angle =
    orderedStroke == null
      ? 0
      : (Math.atan2(orderedStroke.aimY - orderedStroke.startY, orderedStroke.aimX - orderedStroke.startX) * 180) / Math.PI;

  return (
    <div className={cn("flex h-full flex-col", embedded ? "min-h-0" : "min-h-[26rem]")}>
      <span
        ref={probeRef}
        lang="he"
        dir="rtl"
        aria-hidden
        className={cn("pointer-events-none absolute size-0 overflow-hidden", fontClassName)}
      >
        {letter}
      </span>
      <p className="text-center text-sm text-emerald-900/70">
        {done
          ? t("drawDone")
          : orderedStroke
            ? t("drawStroke", { current: strokeIndex + 1, total: strokeCount })
            : ready
              ? t("drawProgress", { percent })
              : t("drawLetter")}
      </p>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        {done ? t("drawDoneHint") : orderedStroke ? t("drawOrderHint") : t("drawHint")}
      </p>
      <div className="flex min-h-0 flex-1 items-center justify-center py-4">
        <div
          className={cn(
            "relative aspect-square w-full overflow-hidden rounded-3xl bg-emerald-50/60",
            embedded ? "max-w-[16rem]" : "max-w-sm",
            miss && "ring-2 ring-red-700/70",
          )}
        >
          <canvas
            ref={guideCanvasRef}
            width={plateSize}
            height={plateSize}
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          <canvas
            ref={inkCanvasRef}
            width={plateSize}
            height={plateSize}
            aria-label={t("drawLetter")}
            className="absolute inset-0 h-full w-full touch-none select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
          {orderedStroke && !done ? (
            <span
              className="pointer-events-none absolute"
              style={{
                left: `${(orderedStroke.startX / maskSize) * 100}%`,
                top: `${(orderedStroke.startY / maskSize) * 100}%`,
              }}
            >
              <span
                className="absolute top-0 left-0 h-1 w-8 rounded-full bg-emerald-700"
                style={{ transform: `translateY(-50%) rotate(${angle}deg)`, transformOrigin: "0 50%" }}
              />
              <span className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border-2 border-white bg-emerald-600" />
            </span>
          ) : null}
          {ready ? null : (
            <span
              lang="he"
              dir="rtl"
              className={cn(
                "pointer-events-none absolute inset-0 flex items-center justify-center text-8xl text-emerald-950/25",
                fontClassName,
              )}
            >
              {letter}
            </span>
          )}
        </div>
      </div>
      {onComplete ? null : (
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={resetAll} disabled={!ready}>
            {t("drawAgain")}
          </Button>
        </div>
      )}
    </div>
  );
}

function startsOnStroke(point: Point, stroke: OrderedStroke, reach: number) {
  return Math.hypot(point.x - stroke.startX, point.y - stroke.startY) <= reach;
}

function pointFrom(event: React.PointerEvent<HTMLCanvasElement>): Point {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * maskSize,
    y: ((event.clientY - rect.top) / rect.height) * maskSize,
  };
}

function stylePen(ctx: CanvasRenderingContext2D, guide: LetterGuide, color: string) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = guide.penRadius * 2 * (plateSize / maskSize);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function trace(ctx: CanvasRenderingContext2D, guide: LetterGuide, points: readonly Point[], color: string) {
  if (points.length === 0) return;
  stylePen(ctx, guide, color);
  const scale = plateSize / maskSize;
  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x * scale, points[0].y * scale, guide.penRadius * scale, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x * scale, points[0].y * scale);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x * scale, points[index].y * scale);
  }
  ctx.stroke();
}

function paintPlate(canvas: HTMLCanvasElement, plate: HTMLCanvasElement, color: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, plateSize, plateSize);
  ctx.drawImage(plate, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, plateSize, plateSize);
  ctx.globalCompositeOperation = "source-over";
}

function paintOrderedGuide(canvas: HTMLCanvasElement, guide: LetterGuide, strokeIndex: number) {
  const ctx = canvas.getContext("2d");
  const stroke = guide.order?.[strokeIndex];
  if (!ctx || !stroke) return;
  ctx.clearRect(0, 0, plateSize, plateSize);
  ctx.drawImage(guide.plate, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = "rgba(6, 78, 59, 0.28)";
  ctx.fillRect(0, 0, plateSize, plateSize);
  ctx.globalCompositeOperation = "source-over";
  paintMaskedPlate(ctx, guide.plate, strokeMask(stroke), "#047857");
}

function strokeMask(stroke: OrderedStroke) {
  const mask = new Uint8Array(maskSize * maskSize);
  for (let index = 0; index < stroke.pixels.length; index += 1) mask[stroke.pixels[index]] = 1;
  return mask;
}

function paintMaskedPlate(
  ctx: CanvasRenderingContext2D,
  plate: HTMLCanvasElement,
  mask: Uint8Array,
  color: string,
) {
  const layer = document.createElement("canvas");
  layer.width = plateSize;
  layer.height = plateSize;
  const layerCtx = layer.getContext("2d");
  const maskImage = maskCanvas(mask);
  if (!layerCtx || !maskImage) return;
  layerCtx.drawImage(plate, 0, 0);
  layerCtx.globalCompositeOperation = "source-in";
  layerCtx.fillStyle = color;
  layerCtx.fillRect(0, 0, plateSize, plateSize);
  layerCtx.globalCompositeOperation = "destination-in";
  layerCtx.drawImage(maskImage, 0, 0, plateSize, plateSize);
  ctx.drawImage(layer, 0, 0);
}

function maskCanvas(mask: Uint8Array) {
  const small = document.createElement("canvas");
  small.width = maskSize;
  small.height = maskSize;
  const ctx = small.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(maskSize, maskSize);
  for (let index = 0; index < mask.length; index += 1) {
    if (!mask[index]) continue;
    const offset = index * 4;
    image.data[offset] = 255;
    image.data[offset + 1] = 255;
    image.data[offset + 2] = 255;
    image.data[offset + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return small;
}
