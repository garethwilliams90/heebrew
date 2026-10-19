// Anki's SM-2 scheduler for vocabulary cards. Letters keep the linear ladder.
// Learning steps are 1 minute, then 10 minutes, then a card graduates at 1 day.
// A remembered review multiplies the interval by ease (starting at 2.5).
// Missing a review drops ease by 20 points and sends the card through a short relearn.
// Six mastery stages are read off that schedule for the ring.

export type CardPhase = "new" | "learning" | "review" | "relearning" | "mastered";

export type FlashcardGrade = "dontKnow" | "know" | "mastered";

export type CardMemory = {
  ease: number;
  intervalMinutes: number;
  dueAt: string | null;
  reps: number;
  lapses: number;
  learningStep: number;
  phase: CardPhase;
  mastery: number;
};

const DAY_MINUTES = 24 * 60;
const LEARNING_STEPS = [1, 10];
const RELEARNING_STEPS = [10];
const GRADUATING_DAYS = 1;
const STARTING_EASE = 250;
const MIN_EASE = 130;
const MAX_EASE = 500;
const MAX_INTERVAL_DAYS = 365;
const MASTERED_DAYS = 120;
const AGAIN_EASE_DROP = 20;
const MASTERED_EASE_BUMP = 15;
const SOON_MINUTES = 10;

export function freshMemory(): CardMemory {
  return {
    ease: STARTING_EASE,
    intervalMinutes: 0,
    dueAt: null,
    reps: 0,
    lapses: 0,
    learningStep: 0,
    phase: "new",
    mastery: 0,
  };
}

export function isCardPhase(value: unknown): value is CardPhase {
  return (
    value === "new" ||
    value === "learning" ||
    value === "review" ||
    value === "relearning" ||
    value === "mastered"
  );
}

export function stageFromMemory(memory: CardMemory) {
  if (memory.phase === "mastered") {
    return 6;
  }

  if (memory.phase === "new") {
    return 0;
  }

  if (memory.phase === "learning" || memory.phase === "relearning") {
    return 1;
  }

  const days = memory.intervalMinutes / DAY_MINUTES;

  if (days >= 50) {
    return 6;
  }

  if (days >= 20) {
    return 5;
  }

  if (days >= 8) {
    return 4;
  }

  if (days >= 3) {
    return 3;
  }

  if (days >= 1) {
    return 2;
  }

  return 1;
}

function clampEase(ease: number) {
  if (!Number.isFinite(ease)) {
    return STARTING_EASE;
  }

  return Math.min(MAX_EASE, Math.max(MIN_EASE, Math.round(ease)));
}

export function normalizeMemory(input: {
  ease?: number;
  intervalMinutes?: number;
  dueAt?: string | null;
  reps?: number;
  lapses?: number;
  learningStep?: number;
  phase: CardPhase;
}): CardMemory {
  const memory: CardMemory = {
    ease: clampEase(input.ease ?? STARTING_EASE),
    intervalMinutes: Math.max(0, Math.round(input.intervalMinutes ?? 0)),
    dueAt: input.dueAt ?? null,
    reps: Math.max(0, Math.round(input.reps ?? 0)),
    lapses: Math.max(0, Math.round(input.lapses ?? 0)),
    learningStep: Math.max(0, Math.round(input.learningStep ?? 0)),
    phase: input.phase,
    mastery: 0,
  };
  memory.mastery = stageFromMemory(memory);
  return memory;
}

function addMinutes(now: Date, minutes: number) {
  return new Date(now.getTime() + minutes * 60_000).toISOString();
}

function withStage(memory: Omit<CardMemory, "mastery">): CardMemory {
  const next = { ...memory, mastery: 0 };
  next.mastery = stageFromMemory(next);
  return next;
}

function enterLearning(memory: CardMemory, step: number, now: Date): CardMemory {
  const minutes = LEARNING_STEPS[Math.min(step, LEARNING_STEPS.length - 1)];
  return withStage({
    ...memory,
    phase: "learning",
    learningStep: step,
    intervalMinutes: minutes,
    dueAt: addMinutes(now, minutes),
  });
}

function graduate(memory: CardMemory, now: Date): CardMemory {
  const minutes = GRADUATING_DAYS * DAY_MINUTES;
  return withStage({
    ...memory,
    phase: "review",
    learningStep: 0,
    reps: memory.reps + 1,
    intervalMinutes: minutes,
    dueAt: addMinutes(now, minutes),
  });
}

function reviewGood(memory: CardMemory, now: Date): CardMemory {
  const intervalDays = Math.max(1, Math.round(memory.intervalMinutes / DAY_MINUTES));
  const due = memory.dueAt ? new Date(memory.dueAt).getTime() : now.getTime();
  const lateDays = Math.max(0, Math.floor((now.getTime() - due) / (DAY_MINUTES * 60_000)));
  let nextDays = intervalDays + Math.floor(lateDays / 2);
  nextDays = Math.round(nextDays * (memory.ease / 100));
  nextDays = Math.max(nextDays, intervalDays + 1);
  nextDays = Math.min(nextDays, MAX_INTERVAL_DAYS);
  const mastered = nextDays >= 50;

  return withStage({
    ...memory,
    phase: mastered ? "mastered" : "review",
    learningStep: 0,
    reps: memory.reps + 1,
    intervalMinutes: nextDays * DAY_MINUTES,
    dueAt: addMinutes(now, nextDays * DAY_MINUTES),
  });
}

