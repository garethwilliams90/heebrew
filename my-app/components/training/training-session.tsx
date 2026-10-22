"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { useCue } from "@/components/settings/use-cue";
import { AccountNotice } from "@/components/flashcards/account-notice";
import { ProgressMeter } from "@/components/flashcards/progress-meter";
import { readSoundPrefs } from "@/components/flashcards/sound-toggle";
import { HeartRow, HintButton } from "@/components/learn/practice-hearts";
import { Button } from "@/components/ui/button";
import { BlankSentence } from "@/components/training/blank-sentence";
import { TrainingChoice } from "@/components/training/training-choice";
import { TrainingIntro, TrainingResults } from "@/components/training/training-screens";
import { VerbConjugationModal } from "@/components/training/verb-conjugation-modal";
import { addExperience, loadExperience } from "@/lib/flashcards/experience";
import { loadSpeechClip } from "@/lib/flashcards/speech-clip";
import { playAudio } from "@/lib/settings/master-volume";
import {
  buildTrainingRoundAsync,
  CORRECT_EXPERIENCE,
  ROUND_SIZE,
  type RoundQuestion,
} from "@/lib/training/round";
import { verbConjugations } from "@/lib/training/verb-conjugations";
import { sentenceTemplates } from "@/lib/training/sentence-templates";

type Phase = "intro" | "question" | "done";

