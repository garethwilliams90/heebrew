"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ExperienceTube } from "@/components/learn/experience-tube";
import { ConceptSlide, HearCards, HebrewMark } from "@/components/learn/hear-cards";
import { HebrewGlyph } from "@/components/learn/hebrew-glyph";
import { HearTile } from "@/components/learn/hear-tile";
import { LevelClear } from "@/components/learn/level-clear";
import { LevelNav } from "@/components/learn/level-nav";
import { LevelFrame } from "@/components/learn/level-frame";
import { LockedLevel, useCurriculumGate } from "@/components/learn/use-curriculum-gate";
import { SentenceBuilder } from "@/components/learn/sentence-builder";
import { loadBundleClip } from "@/lib/learn/bundle-clip";
import { playCue } from "@/lib/learn/play-cue";
import { completeCurriculumLevel, curriculumLevel } from "@/lib/learn/curriculum";
import { rememberKnownWord } from "@/lib/learn/known-words";
import {
  thirteenIntroForms,
  thirteenKnownWords,
  thirteenPractice,
  thirteenStage1Forms,
  thirteenStage2Forms,
  thirteenStage3Forms,
  thirteenStage4Forms,
} from "@/lib/learn/level-thirteen";
import {
  drinkForms,
  eatForms,
  etHaPair,
  fourteenEatPractice,
  fourteenKnownWords,
  fourteenMixPractice,
  learnForms,
} from "@/lib/learn/level-fourteen";
import { fifteenKnownWords, fifteenReadPractice, readForms, readNouns } from "@/lib/learn/level-fifteen";
import { loveForms, loveNouns, sixteenKnownWords, sixteenMixPractice, writeForms } from "@/lib/learn/level-sixteen";
import { glossOf } from "@/lib/learn/sentences";
import { playAudio } from "@/lib/settings/master-volume";
import { useLocale } from "next-intl";

type Step =
  | "intro"
  | "13.1"
  | "13.1p"
  | "13.2"
  | "13.2p"
  | "13.3"
  | "13.3p"
  | "13.4"
  | "13.4p"
  | "14.1"
  | "14.2"
  | "14.3"
  | "14.4"
  | "14.5"
  | "15.1"
  | "15.2"
  | "15.3"
  | "16.1"
  | "16.2"
  | "16.3"
  | "16.4"
  | "done";

const thirteenOrder: Step[] = ["intro", "13.1", "13.1p", "13.2", "13.2p", "13.3", "13.3p", "13.4", "13.4p", "done"];
const fourteenOrder: Step[] = ["14.1", "14.2", "14.3", "14.4", "14.5", "done"];
const fifteenOrder: Step[] = ["15.1", "15.2", "15.3", "done"];
const sixteenOrder: Step[] = ["16.1", "16.2", "16.3", "16.4", "done"];

const orders: Record<13 | 14 | 15 | 16, Step[]> = {
  13: thirteenOrder,
  14: fourteenOrder,
  15: fifteenOrder,
  16: sixteenOrder,
};

const firstStep: Record<13 | 14 | 15 | 16, Step> = {
  13: "intro",
  14: "14.1",
  15: "15.1",
  16: "16.1",
};

function startStep(level: 13 | 14 | 15 | 16, from?: string): Step {
  const order = orders[level];
  if (from && order.includes(from as Step)) {
    return from as Step;
  }
  return firstStep[level];
}

function advance(level: 13 | 14 | 15 | 16, step: Step): Step {
  const order = orders[level];
  const index = order.indexOf(step);
  return order[Math.min(index + 1, order.length - 1)] ?? "done";
}

function previous(level: 13 | 14 | 15 | 16, step: Step): Step | null {
  const order = orders[level];
  const index = order.indexOf(step);
  if (index <= 0) {
    return null;
  }
  const prior = order[index - 1];
  return prior && prior !== "done" ? prior : null;
}

