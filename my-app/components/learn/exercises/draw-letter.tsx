"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { LetterDraw } from "@/components/alephbet/letter-draw";
import { printFont } from "@/components/alephbet/print-font";
import { ExerciseChrome } from "@/components/learn/exercises/lesson-session";
import { useAdvance } from "@/components/learn/exercises/use-advance";
import { letterFact } from "@/lib/alephbet/letter-info";
import { strokesFor } from "@/lib/alephbet/stroke-order";

export function DrawLetter({ letterIds, onPass }: { letterIds: readonly string[]; onPass: () => void }) {
  const t = useTranslations("Learn");
  const letters = letterIds.flatMap((id) => {
    const fact = letterFact(id);
    return fact ? [fact] : [];
  });
  const [index, setIndex] = useState(0);
  const advance = useAdvance(() => {
    if (index >= letters.length - 1) {
      onPass();
      return;
    }
    setIndex((current) => current + 1);
  });
  const fact = letters[index];

  useEffect(() => {
    if (letters.length === 0) onPass();
  }, [letters.length, onPass]);

  if (!fact) return null;

  return (
    <ExerciseChrome index={index} total={letters.length} prompt={t("drawPrompt")}>
      <LetterDraw
        key={fact.id}
        embedded
        letter={fact.letter}
        fontClassName={cn("font-bold", printFont.className)}
        paths={strokesFor(fact.id)}
        onComplete={() => advance.pass()}
      />
    </ExerciseChrome>
  );
}
