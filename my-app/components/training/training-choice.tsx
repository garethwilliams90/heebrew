"use client";

import { printFont } from "@/components/alephbet/print-font";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

export function TrainingChoice({
  number,
  words,
  answered,
  correct,
  selected,
  onChoose,
  tooltip,
}: {
  number: number;
  words: string[];
  answered: boolean;
  correct: boolean;
  selected: boolean;
  onChoose: () => void;
  tooltip?: string;
}) {
  const tone = !answered
    ? "border-emerald-900 bg-white hover:bg-emerald-50"
    : correct
      ? "border-emerald-700 bg-emerald-50"
      : selected
        ? "border-red-700 bg-red-50"
        : "border-emerald-900/20 bg-white opacity-60";

  const button = (
    <button
      type="button"
      dir="rtl"
      lang="he"
      disabled={answered}
      onClick={onChoose}
      className={cn(
        printFont.className,
        "flex min-h-16 items-center gap-3 rounded-2xl border-2 px-5 py-4 text-2xl transition-colors disabled:cursor-default",
        tone,
      )}
    >
      <span dir="ltr" className="shrink-0 tabular-nums text-base">
        {number}.
      </span>
      <span>{words.join(", ")}</span>
    </button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-white px-3 py-1.5 text-emerald-950 shadow-sm"
        arrowClassName="bg-white fill-white"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
