"use client";

import { createContext, useContext, type ReactNode } from "react";
import { PracticeQuizHeader } from "@/components/learn/practice-quiz-header";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { useTranslations } from "next-intl";

export type LessonSession = {
  halves: number;
  failed: boolean;
  lives: number;
  loseHeart: (cost: number) => void;
  resetHearts: () => void;
  retry: () => void;
  spendHint: () => boolean;
};

const LessonSessionContext = createContext<LessonSession | null>(null);

export function LessonSessionProvider({ value, children }: { value: LessonSession; children: ReactNode }) {
  return <LessonSessionContext.Provider value={value}>{children}</LessonSessionContext.Provider>;
}

export function useLessonSession() {
  return useContext(LessonSessionContext);
}

export function ExerciseChrome({
  index,
  total,
  prompt,
  canHint = false,
  onHint,
  children,
}: {
  index: number;
  total: number;
  prompt: string;
  canHint?: boolean;
  onHint?: () => void;
  children: ReactNode;
}) {
  const t = useTranslations("Learn");
  const session = useLessonSession();
  const safeTotal = Math.max(total, 1);
  const ratio = ((index + 0.5) / safeTotal) * 100;
  const shell = "flex h-full min-h-0 w-full flex-1 flex-col items-center gap-4";
  const body = "flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 overflow-y-auto";

  if (!session) {
    if (total <= 1) {
      return <>{children}</>;
    }
    return (
      <div className={shell}>
        <ProgressMeter
          label={t("quizProgress", { done: index + 1, total: safeTotal })}
          value={index + 1}
          max={safeTotal}
          ratio={ratio}
          sections={safeTotal}
          className="h-2.5 w-full shrink-0 rounded-full bg-emerald-950/10"
        />
        <div className={body}>{children}</div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="w-full shrink-0">
        <PracticeQuizHeader
          question={index + 1}
          total={safeTotal}
          ratio={ratio}
          halves={session.halves}
          failed={session.failed}
          prompt={session.failed ? "" : prompt}
          hintDisabled={!canHint || session.failed || session.halves < 1}
          onHint={() => {
            if (session.spendHint()) {
              onHint?.();
            }
          }}
          onRetry={session.retry}
          showHint={Boolean(onHint)}
          lives={session.lives}
        />
      </div>
      {session.failed ? null : <div className={body}>{children}</div>}
    </div>
  );
}
