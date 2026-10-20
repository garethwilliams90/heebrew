"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { Link } from "@/i18n/navigation";
import { loadExperience, placeExperience } from "@/lib/flashcards/experience";
import { alphabetLetters } from "@/lib/alephbet/intro-alphabet";
import { hasLearningStarted } from "@/lib/learn/started";

const letters = alphabetLetters();

const stageForLevel: Record<number, string> = {
  1: "/learn",
  2: "/learn?from=2.0",
};

export function LevelPath() {
  const t = useTranslations("Home");
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [xpLevel, setXpLevel] = useState(1);

  useEffect(() => {
    setStarted(hasLearningStarted());
    void loadExperience().then((saved) => {
      setXpLevel(placeExperience(saved.experience).level);
      setReady(true);
    });
    function refresh() {
      void loadExperience().then((saved) => setXpLevel(placeExperience(saved.experience).level));
    }
    window.addEventListener("webrew-experience", refresh);
    return () => window.removeEventListener("webrew-experience", refresh);
  }, []);

  if (!ready || !started) {
    return null;
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      <p className="text-sm text-emerald-800">{t("levelPathHint", { level: xpLevel })}</p>
      <div className="flex flex-col justify-center gap-6" dir="rtl">
        {letters.map((letter, index) => {
          const level = index + 1;
          const open = xpLevel >= level;
          const href = stageForLevel[level];
          const className = cn(
            printFont.className,
            "flex size-64 flex-col items-center justify-center rounded-2xl border text-5xl",
            open
              ?  "border-emerald-950/30 bg-white/90 text-black shadow-[0_16px_40px_-28px_rgba(6,78,59,0.8)] bg-emerald-50"
              : "cursor-not-allowed border-emerald-950/5 bg-white/40 text-emerald-950/30",
          );

          if (!open) {
            return (
              <span key={letter.id} className={className} aria-disabled="true" lang="he">
                {letter.letter}
                <span className="font-sans text-[10px] tracking-wide text-emerald-900/50">{level}</span>
              </span>
            );
          }

          if (!href) {
            return (
              <span key={letter.id} className={className} lang="he">
                {letter.letter}
                <span className="font-sans text-[10px] tracking-wide text-emerald-800">{level}</span>
              </span>
            );
          }

          return (
            <Link key={letter.id} href={href} className={className} lang="he" aria-label={t("openLevel", { level })}>
              {letter.letter}
              <span className="font-sans font-xl tracking-wide text-emerald-800">{level}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
