export type QuizChoice = { text: string; correct: boolean };
export type QuizQuestion = { prompt: string; choices: QuizChoice[] };

const PROMPT_MAX = 400;
const CHOICE_MAX = 200;
const QUESTION_MAX = 20;
const CHOICE_MIN = 2;
const CHOICE_MAX_COUNT = 6;

function clean(value: unknown, max: number) {
  if (typeof value !== "string") {
    return "";
  }
  const text = value.trim();
  if (!text || text.length > max || text.includes("\0")) {
    return "";
  }
  return text;
}

export function parseQuiz(input: unknown): QuizQuestion[] | null {
  if (!Array.isArray(input) || input.length > QUESTION_MAX) {
    return null;
  }
  const questions: QuizQuestion[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") {
      return null;
    }
    const prompt = clean((item as { prompt?: unknown }).prompt, PROMPT_MAX);
    const rawChoices = (item as { choices?: unknown }).choices;
    if (!prompt || !Array.isArray(rawChoices) || rawChoices.length < CHOICE_MIN || rawChoices.length > CHOICE_MAX_COUNT) {
      return null;
    }
    const choices: QuizChoice[] = [];
    for (const choice of rawChoices) {
      if (!choice || typeof choice !== "object") {
        return null;
      }
      const text = clean((choice as { text?: unknown }).text, CHOICE_MAX);
      if (!text) {
        return null;
      }
      choices.push({ text, correct: (choice as { correct?: unknown }).correct === true });
    }
    if (choices.filter((choice) => choice.correct).length !== 1) {
      return null;
    }
    questions.push({ prompt, choices });
  }
  return questions;
}
