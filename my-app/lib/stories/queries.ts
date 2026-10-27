import { loadMediaMap, type MediaView } from "@/lib/content/media-queries";
import { visibleToVisitor } from "@/lib/content/visibility";
import { glossOf, type LocaleGloss } from "@/lib/learn/sentences";
import { requireOwner } from "@/lib/owner-session";
import { isStoryAudioPath } from "@/lib/stories/audio";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const storyLevels = ["beginner", "intermediate", "advanced"] as const;
export type StoryLevel = (typeof storyLevels)[number];

export type StoryView = {
  id: string;
  level: StoryLevel;
  title: string;
  hebrew: string;
  gloss: LocaleGloss;
  published: boolean;
  audioUrl: string | null;
  updatedAt: string;
};

export type WordView = {
  id: string;
  phrase: string;
  label: string;
  startMs: number;
  endMs: number;
};

export type StoryChoice = {
  id: string;
  text: string;
  correct: boolean;
};

export type StoryQuestion = {
  id: string;
  prompt: string;
  choices: StoryChoice[];
};

export type StoryDetail = StoryView & {
  media: MediaView[];
  words: WordView[];
  questions: StoryQuestion[];
  hearted: boolean;
  completed: boolean;
};

type StoryRow = {
  id: string;
  level: string;
  title: string;
  hebrew_transcript: string;
  transcript_en: string;
  transcript_fr: string;
  transcript_es: string;
  audio_path: string;
  published: boolean;
  updated_at: string;
};

function isLevel(value: string): value is StoryLevel {
  return storyLevels.includes(value as StoryLevel);
}

export function parseStoryLevel(value: string | undefined): StoryLevel | null {
  return value && isLevel(value) ? value : null;
}

async function signAudio(paths: string[]) {
  const unique = [...new Set(paths.filter(isStoryAudioPath))];
  if (unique.length === 0) {
    return new Map<string, string>();
  }
  try {
    const service = createServiceClient();
    const signed = await Promise.all(
      unique.map(async (path) => {
        const { data, error } = await service.storage.from("story-audio").createSignedUrl(path, 60 * 60);
        return error || !data?.signedUrl ? null : ([path, data.signedUrl] as const);
      }),
    );
    return new Map(signed.filter((item): item is readonly [string, string] => item !== null));
  } catch {
    return new Map<string, string>();
  }
}

function toView(row: StoryRow, audioUrl: string | null): StoryView | null {
  if (!isLevel(row.level) || !isStoryAudioPath(row.audio_path)) {
    return null;
  }
  return {
    id: row.id,
    level: row.level,
    title: row.title,
    hebrew: row.hebrew_transcript,
    gloss: { en: row.transcript_en, fr: row.transcript_fr, es: row.transcript_es },
    published: row.published,
    audioUrl,
    updatedAt: row.updated_at,
  };
}

export async function loadStories(level: StoryLevel | null) {
  const owner = await requireOwner();
  const rows = owner ? await loadOwnerStories(level) : await loadPublishedStories(level);
  const audio = await signAudio(rows.map((row) => row.audio_path));
  const stories = rows.flatMap((row) => {
    const view = toView(row, audio.get(row.audio_path) ?? null);
    return view && visibleToVisitor(view.published, Boolean(owner)) ? [view] : [];
  });
  const details = await attachStoryDetails(stories, Boolean(owner));
  return {
    owner: Boolean(owner),
    signedIn: details.signedIn,
    stories: details.stories,
  };
}

async function attachStoryDetails(stories: StoryView[], owner: boolean) {
  const ids = stories.map((story) => story.id);
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const signedIn = Boolean(data.user);
  const [media, marks, words, questions] = await Promise.all([
    loadMediaMap("story", ids),
    loadMarks(ids, signedIn),
    loadWords(ids),
    loadQuestions(ids, owner),
  ]);
  return {
    signedIn,
    stories: stories.map((story) => ({
      ...story,
      media: media.get(story.id) ?? [],
      words: words.get(story.id) ?? [],
      questions: questions.get(story.id) ?? [],
      hearted: marks.hearts.has(story.id),
      completed: marks.done.has(story.id),
    })),
  };
}

