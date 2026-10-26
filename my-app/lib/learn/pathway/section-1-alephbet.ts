import { letterById } from "@/lib/alephbet/letter-lookup";
import { nikudDropRounds } from "@/lib/learn/nikud-drop";
import { seededOrder } from "@/lib/learn/pathway/order";
import {
  gloss,
  type ExamQuestion,
  type ExerciseStep,
  type Gloss,
  type PathwayLevel,
  type PathwaySection,
  type SpokenItem,
} from "@/lib/learn/pathway/types";

const letterGroups: readonly { index: number; ids: readonly string[] }[] = [
  { index: 0, ids: ["aleph", "bet", "gimel"] },
  { index: 1, ids: ["dalet", "he"] },
  { index: 2, ids: ["vav", "zayin"] },
  { index: 3, ids: ["chet", "tet"] },
  { index: 4, ids: ["yod", "kaf"] },
  { index: 5, ids: ["lamed", "mem"] },
  { index: 6, ids: ["nun", "samekh"] },
  { index: 7, ids: ["ayin", "pe"] },
  { index: 8, ids: ["tsadi", "kuf"] },
  { index: 9, ids: ["reish", "shin"] },
  { index: 10, ids: ["tav"] },
  { index: 11, ids: ["kafSofit", "tsadiSofit", "nunSofit", "memSofit", "peSofit"] },
];

const titles: readonly Gloss[] = [
  gloss("Aleph, bet, and gimel", "Alef, bet et guimel", "Álef, bet y guímel"),
  gloss("Dalet and he", "Dalet et hé", "Dálet y he"),
  gloss("Vav and zayin", "Vav et zaïn", "Vav y záyin"),
  gloss("Chet and tet", "Het et tet", "Jet y tet"),
  gloss("Yod and kaf", "Yod et kaf", "Yod y kaf"),
  gloss("Lamed and mem", "Lamed et mem", "Lámed y mem"),
  gloss("Nun and samekh", "Noun et samekh", "Nun y sámej"),
  gloss("Ayin and pe", "Aïn et pé", "Áyin y pe"),
  gloss("Tsadi and kuf", "Tsadi et kouf", "Tsadi y kuf"),
  gloss("Reish and shin", "Reich et shin", "Reish y shin"),
  gloss("Tav", "Tav", "Tav"),
  gloss("Final letters", "Lettres finales", "Letras finales"),
];

const about = gloss(
  "Hear these letters, match a vowel, then say the letter names if you want.",
  "Écoute ces lettres, place une voyelle, puis dis leurs noms si tu veux.",
  "Escucha estas letras, coloca una vocal y, si quieres, di sus nombres.",
);

const sofitAbout = gloss(
  "Five letters change shape at the end of a word.",
  "Cinq lettres changent de forme à la fin d'un mot.",
  "Cinco letras cambian de forma al final de una palabra.",
);

const introBody = gloss(
  "A Hebrew letter is a consonant. You will hear it, then drag the vowel mark that matches the sound.",
  "Une lettre hébraïque est une consonne. Tu vas l'entendre, puis faire glisser la voyelle qui correspond au son.",
  "Una letra hebrea es una consonante. La oirás y luego arrastrarás la vocal que coincide con el sonido.",
);

const sofitBody = gloss(
  "Kaf, tsadi, nun, mem, and pe take a final form at the end of a word: ך ץ ן ם ף.",
  "Kaf, tsadi, noun, mem et pé prennent une forme finale en fin de mot : ך ץ ן ם ף.",
  "Kaf, tsadi, nun, mem y pe toman una forma final al final de la palabra: ך ץ ן ם ף.",
);

function letterItem(id: string, listen = false): SpokenItem {
  const letter = letterById.get(id);
  if (!letter) {
    throw new Error(`Missing letter ${id}`);
  }
  return {
    id: listen ? `letter-${id}-say` : `letter-${id}`,
    hebrew: letter.letter,
    say: letter.spoken,
    gloss: { en: letter.name, fr: letter.name, es: letter.name },
    letterId: listen || letter.kind !== "letter" ? undefined : id,
  };
}

function levelFor(group: { index: number; ids: readonly string[] }, learned: readonly string[]): PathwayLevel {
  const title = titles[group.index] ?? about;
  const final = group.index === 11;
  const recognize = group.ids.map((id) => {
    const others = seededOrder(
      learned.filter((item) => item !== id),
      id,
    ).slice(0, 2);
    const choices = seededOrder([id, ...others], `${id}-choices`).map((choice) => letterItem(choice));
    return { prompt: letterItem(id), choices };
  });

  return {
    id: `s1-l${group.index}`,
    sectionId: "s1",
    index: group.index,
    title,
    about: final ? sofitAbout : about,
    mark: group.ids.map((id) => letterById.get(id)?.letter ?? "").join(" "),
    knownWordIds: [],
    intros: [
      {
        title,
        body: final ? sofitBody : introBody,
        samples: group.ids.map((id) => {
          const item = letterItem(id);
          return { hebrew: item.hebrew, gloss: item.gloss, letterId: id, say: item.say };
        }),
      },
    ],
    exercises: [
      { type: "draw-letter", letterIds: group.ids },
      { type: "nikud-drop", letterIds: group.ids },
      { type: "recognize-sound", items: recognize },
      { type: "listen-repeat", optional: true, items: group.ids.map((id) => letterItem(id, true)) },
    ],
  };
}

const levels: PathwayLevel[] = [];
const learned: string[] = [];
for (const group of letterGroups) {
  learned.push(...group.ids);
  levels.push(levelFor(group, learned));
}

export const section1: PathwaySection = {
  id: "s1",
  index: 1,
  title: gloss("Welcome to Hebrew", "Bienvenue en hébreu", "Bienvenida al hebreo"),
  about: gloss("The Aleph-Bet", "L'aleph-bet", "El álef-bet"),
  levels,
  exam: {
    questions: 20,
    lives: 3,
    types: ["draw-letter", "nikud-drop", "recognize-sound", "listen-repeat"],
  },
};

export function questionsFromStep(step: ExerciseStep): ExamQuestion[] {
  if (step.type === "nikud-drop") {
    const round = nikudDropRounds(step.letterIds)[0];
    return round ? [{ type: "nikud-drop", round }] : [];
  }
  if (step.type === "recognize-sound") {
    return step.items.map((item) => ({ type: "recognize-sound", item }));
  }
  if (step.type === "listen-repeat") {
    return step.items.map((item) => ({ type: "listen-repeat", item }));
  }
  if (step.type === "spell") {
    return step.items.map((item) => ({ type: "spell", item }));
  }
  if (step.type === "compose-gap") {
    return step.items.map((item) => ({ type: "compose-gap", item }));
  }
  if (step.type === "conjugate") {
    return step.items.map((item) => ({ type: "conjugate", item }));
  }
  if (step.type === "read") {
    return step.items.map((item) => ({ type: "read", item }));
  }
  if (step.type === "write") {
    return step.items.map((item) => ({ type: "write", item }));
  }
  if (step.type === "draw-letter") {
    return step.letterIds.map((letterId) => ({ type: "draw-letter", letterId }));
  }
  if (step.type === "picture-word") {
    return step.items.map((item) => ({ type: "picture-word", item }));
  }
  return step.items.map((item) => ({ type: "comprehend", item }));
}
