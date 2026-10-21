import { curriculumLevel } from "@/lib/learn/curriculum";

const UNLOCKED_KEY = "webrew.flashcards-unlocked";

export function flashcardsUnlocked() {
  if (typeof window !== "undefined" && window.localStorage.getItem(UNLOCKED_KEY) === "1") {
    return true;
  }
  return curriculumLevel() >= 5;
}
