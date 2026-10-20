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
  type LetterGuide,
} from "@/lib/alephbet/glyph-trace";

const doneAt = 0.80;
const inkColor = "#047857";
const missColor = "#b91c1c";

type Point = { x: number; y: number };

export function LetterDraw({ letter, fontClassName }: { letter: string; fontClassName: string }) {
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
  const [ready, setReady] = useState(false);
  const [percent, setPercent] = useState(0);
  const [miss, setMiss] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancel = false;
    const probe = probeRef.current;
    guideRef.current = null;
    doneRef.current = false;
    drawingRef.current = false;
    setReady(false);
    setDone(false);
    setMiss(false);
    setPercent(0);

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

      const guide = rasterizeLetter(letter, family, weight);
      const guideCanvas = guideCanvasRef.current;
      const inkCanvas = inkCanvasRef.current;
      if (!guide || !guideCanvas || !inkCanvas || cancel) return;

      guideRef.current = guide;
      inkRef.current = new Uint8Array(maskSize * maskSize);
      paintPlate(guideCanvas, guide.plate, "rgba(6, 78, 59, 0.45)");
      inkCanvas.getContext("2d")?.clearRect(0, 0, plateSize, plateSize);
      setReady(true);
    }

    void prepare();
    return () => {
      cancel = true;
      if (missTimer.current !== null) window.clearTimeout(missTimer.current);
    };
  }, [letter, fontClassName]);

  function publish(share: number, force = false) {
    const next = Math.round(share * 100);
    const now = performance.now();
    if (!force && now - paintedAt.current < 90) return;
    paintedAt.current = now;
    setPercent((current) => (current === next ? current : next));
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
    if (guide) inkRef.current = new Uint8Array(maskSize * maskSize);
    if (guide && guideCanvas) paintPlate(guideCanvas, guide.plate, "rgba(6, 78, 59, 0.45)");
    inkCanvas?.getContext("2d")?.clearRect(0, 0, plateSize, plateSize);
    setMiss(false);
    setDone(false);
    setPercent(0);
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
      if (committed && current) publish(traceScore(current.parts, committed, doneAt).share, true);
      missTimer.current = null;
    }, 320);
  }

  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const guide = guideRef.current;
    const committed = inkRef.current;
    const canvas = inkCanvasRef.current;
    if (!guide || !committed || !canvas || doneRef.current || lockedRef.current || event.button !== 0) return;

    const point = pointFrom(event);
    if (!contains(guide.glyph, point.x, point.y)) return;

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
    publish(traceScore(guide.parts, draftRef.current, doneAt).share);
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const guide = guideRef.current;
    const draft = draftRef.current;
    const last = lastRef.current;
    const canvas = inkCanvasRef.current;
    if (!drawingRef.current || !guide || !draft || !last || !canvas) return;

    const point = pointFrom(event);
    if (!segmentFits(guide.room, last.x, last.y, point.x, point.y)) {
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
    publish(traceScore(guide.parts, draft, doneAt).share);
  }

  function onPointerUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const guide = guideRef.current;
    const draft = draftRef.current;
    if (!guide || !draft) return;

    inkRef.current = draft;
    const score = traceScore(guide.parts, draft, doneAt);
    publish(score.share, true);
    if (!score.done) return;

    const guideCanvas = guideCanvasRef.current;
    if (guideCanvas) paintPlate(guideCanvas, guide.plate, inkColor);
    inkCanvasRef.current?.getContext("2d")?.clearRect(0, 0, plateSize, plateSize);
    doneRef.current = true;
    setDone(true);
  }

  return (
    <div className="flex h-full min-h-[26rem] flex-col">
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
        {done ? t("drawDone") : ready ? t("drawProgress", { percent }) : t("drawLetter")}
      </p>
      <p className="mt-1 text-center text-sm text-muted-foreground">{done ? t("drawDoneHint") : t("drawHint")}</p>
      <div className="flex flex-1 items-center justify-center py-4">
        <div
          className={cn(
            "relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-emerald-50/60",
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
      <div className="flex justify-center">
        <Button type="button" variant="outline" onClick={resetAll} disabled={!ready}>
          {t("drawAgain")}
        </Button>
      </div>
    </div>
  );
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
