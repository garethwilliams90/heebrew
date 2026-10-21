"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExperienceTube } from "@/components/learn/experience-tube";
import { SoundQuiz } from "@/components/learn/letter-quiz";
import { LevelClose, NextLevelLink } from "@/components/learn/level-finish";
import type { SpeechCue } from "@/lib/alephbet/intro-alphabet";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { completeCurriculumLevel, curriculumLevel } from "@/lib/learn/curriculum";
import { readingRounds } from "@/lib/learn/reading-levels";
import { playAudio } from "@/lib/settings/master-volume";

export function ReadingLevel({ level }: { level: number }) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const [allowed, setAllowed] = useState<boolean | null>(null);
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
      <main className="flex flex-1 items-center justify-center text-center">
        <p className="text-base text-emerald-900">{t("levelLocked")}</p>
      </main>
    );
  }

  return (
    <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] bg-white/55 shadow-[0_24px_60px_-36px_rgba(6,78,59,0.45)] backdrop-blur-md">
      <LevelClose finished={passed || curriculumLevel() > level} className="absolute top-0 right-0 z-20" />
      <header className="flex shrink-0 justify-center py-1">
        <p className="rounded-full border border-emerald-950/15 bg-white/80 px-4 py-1 text-sm font-semibold tracking-[0.18em] text-emerald-950 uppercase">
          {t("level", { id: String(level) })}
        </p>
      </header>
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden">
          {passed ? (
            <div className="flex max-w-xl flex-col items-center text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("levelClear", { level })}</h1>
              <NextLevelLink level={level} />
            </div>
          ) : (
            <SoundQuiz
              rounds={rounds}
              dense={level >= 13}
              prompt={level >= 13 ? t("sentencePrompt") : t("wordPrompt")}
              onPlay={playCue}
              onPass={() => {
                completeCurriculumLevel(level);
                setPassed(true);
              }}
            />
          )}
        </div>
        {passed ? <ExperienceTube /> : null}
      </div>
    </main>
  );
}
