"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { printFont } from "@/components/alephbet/print-font";
import { Link } from "@/i18n/navigation";
import { DevLevelControl } from "@/components/learn/dev-level";
import { LevelPath } from "@/components/home/level-path";
import { hasLearningStarted, markLearningStarted } from "@/lib/learn/started";

const choiceSize = "h-auto w-full whitespace-normal px-6 py-4 text-base leading-snug";

export function WelcomeHome() {
  const t = useTranslations("Home");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(hasLearningStarted());
  }, []);

  return (
    <main className="flex min-h-0 flex-1 flex-col items-center gap-12 overflow-y-auto py-6">
      <WelcomeTitle label={t("welcome")} hebrew={t("welcomeHebrew")} />
      {started ? (
        <LevelPath />
      ) : (
        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="webrew-float w-full rounded-full">
            <Link href="/learn" className={cn(buttonVariants(), choiceSize)} onClick={() => markLearningStarted()}>
              {t("startHere")}
            </Link>
          </div>
          <div className="webrew-float w-full cursor-not-allowed rounded-full [animation-delay:450ms]">
            <button type="button" disabled className={cn(buttonVariants({ variant: "outline" }), choiceSize)}>
              {t("assessment")}
            </button>
          </div>
        </div>
      )}
      <DevLevelControl />
    </main>
  );
}

function WelcomeTitle({ label, hebrew }: { label: string; hebrew: string }) {
  const t = useTranslations("Home");
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [english, setEnglish] = useState<Record<string, boolean>>({});
  const words = [
    { id: "welcome", face: t("welcomeWord"), back: "ברוכים הבאים" },
    { id: "to", face: t("welcomeTo"), back: "ל" },
    { id: "name", face: t("welcomeName"), back: "ווברו!" },
  ];

  const allEnglish = words.every((word) => english[word.id]);

  function showHebrew(id: string) {
    return hovered && !english[id];
  }

  return (
    <h1
      className="flex max-w-4xl flex-wrap items-baseline justify-center gap-x-3 gap-y-2 px-4 text-center text-4xl font-semibold tracking-tight text-emerald-950 sm:text-6xl"
      aria-label={`${label} ${hebrew}`}
      onMouseEnter={() => {
        setHovered(true);
        setEnglish({});
      }}
      onMouseLeave={() => {
        setHovered(false);
        setEnglish({});
      }}
    >
      {(hovered && !allEnglish ? [...words].reverse() : words).map((word) => {
        const flipped = showHebrew(word.id);

        return (
          <motion.span
            key={word.id}
            layout
            className="inline-grid [perspective:900px]"
            transition={{ layout: { type: "spring", bounce: 0.18, visualDuration: 0.45 } }}
          >
            <motion.button
              type="button"
              className="col-start-1 row-start-1 inline-grid cursor-pointer rounded-xl px-1 outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30"
              aria-pressed={flipped}
              aria-label={flipped ? word.back : word.face}
              animate={reduce ? undefined : { rotateX: flipped ? 180 : 0 }}
              transition={{ type: "spring", bounce: 0.2, visualDuration: 0.4 }}
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => {
                if (!hovered || allEnglish) {
                  return;
                }
                setEnglish((current) => ({ ...current, [word.id]: !current[word.id] }));
              }}
            >
              <span className={cn("col-start-1 row-start-1 [backface-visibility:hidden]", reduce && flipped && "opacity-0")} aria-hidden={flipped}>
                {word.face}
              </span>
              <span
                className={cn(
                  "col-start-1 row-start-1 [backface-visibility:hidden] [transform:rotateX(180deg)]",
                  printFont.className,
                  reduce && "[transform:none]",
                  reduce && !flipped && "opacity-0",
                )}
                dir="rtl"
                lang="he"
                aria-hidden={!flipped}
              >
                {word.back}
              </span>
            </motion.button>
          </motion.span>
        );
      })}
    </h1>
  );
}
