"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnswerPop, answerTone } from "@/components/learn/exercises/answer-mark";
import { ExerciseChrome } from "@/components/learn/exercises/lesson-session";
import { useAdvance } from "@/components/learn/exercises/use-advance";
import { printFont } from "@/components/alephbet/print-font";
import { Button } from "@/components/ui/button";
import { playStudyClip } from "@/lib/learn/pathway/play-study";
import type { ConjugateItem } from "@/lib/learn/pathway/types";
import { cn } from "cn";

export function ConjugateChoice({
  items,
  onPass,
  onMiss,
}: {
  items: readonly ConjugateItem[];
  onPass: () => void;
  onMiss?: () => void;
}) {
  const t = useTranslations("Learn");
  const [index, setIndex] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [rightId, setRightId] = useState<string | null>(null);
  const item = items[index];
  const advance = useAdvance(() => {
    if (index >= items.length - 1) {
      onPass();
      return;
    }
    setWrongIds([]);
    setHidden([]);
    setRightId(null);
    setIndex((current) => current + 1);
  }, onMiss);

  if (!item) {
    return null;
  }

  const answer = item.choices.find((choice) => choice.id === item.answerId);
  const remainingWrong = item.choices.filter((choice) => choice.id !== item.answerId && !wrongIds.includes(choice.id) && !hidden.includes(choice.id));

  function hint() {
    const pick = remainingWrong[Math.floor(Math.random() * remainingWrong.length)];
    if (pick) {
      setHidden((current) => [...current, pick.id]);
    }
  }

  return (
    <ExerciseChrome index={index} total={items.length} prompt={t("conjugatePrompt")} canHint={remainingWrong.length > 0} onHint={hint}>
      <div className="flex w-full max-w-xl flex-col items-center gap-6">
        <p className={cn(printFont.className, "text-center text-4xl text-emerald-950")} dir="rtl" lang="he">
          {item.before} ___ {item.after}
        </p>
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {item.choices.map((choice) => {
            if (hidden.includes(choice.id)) {
              return null;
            }
            const tone = rightId === choice.id ? "correct" : wrongIds.includes(choice.id) ? "wrong" : null;
            return (
              <AnswerPop key={choice.id} tone={tone}>
                <Button
                  type="button"
                  sound={false}
                  variant="outline"
                  disabled={wrongIds.includes(choice.id)}
                  className={cn("h-auto w-full py-4 text-2xl", printFont.className, answerTone(tone))}
                  lang="he"
                  dir="rtl"
                  onClick={() => {
                    if (rightId || wrongIds.includes(choice.id)) {
                      return;
                    }
                    if (choice.id !== item.answerId) {
                      setWrongIds((current) => [...current, choice.id]);
                      advance.miss(() => {
                        if (answer) {
                          void playStudyClip(answer);
                        }
                      });
                      return;
                    }
                    setRightId(choice.id);
                    advance.pass();
                  }}
                >
                  {choice.hebrew}
                </Button>
              </AnswerPop>
            );
          })}
        </div>
      </div>
    </ExerciseChrome>
  );
}
