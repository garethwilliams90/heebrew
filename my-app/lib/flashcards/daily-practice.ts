import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "webrew.daily-cards";

export type PracticeDay = {
  date: string;
  cards: number;
};

/** The learner's local calendar day, stored as YYYY-MM-DD. */
export function practiceDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readLocalDays(): Record<string, number> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const days: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && typeof value === "number" && Number.isFinite(value) && value >= 0) {
        days[key] = Math.floor(value);
      }
    }
    return days;
  } catch {
    return {};
  }
}

export function readLocalPractice(): PracticeDay[] {
  return Object.entries(readLocalDays()).map(([date, cards]) => ({ date, cards }));
}

export async function recordDailyCards(amount = 1): Promise<"ok" | "signed-out" | "error"> {
  if (amount <= 0) {
    return "ok";
  }

  const date = practiceDate();
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    try {
      const days = readLocalDays();
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...days, [date]: (days[date] ?? 0) + amount }),
      );
    } catch {
      return "error";
    }
    return "signed-out";
  }

  const { error: writeError } = await supabase.rpc("record_daily_cards", {
    practice_date: date,
    amount,
  });

  return writeError ? "error" : "ok";
}
