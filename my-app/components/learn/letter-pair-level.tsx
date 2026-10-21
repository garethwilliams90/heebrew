"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { ExperienceTube } from "@/components/learn/experience-tube";
import { LetterQuiz } from "@/components/learn/letter-quiz";
import { LevelClose, NextLevelLink } from "@/components/learn/level-finish";
import { BlueNikud } from "@/components/learn/pointed-letter";
import { Button } from "@/components/ui/button";
import { letterCatalog } from "@/lib/alephbet/letter-info";
import type { SpeechCue } from "@/lib/alephbet/intro-alphabet";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { completeCurriculumLevel, curriculumLevel } from "@/lib/learn/curriculum";
import { letterPair, lettersThrough, type PairWord } from "@/lib/learn/letter-pairs";
import { playAudio } from "@/lib/settings/master-volume";
import { cn } from "cn";

export function LetterPairLevel({ level }: { level: number }) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const pair = letterPair(level);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [slide, setSlide] = useState(0);
  const [quizzing, setQuizzing] = useState(false);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    const local = host === "localhost" || host === "127.0.0.1";
    setAllowed(local || curriculumLevel() >= level);
  }, [level]);

  if (!pair || allowed === null) {
    return null;
  }

  if (!allowed) {
    return (
      <main className="flex flex-1 items-center justify-center text-center">
        <p className="text-base text-emerald-900">{t("levelLocked")}</p>
      </main>
    );
  }

  const letters = pair.letterIds
    .map((id) => letterCatalog.find((item) => item.id === id))
    .filter((item) => item !== undefined);
  const known = lettersThrough(level);
  const pool = letterCatalog.filter((item) => known.has(item.id) && item.kind === "letter");
  const word = pair.words[slide];
  const glossLocale = locale === "fr" || locale === "es" ? locale : "en";

  async function playCue(cue: SpeechCue) {
    const audio = await loadSpeechClip(cue.text, cue.phoneme);
    if (!audio) {
      return;
    }
    audio.currentTime = 0;
    await playAudio(audio);
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
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden">
          {passed ? (
            <div className="flex max-w-xl flex-col items-center text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("levelClear", { level })}</h1>
              <NextLevelLink level={level} />
            </div>
          ) : quizzing ? (
            <LetterQuiz
              letters={letters}
              pool={pool}
              onPlay={playCue}
              onPass={() => {
                completeCurriculumLevel(level);
                setPassed(true);
              }}
            />
          ) : word ? (
            <WordSlide
              word={word}
              gloss={word.gloss[glossLocale]}
              hearLabel={t("hearWord")}
              nextLabel={t("next")}
              onHear={() => void playCue({ text: word.hebrew })}
              onNext={() => {
                if (slide + 1 >= pair.words.length) {
                  setQuizzing(true);
                  return;
                }
                setSlide((current) => current + 1);
              }}
            />
          ) : null}
        </div>
        {passed ? <ExperienceTube /> : null}
      </div>
    </main>
  );
}

function WordSlide({
  word,
  gloss,
  hearLabel,
  nextLabel,
  onHear,
  onNext,
}: {
  word: PairWord;
  gloss: string;
  hearLabel: string;
  nextLabel: string;
  onHear: () => void;
  onNext: () => void;
}) {
  const letter = letterCatalog.find((item) => item.id === word.letterId);

  return (
    <div className="flex max-w-xl flex-col items-center gap-4 text-center">
      <p className={cn(printFont.className, "text-7xl leading-none text-black sm:text-8xl")} dir="rtl" lang="he">
        {letter ? <BlueNikud text={letter.letter} /> : null}
      </p>
      <p className={cn(printFont.className, "text-5xl leading-none text-black")} dir="rtl" lang="he">
        <BlueNikud text={word.hebrew} />
      </p>
      <p className="text-lg text-emerald-900">{gloss}</p>
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="h-11 px-5" onClick={onHear}>
          {hearLabel}
        </Button>
        <Button type="button" className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={onNext}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
