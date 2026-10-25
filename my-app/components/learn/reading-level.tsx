"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExperienceTube } from "@/components/learn/experience-tube";
import { SoundQuiz } from "@/components/learn/letter-quiz";
import { LevelClear } from "@/components/learn/level-clear";
import { LevelNav } from "@/components/learn/level-nav";
import { LevelFrame } from "@/components/learn/level-frame";
import { LockedLevel, useCurriculumGate } from "@/components/learn/use-curriculum-gate";
import { ReadingIntro } from "@/components/learn/reading-intro";
import { playCue } from "@/lib/learn/play-cue";
import { completeCurriculumLevel, curriculumLevel } from "@/lib/learn/curriculum";
import { rememberKnownWord } from "@/lib/learn/known-words";
import { readingKnownWords, readingRounds } from "@/lib/learn/reading-levels";

export function ReadingLevel({ level }: { level: number }) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const allowed = useCurriculumGate(level);
  const [intro, setIntro] = useState(true);
  const [passed, setPassed] = useState(false);
  const [rounds] = useState(() => readingRounds(locale));

  if (allowed === null) {
    return null;
  }

  if (!allowed) {
    return <LockedLevel level={level} />;
  }

  return (
    <LevelFrame
      label={t("level", { id: String(level) })}
      finished={passed || curriculumLevel() > level}
      aside={passed ? <ExperienceTube /> : null}
      footer={
        passed ? null : (
          <LevelNav
            backHref={intro ? "/" : undefined}
            onBack={intro ? undefined : () => setIntro(true)}
            onNext={intro ? () => setIntro(false) : undefined}
          />
        )
      }
    >
      {passed ? (
        <LevelClear level={level} />
      ) : intro ? (
        <ReadingIntro />
      ) : (
        <SoundQuiz
          rounds={rounds}
          prompt={t("wordPrompt")}
          onPlay={playCue}
          onLearn={(card) => {
            const word = readingKnownWords.find((item) => item.id === card.id);
            if (word) {
              void rememberKnownWord(word);
            }
          }}
          onPass={() => {
            completeCurriculumLevel(level);
            setPassed(true);
          }}
        />
      )}
    </LevelFrame>
  );
}
