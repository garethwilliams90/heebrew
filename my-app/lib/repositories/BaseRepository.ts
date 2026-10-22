import { PAGE_SIZE, type PageResult } from "./types";

/**
 * Minimal table client so repositories accept both the browser and server
 * Supabase clients already used in this repo.
 */
export type RepositoryClient = {
  from: (table: string) => unknown;
};

/**
 * Base class for table-scoped data access. Pass in the client from
 * `requireUser()` or a Route Handler so RLS still sees the session.
 *
 * Repositories are not registered on `ServiceContainer`. They need a
 * per-request client, not a process-wide singleton.
 */
export abstract class BaseRepository {
  protected constructor(
    protected readonly tableName: string,
    protected readonly supabase: RepositoryClient,
  ) {}

  protected from() {
    return this.supabase.from(this.tableName);
  }
}

/**
 * Walk a paginated Supabase select the same way `loadDeckMastery` does.
 */
export async function readAllPages<T>(
  fetchPage: (from: number, to: number) => Promise<PageResult<T>>,
  pageSize = PAGE_SIZE,
): Promise<T[]> {
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await fetchPage(from, from + pageSize - 1);
    if (error) {
      throw error;
    }

    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) {
      break;
    }
  }

  return rows;
}
