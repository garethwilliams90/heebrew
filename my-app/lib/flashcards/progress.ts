import { createClient } from "@/lib/supabase/client";

const PAGE_SIZE = 1000;

export type SaveResult = "ok" | "signed-out" | "error";

type AuthContext = {
  supabase: ReturnType<typeof createClient>;
  userId: string;
};

async function requireUser(): Promise<AuthContext | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return { supabase, userId: data.user.id };
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

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await auth.supabase
      .from("card_progress")
      .select("card_id, mastery")
      .eq("user_id", auth.userId)
      .eq("deck_id", deckId)
      .order("card_id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    const rows = data ?? [];

    for (const row of rows) {
      const level = masteryLevel(row.mastery);
      if (typeof row.card_id === "string" && level !== null) {
        mastery[row.card_id] = level;
      }
    }

    if (rows.length < PAGE_SIZE) {
      break;
    }
  }

  return { signedIn: true, mastery };
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

  const { error } = await auth.supabase.from("card_progress").upsert(
    {
      user_id: auth.userId,
      deck_id: deckId,
      card_id: cardId,
      mastery: level,
    },
    { onConflict: "user_id,deck_id,card_id", defaultToNull: false },
  );

  return error ? "error" : "ok";
}

export async function saveSessionProgress(
  deckId: string,
  updates: { cardId: string; mastery: number; practices: number }[],
): Promise<SaveResult> {
  if (updates.length === 0) {
    return "ok";
  }

  const auth = await requireUser();

  if (!auth) {
    return "signed-out";
  }

  const { data, error: readError } = await auth.supabase
    .from("card_progress")
    .select("card_id, practice_count")
    .eq("user_id", auth.userId)
    .eq("deck_id", deckId)
    .in(
      "card_id",
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
  const { error } = await auth.supabase.from("card_progress").upsert(
    updates.map((item) => ({
      user_id: auth.userId,
      deck_id: deckId,
      card_id: item.cardId,
      mastery: item.mastery,
      last_practiced_at: practicedAt,
      practice_count: (counts.get(item.cardId) ?? 0) + item.practices,
    })),
    { onConflict: "user_id,deck_id,card_id" },
  );

  return error ? "error" : "ok";
}
