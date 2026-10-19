"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const SEGMENTS = 6;
const SIZE = 44;
const CENTER = SIZE / 2;
const RADIUS = 16;
const GAP = 16;
const SWEEP = (360 - SEGMENTS * GAP) / SEGMENTS;

function polar(angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(radians),
    y: CENTER + RADIUS * Math.sin(radians),
  };
}

function segmentPath(index: number) {
  const start = GAP / 2 + index * (SWEEP + GAP);
  const end = start + SWEEP;
  const from = polar(start);
  const to = polar(end);
  const large = SWEEP > 180 ? 1 : 0;
  return `M ${from.x} ${from.y} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${to.x} ${to.y}`;
}

export function MasteryMark({
  level,
  size = "md",
  onDark = false,
}: {
  level: number;
  size?: "sm" | "md";
  onDark?: boolean;
}) {
  const stage = Math.min(SEGMENTS, Math.max(0, Math.round(level)));
  const box = size === "sm" ? "size-7" : "size-11";
  const star = size === "sm" ? "size-3" : "size-4";

  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", box)} aria-hidden>
      {stage >= SEGMENTS ? (
        <>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={box}>
            <circle cx={CENTER} cy={CENTER} r={RADIUS + 1.5} className="fill-emerald-700" />
          </svg>
          <Star className={cn("absolute fill-white text-white", star)} />
        </>
      ) : (
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={box}>
          {Array.from({ length: SEGMENTS }, (_, index) => (
            <path
              key={index}
              d={segmentPath(index)}
              fill="none"
              strokeWidth={4}
              strokeLinecap="butt"
              className={
                index < stage ? "stroke-emerald-700" : onDark ? "stroke-background/40" : "stroke-emerald-950/25"
              }
            />
          ))}
        </svg>
      )}
    </span>
  );
}

const guideStages = [
  { level: 0, label: "statusNew" },
  { level: 2, label: "stageOneDay" },
  { level: 4, label: "stageEightDays" },
  { level: 6, label: "mastered" },
] as const;

export function MasteryRing({ level }: { level: number }) {
  const t = useTranslations("Flashcards");
  const stage = Math.min(SEGMENTS, Math.max(0, Math.round(level)));
  const label =
    stage >= SEGMENTS ? t("mastered") : stage === 0 ? t("statusNew") : t("mastery", { level: stage });

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={label}
        className="inline-flex rounded-full bg-transparent p-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <MasteryMark level={level} />
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8} className="w-72 flex-col items-stretch gap-3 py-3">
        <p>{t("masteryGuide")}</p>
        <span className="grid grid-cols-4 gap-2">
          {guideStages.map((item) => (
            <span key={item.level} className="flex flex-col items-center gap-1">
              <MasteryMark level={item.level} size="sm" onDark />
              <span>{t(item.label)}</span>
            </span>
          ))}
        </span>
        <p>{t("masteryCredit")}</p>
      </TooltipContent>
    </Tooltip>
  );
}
