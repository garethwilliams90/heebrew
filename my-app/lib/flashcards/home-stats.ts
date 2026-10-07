import { createClient } from "@/lib/supabase/server";

export type HomeStats = {
  signedIn: boolean;
  experience: number;
  days: { date: string; cards: number }[];
};

export async function loadHomeStats(): Promise<HomeStats> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { signedIn: false, experience: 0, days: [] };
  }

  const [experienceResult, daysResult] = await Promise.all([
    supabase
      .from("learner_experience")
      .select("experience")
      .eq("user_id", data.user.id)
      .maybeSingle(),
    supabase
      .from("daily_card_practice")
      .select("practiced_on, cards")
      .eq("user_id", data.user.id)
      .order("practiced_on", { ascending: true }),
  ]);

  if (experienceResult.error) {
    throw experienceResult.error;
  }

  if (daysResult.error) {
    throw daysResult.error;
  }

  const days: HomeStats["days"] = [];
  for (const row of daysResult.data ?? []) {
    if (typeof row.practiced_on === "string" && typeof row.cards === "number") {
      days.push({ date: row.practiced_on.slice(0, 10), cards: row.cards });
    }
  }

  return {
    signedIn: true,
    experience: typeof experienceResult.data?.experience === "number" ? experienceResult.data.experience : 0,
    days,
  };
}
