"use server";

import { transcribeHebrewDetail } from "@/lib/azure/transcribe";
import { requireOwner } from "@/lib/owner-session";
import { contentTypeForStoryPath, isStoryAudioPath } from "@/lib/stories/audio";
import { alignCues, readCues, transcriptTokenLines, type WordCue } from "@/lib/stories/cues";
import { createServiceClient } from "@/lib/supabase/service";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function alignStoryCues(storyId: string): Promise<WordCue[]> {
  if (!UUID.test(storyId)) {
    return [];
  }
  const service = createServiceClient();
  const { data } = await service
    .from("stories")
    .select("hebrew_transcript, audio_path, published, word_cues")
    .eq("id", storyId)
    .maybeSingle();
  if (!data || !isStoryAudioPath(data.audio_path)) {
    return [];
  }
  const owner = await requireOwner();
  if (!data.published && !owner) {
    return [];
  }
  const tokens = transcriptTokenLines(data.hebrew_transcript).flat();
  const saved = readCues(data.word_cues);
  if (saved.length === tokens.length && saved.length > 0) {
    return saved;
  }
  const downloaded = await service.storage.from("story-audio").download(data.audio_path);
  if (downloaded.error || !downloaded.data) {
    return [];
  }
  try {
    const detail = await transcribeHebrewDetail(
      new Uint8Array(await downloaded.data.arrayBuffer()),
      contentTypeForStoryPath(data.audio_path),
      data.audio_path,
    );
    const cues = alignCues(tokens, detail.words, 0);
    if (cues.length !== tokens.length) {
      return [];
    }
    await service.from("stories").update({ word_cues: cues }).eq("id", storyId);
    return cues;
  } catch {
    return [];
  }
}
