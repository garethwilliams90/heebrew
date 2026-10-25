import { levelById, pathwaySections, sectionById } from "@/lib/learn/pathway/catalog";

const KEY = "webrew.pathway";

export const PATHWAY_EVENT = "webrew-pathway";

const DAY_MS = 24 * 60 * 60 * 1000;

export type PathwayProgress = {
  completed: string[];
  exams: string[];
  lastStudiedAt: number | null;
  lastSectionId: string | null;
};

const emptyProgress: PathwayProgress = {
  completed: [],
  exams: [],
  lastStudiedAt: null,
  lastSectionId: null,
};

function asStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function readProgress(): PathwayProgress {
  if (typeof window === "undefined") {
    return emptyProgress;
  }
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "");
    if (!parsed || typeof parsed !== "object") {
      return emptyProgress;
    }
    const row = parsed as Record<string, unknown>;
    return {
      completed: asStringList(row.completed),
      exams: asStringList(row.exams),
      lastStudiedAt: typeof row.lastStudiedAt === "number" ? row.lastStudiedAt : null,
      lastSectionId: typeof row.lastSectionId === "string" ? row.lastSectionId : null,
    };
  } catch {
    return emptyProgress;
  }
}

function writeProgress(progress: PathwayProgress) {
  window.localStorage.setItem(KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(PATHWAY_EVENT));
}

export function sectionIsOpen(index: number, progress = readProgress()) {
  if (index <= 1) {
    return true;
  }
  const previous = pathwaySections.find((section) => section.index === index - 1);
  return previous ? progress.exams.includes(previous.id) : false;
}

export function levelIsOpen(levelId: string, progress = readProgress()) {
  const level = levelById(levelId);
  const section = level ? sectionById(level.sectionId) : null;
  if (!level || !section || !sectionIsOpen(section.index, progress)) {
    return false;
  }
  const index = section.levels.findIndex((item) => item.id === levelId);
  if (index <= 0) {
    return index === 0;
  }
  const previous = section.levels[index - 1];
  return previous ? progress.completed.includes(previous.id) : false;
}

export function completeLevel(levelId: string) {
  const progress = readProgress();
  const level = levelById(levelId);
  writeProgress({
    ...progress,
    completed: progress.completed.includes(levelId) ? progress.completed : [...progress.completed, levelId],
    lastStudiedAt: Date.now(),
    lastSectionId: level?.sectionId ?? progress.lastSectionId,
  });
}

export function passExam(sectionId: string) {
  const progress = readProgress();
  writeProgress({
    ...progress,
    exams: progress.exams.includes(sectionId) ? progress.exams : [...progress.exams, sectionId],
    lastStudiedAt: Date.now(),
    lastSectionId: sectionId,
  });
}

export function touchStudy(sectionId: string) {
  const progress = readProgress();
  writeProgress({ ...progress, lastStudiedAt: Date.now(), lastSectionId: sectionId });
}

export function needsReview(progress = readProgress()) {
  if (!progress.lastStudiedAt || !progress.lastSectionId) {
    return false;
  }
  return Date.now() - progress.lastStudiedAt > DAY_MS;
}

export function openSectionIndex(progress = readProgress()) {
  let open = 1;
  for (const section of pathwaySections) {
    if (sectionIsOpen(section.index, progress)) {
      open = section.index;
    }
  }
  return open;
}

export function devSetPlace(sectionIndex: number, levelIndex: number) {
  const section = pathwaySections.find((item) => item.index === Math.max(1, Math.floor(sectionIndex))) ?? pathwaySections[0];
  const level = section?.levels.find((item) => item.index === Math.max(0, Math.floor(levelIndex))) ?? section?.levels[0];
  const exams = pathwaySections.filter((item) => section && item.index < section.index).map((item) => item.id);
  const completed: string[] = [];
  for (const item of pathwaySections) {
    if (!section || item.index > section.index) {
      continue;
    }
    for (const entry of item.levels) {
      if (item.index < section.index || (level && entry.index < level.index)) {
        completed.push(entry.id);
      }
    }
  }
  writeProgress({
    completed,
    exams,
    lastStudiedAt: Date.now(),
    lastSectionId: section?.id ?? null,
  });
  return { sectionId: section?.id ?? "s1", levelId: level?.id ?? "s1-l0" };
}

export function devSkipAll() {
  const last = pathwaySections.at(-1);
  writeProgress({
    completed: pathwaySections.flatMap((section) => section.levels.map((level) => level.id)),
    exams: pathwaySections.map((section) => section.id),
    lastStudiedAt: Date.now(),
    lastSectionId: last?.id ?? null,
  });
}
