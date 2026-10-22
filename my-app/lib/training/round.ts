import { questions, type TrainingQuestion } from "@/lib/training/questions";
import { generateTrainingQuestions } from "@/lib/training/dynamic-questions";
import { verbConjugations, type VerbRecord } from "@/lib/training/verb-conjugations";

export const ROUND_SIZE = 5;
export const CORRECT_EXPERIENCE = 10;

export type RoundQuestion = {
  id: string;
  sentence: string;
  choices: string[][];
  correct: number;
  verb?: VerbRecord; // Optional verb info for conjugation view
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
  source: readonly TrainingQuestion[] | null = null,
  random: () => number = Math.random,
): RoundQuestion[] {
  // Use dynamic questions if no source provided
  let questionsToUse: readonly TrainingQuestion[];
  let isDynamic = false;
  
  if (source === null) {
    // Try to generate dynamic questions
    const dynamicQuestions = generateTrainingQuestions(ROUND_SIZE);
    
    // Fallback to hard-coded questions if generation fails
    questionsToUse = dynamicQuestions.length > 0 ? dynamicQuestions : questions;
    isDynamic = dynamicQuestions.length > 0;
  } else {
    questionsToUse = source;
  }
  
  // If we have fewer questions than needed, use what we have
  const questionCount = Math.min(ROUND_SIZE, questionsToUse.length);
  
  return shuffle(questionsToUse, random)
    .slice(0, questionCount)
    .map((item) => {
      const order = shuffle([0, 1, 2], random);
      
      // Extract verb info for dynamic questions
      let verb: VerbRecord | undefined;
      if (isDynamic && item.id.startsWith("dynamic-")) {
        const infinitive = item.id.split("-")[1];
        verb = verbConjugations.find((v) => v.infinitive === infinitive);
      }

      return {
        id: item.id,
        sentence: item.sentence,
        choices: order.map((index) => item.choices[index]),
        correct: order.indexOf(0),
        verb,
      };
    });
}
