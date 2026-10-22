import { BaseRepository, readAllPages, type RepositoryClient } from "./BaseRepository";
import { PAGE_SIZE } from "./types";

export type ProgressWriteResult = {
  error: { message?: string } | null;
};

export type MasteryRow = {
  card_id: string;
  mastery: number;
};

export type MemoryRow = {
  card_id: string;
  ease: number | null;
  interval_minutes: number | null;
  due_at: string | null;
  reps: number | null;
  lapses: number | null;
  learning_step: number | null;
  card_state: string | null;
};

type FilterBuilder<T> = PromiseLike<{ data: T[] | null; error: ProgressWriteResult["error"] }> & {
  eq: (column: string, value: string) => FilterBuilder<T>;
  in: (column: string, values: string[]) => FilterBuilder<T>;
  order: (column: string, options: { ascending: boolean }) => FilterBuilder<T>;
  range: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: ProgressWriteResult["error"] }>;
};

export type PracticeCountRow = {
  card_id: string;
  practice_count: number;
};

export type ProgressUpsertRow = Record<string, unknown>;

type ProgressQuery = {
  select: (columns: string) => FilterBuilder<MasteryRow & MemoryRow & PracticeCountRow>;
  upsert: (
    row: ProgressUpsertRow | ProgressUpsertRow[],
    options?: { onConflict?: string; defaultToNull?: boolean },
  ) => PromiseLike<ProgressWriteResult>;
};

/**
 * card_progress reads used by `loadDeckMastery` and `readDeckMemory`.
 */
export class ProgressRepository extends BaseRepository {
  constructor(supabase: RepositoryClient) {
    super("card_progress", supabase);
  }

  private progress() {
    return this.from() as ProgressQuery;
  }

  listMastery(userId: string, deckId: string) {
    return readAllPages<MasteryRow>(async (from, to) =>
      this.progress()
        .select("card_id, mastery")
        .eq("user_id", userId)
        .eq("deck_id", deckId)
        .order("card_id", { ascending: true })
        .range(from, to),
    );
  }

  listMemory(userId: string, deckId: string) {
    return readAllPages<MemoryRow>(async (from, to) =>
      this.progress()
        .select("card_id, ease, interval_minutes, due_at, reps, lapses, learning_step, card_state")
        .eq("user_id", userId)
        .eq("deck_id", deckId)
        .order("card_id", { ascending: true })
        .range(from, to),
    );
  }

  listPracticeCounts(userId: string, deckId: string, cardIds: string[]) {
    return this.progress()
      .select("card_id, practice_count")
      .eq("user_id", userId)
      .eq("deck_id", deckId)
      .in("card_id", cardIds);
  }

  upsertRow(row: ProgressUpsertRow, options: { onConflict: string; defaultToNull?: boolean }) {
    return this.progress().upsert(row, options);
  }

  upsertRows(rows: ProgressUpsertRow[], options: { onConflict: string }) {
    return this.progress().upsert(rows, options);
  }
}

export { PAGE_SIZE as PROGRESS_PAGE_SIZE };
