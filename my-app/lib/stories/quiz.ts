"use server";

import { revalidateLocalized } from "@/lib/content/revalidate";
import { requireOwner } from "@/lib/owner-session";
import { parseQuiz } from "@/lib/stories/quiz-model";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type QuizActionState = {
  error: "" | "forbidden" | "invalid" | "storage";
};

export type QuizGrade = {
  questionId: string;
  ok: boolean;
  answer: string;
};

export type QuizAnswer = { questionId: string; choiceIds: string[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveQuiz(_state: QuizActionState, formData: FormData): Promise<QuizActionState> {
  const owner = await requireOwner();
  if (!owner) {
    return { error: "forbidden" };
  }
  const storyId = formData.get("storyId");
  const raw = formData.get("quiz");
  if (typeof storyId !== "string" || !UUID.test(storyId) || typeof raw !== "string" || raw.length > 50_000) {
    return { error: "invalid" };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "invalid" };
  }
  const questions = parseQuiz(parsed);
  if (!questions) {
    return { error: "invalid" };
  }

  const service = createServiceClient();
  const { error: clearError } = await service.from("story_questions").delete().eq("story_id", storyId);
  if (clearError) {
    return { error: "storage" };
  }
  for (const [index, question] of questions.entries()) {
    const { data, error } = await service
      .from("story_questions")
      .insert({ story_id: storyId, prompt: question.prompt, sort_order: index })
      .select("id")
      .single();
    if (error || !data) {
      return { error: "storage" };
    }
    const { error: choiceError } = await service.from("story_choices").insert(
      question.choices.map((choice, choiceIndex) => ({
        question_id: data.id,
        label: choice.text,
        correct: choice.correct,
        sort_order: choiceIndex,
      })),
    );
    if (choiceError) {
      return { error: "storage" };
    }
  }
  revalidateLocalized("/stories");
  return { error: "" };
}

export async function gradeQuiz(storyId: string, answers: QuizAnswer[]): Promise<QuizGrade[] | null> {
  if (!UUID.test(storyId) || !Array.isArray(answers) || answers.length > 20) {
    return null;
  }
  if (
    answers.some(
      (answer) =>
        !UUID.test(answer.questionId) ||
        !Array.isArray(answer.choiceIds) ||
        answer.choiceIds.length > 6 ||
        answer.choiceIds.some((choiceId) => !UUID.test(choiceId)),
    )
  ) {
    return null;
  }

  const owner = await requireOwner();
  const questions = owner ? await loadOwnedQuestions(storyId) : await loadPublicQuestions(storyId);
  if (!questions || questions.length === 0) {
    return null;
  }
  const byId = new Map(questions.map((question) => [question.id, question]));
  return answers.flatMap((answer) => {
    const question = byId.get(answer.questionId);
    if (!question) {
      return [];
    }
    const correct = question.choices.filter((choice) => choice.correct);
    const picked = new Set(answer.choiceIds);
    const ok =
      correct.length > 0 &&
      correct.every((choice) => picked.has(choice.id)) &&
      question.choices.every((choice) => choice.correct || !picked.has(choice.id));
    return [{ questionId: question.id, ok, answer: correct.map((choice) => choice.label).join(" · ") }];
  });
}

type ChoiceRow = { id: string; question_id: string; label: string; correct: boolean; sort_order: number };
type QuestionRow = { id: string; prompt: string; sort_order: number; choices: ChoiceRow[] };

function groupQuestions(
  questions: { id: string; prompt: string; sort_order: number }[],
  choices: ChoiceRow[],
): QuestionRow[] {
  const grouped = new Map<string, ChoiceRow[]>();
  for (const choice of choices) {
    const list = grouped.get(choice.question_id) ?? [];
    list.push(choice);
    grouped.set(choice.question_id, list);
  }
  return questions.map((question) => ({
    ...question,
    choices: (grouped.get(question.id) ?? []).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

async function loadOwnedQuestions(storyId: string) {
  try {
    const client = createServiceClient();
    const { data, error } = await client.from("story_questions").select("id, prompt, sort_order").eq("story_id", storyId).order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) {
      return null;
    }
    const choices = await client.from("story_choices").select("id, question_id, label, correct, sort_order").in("question_id", data.map((question) => question.id));
    if (choices.error || !choices.data) {
      return null;
    }
    return groupQuestions(data, choices.data);
  } catch {
    return null;
  }
}

async function loadPublicQuestions(storyId: string) {
  try {
    const client = await createClient();
    const { data, error } = await client.from("story_questions").select("id, prompt, sort_order").eq("story_id", storyId).order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) {
      return null;
    }
    const choices = await client.from("story_choices").select("id, question_id, label, correct, sort_order").in("question_id", data.map((question) => question.id));
    if (choices.error || !choices.data) {
      return null;
    }
    return groupQuestions(data, choices.data);
  } catch {
    return null;
  }
}
