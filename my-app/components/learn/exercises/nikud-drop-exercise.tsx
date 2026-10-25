"use client";

import { NikudDropQuiz } from "@/components/learn/nikud-drop-quiz";
import { useLessonSession } from "@/components/learn/exercises/lesson-session";
import { playCue } from "@/lib/learn/play-cue";
import type { NikudDropRound } from "@/lib/learn/nikud-drop";

type SharedHearts = {
  halves: number;
  failed: boolean;
  loseHeart: (cost: number) => void;
  resetHearts: () => void;
};

export function NikudDropExercise({ letterIds, onPass }: { letterIds: readonly string[]; onPass: () => void }) {
  const session = useLessonSession();
  return (
    <NikudDropQuiz
      letterIds={letterIds}
      onPlay={(cue) => void playCue(cue)}
      onPass={onPass}
      hearts={
        session
          ? { halves: session.halves, failed: session.failed, loseHeart: session.loseHeart, resetHearts: session.resetHearts }
          : undefined
      }
    />
  );
}

export function NikudRoundQuestion({
  round,
  onPass,
  hearts,
}: {
  round: NikudDropRound;
  onPass: () => void;
  hearts?: SharedHearts;
}) {
  return (
    <NikudDropQuiz
      rounds={[round]}
      onPlay={(cue) => void playCue(cue)}
      onPass={onPass}
      hearts={hearts}
      showHeader={false}
      awardExperience={false}
    />
  );
}
