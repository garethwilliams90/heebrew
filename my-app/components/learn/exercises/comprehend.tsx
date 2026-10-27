"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnswerPop, answerTone } from "@/components/learn/exercises/answer-mark";
import { ExerciseChrome } from "@/components/learn/exercises/lesson-session";
import { useAdvance } from "@/components/learn/exercises/use-advance";
import { printFont } from "@/components/alephbet/print-font";
import { Button } from "@/components/ui/button";
import { playStudyClip } from "@/lib/learn/pathway/play-study";
import type { ComprehendItem } from "@/lib/learn/pathway/types";
import { GlossLabel } from "@/components/learn/gloss-label";
import { glossOf } from "@/lib/learn/sentences";
import { cn } from "cn";

export function Comprehend({
  items,
  onPass,
  onMiss,
}: {
  items: readonly ComprehendItem[];
  onPass: () => void;
  onMiss?: () => void;
}) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [hidden, setHidden] = useState<number[]>([]);
  const [right, setRight] = useState<number | null>(null);
  const item = items[index];
  const advance = useAdvance(() => {
    if (index >= items.length - 1) {
      onPass();
      return;
    }
    setWrongIds([]);
    setHidden([]);
    setRight(null);
    setIndex((current) => current + 1);
  }, onMiss);

  if (!item) {
    return null;
  }

  const remainingWrong = item.choices
    .map((_, choiceIndex) => choiceIndex)
    .filter((choiceIndex) => choiceIndex !== item.answer && !wrongIds.includes(choiceIndex) && !hidden.includes(choiceIndex));

  function hint() {
    const pick = remainingWrong[Math.floor(Math.random() * remainingWrong.length)];
    if (pick !== undefined) {
      setHidden((current) => [...current, pick]);
    }
  }

  return (
    <ExerciseChrome index={index} total={items.length} prompt={glossOf(item.question, locale)} canHint={remainingWrong.length > 0} onHint={hint}>
      <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center">
        <p className={cn(printFont.className, "text-4xl text-emerald-950")} dir="rtl" lang="he">
          {item.hebrew}
        </p>
        <div className="grid w-full gap-3">
          {item.choices.map((choice, choiceIndex) => {
            if (hidden.includes(choiceIndex)) {
              return null;
            }
            const tone = right === choiceIndex ? "correct" : wrongIds.includes(choiceIndex) ? "wrong" : null;
            return (
              <AnswerPop key={glossOf(choice, locale)} tone={tone}>
                <Button
                  type="button"
                  sound={false}
                  variant="outline"
                  disabled={wrongIds.includes(choiceIndex)}
                  className={cn("h-auto w-full py-3", answerTone(tone))}
                  onClick={() => {
                    if (right !== null || wrongIds.includes(choiceIndex)) {
                      return;
                    }
                    if (choiceIndex !== item.answer) {
                      setWrongIds((current) => [...current, choiceIndex]);
                      advance.miss(() => void playStudyClip({ hebrew: item.hebrew, say: item.hebrew, audio: item.audio }));
                      return;
                    }
                    setRight(choiceIndex);
                    advance.pass();
                  }}
                >
                  <GlossLabel gloss={choice} />
                </Button>
              </AnswerPop>
            );
          })}
        </div>
        <p className="sr-only">{t("checkAnswer")}</p>
      </div>
    </ExerciseChrome>
  );
}
