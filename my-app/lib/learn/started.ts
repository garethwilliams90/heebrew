const STARTED_KEY = "webrew.learning-started";

export function markLearningStarted() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STARTED_KEY, "1");
}

export function hasLearningStarted() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(STARTED_KEY) === "1";
}
