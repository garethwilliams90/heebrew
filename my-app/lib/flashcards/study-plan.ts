import {
  freshMemory,
  isDue,
  type CardMemory,
} from "@/lib/flashcards/schedule";

export const studyModes = ["new", "review", "mix", "trial"] as const;

export type StudyMode = (typeof studyModes)[number];

export const DEFAULT_STUDY_COUNT = 10;
export const MAX_STUDY_COUNT = 20;
export const TRIAL_SECONDS = 30;

export type PlannedCard<T extends { id: string }> = T & {
  memory: CardMemory;
  repeats: number;
};

type Ranked<T> = {
  card: T;
  order: number;
  memory: CardMemory;
};

export function parseStudyMode(value: string | undefined): StudyMode {
  return studyModes.includes(value as StudyMode) ? (value as StudyMode) : "mix";
}

export function parseStudyCount(value: string | undefined) {
  const count = Number(value);
  if (!Number.isInteger(count)) {
    return DEFAULT_STUDY_COUNT;
  }

  return Math.min(MAX_STUDY_COUNT, Math.max(1, count));
}

export function countPools<T extends { id: string }>(
  cards: T[],
  memories: Record<string, CardMemory>,
) {
  let fresh = 0;
  let current = 0;

  for (const card of cards) {
    if ((memories[card.id] ?? freshMemory()).phase === "new") {
      fresh += 1;
    } else {
      current += 1;
    }
  }

  return { fresh, current };
}

export function buildPlannedSession<T extends { id: string }>(
  cards: T[],
  memories: Record<string, CardMemory>,
  mode: StudyMode,
  count: number,
  now = new Date(),
): PlannedCard<T>[] {
  const ranked = cards.map((card, order) => ({
    card,
    order,
    memory: memories[card.id] ?? freshMemory(),
  }));
  const fresh = ranked.filter((item) => item.memory.phase === "new");
  const current = ranked.filter((item) => item.memory.phase !== "new");
  const limit = Math.min(MAX_STUDY_COUNT, Math.max(1, Math.round(count)));

  if (mode === "new") {
    return stamp(fresh.slice(0, limit));
  }

  if (mode === "review") {
    return stamp(orderCurrent(current, now).slice(0, limit));
  }

  if (mode === "trial") {
    return stamp(shuffle(trialPool(fresh, current, now)));
  }

  return stamp(mixSession(fresh, current, limit, now));
}

function orderCurrent<T>(current: Ranked<T>[], now: Date) {
  const due = current.filter((item) => isDue(item.memory, now)).sort(byDue);
  const later = current.filter((item) => !isDue(item.memory, now)).sort(byDue);
  return [...due, ...later];
}

function byDue<T>(a: Ranked<T>, b: Ranked<T>) {
  const aDue = a.memory.dueAt ? new Date(a.memory.dueAt).getTime() : Number.POSITIVE_INFINITY;
  const bDue = b.memory.dueAt ? new Date(b.memory.dueAt).getTime() : Number.POSITIVE_INFINITY;
  const aTime = Number.isNaN(aDue) ? Number.POSITIVE_INFINITY : aDue;
  const bTime = Number.isNaN(bDue) ? Number.POSITIVE_INFINITY : bDue;
  return aTime - bTime || a.order - b.order;
}

function mixSession<T>(fresh: Ranked<T>[], current: Ranked<T>[], count: number, now: Date) {
  const currentOrdered = orderCurrent(current, now);
  const half = Math.ceil(count / 2);
  let currentCount = Math.min(currentOrdered.length, half);
  let freshCount = Math.min(fresh.length, count - currentCount);

  if (currentCount + freshCount < count) {
    currentCount = Math.min(currentOrdered.length, count - freshCount);
  }

  const chosenCurrent = currentOrdered.slice(0, currentCount);
  const chosenFresh = fresh.slice(0, freshCount);
  const mixed: Ranked<T>[] = [];
  const longer = Math.max(chosenCurrent.length, chosenFresh.length);

  for (let index = 0; index < longer; index += 1) {
    if (chosenCurrent[index]) {
      mixed.push(chosenCurrent[index]);
    }
    if (chosenFresh[index]) {
      mixed.push(chosenFresh[index]);
    }
  }

  return mixed;
}

// A time trial is the cards already in progress, plus 5–10% new cards.
// A tiny deck still gets one new card when any exist, so the mix is visible.
function trialPool<T>(fresh: Ranked<T>[], current: Ranked<T>[], now: Date) {
  const currentOrdered = orderCurrent(current, now);

  if (currentOrdered.length === 0) {
    return fresh;
  }

  if (fresh.length === 0) {
    return currentOrdered;
  }

  const ratio = 0.05 + Math.random() * 0.05;
  const wanted = Math.min(fresh.length, Math.max(1, Math.round(currentOrdered.length * ratio)));
  return [...currentOrdered, ...shuffle(fresh).slice(0, wanted)];
}

function stamp<T extends { id: string }>(items: Ranked<T>[]): PlannedCard<T>[] {
  return items.map(({ card, memory }) => ({ ...card, memory, repeats: 0 }));
}

function shuffle<T>(items: T[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swap];
    next[swap] = current;
  }

  return next;
}
