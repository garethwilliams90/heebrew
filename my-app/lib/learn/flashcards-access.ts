import { completeCurriculumLevel, curriculumLevel } from "@/lib/learn/curriculum";

const UNLOCKED_KEY = "webrew.flashcards-unlocked";

export function markFlashcardsUnlocked() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(UNLOCKED_KEY, "1");
  completeCurriculumLevel(2);
}

export function flashcardsUnlocked() {
  return curriculumLevel() >= 3;
}
