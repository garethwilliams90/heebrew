import { nikudCycle } from "@/lib/alephbet/intro-alphabet";
import { gloss, type PathwaySection } from "@/lib/learn/pathway/types";

const title = gloss("Meet the nikud", "Rencontrer les nikud", "Conoce los nikud");

const about = gloss(
  "Hear each vowel mark on the letter bet.",
  "Écoute chaque voyelle sur la lettre bet.",
  "Escucha cada vocal en la letra bet.",
);

const body = gloss(
  "This mark changes the sound of bet.",
  "Ce signe change le son de bet.",
  "Este signo cambia el sonido de bet.",
);

export const INTRO_LEVEL_ID = "s0-intro";

export const section0: PathwaySection = {
  id: "s0",
  index: 0,
  title: gloss("Introduction to vowels", "Introduction aux voyelles", "Introducción a las vocales"),
  about: gloss("Start here", "Commence ici", "Empieza aquí"),
  levels: [
    {
      id: INTRO_LEVEL_ID,
      sectionId: "s0",
      index: 0,
      title,
      about,
      mark: "ב",
      badge: "ב",
      knownWordIds: [],
      exercises: [],
      intros: [
        ...nikudCycle.map((nikud) => ({
          title,
          body,
          nikudId: nikud.id,
        })),
        { title, body, nikudOverview: true },
      ],
    },
  ],
};
