import {
  isCardPhase,
  memoryForStage,
  normalizeMemory,
  type CardMemory,
} from "@/lib/flashcards/schedule";
import { ProgressRepository } from "@/lib/repositories";
import { requireBrowserUser } from "@/lib/services/auth";

export type SaveResult = "ok" | "signed-out" | "error";

async function requireUser() {
  return requireBrowserUser();
}

function masteryLevel(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 6) {
    return null;
  }

  return value;
}

export async function loadDeckMastery(deckId: string): Promise<{
  signedIn: boolean;
  mastery: Record<string, number>;
}> {
  const auth = await requireUser();

  if (!auth) {
    return { signedIn: false, mastery: {} };
  }

  const mastery: Record<string, number> = {};
  const rows = await new ProgressRepository(auth.supabase).listMastery(auth.userId, deckId);

  for (const row of rows) {
    const level = masteryLevel(row.mastery);
    if (typeof row.card_id === "string" && level !== null) {
      mastery[row.card_id] = level;
    }
  }

  return { signedIn: true, mastery };
}

const deckMemoryLoads = new Map<string, Promise<{ signedIn: boolean; memory: Record<string, CardMemory> }>>();

export function loadDeckMemory(deckId: string) {
  const existing = deckMemoryLoads.get(deckId);

  if (existing) {
    return existing;
  }

  const request = readDeckMemory(deckId).catch((error: unknown) => {
    deckMemoryLoads.delete(deckId);
    throw error;
  });

  deckMemoryLoads.set(deckId, request);
  return request;
}

function invalidateDeckMemory(deckId: string) {
  deckMemoryLoads.delete(deckId);
}

async function readDeckMemory(deckId: string): Promise<{
  signedIn: boolean;
  memory: Record<string, CardMemory>;
}> {
  const auth = await requireUser();

  if (!auth) {
    return { signedIn: false, memory: {} };
  }

  const memory: Record<string, CardMemory> = {};
  const rows = await new ProgressRepository(auth.supabase).listMemory(auth.userId, deckId);

  for (const row of rows) {
    if (typeof row.card_id !== "string" || !isCardPhase(row.card_state)) {
      continue;
    }

    memory[row.card_id] = normalizeMemory({
      phase: row.card_state,
      ease: typeof row.ease === "number" ? row.ease : undefined,
      intervalMinutes: typeof row.interval_minutes === "number" ? row.interval_minutes : undefined,
      dueAt: typeof row.due_at === "string" ? row.due_at : null,
      reps: typeof row.reps === "number" ? row.reps : undefined,
      lapses: typeof row.lapses === "number" ? row.lapses : undefined,
      learningStep: typeof row.learning_step === "number" ? row.learning_step : undefined,
    });
  }

  return { signedIn: true, memory };
}

function scheduleColumns(level: number) {
  const memory = memoryForStage(level);
  return {
    mastery: memory.mastery,
    ease: memory.ease,
    interval_minutes: memory.intervalMinutes,
    due_at: memory.dueAt,
    reps: memory.reps,
    lapses: memory.lapses,
    learning_step: memory.learningStep,
    card_state: memory.phase,
  };
}

export async function writeCardMastery(
  deckId: string,
  cardId: string,
  level: number,
): Promise<SaveResult> {
  const auth = await requireUser();

  if (!auth) {
    return "signed-out";
  }

  const { error } = await new ProgressRepository(auth.supabase).upsertRow(
    {
      user_id: auth.userId,
      deck_id: deckId,
      card_id: cardId,
      ...scheduleColumns(level),
    },
    { onConflict: "user_id,deck_id,card_id", defaultToNull: false },
  );

  if (!error) {
    invalidateDeckMemory(deckId);
  }

  return error ? "error" : "ok";
}

export async function saveSessionProgress(
  deckId: string,
  updates: { cardId: string; mastery: number; practices: number; memory?: CardMemory }[],
): Promise<SaveResult> {
  if (updates.length === 0) {
    return "ok";
  }

  const auth = await requireUser();

  if (!auth) {
    return "signed-out";
  }

  const progress = new ProgressRepository(auth.supabase);
  const { data, error: readError } = await progress.listPracticeCounts(
    auth.userId,
    deckId,
    updates.map((item) => item.cardId),
  );

  if (readError) {
    return "error";
  }

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    if (typeof row.card_id === "string" && typeof row.practice_count === "number") {
      counts.set(row.card_id, row.practice_count);
    }
  }

  const practicedAt = new Date().toISOString();
  const { error } = await progress.upsertRows(
    updates.map((item) => ({
      user_id: auth.userId,
      deck_id: deckId,
      card_id: item.cardId,
      mastery: item.mastery,
      last_practiced_at: practicedAt,
      practice_count: (counts.get(item.cardId) ?? 0) + item.practices,
      ...(item.memory
        ? {
            ease: item.memory.ease,
            interval_minutes: item.memory.intervalMinutes,
            due_at: item.memory.dueAt,
            reps: item.memory.reps,
            lapses: item.memory.lapses,
            learning_step: item.memory.learningStep,
            card_state: item.memory.phase,
          }
        : {}),
    })),
    { onConflict: "user_id,deck_id,card_id" },
  );

  if (!error) {
    invalidateDeckMemory(deckId);
  }

  return error ? "error" : "ok";
}
