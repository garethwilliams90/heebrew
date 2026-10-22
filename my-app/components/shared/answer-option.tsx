"use client";

import { motion } from "framer-motion";
import { printFont } from "@/components/alephbet/print-font";
import { cn } from "cn";

export function AnswerOption({
  number,
  words,
  answered,
  correct,
  selected,
  onChoose,
  disabled,
}: {
  number: number;
  words: string | string[];
  answered: boolean;
  correct: boolean;
  selected: boolean;
  onChoose: () => void;
  disabled?: boolean;
}) {
  const showFeedback = answered && (selected || correct);
  const wordsText = Array.isArray(words) ? words.join(", ") : words;

  return (
    <motion.button
      type="button"
      dir="rtl"
      lang="he"
      disabled={disabled || answered}
      onClick={onChoose}
      whileHover={!answered ? { scale: 1.01 } : undefined}
      whileTap={!answered ? { scale: 0.99 } : undefined}
      className={cn(
        printFont.className,
        "group relative flex min-h-16 items-center justify-center gap-3 rounded-xl px-5 py-4 text-2xl transition-colors disabled:cursor-default",
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
      <span className="flex-1">{wordsText}</span>
    </motion.button>
  );
}
