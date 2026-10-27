"use server";

import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";
import { revalidateLocalized } from "@/lib/content/revalidate";
import { cleanRequired } from "@/lib/content/text";
import { requireOwner } from "@/lib/owner-session";
import { deckTitle, phraseInTranscript } from "@/lib/stories/words-model";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type WordActionState = {
  error: "" | "forbidden" | "invalid" | "empty" | "storage";
  deckId: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const idle: WordActionState = { error: "", deckId: "" };

function failed(error: WordActionState["error"]): WordActionState {
  return { error, deckId: "" };
}

export async function addWord(_state: WordActionState, formData: FormData): Promise<WordActionState> {
  const owner = await requireOwner();
  if (!owner) {
    return failed("forbidden");
  }
  const storyId = formData.get("storyId");
  const label = cleanRequired(formData.get("label"), 200);
  const phrase = typeof formData.get("phrase") === "string" ? formData.get("phrase") : "";
  if (typeof storyId !== "string" || !UUID.test(storyId) || !label || typeof phrase !== "string") {
    return failed("invalid");
  }

  const service = createServiceClient();
  const { data: story, error } = await service.from("stories").select("hebrew_transcript").eq("id", storyId).maybeSingle();
  if (error || !story) {
    return failed("invalid");
  }
  const selected = phraseInTranscript(story.hebrew_transcript, phrase);
  if (!selected) {
    return failed("invalid");
  }
  const { count } = await service.from("story_words").select("id", { count: "exact", head: true }).eq("story_id", storyId);
  if ((count ?? 0) >= 40) {
    return failed("invalid");
  }
  const { error: insertError } = await service.from("story_words").insert({
    story_id: storyId,
    phrase: selected,
    label,
    start_ms: 0,
    end_ms: 1,
    sort_order: count ?? 0,
  });
  if (insertError) {
    return failed("storage");
  }
  revalidateLocalized("/stories");
  return idle;
}

export async function deleteWord(formData: FormData) {
  const owner = await requireOwner();
  if (!owner) {
    return;
  }
  const id = formData.get("id");
  if (typeof id !== "string" || !UUID.test(id)) {
    return;
  }
  const service = createServiceClient();
  await service.from("story_words").delete().eq("id", id);
  revalidateLocalized("/stories");
}

export async function createWordDeck(_state: WordActionState, formData: FormData): Promise<WordActionState> {
  const owner = await requireOwner();
  if (!owner) {
    return failed("forbidden");
  }
  const storyId = formData.get("storyId");
  if (typeof storyId !== "string" || !UUID.test(storyId)) {
    return failed("invalid");
  }

  const service = createServiceClient();
  const { data: story } = await service.from("stories").select("title").eq("id", storyId).maybeSingle();
  const { data: words } = await service
    .from("story_words")
    .select("phrase, label")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: true });
  if (!story || !words) {
    return failed("invalid");
  }
  if (words.length === 0) {
    return failed("empty");
  }

  const supabase = await createClient();
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .insert({ user_id: owner.id, title: deckTitle(story.title), description: "Words taken from this story." })
    .select("id")
    .single();
  if (deckError || !deck) {
    return failed("storage");
  }

  const { error: cardError } = await supabase.from("cards").insert(
    words.map((word) => ({
      user_id: owner.id,
      deck_id: deck.id,
      english: word.label,
      part_of_speech: "phrase" as const,
      hebrew: word.phrase,
    })),
  );
  if (cardError) {
    await supabase.from("cards").delete().eq("user_id", owner.id).eq("deck_id", deck.id);
    await supabase.from("decks").delete().eq("id", deck.id).eq("user_id", owner.id);
    return failed("storage");
  }

  revalidatePath("/decks");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/decks`);
  }
  return { error: "", deckId: deck.id };
}
