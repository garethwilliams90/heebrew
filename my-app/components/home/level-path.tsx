"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { Link } from "@/i18n/navigation";
import { alphabetLetters } from "@/lib/alephbet/intro-alphabet";
import { curriculumLevel } from "@/lib/learn/curriculum";
import { hasLearningStarted } from "@/lib/learn/started";

const letters = alphabetLetters();

const levelStages: Record<number, { id: string; href: "/learn" | `/learn?from=${string}`; practice?: boolean }[]> = {
  1: [
    { id: "1.0", href: "/learn" },
    { id: "1.1", href: "/learn?from=1.1", practice: true },
    { id: "1.2", href: "/learn?from=1.2" },
    { id: "1.3", href: "/learn?from=1.3" },
    { id: "1.4", href: "/learn?from=1.4", practice: true },
    { id: "1.5", href: "/learn?from=1.5", practice: true },
  ],
  2: [
    { id: "2.0", href: "/learn?from=2.0" },
    { id: "2.1", href: "/learn?from=2.1" },
    { id: "2.2", href: "/learn?from=2.2" },
    { id: "2.3", href: "/learn?from=2.3" },
    { id: "2.4", href: "/learn?from=2.4", practice: true },
  ],
};

export function LevelPath() {
  const t = useTranslations("Home");
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [pathLevel, setPathLevel] = useState(1);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    setStarted(hasLearningStarted());
    setPathLevel(curriculumLevel());
    setReady(true);
    function refresh() {
      setPathLevel(curriculumLevel());
    }
    window.addEventListener("webrew-curriculum", refresh);
    return () => window.removeEventListener("webrew-curriculum", refresh);
  }, []);

  if (!ready || !started) {
    return null;
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      <p className="text-sm text-emerald-800">{t("levelPathHint", { level: pathLevel })}</p>
      <div className="flex w-full flex-col items-center gap-4" dir="rtl">
        {letters.map((letter, index) => {
          const level = index + 1;
          const open = pathLevel >= level;
          const stages = levelStages[level];
          const expanded = hovered === level && open && Boolean(stages);

          return (
            <motion.div
              key={letter.id}
              className="flex w-full flex-col items-center"
              onHoverStart={() => setHovered(level)}
              onHoverEnd={() => setHovered((current) => (current === level ? null : current))}
            >
              <LevelNode letter={letter.letter} level={level} open={open} href={stages?.[0]?.href} label={t("openLevel", { level })} />
              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    key="stages"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.12, visualDuration: 0.32 }}
                    className="w-full overflow-hidden"
                  >
                    <div className="flex flex-wrap justify-center gap-2 py-3" dir="ltr">
                      {stages.map((stage) => (
                        <Link
                          key={stage.id}
                          href={stage.href}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm font-medium",
                            stage.practice
                              ? "border-emerald-700 bg-emerald-100 text-emerald-950 shadow-[0_10px_24px_-18px_rgba(6,78,59,0.9)]"
                              : "border-emerald-950/15 bg-white/90 text-emerald-900",
                          )}
                          aria-label={stage.practice ? t("stagePractice", { id: stage.id }) : t("openStage", { id: stage.id })}
                        >
                          {stage.practice ? t("stagePractice", { id: stage.id }) : stage.id}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function LevelNode({
  letter,
  level,
  open,
  href,
  label,
}: {
  letter: string;
  level: number;
  open: boolean;
  href?: "/learn" | `/learn?from=${string}`;
  label: string;
}) {
  const className = cn(
    printFont.className,
    "flex size-24 flex-col items-center justify-center rounded-2xl border text-4xl sm:size-28",
    open
      ? "border-emerald-950/30 bg-emerald-50 text-black shadow-[0_16px_40px_-28px_rgba(6,78,59,0.8)]"
      : "cursor-not-allowed border-emerald-950/5 bg-white/40 text-emerald-950/30",
  );

  if (!open || !href) {
    return (
      <span className={className} aria-disabled={!open} lang="he">
        {letter}
        <span className="font-sans text-sm tracking-wide text-emerald-800">{level}</span>
      </span>
    );
  }

  return (
    <Link href={href} className={className} lang="he" aria-label={label}>
      {letter}
      <span className="font-sans text-sm tracking-wide text-emerald-800">{level}</span>
    </Link>
  );
}
