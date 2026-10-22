"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { ExperienceTube } from "@/components/learn/experience-tube";
import { LetterIntro } from "@/components/learn/letter-intro";
import { LetterQuiz } from "@/components/learn/letter-quiz";
import { NextLevelLink } from "@/components/learn/level-finish";
import { LevelFrame } from "@/components/learn/level-frame";
import { BlueNikud } from "@/components/learn/pointed-letter";
import { Button } from "@/components/ui/button";
import { letterCatalog } from "@/lib/alephbet/letter-info";
import type { SpeechCue } from "@/lib/alephbet/intro-alphabet";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { completeCurriculumLevel, curriculumLevel } from "@/lib/learn/curriculum";
import { rememberKnownWord } from "@/lib/learn/known-words";
import { letterPair, lettersThrough, pairKnownWord, type PairWord } from "@/lib/learn/letter-pairs";
import { playAudio } from "@/lib/settings/master-volume";
import { cn } from "cn";

export function LetterPairLevel({ level }: { level: number }) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const pair = letterPair(level);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [intro, setIntro] = useState(true);
  const [slide, setSlide] = useState(0);
  const [quizzing, setQuizzing] = useState(false);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    const local = host === "localhost" || host === "127.0.0.1";
    setAllowed(local || curriculumLevel() >= level);
  }, [level]);

  const shownWord = !intro && !quizzing && !passed ? pair?.words[slide] : undefined;

  useEffect(() => {
    if (shownWord) {
      void rememberKnownWord(pairKnownWord(shownWord));
    }
  }, [shownWord]);

  if (!pair || allowed === null) {
    return null;
  }

  if (!allowed) {
    return (
      <LevelFrame label={t("level", { id: String(level) })} finished>
        <p className="text-center text-base text-emerald-900">{t("levelLocked")}</p>
      </LevelFrame>
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
    <LevelFrame
      label={t("level", { id: String(level) })}
      finished={passed || curriculumLevel() > level}
      aside={passed ? <ExperienceTube /> : null}
    >
      {passed ? (
        <div className="flex max-w-xl flex-col items-center text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("levelClear", { level })}</h1>
          {level === 4 ? <p className="mt-3 text-base text-emerald-900/80">{t("flashcardsUnlockedBody")}</p> : null}
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
      ) : intro ? (
        <LetterIntro letters={letters} onPlay={(cue) => void playCue(cue)} onNext={() => setIntro(false)} />
      ) : word ? (
        <WordSlide
          word={word}
          gloss={word.gloss[glossLocale]}
          savedLabel={t("newWord", { word: word.gloss[glossLocale] })}
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
    </LevelFrame>
  );
}

function WordSlide({
  word,
  gloss,
  savedLabel,
  hearLabel,
  nextLabel,
  onHear,
  onNext,
}: {
  word: PairWord;
  gloss: string;
  savedLabel: string;
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
      <p className="text-sm text-emerald-800/80">{savedLabel}</p>
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="h-11 px-5" sound={false} onClick={onHear}>
          {hearLabel}
        </Button>
        <Button type="button" className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={onNext}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