const cardSpring = { type: "spring" as const, bounce: 0.28, visualDuration: 0.22 };

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
  const [showVerbModal, setShowVerbModal] = useState(false);
  const [halves, setHalves] = useState(10); // 5 hearts = 10 halves
  const [failed, setFailed] = useState(false);
  const [shake, setShake] = useState(false);
  const [replayDown, setReplayDown] = useState(false);
  const experienceRef = useRef(0);
  const rewardedRef = useRef(false);
  const playing = useRef<HTMLAudioElement | null>(null);
  const playId = useRef(0);
  const playCorrect = useCue("popUp");
  const playWrong = useCue("popDown");
  const playSuccess = useCue("success");

  const [generating, setGenerating] = useState(false);

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

  const hear = useCallback(async (text: string) => {
    const id = playId.current + 1;
    playId.current = id;
    const audio = await loadSpeechClip(text);
    if (!audio || id !== playId.current) {
      return;
    }
    if (playing.current) {
      playing.current.pause();
      playing.current.currentTime = 0;
    }
    audio.currentTime = 0;
    playing.current = audio;
    try {
      await playAudio(audio);
    } catch {
      // Autoplay can wait for a gesture; Hear again still replays after a click.
    }
  }, []);

  useEffect(() => {
    if (!question || selected !== null) {
      return;
    }
    
    // Load and play the sentence audio
    void loadSpeechClip(question.sentence.replace("{}", ""));
    void hear(question.sentence.replace("{}", ""));
    
    return () => {
      playId.current += 1;
      if (playing.current) {
        playing.current.pause();
        playing.current.currentTime = 0;
      }
    };
  }, [question, selected, hear]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea")) {
        return;
      }
      if (!question || selected !== null || failed) {
        return;
      }
      if (event.key !== "r" && event.key !== "R") {
        return;
      }
      event.preventDefault();
      if (event.type === "keyup") {
        setReplayDown(false);
        return;
      }
      if (event.repeat) {
        return;
      }
      setReplayDown(true);
      void hear(question.sentence.replace("{}", ""));
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [question, selected, failed, hear]);

  function start() {
    setGenerating(true);
    
    buildTrainingRoundAsync(null, undefined, {
      checkCogency: true,
      useModel: true,
    })
      .then((questions) => {
        setRound(questions);
        setIndex(0);
        setSelected(null);
        setCorrectCount(0);
        setReward(null);
        setSaveError(false);
        setHalves(10);
        setFailed(false);
        rewardedRef.current = false;
        setPhase("question");
      })
      .catch((error) => {
        console.error("Failed to generate training round:", error);
        setSaveError(true);
      })
      .finally(() => {
        setGenerating(false);
      });
  }

  function loseHeart(cost: number) {
    setHalves((current) => {
      const next = Math.max(0, current - cost);
      if (next <= 0) {
        setFailed(true);
      }
      return next;
    });
  }

  function choose(choice: number) {
    if (selected !== null || !question || failed) {
      return;
    }

    setSelected(choice);
    const correct = choice === question.correct;

    if (readSoundPrefs().general) {
      if (correct) {
        playSuccess();
      } else {
        playWrong();
        loseHeart(2);
        setShake(true);
        window.setTimeout(() => setShake(false), 420);
      }
    } else {
      if (!correct) {
        loseHeart(2);
        setShake(true);
        window.setTimeout(() => setShake(false), 420);
      }
    }
  }

  function hint() {
    if (!question || selected !== null || failed || halves < 1) {
      return;
    }
    loseHeart(1);
    // Auto-select the correct answer
    choose(question.correct);
  }

  function retry() {
    setHalves(10);
    setFailed(false);
    setSelected(null);
    setIndex(0);
    if (round[0]) {
      void hear(round[0].sentence.replace("{}", ""));
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

  // Get translation info for the question
  const getQuestionTranslation = () => {
    if (!question) return null;
    
    // Extract verb infinitive from question id
    const verbInfinitive = question.id.startsWith("dynamic-") ? question.id.split("-")[1] : null;
    if (!verbInfinitive) return null;
    
    const verb = verbConjugations.find((v) => v.infinitive === verbInfinitive);
    if (!verb) return null;
    
    // Find the template
    const templateId = question.id.split("-").slice(2).join("-");
    const template = sentenceTemplates.find((t) => t.id === templateId);
    if (!template) return null;
    
    // Get the correct form
    const correctForm = question.choices[question.correct][0];
    
    return {
      sentence: template.englishPattern.replace("{verb}", verb.english),
      verb: verb.english,
      form: correctForm,
    };
  };

  const translation = selected !== null ? getQuestionTranslation() : null;

  // Get tooltip for a choice
  const getChoiceTooltip = (choiceIndex: number) => {
    if (!question || !question.verb) return undefined;
    
    const hebrewForm = question.choices[choiceIndex][0];
    const form = question.verb.forms.find((f) => f.hebrew === hebrewForm);
    if (!form) return undefined;
    
    return `${question.verb.english} (${form.tense}, ${form.person} ${form.number}${form.gender !== "common" ? `, ${form.gender}` : ""})`;
  };

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-10 sm:px-8">
      <AccountNotice signedOut={signedIn === false} saveError={saveError} />

      {phase === "intro" ? <TrainingIntro onStart={start} generating={generating} /> : null}

      {phase === "question" && question ? (
        <section className="flex w-full max-w-3xl flex-1 flex-col justify-center gap-3">
          <div className="w-full">
            <ProgressMeter
              label={t("progress", { done: index + 1, total: ROUND_SIZE })}
              value={index + (selected !== null ? 1 : 0.45)}
              max={ROUND_SIZE}
              ratio={((index + (selected !== null ? 1 : 0.45)) / ROUND_SIZE) * 100}
              sections={ROUND_SIZE}
              className="h-2.5 rounded-full bg-emerald-950/10"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <HeartRow hearts={halves / 2} />
            <HintButton disabled={failed || selected !== null || halves < 1} onHint={hint} />
          </div>

          {failed ? (
            <p className="text-center text-emerald-900/80">{t("outOfHearts")}</p>
          ) : selected !== null ? (
            <p className="text-center text-emerald-900/80">
              {selected === question.correct ? t("correct") : t("incorrect")}
            </p>
          ) : (
            <div className="flex justify-center">
              <motion.span
                className="relative inline-flex"
                animate={{ scale: replayDown ? 0.96 : 1 }}
                transition={{ type: "spring", bounce: 0.05, visualDuration: 0.12 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 px-5"
                  aria-keyshortcuts="R"
                  onPointerDown={() => setReplayDown(true)}
                  onPointerUp={() => setReplayDown(false)}
                  onPointerLeave={() => setReplayDown(false)}
                  sound={false}
                  onClick={() => void hear(question.sentence.replace("{}", ""))}
                >
                  <Volume2 className="size-4" /> {t("hear")}
                </Button>
                <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-800 text-[10px] font-semibold text-white">
                  R
                </span>
              </motion.span>
            </div>
          )}

          {failed ? (
            <div className="flex justify-center">
              <Button type="button" className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900" onClick={retry}>
                {t("tryAgain")}
              </Button>
            </div>
          ) : (
            <>
              <motion.div
                animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="rounded-3xl border-2 border-emerald-900 bg-white/90 px-6 py-8 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)] backdrop-blur-sm"
              >
                <BlankSentence
                  template={question.sentence}
                  blankLabel={t("blank")}
                  onBlankClick={question.verb ? () => setShowVerbModal(true) : undefined}
                />
                {translation && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={cardSpring}
                    className="mt-4 text-center text-lg text-emerald-900"
                  >
                    {translation.sentence}
                  </motion.p>
                )}
              </motion.div>

              <div className="mt-4 flex flex-col gap-3" role="group" aria-label={t("title")}>
                {question.choices.map((choice, choiceIndex) => (
                  <motion.div
                    key={choiceIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...cardSpring, delay: choiceIndex * 0.05 }}
                  >
                    <TrainingChoice
                      number={choiceIndex + 1}
                      words={choice}
                      answered={selected !== null}
                      correct={choiceIndex === question.correct}
                      selected={choiceIndex === selected}
                      onChoose={() => choose(choiceIndex)}
                      tooltip={getChoiceTooltip(choiceIndex)}
                    />
                  </motion.div>
                ))}
              </div>

              {selected !== null ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={cardSpring}
                  className="flex justify-center"
                >
                  <Button
                    className="h-11 bg-emerald-800 px-5 text-white hover:bg-emerald-900"
                    onClick={continueRound}
                  >
                    {index + 1 >= round.length ? t("seeResults") : t("next")}
                  </Button>
                </motion.div>
              ) : null}
            </>
          )}
        </section>
      ) : null}

      {phase === "done" ? (
        <TrainingResults correct={correctCount} total={ROUND_SIZE} reward={reward} onAgain={start} />
      ) : null}

      {showVerbModal && question?.verb ? (
        <VerbConjugationModal verb={question.verb} onClose={() => setShowVerbModal(false)} />
      ) : null}
    </main>
  );
}
