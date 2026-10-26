/**
 * Data Access Layer for Vocabulary System
 * 
 * Provides typed functions to query vocabulary, lessons, and user progress
 * from Supabase. This layer abstracts the database queries and provides
 * a clean API for the application.
 */

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

// Type aliases for convenience
type VocabularyWord = Database['public']['Tables']['vocabulary_words']['Row'];
type WordExample = Database['public']['Tables']['word_examples']['Row'];
type WordConjugation = Database['public']['Tables']['word_conjugations']['Row'];
type WordMedia = Database['public']['Tables']['word_media']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];
type LessonVocabulary = Database['public']['Tables']['lesson_vocabulary']['Row'];
type LessonSentence = Database['public']['Tables']['lesson_sentences']['Row'];

// Extended types with relations
export type WordWithMedia = VocabularyWord & {
  media?: WordMedia[];
  examples?: WordExample[];
  conjugations?: WordConjugation[];
};

export type LessonWithVocabulary = Lesson & {
  vocabulary?: (LessonVocabulary & { word: VocabularyWord })[];
  sentences?: LessonSentence[];
};

// ============================================================================
// Vocabulary Queries
// ============================================================================

/**
 * Get a single word by its stable key identifier
 */
export async function getWordByKey(wordKey: string): Promise<VocabularyWord | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('vocabulary_words')
    .select('*')
    .eq('word_key', wordKey)
    .single();
  
  if (error) {
    console.error('Error fetching word:', error);
    return null;
  }
  
  return data;
}

/**
 * Get a word by UUID
 */
export async function getWordById(wordId: string): Promise<VocabularyWord | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('vocabulary_words')
    .select('*')
    .eq('id', wordId)
    .single();
  
  if (error) {
    console.error('Error fetching word by ID:', error);
    return null;
  }
  
  return data;
}

/**
 * Get multiple words by their keys
 */