function again(memory: CardMemory, now: Date): CardMemory {
  if (memory.phase === "review" || memory.phase === "mastered") {
    const minutes = RELEARNING_STEPS[0];
    return withStage({
      ...memory,
      phase: "relearning",
      ease: clampEase(memory.ease - AGAIN_EASE_DROP),
      lapses: memory.lapses + 1,
      learningStep: 0,
      intervalMinutes: minutes,
      dueAt: addMinutes(now, minutes),
    });
  }

  return enterLearning(memory, 0, now);
}

function good(memory: CardMemory, now: Date): CardMemory {
  if (memory.phase === "new") {
    return enterLearning(memory, LEARNING_STEPS.length > 1 ? 1 : 0, now);
  }

  if (memory.phase === "learning") {
    const nextStep = memory.learningStep + 1;
    if (nextStep >= LEARNING_STEPS.length) {
      return graduate(memory, now);
    }

    return enterLearning(memory, nextStep, now);
  }

  if (memory.phase === "relearning") {
    const nextStep = memory.learningStep + 1;
    if (nextStep < RELEARNING_STEPS.length) {
      const minutes = RELEARNING_STEPS[nextStep];
      return withStage({
        ...memory,
        learningStep: nextStep,
        intervalMinutes: minutes,
        dueAt: addMinutes(now, minutes),
      });
    }

    return graduate(memory, now);
  }

  return reviewGood(memory, now);
}

function markMastered(memory: CardMemory, now: Date): CardMemory {
  const days = Math.max(MASTERED_DAYS, Math.round(memory.intervalMinutes / DAY_MINUTES));
  return withStage({
    ...memory,
    phase: "mastered",
    ease: clampEase(memory.ease + MASTERED_EASE_BUMP),
    learningStep: 0,
    reps: memory.reps + 1,
    intervalMinutes: days * DAY_MINUTES,
    dueAt: addMinutes(now, days * DAY_MINUTES),
  });
}

export function gradeMemory(memory: CardMemory, grade: FlashcardGrade, now = new Date()) {
  if (grade === "mastered") {
    return markMastered(memory, now);
  }

  if (grade === "dontKnow") {
    return again(memory, now);
  }

  return good(memory, now);
}

export function isDue(memory: CardMemory | undefined, now: Date, graceMinutes = 0) {
  if (!memory || memory.phase === "new") {
    return true;
  }

  if (!memory.dueAt) {
    return memory.phase === "learning" || memory.phase === "relearning";
  }

  const due = new Date(memory.dueAt).getTime();
  if (Number.isNaN(due)) {
    return true;
  }

  return due <= now.getTime() + graceMinutes * 60_000;
}

export function returnsSoon(memory: CardMemory, now: Date) {
  if (memory.phase !== "learning" && memory.phase !== "relearning") {
    return false;
  }

  if (!memory.dueAt) {
    return false;
  }

  const wait = new Date(memory.dueAt).getTime() - now.getTime();
  return wait <= SOON_MINUTES * 60_000;
}

export function memoryForStage(level: number, now = new Date()): CardMemory {
  const stage = Math.min(6, Math.max(0, Math.round(level)));

  if (stage <= 0) {
    return freshMemory();
  }

  if (stage === 1) {
    return normalizeMemory({
      phase: "learning",
      learningStep: 0,
      intervalMinutes: LEARNING_STEPS[0],
      dueAt: now.toISOString(),
    });
  }

  const days = stage === 2 ? 1 : stage === 3 ? 3 : stage === 4 ? 8 : stage === 5 ? 20 : MASTERED_DAYS;
  return normalizeMemory({
    phase: stage >= 6 ? "mastered" : "review",
    reps: Math.max(0, stage - 1),
    intervalMinutes: days * DAY_MINUTES,
    dueAt: addMinutes(now, days * DAY_MINUTES),
  });
}

export function buildDueSession<T extends { id: string }>(
  cards: T[],
  memories: Record<string, CardMemory>,
  now = new Date(),
  limit = 10,
) {
  const ranked = cards.map((card, order) => ({
    card,
    order,
    memory: memories[card.id] ?? freshMemory(),
  }));

  const learning = ranked.filter(
    (item) =>
      (item.memory.phase === "learning" || item.memory.phase === "relearning") &&
      isDue(item.memory, now, SOON_MINUTES),
  );
  const review = ranked.filter(
    (item) =>
      (item.memory.phase === "review" || item.memory.phase === "mastered") && isDue(item.memory, now),
  );
  const fresh = ranked.filter((item) => item.memory.phase === "new");

  const byDue = (
    a: { memory: CardMemory; order: number },
    b: { memory: CardMemory; order: number },
  ) => {
    const aDue = a.memory.dueAt ? new Date(a.memory.dueAt).getTime() : 0;
    const bDue = b.memory.dueAt ? new Date(b.memory.dueAt).getTime() : 0;
    return aDue - bDue || a.order - b.order;
  };

  learning.sort(byDue);
  review.sort(byDue);

  return [...learning, ...review, ...fresh].slice(0, limit).map(({ card, memory }) => ({
    ...card,
    memory,
    repeats: 0,
  }));
}

export function soonestDue(memories: CardMemory[]) {
  let best: number | null = null;
  let iso: string | null = null;

  for (const memory of memories) {
    if (!memory.dueAt) {
      continue;
    }

    const time = new Date(memory.dueAt).getTime();
    if (Number.isNaN(time)) {
      continue;
    }

    if (best === null || time < best) {
      best = time;
      iso = memory.dueAt;
    }
  }

  return iso;
}