export function SentenceLevel({ level, from }: { level: 13 | 14 | 15 | 16; from?: string }) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const allowed = useCurriculumGate(level);
  const [step, setStep] = useState<Step>(() => startStep(level, from));
  const eatRounds = useMemo(() => fourteenEatPractice(), []);
  const mixRounds = useMemo(() => fourteenMixPractice(), []);
  const readRounds = useMemo(() => fifteenReadPractice(), []);
  const writeLoveRounds = useMemo(() => sixteenMixPractice(), []);
  const stage1 = useMemo(() => thirteenPractice(1), []);
  const stage2 = useMemo(() => thirteenPractice(2), []);
  const stage3 = useMemo(() => thirteenPractice(3), []);
  const stage4 = useMemo(() => thirteenPractice(4), []);

  useEffect(() => {
    const words =
      level === 13 ? thirteenKnownWords : level === 14 ? fourteenKnownWords : level === 15 ? fifteenKnownWords : sixteenKnownWords;
    for (const word of words) {
      void rememberKnownWord(word);
    }
  }, [level]);

  async function hear(text: string, audioPath?: string) {
    if (!audioPath) {
      await playCue({ text });
      return;
    }
    const audio = await loadBundleClip(audioPath);
    if (!audio) {
      return;
    }
    audio.currentTime = 0;
    await playAudio(audio);
  }

  function goNext() {
    setStep((current) => advance(level, current));
  }

  function finishLevel() {
    completeCurriculumLevel(level);
    setStep("done");
  }

  if (allowed === null) {
    return null;
  }

  if (!allowed) {
    return <LockedLevel level={level} />;
  }

  const passed = step === "done";
  const labelId = step === "intro" || step === "done" ? String(level) : step.replace("p", "");
  const prior = previous(level, step);
  const practice = step.endsWith("p") || step === "15.3" || step === "16.4";
  const concept = !passed && !practice;

  return (
    <LevelFrame
      label={t("level", { id: labelId })}
      finished={passed || curriculumLevel() > level}
      aside={passed ? <ExperienceTube /> : null}
      footer={
        passed ? null : (
          <LevelNav
            backHref={prior ? undefined : "/"}
            onBack={prior ? () => setStep(prior) : undefined}
            onNext={concept ? goNext : undefined}
          />
        )
      }
    >
      {passed ? (
        <LevelClear level={level} />
      ) : step === "intro" ? (
        <ConceptSlide title={t.rich("shelTitle", { he: (chunks) => <HebrewMark tone="new">{chunks}</HebrewMark> })} >
          <p className="text-base text-emerald-900/80 sm:text-lg">
            {t.rich("shelMeaning", { he: (chunks) => <HebrewMark>{chunks}</HebrewMark> })}
          </p>
          <p className="text-base text-emerald-900/80">
            {t.rich("shelUse", { he: (chunks) => <HebrewMark>{chunks}</HebrewMark> })}
          </p>
          <p className="text-base text-emerald-900/80">{t("shelEndings")}</p>
          <HearCards cards={thirteenIntroForms} onHear={(text) => void playCue({ text })} />
        </ConceptSlide>
      ) : step === "13.1" ? (
        <ConceptSlide title={t("shelStage1Title")} >
          <p className="text-base text-emerald-900/80">{t("shelStage1Body")}</p>
          <HearCards cards={thirteenStage1Forms} onHear={(text) => void playCue({ text })} />
        </ConceptSlide>
      ) : step === "13.1p" ? (
        <SentenceBuilder rounds={stage1} onPass={goNext} />
      ) : step === "13.2" ? (
        <ConceptSlide title={t("shelStage2Title")} >
          <p className="text-base text-emerald-900/80">
            {t.rich("shelStage2Body", { he: (chunks) => <HebrewMark>{chunks}</HebrewMark> })}
          </p>
          <p className="text-base text-emerald-900/80">{t("pluralSuffixes")}</p>
          <HearCards cards={thirteenStage2Forms} onHear={(text) => void playCue({ text })} />
        </ConceptSlide>
      ) : step === "13.2p" ? (
        <SentenceBuilder rounds={stage2} onPass={goNext} />
      ) : step === "13.3" ? (
        <ConceptSlide title={t("shelStage3Title")} >
          <p className="text-base text-emerald-900/80">{t("shelStage3Body")}</p>
          <HearCards cards={thirteenStage3Forms} onHear={(text) => void playCue({ text })} />
        </ConceptSlide>
      ) : step === "13.3p" ? (
        <SentenceBuilder rounds={stage3} onPass={goNext} />
      ) : step === "13.4" ? (
        <ConceptSlide title={t("shelStage4Title")} >
          <p className="text-base text-emerald-900/80">{t("shelStage4Body")}</p>
          <HearCards cards={thirteenStage4Forms} onHear={(text) => void playCue({ text })} />
        </ConceptSlide>
      ) : step === "13.4p" ? (
        <SentenceBuilder rounds={stage4} onPass={finishLevel} />
      ) : step === "14.1" ? (
        <ConceptSlide title={t.rich("eatTitle", { he: (chunks) => <HebrewMark tone="new">{chunks}</HebrewMark> })} >
          <p className="text-base text-emerald-900/80">{t("eatBody")}</p>
          <HearCards cards={eatForms} onHear={(text) => void playCue({ text })} />
        </ConceptSlide>
      ) : step === "14.2" ? (
        <ConceptSlide title={t.rich("etHaTitle", { he: (chunks) => <HebrewMark tone="new">{chunks}</HebrewMark> })} >
          <p className="text-base text-emerald-900/80">
            {t.rich("etHaBody", { he: (chunks) => <HebrewMark>{chunks}</HebrewMark> })}
          </p>
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <ExampleSentence hebrew={etHaPair.without.hebrew} gloss={glossOf(etHaPair.without.gloss, locale)} onHear={() => void playCue({ text: etHaPair.without.hebrew })} />
            <ExampleSentence hebrew={etHaPair.withEt.hebrew} gloss={glossOf(etHaPair.withEt.gloss, locale)} onHear={() => void playCue({ text: etHaPair.withEt.hebrew })} />
          </div>
        </ConceptSlide>
      ) : step === "14.3" ? (
        <SentenceBuilder rounds={eatRounds} onPass={goNext} />
      ) : step === "14.4" ? (
        <ConceptSlide title={t.rich("drinkLearnTitle", { he: (chunks) => <HebrewMark tone="new">{chunks}</HebrewMark> })} >
          <p className="text-base text-emerald-900/80">{t("drinkLearnBody")}</p>
          <p className="text-sm font-medium text-emerald-900">{t("verbDrink")}</p>
          <HearCards cards={drinkForms} onHear={(text) => void playCue({ text })} />
          <p className="text-sm font-medium text-emerald-900">{t("verbLearn")}</p>
          <HearCards cards={learnForms} onHear={(text) => void playCue({ text })} />
        </ConceptSlide>
      ) : step === "14.5" ? (
        <SentenceBuilder rounds={mixRounds} onPass={finishLevel} />
      ) : step === "15.1" ? (
        <ConceptSlide title={t.rich("readTitle", { he: (chunks) => <HebrewMark tone="new">{chunks}</HebrewMark> })} >
          <p className="text-base text-emerald-900/80">{t("readBody")}</p>
          <HearCards cards={readForms} onHear={(text, audio) => void hear(text, audio)} />
        </ConceptSlide>
      ) : step === "15.2" ? (
        <ConceptSlide title={t.rich("readNounsTitle", { he: (chunks) => <HebrewMark tone="new">{chunks}</HebrewMark> })} >
          <p className="text-base text-emerald-900/80">{t("readNounsBody")}</p>
          <HearCards cards={readNouns} onHear={(text, audio) => void hear(text, audio)} />
        </ConceptSlide>
      ) : step === "15.3" ? (
        <SentenceBuilder rounds={readRounds} onPass={finishLevel} />
      ) : step === "16.1" ? (
        <ConceptSlide title={t.rich("writeTitle", { he: (chunks) => <HebrewMark tone="new">{chunks}</HebrewMark> })} >
          <p className="text-base text-emerald-900/80">{t("writeBody")}</p>
          <HearCards cards={writeForms} onHear={(text, audio) => void hear(text, audio)} />
        </ConceptSlide>
      ) : step === "16.2" ? (
        <ConceptSlide title={t.rich("loveTitle", { he: (chunks) => <HebrewMark tone="new">{chunks}</HebrewMark> })} >
          <p className="text-base text-emerald-900/80">{t("loveBody")}</p>
          <HearCards cards={loveForms} onHear={(text, audio) => void hear(text, audio)} />
        </ConceptSlide>
      ) : step === "16.3" ? (
        <ConceptSlide title={t.rich("loveNounsTitle", { he: (chunks) => <HebrewMark tone="new">{chunks}</HebrewMark> })} >
          <p className="text-base text-emerald-900/80">{t("loveNounsBody")}</p>
          <HearCards cards={loveNouns} onHear={(text, audio) => void hear(text, audio)} />
        </ConceptSlide>
      ) : step === "16.4" ? (
        <SentenceBuilder rounds={writeLoveRounds} onPass={finishLevel} />
      ) : null}
    </LevelFrame>
  );
}

function ExampleSentence({ hebrew, gloss, onHear }: { hebrew: string; gloss: string; onHear: () => void }) {
  const t = useTranslations("Learn");
  return (
    <HearTile hearLabel={t("quizHear")} onHear={onHear}>
      <HebrewGlyph className="text-2xl">{hebrew}</HebrewGlyph>
      <p className="text-sm text-emerald-900/80">{gloss}</p>
    </HearTile>
  );
}