export async function getWordsByKeys(wordKeys: string[]): Promise<VocabularyWord[]> {
  if (wordKeys.length === 0) return [];
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('vocabulary_words')
    .select('*')
    .in('word_key', wordKeys);
  
  if (error) {
    console.error('Error fetching words:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a word with all its media (audio, images)
 */
export async function getWordWithMedia(wordKey: string): Promise<WordWithMedia | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('vocabulary_words')
    .select(`
      *,
      media:word_media(*),
      examples:word_examples(*),
      conjugations:word_conjugations(*)
    `)
    .eq('word_key', wordKey)
    .single();
  
  if (error) {
    console.error('Error fetching word with media:', error);
    return null;
  }
  
  return data as WordWithMedia;
}

/**
 * Get the default audio URL for a word
 */
export async function getWordAudio(wordId: string): Promise<string | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('word_media')
    .select('media_url')
    .eq('word_id', wordId)
    .eq('media_type', 'audio')
    .eq('is_default', true)
    .single();
  
  if (error || !data) {
    // Fallback: get any audio for this word
    const { data: anyAudio } = await supabase
      .from('word_media')
      .select('media_url')
      .eq('word_id', wordId)
      .eq('media_type', 'audio')
      .limit(1)
      .single();
    
    return anyAudio?.media_url || null;
  }
  
  return data.media_url;
}

/**
 * Lesson pictures live in word_media with media_type "image".
 * A row marked is_default wins when a word has more than one picture.
 */
export async function getWordImagesByKeys(wordKeys: string[]): Promise<Record<string, string>> {
  const keys = [...new Set(wordKeys.filter((key) => key.length > 0))];
  if (keys.length === 0) return {};

  try {
    const supabase = createClient();
    const { data: words, error } = await supabase.from("vocabulary_words").select("id, word_key").in("word_key", keys);
    if (error || !words?.length) return {};

    const { data: media, error: mediaError } = await supabase
      .from("word_media")
      .select("word_id, media_url, is_default")
      .in(
        "word_id",
        words.map((word) => word.id),
      )
      .eq("media_type", "image");
    if (mediaError || !media) return {};

    const keyById = new Map(words.map((word) => [word.id, word.word_key]));
    const images: Record<string, string> = {};
    for (const row of media) {
      const key = keyById.get(row.word_id);
      if (!key) continue;
      if (!images[key] || row.is_default) images[key] = row.media_url;
    }
    return images;
  } catch {
    return {};
  }
}

/**
 * Search words by Hebrew text or English translation
 */
export async function searchWords(query: string, limit = 20): Promise<VocabularyWord[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('vocabulary_words')
    .select('*')
    .or(`hebrew.ilike.%${query}%,en.ilike.%${query}%`)
    .limit(limit);
  
  if (error) {
    console.error('Error searching words:', error);
    return [];
  }
  
  return data || [];
}

// ============================================================================
// Lesson Queries
// ============================================================================

/**
 * Get a lesson by section and level
 */
export async function getLesson(sectionId: number, levelId: number): Promise<Lesson | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('section_id', sectionId)
    .eq('level_id', levelId)
    .single();
  
  if (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
  
  return data;
}

/**
 * Get a lesson with all its vocabulary and sentences
 */
export async function getLessonWithContent(lessonId: string): Promise<LessonWithVocabulary | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      vocabulary:lesson_vocabulary(
        *,
        word:vocabulary_words(*)
      ),
      sentences:lesson_sentences(*)
    `)
    .eq('id', lessonId)
    .single();
  
  if (error) {
    console.error('Error fetching lesson with content:', error);
    return null;
  }
  
  return data as LessonWithVocabulary;
}

/**
 * Get vocabulary for a specific lesson
 */
export async function getLessonVocabulary(lessonId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('lesson_vocabulary')
    .select(`
      *,
      word:vocabulary_words(*)
    `)
    .eq('lesson_id', lessonId)
    .order('introduction_order', { ascending: true, nullsFirst: false });
  
  if (error) {
    console.error('Error fetching lesson vocabulary:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get sentences for a specific lesson
 */
export async function getLessonSentences(
  lessonId: string,
  exerciseType?: string
): Promise<LessonSentence[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('lesson_sentences')
    .select('*')
    .eq('lesson_id', lessonId);
  
  if (exerciseType) {
    query = query.eq('exercise_type', exerciseType);
  }
  
  const { data, error } = await query.order('sentence_order', { ascending: true, nullsFirst: false });
  
  if (error) {
    console.error('Error fetching lesson sentences:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get all lessons in a section
 */
export async function getSectionLessons(sectionId: number): Promise<Lesson[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('section_id', sectionId)
    .order('section_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching section lessons:', error);
    return [];
  }
  
  return data || [];
}

// ============================================================================
// User Progress Queries (Phase 2 tables - when applied)
// ============================================================================

/**
 * Get user's progress on a specific word
 */
export async function getUserWordProgress(userId: string, wordId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_word_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .single();
  
  if (error) {
    // No progress yet - that's okay
    return null;
  }
  
  return data;
}

/**
 * Update user's progress on a word after review
 */
export async function updateWordProgress(
  userId: string,
  wordId: string,
  quality: number // 0-5 rating (0=blackout, 5=perfect)
) {
  const supabase = createClient();
  
  // Get current progress
  const progress = await getUserWordProgress(userId, wordId);
  
  if (!progress) {
    // First time seeing this word
    const { data, error } = await supabase
      .from('user_word_progress')
      .insert({
        user_id: userId,
        word_id: wordId,
        mastery_level: quality >= 3 ? 1 : 0,
        times_seen: 1,
        times_correct: quality >= 3 ? 1 : 0,
        times_incorrect: quality < 3 ? 1 : 0,
        ease_factor: 2.5,
        interval_days: 1,
        next_review_date: new Date(Date.now() + 86400000) // Tomorrow
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating word progress:', error);
      return null;
    }
    
    return data;
  }
  
  // Update existing progress using SM-2 algorithm
  // This would call the calculate_next_review database function
  // For now, simplified version:
  const newMastery = quality >= 3 
    ? Math.min(progress.mastery_level + 1, 5)
    : Math.max(progress.mastery_level - 1, 0);
  
  const { data, error } = await supabase
    .from('user_word_progress')
    .update({
      mastery_level: newMastery,
      times_seen: progress.times_seen + 1,
      times_correct: progress.times_correct + (quality >= 3 ? 1 : 0),
      times_incorrect: progress.times_incorrect + (quality < 3 ? 1 : 0),
      last_reviewed_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating word progress:', error);
    return null;
  }
  
  return data;
}

/**
 * Get words due for review for a user
 */
export async function getWordsForReview(userId: string, limit = 20) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_word_progress')
    .select(`
      *,
      word:vocabulary_words(*)
    `)
    .eq('user_id', userId)
    .not('next_review_date', 'is', null)
    .lte('next_review_date', new Date().toISOString())
    .order('next_review_date', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching words for review:', error);
    return [];
  }
  
  return data || [];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert VocabularyWord to BasicWord format (used by existing code)
 */
export function toBasicWord(word: VocabularyWord) {
  return {
    id: word.word_key,
    hebrew: word.niqqud || word.hebrew,
    english: word.en,
    reading: word.transliteration || word.word_key,
    partOfSpeech: word.part_of_speech as any,
    gender: word.gender as any,
  };
}

/**
 * Build a sentence-like structure from database data
 */
export function buildSentenceFromLesson(
  sentence: LessonSentence,
  words: Map<string, VocabularyWord>
) {
  return {
    id: sentence.id,
    hebrew: sentence.hebrew,
    gloss: {
      en: sentence.en,
      fr: sentence.fr || sentence.en,
      es: sentence.es || sentence.en,
    },
    words: sentence.word_ids.map((wordId: string, index: number) => {
      const word = words.get(wordId);
      return {
        id: `${sentence.id}-${index}`,
        hebrew: word?.hebrew || '',
        gloss: {
          en: word?.en || '',
          fr: word?.fr || word?.en || '',
          es: word?.es || word?.en || '',
        },
        audio: word ? null : undefined, // Would fetch from word_media
      };
    }),
  };
}
