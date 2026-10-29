// Ids and order for the path and progress gates. Lesson exercises stay in the
// section files so the home page and nav do not download them.

export const INTRO_LEVEL_ID = "s0-intro";

export type PathwayShapeLevel = {
  id: string;
  index: number;
};

export type PathwayShape = {
  id: string;
  index: number;
  hasExam: boolean;
  levels: readonly PathwayShapeLevel[];
};

const alephLevels: PathwayShapeLevel[] = Array.from({ length: 12 }, (_, index) => ({
  id: `s1-l${index}`,
  index,
}));

export const pathwayShape: readonly PathwayShape[] = [
  { id: "s0", index: 0, hasExam: false, levels: [{ id: INTRO_LEVEL_ID, index: 0 }] },
  { id: "s1", index: 1, hasExam: true, levels: alephLevels },
  {
    id: "s2",
    index: 2,
    hasExam: true,
    levels: [
      { id: "s2-l0", index: 0 },
      { id: "s2-l1", index: 1 },
      { id: "s2-l2", index: 2 },
      { id: "s2-l3", index: 3 },
      { id: "s2-l4", index: 4 },
    ],
  },
  {
    id: "s3",
    index: 3,
    hasExam: true,
    levels: [
      { id: "s3-l0", index: 0 },
      { id: "s3-l1", index: 1 },
      { id: "s3-l2", index: 2 },
    ],
  },
];

export function nextStop(sectionId: string, levelId: string) {
  const section = pathwayShape.find((item) => item.id === sectionId);
  if (!section) {
    return "/";
  }
  const index = section.levels.findIndex((item) => item.id === levelId);
  const next = section.levels[index + 1];
  if (next) {
    return `/learn?section=${section.id}&level=${next.id}`;
  }
  if (section.hasExam) {
    return `/learn?section=${section.id}&exam=1`;
  }
  const following = pathwayShape.find((item) => item.index === section.index + 1);
  const first = following?.levels[0];
  if (following && first) {
    return `/learn?section=${following.id}&level=${first.id}`;
  }
  return "/";
}
