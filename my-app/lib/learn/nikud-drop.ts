import { alphabetLetters, nikudCue, nikudCycle, type SpeechCue } from "@/lib/alephbet/intro-alphabet";
import type { LetterFact } from "@/lib/alephbet/letter-info";

type NikudId = (typeof nikudCycle)[number]["id"];

export type NikudSlot = "top" | "bottom";

export function nikudSlot(id: string): NikudSlot {
  return id === "holam" ? "top" : "bottom";
}

// Pairs that share a sound must never appear in the same question.
const vowelSound: Record<NikudId, string> = {
  kamatz: "ah",
  patach: "ah",
  tsere: "eh",
  segol: "eh",
  shva: "none",
  hiriq: "ee",
  kubutz: "oo",
  shuruk: "oo",
  holam: "oh",
  holamVav: "oh",
};

type Trial = {
  letterId: string;
  answer: NikudId;
  options: readonly [NikudId, NikudId, NikudId];
};

const trials: readonly Trial[] = [
  { letterId: "dalet", answer: "patach", options: ["patach", "tsere", "hiriq"] },
  { letterId: "bet", answer: "kamatz", options: ["kamatz", "segol", "holam"] },
  { letterId: "gimel", answer: "tsere", options: ["tsere", "patach", "kubutz"] },
  { letterId: "lamed", answer: "segol", options: ["segol", "shva", "holamVav"] },
  { letterId: "mem", answer: "shva", options: ["shva", "kamatz", "hiriq"] },
  { letterId: "nun", answer: "hiriq", options: ["hiriq", "patach", "shuruk"] },
  { letterId: "reish", answer: "kubutz", options: ["kubutz", "segol", "holam"] },
  { letterId: "shin", answer: "shuruk", options: ["shuruk", "tsere", "kamatz"] },
  { letterId: "tav", answer: "holam", options: ["holam", "patach", "hiriq"] },
  { letterId: "kaf", answer: "holamVav", options: ["holamVav", "shva", "segol"] },
];

for (const trial of trials) {
  const sounds = new Set(trial.options.map((id) => vowelSound[id]));
  if (sounds.size !== trial.options.length || !trial.options.includes(trial.answer)) {
    throw new Error(`Nikud trial for ${trial.letterId} repeats a vowel sound`);
  }
}

export type NikudDropOption = {
  id: NikudId;
  nameKey: (typeof nikudCycle)[number]["label"];
  mark: string;
  tail: string;
};

export type NikudDropRound = {
  id: string;
  letter: LetterFact;
  prompt: SpeechCue;
  answerId: NikudId;
  options: NikudDropOption[];
};

// Stable order so the server and the browser render the same choices.
function mixOptions<T>(items: readonly T[], seedText: string): T[] {
  const next = [...items];
  let state = seedFrom(seedText);

  for (let index = next.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = state % (index + 1);
    const current = next[index];
    next[index] = next[swap];
    next[swap] = current;
  }

  return next;
}

function seedFrom(value: string) {
  let seed = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    seed = Math.imul(seed ^ value.charCodeAt(index), 16777619);
  }
  return seed >>> 0;
}

function nikudById(id: NikudId) {
  const nikud = nikudCycle.find((item) => item.id === id);
  if (!nikud) {
    throw new Error(`Missing nikud ${id}`);
  }
  return nikud;
}

export function nikudDropRounds(): NikudDropRound[] {
  const letters = new Map(alphabetLetters().map((letter) => [letter.id, letter]));

  return trials.map((trial) => {
    const letter = letters.get(trial.letterId);
    if (!letter) {
      throw new Error(`Missing letter ${trial.letterId}`);
    }

    return {
      id: `${letter.id}-${trial.answer}`,
      letter,
      prompt: nikudCue(letter, trial.answer),
      answerId: trial.answer,
      options: mixOptions(trial.options, `${letter.id}-${trial.answer}`).map((id) => {
        const nikud = nikudById(id);
        return { id: nikud.id, nameKey: nikud.label, mark: nikud.mark, tail: nikud.tail };
      }),
    };
  });
}
