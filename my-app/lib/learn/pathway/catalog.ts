import { questionsFromStep } from "@/lib/learn/pathway/section-1-alephbet";
import { section0 } from "@/lib/learn/pathway/section-0-intro";
import { section1 } from "@/lib/learn/pathway/section-1-alephbet";
import { section2 } from "@/lib/learn/pathway/section-2-fundamentals";
import { section3 } from "@/lib/learn/pathway/section-3-existential";
import { seededOrder } from "@/lib/learn/pathway/order";
import { pathwayShape } from "@/lib/learn/pathway/shape";
import type {
  ExamQuestion,
  ExerciseType,
  PathwayLevel,
  PathwaySection,
  PathwaySectionOutline,
} from "@/lib/learn/pathway/types";

export { nextStop } from "@/lib/learn/pathway/shape";

export const pathwaySections: readonly PathwaySection[] = [section0, section1, section2, section3];

const shapeFromSections = pathwaySections.map((section) => ({
  id: section.id,
  index: section.index,
  hasExam: Boolean(section.exam),
  levels: section.levels.map((level) => ({ id: level.id, index: level.index })),
}));

if (JSON.stringify(shapeFromSections) !== JSON.stringify(pathwayShape)) {
  throw new Error(
    `Pathway shape is out of date. Update lib/learn/pathway/shape.ts.\nSections: ${JSON.stringify(shapeFromSections)}\nShape: ${JSON.stringify(pathwayShape)}`,
  );
}

export function pathwayOutline(): readonly PathwaySectionOutline[] {
  return pathwaySections.map((section) => ({
    id: section.id,
    index: section.index,
    title: section.title,
    about: section.about,
    hasExam: Boolean(section.exam),
    levels: section.levels.map((level) => ({
      id: level.id,
      index: level.index,
      title: level.title,
      about: level.about,
      badge: level.badge,
    })),
  }));
}

export function sectionById(id: string) {
  return pathwaySections.find((section) => section.id === id) ?? null;
}

export function levelById(id: string) {
  for (const section of pathwaySections) {
    const level = section.levels.find((item) => item.id === id);
    if (level) {
      return level;
    }
  }
  return null;
}

export function sectionOfLevel(level: PathwayLevel) {
  return sectionById(level.sectionId);
}

export function examQuestions(
  section: PathwaySection,
  count: number,
  seed: string,
  options?: { microphone?: boolean },
): ExamQuestion[] {
  if (!section.exam) {
    return [];
  }
  const allowed = new Set<ExerciseType>(section.exam.types);
  if (options?.microphone === false) {
    allowed.delete("listen-repeat");
  }
  const buckets = new Map<ExerciseType, ExamQuestion[]>();
  for (const level of section.levels) {
    for (const step of level.exercises) {
      if (!allowed.has(step.type)) {
        continue;
      }
      const bucket = buckets.get(step.type) ?? [];
      bucket.push(...questionsFromStep(step));
      buckets.set(step.type, bucket);
    }
  }

  const queues = [...buckets.values()].map((bucket, index) => seededOrder(bucket, `${seed}-${index}`));
  const picked: ExamQuestion[] = [];
  let cursor = 0;
  while (picked.length < count && queues.some((queue) => queue.length > 0)) {
    const queue = queues[cursor % queues.length];
    const next = queue?.shift();
    if (next) {
      picked.push(next);
    }
    cursor += 1;
  }
  return seededOrder(picked, seed);
}
