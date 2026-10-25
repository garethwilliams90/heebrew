"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "cn";
import { printFont } from "@/components/alephbet/print-font";
import { Link } from "@/i18n/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { curriculumLevel } from "@/lib/learn/curriculum";
import { StonePath } from "@/components/learn/nature-scene";
import { letterCatalog } from "@/lib/alephbet/letter-info";
import { letterPairLevels } from "@/lib/learn/letter-pairs";
import { curriculumLevelDef, stagesFor } from "@/lib/learn/later-levels";
import { glossOf } from "@/lib/learn/sentences";
import { hasLearningStarted } from "@/lib/learn/started";

const alphabetOrder = letterCatalog.filter((item) => item.kind === "letter");

type LearnHref = "/learn" | `/learn?from=${string}` | `/learn?level=${number}` | `/learn?level=${number}&from=${string}`;

const levelStages: Record<number, { id: string; href: LearnHref; practice?: boolean }[]> = {
  1: [
    { id: "1.0", href: "/learn" },
    { id: "1.1", href: "/learn?from=1.1", practice: true },
    { id: "1.2", href: "/learn?from=1.2", practice: true },
  ],
  2: [
    { id: "2.0", href: "/learn?from=2.0" },
    { id: "2.1", href: "/learn?from=2.1", practice: true },
    { id: "2.2", href: "/learn?from=2.2", practice: true },
  ],
  13: [
    { id: "13.1", href: "/learn?level=13&from=13.1" },
    { id: "13.1", href: "/learn?level=13&from=13.1p", practice: true },
    { id: "13.2", href: "/learn?level=13&from=13.2" },
    { id: "13.2", href: "/learn?level=13&from=13.2p", practice: true },
    { id: "13.3", href: "/learn?level=13&from=13.3" },
    { id: "13.3", href: "/learn?level=13&from=13.3p", practice: true },
    { id: "13.4", href: "/learn?level=13&from=13.4" },
    { id: "13.4", href: "/learn?level=13&from=13.4p", practice: true },
  ],
  14: [
    { id: "14.1", href: "/learn?level=14&from=14.1" },
    { id: "14.2", href: "/learn?level=14&from=14.2" },
    { id: "14.3", href: "/learn?level=14&from=14.3", practice: true },
    { id: "14.4", href: "/learn?level=14&from=14.4" },
    { id: "14.5", href: "/learn?level=14&from=14.5", practice: true },
  ],
  15: [
    { id: "15.1", href: "/learn?level=15&from=15.1" },
    { id: "15.2", href: "/learn?level=15&from=15.2" },
    { id: "15.3", href: "/learn?level=15&from=15.3", practice: true },
  ],
  16: [
    { id: "16.1", href: "/learn?level=16&from=16.1" },
    { id: "16.2", href: "/learn?level=16&from=16.2" },
    { id: "16.3", href: "/learn?level=16&from=16.3" },
    { id: "16.4", href: "/learn?level=16&from=16.4", practice: true },
  ],
};

function pathSection(level: number) {
  if (level === 1) {
    return "pathIntroLetters" as const;
  }
  if (level === 3) {
    return "pathAlephBet" as const;
  }
  if (level === 12) {
    return "pathWordsGrammar" as const;
  }
  if (level === 14) {
    return "pathPresentVerbs" as const;
  }
  if (level === 22) {
    return "pathComplexSentences" as const;
  }
  if (level === 30) {
    return "pathPastVerbs" as const;
  }
  if (level === 40) {
    return "pathFutureVerbs" as const;
  }
  return null;
}

const laterHrefs = Array.from({ length: 24 }, (_, index) => `/learn?level=${index + 17}` as const);

