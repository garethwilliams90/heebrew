"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnswerPop, answerTone } from "@/components/learn/exercises/answer-mark";
import { ExerciseChrome } from "@/components/learn/exercises/lesson-session";
import { useAdvance } from "@/components/learn/exercises/use-advance";
import { printFont } from "@/components/alephbet/print-font";
import { HearReplayButton } from "@/components/learn/hear-replay";
import { Button } from "@/components/ui/button";
import { withoutNikud } from "@/lib/learn/hebrew-text";
import { playStudyClip } from "@/lib/learn/pathway/play-study";
import type { RecognizeItem } from "@/lib/learn/pathway/types";
import { cn } from "cn";

export function RecognizeSound({
  items,
  onPass,
  onMiss,
}: {
  items: readonly RecognizeItem[];
  onPass: () => void;
  onMiss?: () => void;
}) {
  const t = useTranslations("Learn");
  const [index, setIndex] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [rightId, setRightId] = useState<string | null>(null);
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
  const item = items[index];

  useEffect(() => {
    if (!item) {
      return;
    }
    void playStudyClip(item.prompt);
  }, [item]);

  if (!item) {
    return null;
  }

  const remainingWrong = item.choices.filter(
    (choice) => choice.id !== item.prompt.id && !wrongIds.includes(choice.id) && !hidden.includes(choice.id),
  );
  const longChoices = item.choices.some((choice) => choice.hebrew.includes(" ") || [...withoutNikud(choice.hebrew)].length > 8);

  function hint() {
    const pick = remainingWrong[Math.floor(Math.random() * remainingWrong.length)];
    if (pick) {
      setHidden((current) => [...current, pick.id]);
    }
  }

  return (
    <ExerciseChrome index={index} total={items.length} prompt={t("recognizePrompt")} canHint={remainingWrong.length > 0} onHint={hint}>
      <div className={cn("flex w-full flex-col items-center gap-6", longChoices ? "max-w-2xl" : "max-w-xl")}>
        <HearReplayButton onHear={() => void playStudyClip(item.prompt)}>{t("quizHear")}</HearReplayButton>
        <div className={cn("grid w-full gap-3", longChoices ? "grid-cols-1" : "sm:grid-cols-3")}>
          {item.choices.map((choice) => {
            if (hidden.includes(choice.id)) {
              return null;
            }
            const tone = rightId === choice.id ? "correct" : wrongIds.includes(choice.id) ? "wrong" : null;
            return (
              <AnswerPop key={choice.id} tone={tone} className="min-w-0 w-full">
                <Button
                  type="button"
                  sound={false}
                  variant="outline"
                  disabled={wrongIds.includes(choice.id)}
                  className={cn(
                    "h-auto w-full min-w-0 whitespace-normal px-5 py-4 text-center leading-snug",
                    longChoices ? "rounded-3xl! text-2xl" : "text-3xl",
                    printFont.className,
                    answerTone(tone),
                  )}
                  lang="he"
                  dir="rtl"
                  onClick={() => {
                    if (rightId || wrongIds.includes(choice.id)) {
                      return;
                    }
                    if (choice.id === item.prompt.id) {
                      setRightId(choice.id);
                      advance.pass();
                      return;
                    }
                    setWrongIds((current) => [...current, choice.id]);
                    advance.miss(() => void playStudyClip(item.prompt));
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
