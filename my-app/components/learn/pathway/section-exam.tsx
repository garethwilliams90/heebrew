"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mic, MicOff } from "lucide-react";
import { ExamQuestionView } from "@/components/learn/exercises/exercise-view";
import { PracticeQuizHeader } from "@/components/learn/practice-quiz-header";
import { usePracticeHearts } from "@/components/learn/use-practice-hearts";
import { LevelFrame } from "@/components/learn/level-frame";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { examQuestions, sectionById } from "@/lib/learn/pathway/catalog";
import { passExam, touchStudy } from "@/lib/learn/pathway/progress";
import type { ExamQuestion } from "@/lib/learn/pathway/types";

export function SectionExam({ sectionId, review = false }: { sectionId: string; review?: boolean }) {
  const t = useTranslations("Learn");
  const section = sectionById(sectionId);
  const lives = section?.exam.lives ?? 3;
  const { halves, failed, loseHeart, resetHearts } = usePracticeHearts(lives);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(review);
  const [questions, setQuestions] = useState<ExamQuestion[]>(() => {
    const current = sectionById(sectionId);
    if (!review || !current) {
      return [];
    }
    return examQuestions(current, 8, `${current.id}-review`);
  });
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  if (!section) {
    return null;
  }

  const activeSection = section;

  function begin(microphone: boolean) {
    setQuestions(
      examQuestions(activeSection, activeSection.exam.questions, `${activeSection.id}-exam-${microphone ? "mic" : "quiet"}`, {
        microphone,
      }),
    );
    setIndex(0);
    setReady(true);
  }
  const question = questions[index];
  const showFail = failed && !review;

  function succeed() {
    if (index < questions.length - 1) {
      setIndex((current) => current + 1);
      return;
    }
    if (review) {
      touchStudy(activeSection.id);
    } else {
      passExam(activeSection.id);
    }
    setDone(true);
  }

  return (
    <LevelFrame accent={!review} label={review ? t("reviewDone") : t("examTitle")} finished={done || showFail}>
      {!ready ? (
        <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-semibold text-emerald-950">{t("examMicTitle")}</h1>
          <p className="text-emerald-900">{t("examMicBody")}</p>
          <div className="flex w-full flex-col gap-3">
            <Button type="button" className="h-11" onClick={() => begin(true)}>
              <Mic />
              {t("examMicYes")}
            </Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => begin(false)}>
              <MicOff />
              {t("examMicNo")}
            </Button>
          </div>
        </div>
      ) : done ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-semibold text-emerald-950">{review ? t("reviewDone") : t("examPass")}</h1>
          <Link href="/" className={buttonVariants()}>
            {t("continueHome")}
          </Link>
        </div>
      ) : showFail ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-emerald-950">{t("examFail")}</p>
          <Button
            type="button"
            onClick={() => {
              resetHearts();
              setIndex(0);
              setAttempt((current) => current + 1);
            }}
          >
            {t("tryAgain")}
          </Button>
        </div>
      ) : (
        <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center gap-4">
          <div className="w-full shrink-0 self-stretch">
            <PracticeQuizHeader
              question={index + 1}
              total={Math.max(questions.length, 1)}
              ratio={questions.length === 0 ? 0 : ((index + 0.5) / questions.length) * 100}
              halves={review ? lives * 2 : halves}
              failed={false}
              prompt={review ? t("reviewDone") : t("examTitle")}
              hintDisabled
              onHint={() => undefined}
              onRetry={() => undefined}
              showHint={false}
              lives={lives}
            />
          </div>
          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-y-auto">
          {question ? (
            <ExamQuestionView
              key={`${attempt}-${index}`}
              question={question}
              onPass={succeed}
              onMiss={review ? undefined : () => loseHeart(2)}
              hearts={
                review
                  ? { halves: lives * 2, failed: false, loseHeart: () => undefined, resetHearts }
                  : { halves, failed, loseHeart, resetHearts }
              }
            />
          ) : null}
          </div>
        </div>
      )}
    </LevelFrame>
  );
}

export function ReviewPrompt({ title, href, onLater }: { title: string; href: string; onLater: () => void }) {
  const t = useTranslations("Home");
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-emerald-950/30 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-xl">
        <h2 className="text-2xl font-semibold text-emerald-950">{t("reviewTitle")}</h2>
        <p className="mt-2 text-emerald-900">{t("reviewBody", { section: title })}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Link href={href} className={buttonVariants()}>
            {t("reviewStart")}
          </Link>
          <Button type="button" variant="outline" onClick={onLater}>
            {t("reviewLater")}
          </Button>
        </div>
      </div>
    </div>
  );
}
