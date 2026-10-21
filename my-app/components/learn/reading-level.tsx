"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExperienceTube } from "@/components/learn/experience-tube";
import { SoundQuiz } from "@/components/learn/letter-quiz";
import { NextLevelLink } from "@/components/learn/level-finish";
import { LevelFrame } from "@/components/learn/level-frame";
import { ReadingIntro } from "@/components/learn/reading-intro";
import type { SpeechCue } from "@/lib/alephbet/intro-alphabet";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { completeCurriculumLevel, curriculumLevel } from "@/lib/learn/curriculum";
import { rememberKnownWord } from "@/lib/learn/known-words";
import { readingKnownWords, readingRounds } from "@/lib/learn/reading-levels";
import { playAudio } from "@/lib/settings/master-volume";

export function ReadingLevel({ level }: { level: number }) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [intro, setIntro] = useState(level === 12 || level === 13);
  const [passed, setPassed] = useState(false);
  const [rounds] = useState(() => readingRounds(level, locale));

  useEffect(() => {
    const host = window.location.hostname;
    const local = host === "localhost" || host === "127.0.0.1";
    setAllowed(local || curriculumLevel() >= level);
  }, [level]);

  async function playCue(cue: SpeechCue) {
    const audio = await loadSpeechClip(cue.text, cue.phoneme);
    if (!audio) {
      return;
    }
    audio.currentTime = 0;
    await playAudio(audio);
  }

  if (allowed === null) {
    return null;
  }

  if (!allowed) {
    return (
      <LevelFrame label={t("level", { id: String(level) })} finished>
        <p className="text-center text-base text-emerald-900">{t("levelLocked")}</p>
      </LevelFrame>
    );
  }

  return (
    <LevelFrame
      label={t("level", { id: String(level) })}
      finished={passed || curriculumLevel() > level}
      aside={passed ? <ExperienceTube /> : null}
    >
      {passed ? (
        <div className="flex max-w-xl flex-col items-center text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("levelClear", { level })}</h1>
          <NextLevelLink level={level} />
        </div>
      ) : intro && (level === 12 || level === 13) ? (
        <ReadingIntro level={level} onNext={() => setIntro(false)} />
      ) : (
        <SoundQuiz
          rounds={rounds}
          dense={level >= 13}
          prompt={level >= 13 ? t("sentencePrompt") : t("wordPrompt")}
          onPlay={playCue}
          onLearn={
            level === 12
              ? (card) => {
                  const word = readingKnownWords.find((item) => item.id === card.id);
                  if (word) {
                    void rememberKnownWord(word);
                  }
                }
              : undefined
          }
          onPass={() => {
            completeCurriculumLevel(level);
            setPassed(true);
          }}
        />
      )}
    </LevelFrame>
  );
}
