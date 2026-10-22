"use client";

import { printFont } from "@/components/alephbet/print-font";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

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
  const showFeedback = answered && (selected || correct);

  const button = (
    <motion.button
      type="button"
      dir="rtl"
      lang="he"
      disabled={answered}
      onClick={onChoose}
      whileHover={!answered ? { scale: 1.01 } : undefined}
      whileTap={!answered ? { scale: 0.99 } : undefined}
      className={cn(
        printFont.className,
        "group relative flex min-h-16 items-center gap-3 rounded-xl px-5 py-4 text-2xl transition-colors disabled:cursor-default",
        !answered && "border border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50",
        answered && !showFeedback && "border border-emerald-100 bg-white/50 opacity-60",
        showFeedback && correct && "border border-emerald-600 bg-emerald-100",
        showFeedback && !correct && "border border-red-500 bg-red-100"
      )}
    >
      <span
        dir="ltr"
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
          !answered && "bg-emerald-100 text-emerald-800",
          answered && !showFeedback && "bg-emerald-50 text-emerald-500",
          showFeedback && correct && "bg-emerald-700 text-white",
          showFeedback && !correct && "bg-red-600 text-white"
        )}
      >
        {number}
      </span>
      <span className="flex-1">{words.join(", ")}</span>

      {showFeedback && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          {correct ? (
            <CheckCircle2 className="size-6 text-emerald-700" />
          ) : (
            <XCircle className="size-6 text-red-600" />
          )}
        </motion.div>
      )}
    </motion.button>
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