export function LevelPath() {
  const t = useTranslations("Home");
  const locale = useLocale();
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

  const hrefs = [
    "/learn" as const,
    "/learn?from=2.0" as const,
    ...letterPairLevels.map((item) => `/learn?level=${item.level}` as const),
    "/learn?level=12" as const,
    "/learn?level=13" as const,
    "/learn?level=14" as const,
    "/learn?level=15" as const,
    "/learn?level=16" as const,
    ...laterHrefs,
  ];
  const nodes = hrefs.map((href, index) => ({
    level: index + 1,
    mark: index < 16 ? (alphabetOrder[index]?.letter ?? "") : "",
    href,
  }));

  function lessonText(level: number) {
    const later = curriculumLevelDef(level);
    if (later) {
      return { title: glossOf(later.title, locale), about: glossOf(later.about, locale) };
    }
    const pair = letterPairLevels.find((item) => item.level === level);
    if (pair) {
      const letters = pair.letterIds
        .map((id) => letterCatalog.find((item) => item.id === id)?.letter ?? "")
        .join(" & ");
      return {
        title: t("lessonLettersTitle", { letters }),
        about: t("lessonLettersAbout", { letters, count: pair.letterIds.length }),
      };
    }
    const key = `lesson${level}` as "lesson1" | "lesson2" | "lesson12" | "lesson13" | "lesson14" | "lesson15" | "lesson16";
    return { title: t(`${key}Title`), about: t(`${key}About`) };
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      <p className="text-sm text-emerald-800">{t("levelPathHint", { level: pathLevel })}</p>
      <div className="flex w-full flex-col items-center gap-6" dir="rtl">
        {nodes.map((node, index) => {
          const level = node.level;
          const open = pathLevel >= level;
          const stages = open ? (levelStages[level] ?? stagesFor(level)) : undefined;
          const lesson = lessonText(level);
          const shifts = [4, 36, 12, 42, 18, 30];
          const shift = `${shifts[index % shifts.length]}%`;

          const section = pathSection(level);

          return (
            <motion.div
              key={level}
              className="flex w-full flex-col items-center"
              style={{ marginInlineStart: shift }}
              onHoverStart={() => setHovered(level)}
              onHoverEnd={() => setHovered((current) => (current === level ? null : current))}
            >
              {section ? (
                <div className="mb-4 flex w-full max-w-md items-center gap-3" dir="ltr">
                  <span className="h-px flex-1 bg-emerald-900/20" />
                  <p className="text-center text-sm font-semibold tracking-wide text-emerald-800 uppercase">{t(section)}</p>
                  <span className="h-px flex-1 bg-emerald-900/20" />
                </div>
              ) : null}
              <LevelNode
                letter={node.mark}
                level={level}
                open={open}
                href={node.href}
                label={t("openLevel", { level })}
                lesson={t("lessonName", { level, title: lesson.title })}
                about={lesson.about}
              />
              <AnimatePresence initial={false}>
                {hovered === level && stages ? (
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
                          key={`${stage.id}-${stage.practice ? "p" : "t"}`}
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
              {index < nodes.length - 1 ? <StonePath turn={(index % 5) * 8 - 12} /> : null}
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
  lesson,
  about,
}: {
  letter: string;
  level: number;
  open: boolean;
  href?: LearnHref;
  label: string;
  lesson: string;
  about: string;
}) {
  const className = cn(
    letter ? printFont.className : "font-sans text-3xl font-semibold",
    "flex size-24 flex-col items-center justify-center rounded-2xl border text-4xl sm:size-28",
    open
      ? "border-emerald-950/30 bg-emerald-50 text-black shadow-[0_16px_40px_-28px_rgba(6,78,59,0.8)]"
      : "cursor-not-allowed border-emerald-950/5 bg-white/40 text-emerald-950/30",
  );

  const card =
    !open || !href ? (
      <span className={className} aria-disabled={!open} lang="he" tabIndex={0}>
        {letter || level}
        {letter ? <span className="font-sans text-sm tracking-wide text-emerald-800">{level}</span> : null}
      </span>
    ) : (
      <Link href={href} className={className} lang={letter ? "he" : undefined} aria-label={label}>
        {letter || level}
        {letter ? <span className="font-sans text-sm tracking-wide text-emerald-800">{level}</span> : null}
      </Link>
    );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-xs flex-col items-start gap-1 bg-white px-3 py-2 text-left text-emerald-950 shadow-[0_16px_40px_-24px_rgba(6,78,59,0.8)]"
        arrowClassName="bg-white fill-white"
      >
        <p className="text-sm font-semibold">{lesson}</p>
        <p className="text-xs text-emerald-900/75">{about}</p>
      </TooltipContent>
    </Tooltip>
  );
}
