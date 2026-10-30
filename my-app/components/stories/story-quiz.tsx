"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { usePlaySample } from "@/components/settings/settings-provider";
import { ink } from "@/components/stories/ink";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { gradeQuiz, saveQuiz, type QuizActionState, type QuizGrade } from "@/lib/stories/quiz";
import type { StoryQuestion } from "@/lib/stories/queries";
import { Label } from "../ui/label";
import { cn } from "cn";

const initial: QuizActionState = { error: "" };

type Draft = { prompt: string; choices: { text: string; correct: boolean }[] };

function fromQuestions(questions: StoryQuestion[]): Draft[] {
  return questions.map((question) => ({
    prompt: question.prompt,
    choices: question.choices.map((choice) => ({ text: choice.text, correct: choice.correct })),
  }));
}

function blankQuestion(): Draft {
  return {
    prompt: "",
    choices: [
      { text: "", correct: true },
      { text: "", correct: false },
      { text: "", correct: false },
    ],
  };
}

export function QuizEditor({ storyId, questions }: { storyId: string; questions: StoryQuestion[] }) {
  const t = useTranslations("Stories");
  const [drafts, setDrafts] = useState<Draft[]>(() => (questions.length > 0 ? fromQuestions(questions) : [blankQuestion()]));
  const [state, action, pending] = useActionState(saveQuiz, initial);

  function update(index: number, next: Draft) {
    setDrafts((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)));
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="storyId" value={storyId} />
      <input type="hidden" name="quiz" value={JSON.stringify(drafts.filter((item) => item.prompt.trim()))} />
      {drafts.map((question, index) => (
        <fieldset key={index} className="flex flex-col gap-2" dir="rtl" lang="he" translate="no">
          <input
            className={cn(ink, "text-xl font-semibold")}
            dir="rtl"
            lang="he"
            value={question.prompt}
            maxLength={400}
            aria-label={t("questionLabel")}
            onChange={(event) => update(index, { ...question, prompt: event.target.value })}
          />
          {question.choices.map((choice, choiceIndex) => (
            <label key={choiceIndex} className="flex items-center gap-2 text-lg">
              <Checkbox
                checked={choice.correct}
                aria-label={t("choiceLabel")}
                onCheckedChange={(checked) =>
                  update(index, {
                    ...question,
                    choices: question.choices.map((item, itemIndex) =>
                      itemIndex === choiceIndex ? { ...item, correct: checked === true } : item,
                    ),
                  })
                }
              />
              <input
                className={cn(ink, "text-lg")}
                dir="rtl"
                lang="he"
                value={choice.text}
                maxLength={200}
                aria-label={t("choiceLabel")}
                onChange={(event) =>
                  update(index, {
                    ...question,
                    choices: question.choices.map((item, itemIndex) =>
                      itemIndex === choiceIndex ? { ...item, text: event.target.value } : item,
                    ),
                  })
                }
              />
            </label>
          ))}
          <div className="flex flex-wrap gap-2" dir="ltr">
            {question.choices.length < 6 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => update(index, { ...question, choices: [...question.choices, { text: "", correct: false }] })}
              >
                {t("addChoice")}
              </Button>
            ) : null}
            {question.choices.length > 2 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => update(index, { ...question, choices: question.choices.slice(0, -1) })}
              >
                {t("removeChoice")}
              </Button>
            ) : null}
          </div>
        </fieldset>
      ))}
      {state.error ? <p className="text-sm text-destructive">{t(state.error)}</p> : null}
      <div className="flex flex-wrap gap-2">
        {drafts.length < 20 ? (
          <Button type="button" variant="outline" onClick={() => setDrafts((current) => [...current, blankQuestion()])}>
            {t("addQuestion")}
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}

export function StoryQuiz({ storyId, questions, bare = false }: { storyId: string; questions: StoryQuestion[]; bare?: boolean }) {
  const t = useTranslations("Stories");
  const play = usePlaySample();
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [grades, setGrades] = useState<QuizGrade[] | null>(null);
  const [pending, setPending] = useState(false);
  if (questions.length === 0) {
    return null;
  }

  const byId = new Map(grades?.map((grade) => [grade.questionId, grade]));

  return (
    <form
      className={bare ? "flex flex-col gap-4" : "mt-4 flex flex-col gap-4"}
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        void gradeQuiz(
          storyId,
          questions.map((question) => ({ questionId: question.id, choiceIds: picked[question.id] ?? [] })),
        )
          .then((result) => {
            setGrades(result);
            if (result && result.length > 0 && result.every((grade) => grade.ok)) {
              play("success");
            } else if (result) {
              play("wrong");
            }
          })
          .finally(() => setPending(false));
      }}
    >
      {bare ? null : <h3 className="text-sm font-medium text-emerald-800">{t("quizTitle")}</h3>}
      {questions.map((question, index) => {
        const grade = byId.get(question.id);
        return (
          <fieldset key={question.id} className="flex flex-col gap-2" dir="rtl" lang="he" translate="no">
            <legend className="text-xl font-semibold">{index + 1}. {question.prompt}</legend>
            {question.choices.map((choice) => (
              <Label key={choice.id} className="flex items-center gap-2 text-lg" dir="rtl" lang="he" translate="no">
                <Checkbox
                  checked={(picked[question.id] ?? []).includes(choice.id)}
                  onCheckedChange={(checked) =>
                    setPicked((current) => {
                      const list = current[question.id] ?? [];
                      const next = checked === true ? [...list, choice.id] : list.filter((id) => id !== choice.id);
                      return { ...current, [question.id]: next };
                    })
                  }
                />
                {choice.text}
              </Label>
            ))}
            {grade ? (
              <p className={grade.ok ? "text-sm text-emerald-800" : "text-sm text-red-800"}>
                {grade.ok ? t("quizRight") : t("quizWrong", { answer: grade.answer })}
              </p>
            ) : null}
          </fieldset>
        );
      })}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t("saving") : t("checkQuiz")}
      </Button>
    </form>
  );
}
