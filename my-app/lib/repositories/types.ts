/**
 * Shared query types for repositories. Page size matches the existing
 * card_progress reads in `lib/flashcards/progress.ts`.
 */

export const PAGE_SIZE = 1000;

export type PageResult<T> = {
  data: T[] | null;
  error: { message?: string } | null;
};

export type QueryPage = {
  from: number;
  to: number;
};
