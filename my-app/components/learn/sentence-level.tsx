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
import { glossOf } from "@/lib/learn/sentences";
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
  | "done";

const thirteenOrder: Step[] = ["intro", "13.1", "13.1p", "13.2", "13.2p", "13.3", "13.3p", "13.4", "13.4p", "done"];
const fourteenOrder: Step[] = ["14.1", "14.2", "14.3", "14.4", "14.5", "done"];

function startStep(level: number, from?: string): Step {
  if (level === 13) {
    if (from && thirteenOrder.includes(from as Step)) {
      return from as Step;
    }
    return "intro";
  }
  if (from && fourteenOrder.includes(from as Step)) {
    return from as Step;
  }
  return "14.1";
}

function advance(level: number, step: Step): Step {
  const order = level === 13 ? thirteenOrder : fourteenOrder;
  const index = order.indexOf(step);
  return order[Math.min(index + 1, order.length - 1)] ?? "done";
}

function previous(level: number, step: Step): Step | null {
  const order = level === 13 ? thirteenOrder : fourteenOrder;
  const index = order.indexOf(step);
  if (index <= 0) {
    return null;
  }
  const prior = order[index - 1];
  return prior && prior !== "done" ? prior : null;
}

export function SentenceLevel({ level, from }: { level: 13 | 14; from?: string }) {
  const t = useTranslations("Learn");
  const locale = useLocale();
  const allowed = useCurriculumGate(level);
  const [step, setStep] = useState<Step>(() => startStep(level, from));
  const eatRounds = useMemo(() => fourteenEatPractice(), []);
  const mixRounds = useMemo(() => fourteenMixPractice(), []);
  const stage1 = useMemo(() => thirteenPractice(1), []);
  const stage2 = useMemo(() => thirteenPractice(2), []);
  const stage3 = useMemo(() => thirteenPractice(3), []);
  const stage4 = useMemo(() => thirteenPractice(4), []);

  useEffect(() => {
    const words = level === 13 ? thirteenKnownWords : fourteenKnownWords;
    for (const word of words) {
      void rememberKnownWord(word);
    }
  }, [level]);

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
  const concept = !passed && !step.endsWith("p");

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
        <ConceptSlide title={t.rich("shelTitle", { he: (chunks) => <HebrewMark>{chunks}</HebrewMark> })} >
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
        <ConceptSlide title={t.rich("eatTitle", { he: (chunks) => <HebrewMark>{chunks}</HebrewMark> })} >
          <p className="text-base text-emerald-900/80">{t("eatBody")}</p>
          <HearCards cards={eatForms} onHear={(text) => void playCue({ text })} />
        </ConceptSlide>
      ) : step === "14.2" ? (
        <ConceptSlide title={t.rich("etHaTitle", { he: (chunks) => <HebrewMark>{chunks}</HebrewMark> })} >
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
        <ConceptSlide title={t.rich("drinkLearnTitle", { he: (chunks) => <HebrewMark>{chunks}</HebrewMark> })} >
          <p className="text-base text-emerald-900/80">{t("drinkLearnBody")}</p>
          <p className="text-sm font-medium text-emerald-900">{t("verbDrink")}</p>
          <HearCards cards={drinkForms} onHear={(text) => void playCue({ text })} />
          <p className="text-sm font-medium text-emerald-900">{t("verbLearn")}</p>
          <HearCards cards={learnForms} onHear={(text) => void playCue({ text })} />
        </ConceptSlide>
      ) : step === "14.5" ? (
        <SentenceBuilder rounds={mixRounds} onPass={finishLevel} />
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
