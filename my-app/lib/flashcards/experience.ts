import { createClient } from "@/lib/supabase/client";
import type { FlashcardGrade } from "@/lib/flashcards/schedule";
import type { RecallGrade } from "@/lib/flashcards/types";

const STORAGE_KEY = "webrew.experience";

export const gradeExperience: Record<RecallGrade, number> = {
  dontKnow: 2,
  know: 6,
  knowWell: 10,
  memorised: 15,
};

export const flashcardExperience: Record<FlashcardGrade, number> = {
  dontKnow: 2,
  know: 6,
  mastered: 15,
};

export function spanForLevel(level: number) {
  return 40 + level * 20;
}

export function placeExperience(experience: number) {
  let level = 1;
  let into = Math.max(0, Math.floor(experience));

  for (;;) {
    const span = spanForLevel(level);
    if (into < span) {
      return { level, into, span };
    }

    into -= span;
    level += 1;
  }
}

function readLocalExperience() {
  if (typeof window === "undefined") {
    return 0;
  }

  const value = Number(window.localStorage.getItem(STORAGE_KEY));
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

function writeLocalExperience(experience: number) {
  window.localStorage.setItem(STORAGE_KEY, String(experience));
}

let experienceLoad: Promise<{ signedIn: boolean; experience: number }> | null = null;

export function loadExperience() {
  if (!experienceLoad) {
    experienceLoad = readExperience().catch((error: unknown) => {
      experienceLoad = null;
      throw error;
    });
  }

  return experienceLoad;
}

async function readExperience(): Promise<{ signedIn: boolean; experience: number }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { signedIn: false, experience: readLocalExperience() };
  }

  const { data: row, error: readError } = await supabase
    .from("learner_experience")
    .select("experience")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  return {
    signedIn: true,
    experience: typeof row?.experience === "number" ? row.experience : 0,
  };
}

export function experienceForLevel(level: number) {
  const target = Math.max(1, Math.floor(level));
  let total = 0;
  for (let current = 1; current < target; current += 1) {
    total += spanForLevel(current);
  }
  return total;
}

export async function setExperience(experience: number): Promise<"ok" | "signed-out" | "error"> {
  experienceLoad = null;
  const next = Math.max(0, Math.floor(experience));
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    writeLocalExperience(next);
    return "signed-out";
  }

  const { error: writeError } = await supabase.from("learner_experience").upsert(
    { user_id: data.user.id, experience: next },
    { onConflict: "user_id" },
  );

  return writeError ? "error" : "ok";
}

export async function addExperience(gained: number): Promise<"ok" | "signed-out" | "error"> {
  experienceLoad = null;

  if (gained <= 0) {
    return "ok";
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    writeLocalExperience(readLocalExperience() + gained);
    window.dispatchEvent(new Event("webrew-experience"));
    return "signed-out";
  }

  const { data: row, error: readError } = await supabase
    .from("learner_experience")
    .select("experience")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (readError) {
    return "error";
  }

  const experience = (typeof row?.experience === "number" ? row.experience : 0) + gained;
  const { error: writeError } = await supabase.from("learner_experience").upsert(
    { user_id: data.user.id, experience },
    { onConflict: "user_id" },
  );

  if (!writeError && typeof window !== "undefined") {
    window.dispatchEvent(new Event("webrew-experience"));
  }
  return writeError ? "error" : "ok";
}
