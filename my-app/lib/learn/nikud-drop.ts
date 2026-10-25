import { nikudCue, nikudCycle, type SpeechCue } from "@/lib/alephbet/intro-alphabet";
import { letterCatalog, type LetterFact } from "@/lib/alephbet/letter-info";

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

const answerOrder: readonly NikudId[] = [
  "kamatz",
  "patach",
  "tsere",
  "segol",
  "shva",
  "hiriq",
  "kubutz",
  "shuruk",
  "holam",
  "holamVav",
];

const soundOrder = ["ah", "eh", "none", "ee", "oo", "oh"] as const;

const marksBySound: Record<(typeof soundOrder)[number], readonly NikudId[]> = {
  ah: ["kamatz", "patach"],
  eh: ["tsere", "segol"],
  none: ["shva"],
  ee: ["hiriq"],
  oo: ["kubutz", "shuruk"],
  oh: ["holam", "holamVav"],
};

export const nikudPracticeLetters: Record<1 | 2 | 3, readonly string[]> = {
  1: ["aleph", "bet", "gimel"],
  2: ["aleph", "bet", "gimel", "dalet", "he"],
  3: ["aleph", "bet", "gimel", "dalet", "he", "vav", "zayin"],
};

function choiceIds(answer: NikudId, index: number): [NikudId, NikudId, NikudId] {
  const sound = vowelSound[answer];
  const others = soundOrder.filter((item) => item !== sound);
  const first = others[index % others.length];
  const second = others[(index + 1) % others.length];
  if (!first || !second) {
    throw new Error(`Nikud trial for ${answer} has no distractors`);
  }
  const leftMarks = marksBySound[first];
  const rightMarks = marksBySound[second];
  const left = leftMarks[index % leftMarks.length];
  const right = rightMarks[(index + 1) % rightMarks.length];
  if (!left || !right) {
    throw new Error(`Nikud trial for ${answer} is missing a choice`);
  }
  return [answer, left, right];
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

export function nikudDropRounds(letterIds: readonly string[]): NikudDropRound[] {
  const letters = new Map(letterCatalog.map((letter) => [letter.id, letter]));

  return answerOrder.map((answer, index) => {
    const letterId = letterIds[index % letterIds.length];
    const letter = letters.get(letterId);
    if (!letter) {
      throw new Error(`Missing letter ${letterId}`);
    }

    const options = choiceIds(answer, index);
    const sounds = new Set(options.map((id) => vowelSound[id]));
    if (sounds.size !== options.length || !options.includes(answer)) {
      throw new Error(`Nikud trial for ${letterId} repeats a vowel sound`);
    }

    return {
      id: `${letter.id}-${answer}`,
      letter,
      prompt: nikudCue(letter, answer),
      answerId: answer,
      options: mixOptions(options, `${letter.id}-${answer}`).map((id) => {
        const nikud = nikudById(id);
        return { id: nikud.id, nameKey: nikud.label, mark: nikud.mark, tail: nikud.tail };
      }),
    };
  });
}
