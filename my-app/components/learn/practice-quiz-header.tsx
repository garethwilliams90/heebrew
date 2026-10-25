"use client";

import { useTranslations } from "next-intl";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { HeartRow, HintButton } from "@/components/learn/practice-hearts";
import { Button } from "@/components/ui/button";

export function PracticeQuizHeader({
  question,
  total,
  ratio,
  halves,
  failed,
  prompt,
  hintDisabled,
  onHint,
  onRetry,
  showCount = true,
  lives = 5,
  showHint = true,
}: {
  question: number;
  total: number;
  ratio: number;
  halves: number;
  failed: boolean;
  prompt: string;
  hintDisabled: boolean;
  onHint: () => void;
  onRetry: () => void;
  showCount?: boolean;
  lives?: number;
  showHint?: boolean;
}) {
  const t = useTranslations("Learn");

  return (
    <>
      <div className="w-full">
        <ProgressMeter
          label={t("quizProgress", { done: question, total })}
          value={question}
          max={total}
          ratio={ratio}
          sections={total}
          className="h-2.5 rounded-full bg-emerald-950/10"
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <HeartRow hearts={halves / 2} max={lives} />
        {showHint ? <HintButton disabled={hintDisabled} onHint={onHint} /> : null}
      </div>
      <div className="text-center">
        <p className="text-base text-emerald-900/80 sm:text-lg">{failed ? t("outOfHearts") : prompt}</p>
        {showCount ? <p className="mt-2 text-sm text-emerald-800">{t("quizProgress", { done: question, total })}</p> : null}
      </div>
      {failed ? (
        <Button type="button" className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={onRetry}>
          {t("tryAgain")}
        </Button>
      ) : null}
    </>
  );
}
