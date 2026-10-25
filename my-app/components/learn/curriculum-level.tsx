"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ConceptSlide, HearCards, HebrewMark } from "@/components/learn/hear-cards";
import { ExperienceTube } from "@/components/learn/experience-tube";
import { LevelFrame } from "@/components/learn/level-frame";
import { LevelNav } from "@/components/learn/level-nav";
import { NextLevelLink } from "@/components/learn/level-finish";
import { SentenceBuilder } from "@/components/learn/sentence-builder";
import { loadBundleClip } from "@/lib/learn/bundle-clip";
import { completeCurriculumLevel, curriculumLevel } from "@/lib/learn/curriculum";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { rememberKnownWord } from "@/lib/learn/known-words";
import {
  curriculumLevelDef,
  isRoundStep,
  type TitlePiece,
} from "@/lib/learn/later-levels";
import { glossOf } from "@/lib/learn/sentences";
import { playAudio } from "@/lib/settings/master-volume";

function TitleLine({ pieces }: { pieces: readonly TitlePiece[] }) {
  const locale = useLocale();
  return (
    <>
      {pieces.map((piece, index) =>
        "he" in piece ? (
          <HebrewMark key={index} tone="new">
            {piece.he}
          </HebrewMark>
        ) : (
          <span key={index}>{glossOf(piece, locale)}</span>
        ),
      )}
    </>
  );
}

export function CurriculumLevel({ level, from }: { level: number; from?: string }) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const def = curriculumLevelDef(level);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [index, setIndex] = useState(() => {
    if (!def || !from) {
      return 0;
    }
    const found = def.steps.findIndex((step) => step.id === from);
    return found < 0 ? 0 : found;
  });
  const [done, setDone] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    const local = host === "localhost" || host === "127.0.0.1";
    setAllowed(local || curriculumLevel() >= level);
  }, [level]);

  useEffect(() => {
    if (!def) {
      return;
    }
    for (const word of def.knownWords) {
      void rememberKnownWord(word);
    }
  }, [def]);

  async function hear(text: string, audioPath?: string) {
    const audio = audioPath ? await loadBundleClip(audioPath) : await loadSpeechClip(text);
    if (!audio) {
      return;
    }
    audio.currentTime = 0;
    await playAudio(audio);
  }

  if (!def || allowed === null) {
    return null;
  }

  const levelDef = def;

  if (!allowed) {
    return (
      <LevelFrame label={t("level", { id: String(level) })} finished>
        <p className="text-center text-base text-emerald-900">{t("levelLocked")}</p>
      </LevelFrame>
    );
  }

  const step = levelDef.steps[index];
  const practice = step ? isRoundStep(step) : false;
  const prior = index > 0;

  function finish() {
    if (index < levelDef.steps.length - 1) {
      setIndex((current) => current + 1);
      return;
    }
    completeCurriculumLevel(level);
    setDone(true);
  }

  return (
    <LevelFrame
      label={t("level", { id: done || !step ? String(level) : step.id })}
      finished={done || curriculumLevel() > level}
      aside={done ? <ExperienceTube /> : null}
      footer={
        done || practice ? null : (
          <LevelNav
            backHref={prior ? undefined : "/"}
            onBack={prior ? () => setIndex((current) => current - 1) : undefined}
            onNext={finish}
          />
        )
      }
    >
      {done ? (
        <div className="flex max-w-xl flex-col items-center text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">{t("levelClear", { level })}</h1>
          <NextLevelLink level={level} />
        </div>
      ) : step && isRoundStep(step) ? (
        <SentenceBuilder rounds={step.rounds} exam={step.exam} onPass={finish} />
      ) : step ? (
        <ConceptSlide title={<TitleLine pieces={step.title} />}>
          <p className="text-base text-emerald-900/80 sm:text-lg">{glossOf(step.body, locale)}</p>
          {step.cards && step.cards.length > 0 ? (
            <HearCards cards={step.cards} onHear={(text, audio) => void hear(text, audio)} />
          ) : null}
        </ConceptSlide>
      ) : null}
    </LevelFrame>
  );
}
