"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { placeExperience, spanForLevel } from "@/lib/flashcards/experience";

export function ExperienceAward({ from, to }: { from: number; to: number }) {
  const t = useTranslations("Flashcards");
  const start = placeExperience(from);
  const end = placeExperience(to);
  const [level, setLevel] = useState(start.level);
  const [width, setWidth] = useState(start.span === 0 ? 0 : (start.into / start.span) * 100);
  const [smooth, setSmooth] = useState(false);
  const span = spanForLevel(level);
  const into = Math.round((width / 100) * span);
  const gained = Math.max(0, to - from);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const endWidth = end.span === 0 ? 0 : (end.into / end.span) * 100;

    if (reduce) {
      setLevel(end.level);
      setWidth(endWidth);
      setSmooth(false);
      return;
    }

    const frames: { level: number; width: number; smooth: boolean }[] = [];

    if (end.level === start.level) {
      frames.push({ level: end.level, width: endWidth, smooth: true });
    } else {
      frames.push({ level: start.level, width: 100, smooth: true });
      for (let next = start.level + 1; next < end.level; next += 1) {
        frames.push({ level: next, width: 0, smooth: false });
        frames.push({ level: next, width: 100, smooth: true });
      }
      frames.push({ level: end.level, width: 0, smooth: false });
      frames.push({ level: end.level, width: endWidth, smooth: true });
    }

    let cancel = false;
    const timers: number[] = [];
    let delay = 160;

    for (const frame of frames) {
      timers.push(
        window.setTimeout(() => {
          if (cancel) {
            return;
          }
          setSmooth(frame.smooth);
          setLevel(frame.level);
          setWidth(frame.width);
        }, delay),
      );
      delay += frame.smooth ? 900 : 50;
    }

    return () => {
      cancel = true;
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [end.into, end.level, end.span, start.level]);

  return (
    <div className="mt-8 w-full max-w-sm">
      <p className="text-2xl font-semibold tracking-tight text-emerald-800">
        {t("experienceGained", { points: gained })}
      </p>
      <div className="mt-4 flex items-baseline justify-between gap-3 text-sm text-emerald-900/70">
        <p>{t("levelLabel", { level })}</p>
        <p>{t("experienceProgress", { into, span })}</p>
      </div>
      <div
        className="mt-2 h-3 overflow-hidden rounded-full bg-emerald-950/10"
        role="meter"
        aria-label={t("levelLabel", { level })}
        aria-valuemin={0}
        aria-valuemax={span}
        aria-valuenow={into}
      >
        <div
          className={`h-full rounded-full bg-emerald-700 ${smooth ? "transition-[width] duration-700 ease-out motion-reduce:transition-none" : ""}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
