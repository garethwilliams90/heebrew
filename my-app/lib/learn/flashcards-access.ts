import { placeExperience } from "@/lib/flashcards/experience";

const UNLOCKED_KEY = "webrew.flashcards-unlocked";

export function markFlashcardsUnlocked() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(UNLOCKED_KEY, "1");
  window.dispatchEvent(new Event("webrew-experience"));
}

export function flashcardsUnlocked(experience: number) {
  if (placeExperience(experience).level >= 3) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(UNLOCKED_KEY) === "1";
}