async function loadMarks(ids: string[], signedIn: boolean) {
  const hearts = new Set<string>();
  const done = new Set<string>();
  if (!signedIn || ids.length === 0) {
    return { hearts, done };
  }
  try {
    const supabase = await createClient();
    const [heartRows, doneRows] = await Promise.all([
      supabase.from("story_hearts").select("story_id").in("story_id", ids),
      supabase.from("story_completions").select("story_id").in("story_id", ids),
    ]);
    for (const row of heartRows.data ?? []) {
      hearts.add(row.story_id);
    }
    for (const row of doneRows.data ?? []) {
      done.add(row.story_id);
    }
  } catch {
    return { hearts, done };
  }
  return { hearts, done };
}

async function loadWords(ids: string[]) {
  const grouped = new Map<string, WordView[]>();
  if (ids.length === 0) {
    return grouped;
  }
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("story_words")
      .select("id, story_id, phrase, label, start_ms, end_ms, sort_order")
      .in("story_id", ids)
      .order("sort_order", { ascending: true });
    if (error || !data) {
      return grouped;
    }
    for (const row of data) {
      const list = grouped.get(row.story_id) ?? [];
      list.push({ id: row.id, phrase: row.phrase, label: row.label, startMs: row.start_ms, endMs: row.end_ms });
      grouped.set(row.story_id, list);
    }
  } catch {
    return grouped;
  }
  return grouped;
}

async function loadQuestions(ids: string[], owner: boolean) {
  const grouped = new Map<string, StoryQuestion[]>();
  if (ids.length === 0) {
    return grouped;
  }
  try {
    const client = owner ? createServiceClient() : await createClient();
    const { data, error } = await client.from("story_questions").select("id, story_id, prompt, sort_order").in("story_id", ids).order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) {
      return grouped;
    }
    const choices = await client
      .from("story_choices")
      .select("id, question_id, label, correct, sort_order")
      .in("question_id", data.map((question) => question.id))
      .order("sort_order", { ascending: true });
    const byQuestion = new Map<string, StoryChoice[]>();
    for (const choice of choices.data ?? []) {
      const list = byQuestion.get(choice.question_id) ?? [];
      list.push({ id: choice.id, text: choice.label, correct: owner ? choice.correct : false });
      byQuestion.set(choice.question_id, list);
    }
    for (const question of data) {
      const list = grouped.get(question.story_id) ?? [];
      list.push({ id: question.id, prompt: question.prompt, choices: byQuestion.get(question.id) ?? [] });
      grouped.set(question.story_id, list);
    }
  } catch {
    return grouped;
  }
  return grouped;
}

async function loadPublishedStories(level: StoryLevel | null) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("stories")
      .select("id, level, title, hebrew_transcript, transcript_en, transcript_fr, transcript_es, audio_path, published, updated_at")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (level) {
      query = query.eq("level", level);
    }
    const { data, error } = await query;
    if (error || !data) {
      return [];
    }
    return data as StoryRow[];
  } catch {
    return [];
  }
}

async function loadOwnerStories(level: StoryLevel | null) {
  try {
    const service = createServiceClient();
    let query = service
      .from("stories")
      .select("id, level, title, hebrew_transcript, transcript_en, transcript_fr, transcript_es, audio_path, published, updated_at")
      .order("created_at", { ascending: false });
    if (level) {
      query = query.eq("level", level);
    }
    const { data, error } = await query;
    if (error || !data) {
      return [];
    }
    return data as StoryRow[];
  } catch {
    return [];
  }
}

export function storyGloss(story: StoryView, locale: string) {
  return glossOf(story.gloss, locale);
}
