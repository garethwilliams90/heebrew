import { loadMediaMap, type MediaView } from "@/lib/content/media-queries";
import { visibleToVisitor } from "@/lib/content/visibility";
import { pathwayLevelRef, type PathwayLevelRef, isPathwayLevelId } from "@/lib/learn/pathway/lesson-links";
import { glossOf, type LocaleGloss } from "@/lib/learn/sentences";
import { isOwnerUser } from "@/lib/owner";
import { isStoryAudioPath, storyAudioUrl } from "@/lib/stories/audio";
import { readCues, type WordCue } from "@/lib/stories/cues";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const storyLevels = ["beginner", "intermediate", "advanced"] as const;
export type StoryLevel = (typeof storyLevels)[number];

export const storyTabs = ["story", "words", "quiz", "learn"] as const;
export type StoryTab = (typeof storyTabs)[number];

export function parseStoryTab(value: string | undefined): StoryTab {
  return value && storyTabs.includes(value as StoryTab) ? (value as StoryTab) : "story";
}

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

export type StoryLessonExample = {
  hebrew: string;
  gloss: LocaleGloss;
};

export type StoryLesson = {
  conceptHe: string;
  concept: LocaleGloss;
  title: LocaleGloss;
  body: LocaleGloss;
  examples: StoryLessonExample[];
  levels: PathwayLevelRef[];
};

export type LevelStoryLink = {
  id: string;
  title: string;
};

export type StoryDetail = StoryView & {
  media: MediaView[];
  words: WordView[];
  questions: StoryQuestion[];
  lesson: StoryLesson;
  hearted: boolean;
  completed: boolean;
};

function emptyLesson(): StoryLesson {
  const blank = { en: "", fr: "", es: "" };
  return { conceptHe: "", concept: blank, title: blank, body: blank, examples: [], levels: [] };
}

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
  const [media, marks, words, questions, lessons] = await Promise.all([
    loadMediaMap("story", ids),
    loadMarks(viewer.supabase, ids, viewer.signedIn),
    loadWords(ids),
    loadQuestions(viewer.supabase, ids, viewer.owner),
    loadLessons(ids),
  ]);
  return stories.map((story) => ({
    ...story,
    media: media.get(story.id) ?? [],
    words: words.get(story.id) ?? [],
    questions: questions.get(story.id) ?? [],
    lesson: lessons.get(story.id) ?? emptyLesson(),
    hearted: marks.hearts.has(story.id),
    completed: marks.done.has(story.id),
  }));
}

export async function loadLevelStories(levelId: string): Promise<LevelStoryLink[]> {
  if (!isPathwayLevelId(levelId)) {
    return [];
  }
  const viewer = await readViewer();
  try {
    const service = createServiceClient();
    const links = await service.from("story_pathway_links").select("story_id").eq("level_id", levelId);
    const ids = (links.data ?? []).map((row) => row.story_id);
    if (links.error || ids.length === 0) {
      return [];
    }
    const [lessonRows, storyRows] = await Promise.all([
      service.from("story_lessons").select("story_id, title_en, body_en").in("story_id", ids),
      service.from("stories").select("id, title, published").in("id", ids),
    ]);
    if (lessonRows.error || storyRows.error || !lessonRows.data || !storyRows.data) {
      return [];
    }
    const ready = new Set(
      lessonRows.data.filter((row) => row.title_en.trim() || row.body_en.trim()).map((row) => row.story_id),
    );
    return storyRows.data
      .filter((row) => ready.has(row.id) && (viewer.owner || row.published))
      .map((row) => ({ id: row.id, title: row.title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

async function loadLessons(ids: string[]) {
  const grouped = new Map<string, StoryLesson>();
  if (ids.length === 0) {
    return grouped;
  }
  try {
    const service = createServiceClient();
    const [lessons, examples, links] = await Promise.all([
      service
        .from("story_lessons")
        .select("story_id, concept_he, concept_en, concept_fr, concept_es, title_en, title_fr, title_es, body_en, body_fr, body_es")
        .in("story_id", ids),
      service
        .from("story_lesson_examples")
        .select("story_id, hebrew, gloss_en, gloss_fr, gloss_es, sort_order")
        .in("story_id", ids)
        .order("sort_order", { ascending: true }),
      service.from("story_pathway_links").select("story_id, level_id").in("story_id", ids),
    ]);
    if (lessons.error || examples.error || links.error || !lessons.data || !examples.data || !links.data) {
      return grouped;
    }
    for (const row of lessons.data) {
      grouped.set(row.story_id, {
        conceptHe: row.concept_he,
        concept: { en: row.concept_en, fr: row.concept_fr, es: row.concept_es },
        title: { en: row.title_en, fr: row.title_fr, es: row.title_es },
        body: { en: row.body_en, fr: row.body_fr, es: row.body_es },
        examples: [],
        levels: [],
      });
    }
    for (const row of examples.data) {
      const lesson = grouped.get(row.story_id) ?? emptyLesson();
      lesson.examples.push({ hebrew: row.hebrew, gloss: { en: row.gloss_en, fr: row.gloss_fr, es: row.gloss_es } });
      grouped.set(row.story_id, lesson);
    }
    for (const row of links.data) {
      const level = pathwayLevelRef(row.level_id);
      if (!level) {
        continue;
      }
      const lesson = grouped.get(row.story_id) ?? emptyLesson();
      lesson.levels.push(level);
      grouped.set(row.story_id, lesson);
    }
  } catch {
    return grouped;
  }
  return grouped;
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
