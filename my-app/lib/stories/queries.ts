import { loadMediaMap, type MediaView } from "@/lib/content/media-queries";
import { visibleToVisitor } from "@/lib/content/visibility";
import { glossOf, type LocaleGloss } from "@/lib/learn/sentences";
import { isOwnerUser } from "@/lib/owner";
import { isStoryAudioPath, storyAudioUrl } from "@/lib/stories/audio";
import { readCues, type WordCue } from "@/lib/stories/cues";
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
  cues: WordCue[];
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
  word_cues: unknown;
};

function isLevel(value: string): value is StoryLevel {
  return storyLevels.includes(value as StoryLevel);
}

export function parseStoryLevel(value: string | undefined): StoryLevel | null {
  return value && isLevel(value) ? value : null;
}

function toView(row: StoryRow): StoryView | null {
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
    audioUrl: storyAudioUrl(row.audio_path),
    cues: readCues(row.word_cues),
    updatedAt: row.updated_at,
  };
}

async function readViewer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user ?? null;
  return {
    supabase,
    signedIn: Boolean(user),
    owner: Boolean(user && isOwnerUser(user, process.env.APP_OWNER_EMAIL)),
  };
}

export async function loadStories(level: StoryLevel | null) {
  const viewer = await readViewer();
  const rows = viewer.owner ? await loadOwnerStories(level) : await loadPublishedStories(viewer.supabase, level);
  const stories = rows.flatMap((row) => {
    const view = toView(row);
    return view && visibleToVisitor(view.published, viewer.owner) ? [view] : [];
  });
  const details = await attachStoryDetails(stories, viewer);
  return {
    owner: viewer.owner,
    signedIn: viewer.signedIn,
    stories: details,
  };
}

async function attachStoryDetails(
  stories: StoryView[],
  viewer: { supabase: Awaited<ReturnType<typeof createClient>>; signedIn: boolean; owner: boolean },
) {
  const ids = stories.map((story) => story.id);
  const [media, marks, words, questions] = await Promise.all([
    loadMediaMap("story", ids),
    loadMarks(viewer.supabase, ids, viewer.signedIn),
    loadWords(ids),
    loadQuestions(viewer.supabase, ids, viewer.owner),
  ]);
  return stories.map((story) => ({
    ...story,
    media: media.get(story.id) ?? [],
    words: words.get(story.id) ?? [],
    questions: questions.get(story.id) ?? [],
    hearted: marks.hearts.has(story.id),
    completed: marks.done.has(story.id),
  }));
}

async function loadMarks(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ids: string[],
  signedIn: boolean,
) {
  const hearts = new Set<string>();
  const done = new Set<string>();
  if (!signedIn || ids.length === 0) {
    return { hearts, done };
  }
  try {
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

async function loadQuestions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ids: string[],
  owner: boolean,
) {
  const grouped = new Map<string, StoryQuestion[]>();
  if (ids.length === 0) {
    return grouped;
  }
  try {
    const client = owner ? createServiceClient() : supabase;
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

async function loadPublishedStories(supabase: Awaited<ReturnType<typeof createClient>>, level: StoryLevel | null) {
  try {
    let query = supabase
      .from("stories")
      .select("id, level, title, hebrew_transcript, transcript_en, transcript_fr, transcript_es, audio_path, published, updated_at, word_cues")
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
      .select("id, level, title, hebrew_transcript, transcript_en, transcript_fr, transcript_es, audio_path, published, updated_at, word_cues")
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
