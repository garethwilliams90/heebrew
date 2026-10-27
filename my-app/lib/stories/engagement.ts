"use server";

import { revalidateLocalized } from "@/lib/content/revalidate";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  return toggleMark("story_completions", storyId);
}
