"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useCue } from "@/components/settings/use-cue";
import { AccountNotice } from "@/components/flashcards/account-notice";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { readSoundPrefs } from "@/components/flashcards/sound-toggle";
import { Button } from "@/components/ui/button";
import { BlankSentence } from "@/components/training/blank-sentence";
import { TrainingChoice } from "@/components/training/training-choice";
import { TrainingIntro, TrainingResults } from "@/components/training/training-screens";
import { addExperience, loadExperience } from "@/lib/flashcards/experience";
import {
  buildTrainingRound,
  CORRECT_EXPERIENCE,
  ROUND_SIZE,
  type RoundQuestion,
} from "@/lib/training/round";

type Phase = "intro" | "question" | "done";

export function TrainingSession() {
  const t = useTranslations("Training");
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState<RoundQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [reward, setReward] = useState<{ from: number; to: number } | null>(null);
  const experienceRef = useRef(0);
  const rewardedRef = useRef(false);
  const playCorrect = useCue("/sounds/samples/pop-up-on.mp3");
  const playWrong = useCue("/sounds/samples/pop-down.mp3");

  useEffect(() => {
    let cancel = false;

    loadExperience()
      .then((result) => {
        if (cancel) {
          return;
        }
        experienceRef.current = result.experience;
        setSignedIn(result.signedIn);
      })
      .catch(() => {
        if (!cancel) {
          setSaveError(true);
        }
      });

    return () => {
      cancel = true;
    };
  }, []);

  const question = round[index];

  function start() {
    setRound(buildTrainingRound());
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setReward(null);
    setSaveError(false);
    rewardedRef.current = false;
    setPhase("question");
  }

  function choose(choice: number) {
    if (selected !== null || !question) {
      return;
    }

    setSelected(choice);

    if (readSoundPrefs().general) {
      if (choice === question.correct) {
        playCorrect();
      } else {
        playWrong();
      }
    }
  }

  function continueRound() {
    if (selected === null || !question) {
      return;
    }

    const nextCorrect = correctCount + (selected === question.correct ? 1 : 0);
    setCorrectCount(nextCorrect);

    if (index + 1 >= round.length) {
      setPhase("done");
      void finish(nextCorrect * CORRECT_EXPERIENCE);
      return;
    }

    setIndex(index + 1);
    setSelected(null);
  }

  async function finish(gained: number) {
    if (rewardedRef.current) {
      return;
    }

    rewardedRef.current = true;
    const from = experienceRef.current;
    const to = from + gained;
    experienceRef.current = to;
    setReward({ from, to });
    const result = await addExperience(gained);
    if (result === "error") {
      setSaveError(true);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-10 sm:px-8">
      <AccountNotice signedOut={signedIn === false} saveError={saveError} />

      {phase === "intro" ? <TrainingIntro onStart={start} /> : null}

      {phase === "question" && question ? (
        <section className="flex w-full max-w-3xl flex-1 flex-col justify-center">
          <p className="text-sm text-emerald-900/70">
            {t("progress", { done: index + 1, total: ROUND_SIZE })}
          </p>
          <ProgressMeter
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-950/10"
            label={t("progress", { done: index, total: ROUND_SIZE })}
            value={index}
            max={ROUND_SIZE}
            ratio={(index / ROUND_SIZE) * 100}
          />

          <div className="mt-6 rounded-2xl border-2 border-emerald-900 bg-white px-6 py-8 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]">
            <BlankSentence template={question.sentence} blankLabel={t("blank")} />
          </div>

          <div className="mt-4 flex flex-col gap-3" role="group" aria-label={t("title")}>
            {question.choices.map((choice, choiceIndex) => (
              <TrainingChoice
                key={choiceIndex}
                number={choiceIndex + 1}
                words={choice}
                answered={selected !== null}
                correct={choiceIndex === question.correct}
                selected={choiceIndex === selected}
                onChoose={() => choose(choiceIndex)}
              />
            ))}
          </div>

          {selected !== null ? (
            <div className="mt-5 flex items-center justify-between gap-4">
              <p className={selected === question.correct ? "text-emerald-800" : "text-red-800"}>
                {selected === question.correct ? t("correct") : t("incorrect")}
              </p>
              <Button
                className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900"
                onClick={continueRound}
              >
                {index + 1 >= round.length ? t("seeResults") : t("next")}
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      {phase === "done" ? (
        <TrainingResults correct={correctCount} total={ROUND_SIZE} reward={reward} onAgain={start} />
      ) : null}
    </main>
  );
}
