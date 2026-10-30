"use server";

import { revalidateLocalized } from "@/lib/content/revalidate";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TABS = ["story", "learn", "words", "quiz"] as const;
type StoryTabName = (typeof TABS)[number];

function isTab(value: string): value is StoryTabName {
  return TABS.includes(value as StoryTabName);
}

async function requiredTabs(storyId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("story_lessons").select("title_en, body_en").eq("story_id", storyId).maybeSingle();
  const learn = Boolean(data && (data.title_en.trim() || data.body_en.trim()));
  const tabs: StoryTabName[] = learn ? ["story", "learn", "words", "quiz"] : ["story", "words", "quiz"];
  const done = await supabase.from("story_tab_completions").select("tab").eq("story_id", storyId).eq("user_id", userId);
  const finished = new Set((done.data ?? []).map((row) => row.tab));
  return { supabase, tabs, ready: tabs.every((tab) => finished.has(tab)) };
}

async function toggleMark(table: "story_hearts" | "story_completions", storyId: string) {
  if (!UUID.test(storyId)) {
    return "signed-out" as const;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return "signed-out" as const;
  }
  const existing = await supabase.from(table).select("story_id").eq("story_id", storyId).eq("user_id", data.user.id).maybeSingle();
  if (existing.data) {
    const removed = await supabase.from(table).delete().eq("story_id", storyId).eq("user_id", data.user.id);
    if (removed.error) {
      return true;
    }
    revalidateLocalized("/stories");
    return false;
  }
  const inserted = await supabase.from(table).insert({ story_id: storyId, user_id: data.user.id });
  if (inserted.error) {
    return false;
  }
  revalidateLocalized("/stories");
  return true;
}

export async function toggleHeart(storyId: string) {
  return toggleMark("story_hearts", storyId);
}

export async function toggleComplete(storyId: string) {
  if (!UUID.test(storyId)) {
    return "signed-out" as const;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return "signed-out" as const;
  }
  const existing = await supabase.from("story_completions").select("story_id").eq("story_id", storyId).eq("user_id", data.user.id).maybeSingle();
  if (existing.data) {
    const removed = await supabase.from("story_completions").delete().eq("story_id", storyId).eq("user_id", data.user.id);
    if (removed.error) {
      return true;
    }
    revalidateLocalized("/stories");
    return false;
  }
  const progress = await requiredTabs(storyId, data.user.id);
  if (!progress.ready) {
    return false;
  }
  const inserted = await supabase.from("story_completions").insert({ story_id: storyId, user_id: data.user.id });
  if (inserted.error) {
    return false;
  }
  revalidateLocalized("/stories");
  return true;
}

export async function toggleTabComplete(storyId: string, tab: string): Promise<{ on: boolean; completed: boolean } | "signed-out"> {
  if (!UUID.test(storyId) || !isTab(tab)) {
    return "signed-out";
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return "signed-out";
  }
  const existing = await supabase
    .from("story_tab_completions")
    .select("tab")
    .eq("story_id", storyId)
    .eq("user_id", data.user.id)
    .eq("tab", tab)
    .maybeSingle();
  if (existing.data) {
    await supabase.from("story_tab_completions").delete().eq("story_id", storyId).eq("user_id", data.user.id).eq("tab", tab);
    await supabase.from("story_completions").delete().eq("story_id", storyId).eq("user_id", data.user.id);
    revalidateLocalized("/stories");
    return { on: false, completed: false };
  }
  const inserted = await supabase.from("story_tab_completions").insert({ story_id: storyId, user_id: data.user.id, tab });
  if (inserted.error) {
    return { on: false, completed: false };
  }
  const progress = await requiredTabs(storyId, data.user.id);
  if (progress.ready) {
    await supabase.from("story_completions").insert({ story_id: storyId, user_id: data.user.id });
  }
  revalidateLocalized("/stories");
  return { on: true, completed: progress.ready };
}
