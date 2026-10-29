"use server";

import { translateEnglishToLocales } from "@/lib/azure/translate";
import { revalidateLocalized } from "@/lib/content/revalidate";
import { isPathwayLevelId } from "@/lib/learn/pathway/lesson-links";
import type { LocaleGloss } from "@/lib/learn/sentences";
import { requireOwner } from "@/lib/owner-session";
import { parseLessonInput, type LessonExampleInput } from "@/lib/stories/lesson-model";
import { createServiceClient } from "@/lib/supabase/service";

export type LessonActionState = {
  error: "" | "forbidden" | "lessonInvalid" | "lessonTranslate" | "lessonStorage";
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Slot = { en: string; fr: string; es: string };

async function completeLocales(slots: Slot[]): Promise<LocaleGloss[] | null> {
  const missing = slots.filter((slot) => slot.en && !(slot.fr && slot.es));
  let translated: { fr: string; es: string }[] = [];
  if (missing.length > 0) {
    try {
      translated = await translateEnglishToLocales(missing.map((item) => item.en));
    } catch {
      return null;
    }
  }
  let cursor = 0;
  const filled: LocaleGloss[] = [];
  for (const slot of slots) {
    if (!slot.en) {
      filled.push({ en: "", fr: "", es: "" });
      continue;
    }
    if (slot.fr && slot.es) {
      filled.push({ en: slot.en, fr: slot.fr, es: slot.es });
      continue;
    }
    const next = translated[cursor];
    cursor += 1;
    const fr = slot.fr || next?.fr || "";
    const es = slot.es || next?.es || "";
    if (!fr || !es) {
      return null;
    }
    filled.push({ en: slot.en, fr, es });
  }
  return filled;
}

export async function saveStoryLesson(_state: LessonActionState, formData: FormData): Promise<LessonActionState> {
  const owner = await requireOwner();
  if (!owner) {
    return { error: "forbidden" };
  }
  const storyId = formData.get("storyId");
  const raw = formData.get("lesson");
  if (typeof storyId !== "string" || !UUID.test(storyId) || typeof raw !== "string" || raw.length > 80_000) {
    return { error: "lessonInvalid" };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "lessonInvalid" };
  }
  const input = parseLessonInput(parsed);
  if (input === "invalid" || input.levelIds.some((id) => !isPathwayLevelId(id))) {
    return { error: "lessonInvalid" };
  }
  const requestedLevels = input.levelIds;

  const service = createServiceClient();
  const existing = await service.from("stories").select("id").eq("id", storyId).maybeSingle();
  if (existing.error || !existing.data) {
    return { error: "lessonInvalid" };
  }

  if ("clear" in input) {
    const cleared = await service.from("story_lessons").delete().eq("story_id", storyId);
    if (cleared.error) {
      return { error: "lessonStorage" };
    }
    const linked = await replaceLinks(service, storyId, requestedLevels);
    if (!linked) {
      return { error: "lessonStorage" };
    }
    await service.from("stories").update({ updated_at: new Date().toISOString() }).eq("id", storyId);
    revalidateLocalized("/stories");
    revalidateLocalized("/learn");
    return { error: "" };
  }

  const copies = await completeLocales([
    { en: input.conceptEn, fr: input.conceptFr, es: input.conceptEs },
    { en: input.titleEn, fr: input.titleFr, es: input.titleEs },
    { en: input.bodyEn, fr: input.bodyFr, es: input.bodyEs },
    ...input.examples.map((example) => ({ en: example.en, fr: example.fr, es: example.es })),
  ]);
  if (!copies) {
    return { error: "lessonTranslate" };
  }
  const [concept, title, body, ...exampleGlosses] = copies;
  if (!concept || !title || !body || exampleGlosses.length !== input.examples.length) {
    return { error: "lessonTranslate" };
  }

  const saved = await service.from("story_lessons").upsert({
    story_id: storyId,
    concept_he: input.conceptHe,
    concept_en: concept.en,
    concept_fr: concept.fr,
    concept_es: concept.es,
    title_en: title.en,
    title_fr: title.fr,
    title_es: title.es,
    body_en: body.en,
    body_fr: body.fr,
    body_es: body.es,
  });
  if (saved.error) {
    return { error: "lessonStorage" };
  }
  const removed = await service.from("story_lesson_examples").delete().eq("story_id", storyId);
  if (removed.error) {
    return { error: "lessonStorage" };
  }
  if (input.examples.length > 0) {
    const inserted = await service.from("story_lesson_examples").insert(exampleRows(storyId, input.examples, exampleGlosses));
    if (inserted.error) {
      return { error: "lessonStorage" };
    }
  }
  const linked = await replaceLinks(service, storyId, requestedLevels);
  if (!linked) {
    return { error: "lessonStorage" };
  }
  await service.from("stories").update({ updated_at: new Date().toISOString() }).eq("id", storyId);
  revalidateLocalized("/stories");
  revalidateLocalized("/learn");
  return { error: "" };
}

function exampleRows(storyId: string, examples: LessonExampleInput[], glosses: LocaleGloss[]) {
  return examples.map((example, index) => ({
    story_id: storyId,
    sort_order: index,
    hebrew: example.hebrew,
    gloss_en: glosses[index]?.en ?? example.en,
    gloss_fr: glosses[index]?.fr ?? "",
    gloss_es: glosses[index]?.es ?? "",
  }));
}

async function replaceLinks(service: ReturnType<typeof createServiceClient>, storyId: string, levelIds: string[]) {
  const removed = await service.from("story_pathway_links").delete().eq("story_id", storyId);
  if (removed.error) {
    return false;
  }
  if (levelIds.length === 0) {
    return true;
  }
  const inserted = await service.from("story_pathway_links").insert(
    levelIds.map((levelId) => ({ story_id: storyId, level_id: levelId })),
  );
  return !inserted.error;
}
