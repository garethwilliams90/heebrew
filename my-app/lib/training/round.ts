import { questions, type TrainingQuestion } from "@/lib/training/questions";

export const ROUND_SIZE = 5;
export const CORRECT_EXPERIENCE = 10;

export type RoundQuestion = {
  id: string;
  sentence: string;
  choices: string[][];
  correct: number;
};

function shuffle<T>(items: readonly T[], random: () => number) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }

  return copy;
}

export function buildTrainingRound(
  source: readonly TrainingQuestion[] = questions,
  random: () => number = Math.random,
): RoundQuestion[] {
  return shuffle(source, random)
    .slice(0, ROUND_SIZE)
    .map((item) => {
      const order = shuffle([0, 1, 2], random);

      return {
        id: item.id,
        sentence: item.sentence,
        choices: order.map((index) => item.choices[index]),
        correct: order.indexOf(0),
      };
    });
}
