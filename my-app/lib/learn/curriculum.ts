const LEVEL_KEY = "webrew.curriculum-level";
const LEGACY_UNLOCK = "webrew.flashcards-unlocked";

export function curriculumLevel() {
  if (typeof window === "undefined") {
    return 1;
  }

  const stored = Number(window.localStorage.getItem(LEVEL_KEY));
  if (Number.isFinite(stored) && stored >= 1) {
    return Math.floor(stored);
  }
  if (window.localStorage.getItem(LEGACY_UNLOCK) === "1") {
    return 3;
  }
  return 1;
}

export function setCurriculumLevel(level: number) {
  if (typeof window === "undefined") {
    return;
  }

  const next = Math.max(1, Math.floor(level));
  window.localStorage.setItem(LEVEL_KEY, String(next));
  window.dispatchEvent(new Event("webrew-curriculum"));
}

export function completeCurriculumLevel(finished: number) {
  setCurriculumLevel(Math.max(curriculumLevel(), finished + 1));
}

export function stageLevel(id: string) {
  const major = Number(id.split(".")[0]);
  return Number.isFinite(major) && major > 0 ? major : 1;
}
