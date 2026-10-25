import { questionsFromStep } from "@/lib/learn/pathway/section-1-alephbet";
import { section1 } from "@/lib/learn/pathway/section-1-alephbet";
import { section2 } from "@/lib/learn/pathway/section-2-fundamentals";
import { section3 } from "@/lib/learn/pathway/section-3-existential";
import { seededOrder } from "@/lib/learn/pathway/order";
import type { ExamQuestion, ExerciseType, PathwayLevel, PathwaySection } from "@/lib/learn/pathway/types";

export const pathwaySections: readonly PathwaySection[] = [section1, section2, section3];

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
