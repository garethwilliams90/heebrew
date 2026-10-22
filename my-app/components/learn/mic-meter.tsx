"use client";

import { useEffect, useRef } from "react";
import { cn } from "cn";

function bellHeight(index: number, count: number) {
  const x = count <= 1 ? 0 : (index / (count - 1)) * 2 - 1;
  return Math.exp(-2.4 * x * x);
}

export function MicMeter({
  stream,
  correct,
  onPeak,
}: {
  stream: MediaStream | null;
  correct: boolean;
  onPeak: (value: number) => void;
}) {
  const bars = useRef<HTMLSpanElement[]>([]);
  const peakRef = useRef(onPeak);
  peakRef.current = onPeak;

  useEffect(() => {
    if (!stream) {
      for (const bar of bars.current) {
        if (bar) bar.style.transform = correct ? "scaleY(0.92)" : "scaleY(0.08)";
      }
      return;
    }

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let frame = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let max = 0;
      for (let index = 0; index < data.length; index += 1) {
        const sample = Math.abs(data[index] - 128) / 128;
        if (sample > max) max = sample;
      }
      peakRef.current(max);
      const nodes = bars.current;
      for (let index = 0; index < nodes.length; index += 1) {
        const sampleIndex = Math.floor((index / Math.max(1, nodes.length - 1)) * (data.length - 1));
        const sample = Math.abs(data[sampleIndex] - 128) / 128;
        const bar = nodes[index];
        if (bar) bar.style.transform = `scaleY(${Math.max(0.08, Math.min(1, sample * 3))})`;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      void context.close();
    };
  }, [stream, correct]);

  const count = 17;

  return (
    <div className="flex h-16 w-72 items-end justify-center gap-1 sm:w-80" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="flex w-2 items-end rounded-full bg-emerald-950/10"
          style={{ height: `${Math.round(bellHeight(index, count) * 100)}%` }}
        >
          <span
            ref={(node) => {
              if (node) bars.current[index] = node;
            }}
            className={cn("h-full w-full origin-bottom rounded-full", correct ? "bg-green-500" : "bg-emerald-600")}
            style={{ transform: correct ? "scaleY(0.92)" : "scaleY(0.12)" }}
          />
        </span>
      ))}
    </div>
  );
}
