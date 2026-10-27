"use server";

import { translateHebrewToLocales } from "@/lib/azure/translate";
import { transcribeHebrewAudio } from "@/lib/azure/transcribe";
import { mediaPathsFor } from "@/lib/content/media-actions";
import { revalidateLocalized } from "@/lib/content/revalidate";
import { cleanOptional, cleanRequired } from "@/lib/content/text";
import { requireOwner } from "@/lib/owner-session";
import { contentTypeForStoryPath, isStoryAudioPath, validateStoryAudio } from "@/lib/stories/audio";
import { createServiceClient } from "@/lib/supabase/service";

const LEVELS = ["beginner", "intermediate", "advanced"] as const;
type StoryLevel = (typeof LEVELS)[number];

export type StoryActionState = {
  error: "" | "forbidden" | "invalid" | "audio" | "translate" | "storage" | "transcript";
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function levelOf(value: FormDataEntryValue | null): StoryLevel | null {
  return typeof value === "string" && LEVELS.includes(value as StoryLevel) ? (value as StoryLevel) : null;
}

export async function saveStory(_state: StoryActionState, formData: FormData): Promise<StoryActionState> {
  const owner = await requireOwner();
  if (!owner) {
    return { error: "forbidden" };
  }

  const title = cleanRequired(formData.get("title"), 120);
  const hebrewField = formData.get("hebrew");
  const hebrewInput = cleanOptional(hebrewField);
  const level = levelOf(formData.get("level"));
  const transcriptEn = cleanOptional(formData.get("transcriptEn"));
  const transcriptFr = cleanOptional(formData.get("transcriptFr"));
  const transcriptEs = cleanOptional(formData.get("transcriptEs"));
  const published = formData.get("published") === "true";
  const generate = formData.get("intent") === "generate" || formData.get("regenerate") === "true";
  const rawId = formData.get("id");
  const id = typeof rawId === "string" && rawId ? rawId.trim().toLowerCase() : "";
  if (!title || !level || hebrewInput === null || transcriptEn === null || transcriptFr === null || transcriptEs === null) {
    return { error: "invalid" };
  }
  if (!generate && !hebrewInput) {
    return { error: "invalid" };
  }
  if (id && !UUID.test(id)) {
    return { error: "invalid" };
  }

  const service = createServiceClient();
  const storyId = id || crypto.randomUUID();
  let existingPath: string | null = null;
  if (id) {
    const { data, error } = await service.from("stories").select("audio_path").eq("id", id).maybeSingle();
    if (error || !data || !isStoryAudioPath(data.audio_path)) {
      return { error: "invalid" };
    }
    existingPath = data.audio_path;
  }

  const audio = formData.get("audio");
  let pending: { bytes: Uint8Array; ext: string; contentType: string } | null = null;
  if (audio instanceof File && audio.size > 0) {
    const bytes = new Uint8Array(await audio.arrayBuffer());
    const checked = validateStoryAudio({ bytes, mime: audio.type, name: audio.name });
    if (!checked.ok) {
      return { error: "audio" };
    }
    pending = { bytes, ext: checked.ext, contentType: checked.contentType };
  }
  if (!existingPath && !pending) {
    return { error: "audio" };
  }

  let hebrew = hebrewInput;
  if (generate) {
    let bytes = pending?.bytes;
    let contentType = pending?.contentType ?? "";
    const filename = pending ? `story.${pending.ext}` : existingPath ?? "story.mp3";
    if (!bytes && existingPath) {
      const downloaded = await service.storage.from("story-audio").download(existingPath);
      if (downloaded.error || !downloaded.data) {
        return { error: "transcript" };
      }
      bytes = new Uint8Array(await downloaded.data.arrayBuffer());
      contentType = contentTypeForStoryPath(existingPath);
    }
    if (!bytes || !contentType) {
      return { error: "audio" };
    }
    try {
      hebrew = await transcribeHebrewAudio(bytes, contentType, filename);
    } catch {
      return { error: "transcript" };
    }
  }
  if (!hebrew || hebrew.length > 20000) {
    return { error: "transcript" };
  }

  let gloss = { en: transcriptEn, fr: transcriptFr, es: transcriptEs };
  if (!gloss.en || !gloss.fr || !gloss.es) {
    try {
      const translated = await translateHebrewToLocales(hebrew);
      gloss = {
        en: gloss.en || translated.en,
        fr: gloss.fr || translated.fr,
        es: gloss.es || translated.es,
      };
    } catch {
      return { error: "translate" };
    }
  }
  if (!gloss.en || !gloss.fr || !gloss.es || gloss.en.length > 20000 || gloss.fr.length > 20000 || gloss.es.length > 20000) {
    return { error: "translate" };
  }

  let audioPath = existingPath;
  let uploaded: string | null = null;
  if (pending) {
    const nextPath = `${storyId}.${pending.ext}`;
    const { error } = await service.storage.from("story-audio").upload(nextPath, pending.bytes, {
      contentType: pending.contentType,
      upsert: true,
    });
    if (error || !isStoryAudioPath(nextPath)) {
      return { error: "storage" };
    }
    uploaded = nextPath;
    audioPath = nextPath;
  }
  if (!audioPath) {
    return { error: "audio" };
  }

  const row = {
    id: storyId,
    level,
    title,
    hebrew_transcript: hebrew,
    transcript_en: gloss.en,
    transcript_fr: gloss.fr,
    transcript_es: gloss.es,
    audio_path: audioPath,
    published,
    created_by: owner.id,
  };
  const { error } = id
    ? await service.from("stories").update(row).eq("id", id)
    : await service.from("stories").insert(row);
  if (error) {
    if (uploaded && uploaded !== existingPath) {
      await service.storage.from("story-audio").remove([uploaded]);
    }
    return { error: "storage" };
  }
  if (existingPath && uploaded && existingPath !== uploaded) {
    await service.storage.from("story-audio").remove([existingPath]);
  }

  revalidateLocalized("/stories");
  return { error: "" };
}

export async function deleteStory(formData: FormData) {
  const owner = await requireOwner();
  if (!owner) {
    return;
  }
  const id = formData.get("id");
  if (typeof id !== "string" || !UUID.test(id)) {
    return;
  }

  const service = createServiceClient();
  let mediaPaths: string[] = [];
  try {
    mediaPaths = await mediaPathsFor("story", id);
  } catch {
    mediaPaths = [];
  }
  const { data } = await service.from("stories").select("audio_path").eq("id", id).maybeSingle();
  const { error } = await service.from("stories").delete().eq("id", id);
  if (error) {
    return;
  }
  if (data?.audio_path && isStoryAudioPath(data.audio_path)) {
    await service.storage.from("story-audio").remove([data.audio_path]);
  }
  if (mediaPaths.length > 0) {
    await service.storage.from("content-media").remove(mediaPaths);
  }
  revalidateLocalized("/stories");
}
