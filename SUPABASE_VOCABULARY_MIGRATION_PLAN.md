# Supabase Vocabulary Migration Plan

## Executive Summary

This plan outlines the migration from JSON-based vocabulary storage to a comprehensive Supabase database architecture. The new system will support:
- Thousands of words with rich metadata
- Per-user vocabulary progress and customization
- Custom audio recordings and future image support
- Dynamic sentence generation with grammatical rules
- Level-specific tailored content
- Scalable architecture for growth

---

## Current State Analysis

### Existing Data Sources

#### 1. **vocabulary.json** (Duolingo Hebrew Bundle)
- **Location:** `public/hebrew_duolingo_app_bundle/vocabulary.json`
- **Size:** 10,664 entries
- **Structure:**
  ```json
  {
    "id": "anki-note-1728227826474",
    "source": {
      "original_fields": {
        "Hebrew": "האם",
        "Niqqud": "הַאִם",
        "Transliteration": "ha'im",
        "Translation": "Is…?",
        "Gender": "",
        "Number": "Singular",
        "Form": "Absolute",
        "Type": "Interrogative",
        "Audio": "[sound:הַאִם-094877ce....mp3]",
        "Tags": "01. Letters 1"
      }
    }
  }
  ```
- **Audio Files:** `public/hebrew_duolingo_app_bundle/audio/` (~5,000+ MP3 files)

#### 2. **catalog.json** (Curated Section 2 Vocabulary)
- **Location:** `lib/learn/words/catalog.json`
- **Size:** 40 words
- **Structure:**
  ```json
  {
    "id": "dag",
    "hebrew": "דג",
    "niqqud": "דָּג",
    "transliteration": "dag",
    "en": "fish",
    "fr": "poisson",
    "es": "pez",
    "gender": "masculine",
    "partOfSpeech": "noun",
    "audio": "audio/-99382a3e0b7e92b0f67707dc4ec391b71115aed2_314f7d06.mp3"
  }
  ```
- **Used By:** Section 2 fundamentals pathway (`section-2-fundamentals.ts`)

#### 3. **Inline TypeScript Levels** (Levels 13-16 + New Levels)
- **Files:** `level-thirteen.ts`, `level-fourteen.ts`, `level-fifteen.ts`, `level-sixteen.ts`
- **New Files:** `level-ahava.ts`, `level-ratzon.ts`, `level-age.ts`, `level-coffee.ts`, `level-yesh-ein.ts`
- **Structure:** Words defined inline using `word()` helper, sentences using `sentence()` helper
- **Approach:** No external data storage, compiled into JavaScript

### Existing Supabase Infrastructure

#### Current Tables
1. **`decks`** - User-created flashcard decks
2. **`deck_edits`** - Edits to built-in decks
3. **`cards`** - Flashcards with English/Hebrew, examples, audio URLs
4. **`card_progress`** - Spaced repetition progress
5. **`card_schedule`** - Next review dates
6. **`learner_experience`** - XP tracking
7. **`daily_card_practice`** - Daily practice records

#### Current Storage Buckets
- **`card-audio`** - User-uploaded audio files (public bucket, user-scoped folders)

---

## Target Architecture

### Design Principles

1. **Separation of Concerns:**
   - Core vocabulary (shared across all users) separate from user progress
   - Metadata separate from media
   - Lesson content separate from user customization

2. **Scalability:**
   - Support for thousands of words without performance degradation
   - Efficient querying by level, difficulty, part of speech, etc.
   - Optimized for common access patterns

3. **Flexibility:**
   - Support multiple sentence generation approaches
   - Extensible metadata without schema changes
   - Easy to add new attributes (images, pronunciation variants, etc.)

4. **User Personalization:**
   - Per-user vocabulary progress tracking
   - Custom audio recordings
   - User notes and mnemonics
   - Difficulty adjustments

---

## Database Schema Design

### Core Vocabulary Tables

#### 1. `vocabulary_words`
**Purpose:** Master vocabulary list, shared across all users

```sql
create table public.vocabulary_words (
  id uuid primary key default gen_random_uuid(),
  
  -- Identifiers
  word_key text unique not null, -- stable identifier like "dag", "shalom"
  
  -- Hebrew forms
  hebrew text not null,
  niqqud text,
  hebrew_variations jsonb default '[]'::jsonb, -- alternative spellings
  
  -- Transliteration & Audio
  transliteration text,
  default_audio_url text,
  pronunciation_notes text,
  
  -- Translations
  en text not null,
  fr text,
  es text,
  
  -- Grammar & Classification
  part_of_speech text not null,
  gender text, -- 'masculine', 'feminine', null
  number text, -- 'singular', 'plural', 'dual', null
  binyan text, -- for verbs: pa'al, pi'el, hif'il, etc.
  root text, -- Hebrew root letters
  
  -- Difficulty & Progression
  difficulty_level integer not null default 1, -- 1-10 scale
  frequency_rank integer, -- word frequency in Hebrew
  
  -- Metadata
  tags text[] default array[]::text[],
  notes text,
  etymology text,
  usage_context text,
  
  -- Tracking
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint vocabulary_words_word_key_length 
    check (char_length(btrim(word_key)) between 1 and 100),
  constraint vocabulary_words_hebrew_length 
    check (char_length(btrim(hebrew)) between 1 and 200),
  constraint vocabulary_words_difficulty_range 
    check (difficulty_level between 1 and 10),
  constraint vocabulary_words_part_of_speech_valid 
    check (part_of_speech in (
      'noun', 'verb', 'adjective', 'adverb', 'pronoun',
      'preposition', 'conjunction', 'particle', 'interjection',
      'phrase', 'question', 'exclamation'
    )),
  constraint vocabulary_words_gender_valid 
    check (gender is null or gender in ('masculine', 'feminine')),
  constraint vocabulary_words_number_valid 
    check (number is null or number in ('singular', 'plural', 'dual'))
);

create index vocabulary_words_word_key_idx on vocabulary_words (word_key);
create index vocabulary_words_difficulty_idx on vocabulary_words (difficulty_level);
create index vocabulary_words_part_of_speech_idx on vocabulary_words (part_of_speech);
create index vocabulary_words_tags_idx on vocabulary_words using gin (tags);
```

#### 2. `word_examples`
**Purpose:** Example sentences for each word

```sql
create table public.word_examples (
  id uuid primary key default gen_random_uuid(),
  word_id uuid not null references vocabulary_words (id) on delete cascade,
  
  hebrew text not null,
  niqqud text,
  en text not null,
  fr text,
  es text,
  
  audio_url text,
  difficulty_level integer default 1,
  
  created_at timestamptz not null default now(),
  
  constraint word_examples_hebrew_length 
    check (char_length(hebrew) between 1 and 500),
  constraint word_examples_difficulty_range 
    check (difficulty_level between 1 and 10)
);

create index word_examples_word_id_idx on word_examples (word_id);
```

#### 3. `word_conjugations`
**Purpose:** Verb conjugations (all tenses, persons, genders)

```sql
create table public.word_conjugations (
  id uuid primary key default gen_random_uuid(),
  word_id uuid not null references vocabulary_words (id) on delete cascade,
  
  tense text not null, -- 'present', 'past', 'future', 'imperative', 'infinitive'
  person text, -- 'first', 'second', 'third'
  gender text, -- 'masculine', 'feminine'
  number text, -- 'singular', 'plural'
  
  hebrew text not null,
  niqqud text,
  transliteration text,
  audio_url text,
  
  created_at timestamptz not null default now(),
  
  constraint word_conjugations_tense_valid 
    check (tense in ('present', 'past', 'future', 'imperative', 'infinitive')),
  constraint word_conjugations_person_valid 
    check (person is null or person in ('first', 'second', 'third')),
  constraint word_conjugations_gender_valid 
    check (gender is null or gender in ('masculine', 'feminine')),
  constraint word_conjugations_number_valid 
    check (number is null or number in ('singular', 'plural')),
  
  unique (word_id, tense, person, gender, number)
);

create index word_conjugations_word_id_idx on word_conjugations (word_id);
```

#### 4. `word_media`
**Purpose:** Multiple audio recordings and images per word

```sql
create table public.word_media (
  id uuid primary key default gen_random_uuid(),
  word_id uuid not null references vocabulary_words (id) on delete cascade,
  
  media_type text not null, -- 'audio', 'image'
  media_url text not null,
  
  -- Audio-specific
  speaker text, -- 'default', 'user', speaker name
  audio_quality text, -- 'native', 'synthetic', 'user'
  dialect text, -- 'standard', 'moroccan', 'yemenite', etc.
  
  -- Image-specific
  image_type text, -- 'illustration', 'photo', 'icon'
  alt_text text,
  
  -- Metadata
  is_default boolean default false,
  uploaded_by uuid references auth.users (id),
  
  created_at timestamptz not null default now(),
  
  constraint word_media_type_valid 
    check (media_type in ('audio', 'image')),
  constraint word_media_audio_quality_valid 
    check (audio_quality is null or audio_quality in ('native', 'synthetic', 'user')),
  constraint word_media_image_type_valid 
    check (image_type is null or image_type in ('illustration', 'photo', 'icon'))
);

create index word_media_word_id_idx on word_media (word_id);
create index word_media_type_idx on word_media (media_type);
```

---

### Lesson & Level Tables

#### 5. `lessons`
**Purpose:** Curriculum structure - sections and levels

```sql
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  
  section_id integer not null,
  level_id integer not null,
  
  title_en text not null,
  title_fr text,
  title_es text,
  
  description_en text,
  description_fr text,
  description_es text,
  
  -- Ordering
  section_order integer not null,
  level_order integer not null,
  
  -- Configuration
  difficulty_level integer not null default 1,
  is_exam boolean default false,
  unlock_requirements jsonb default '{}'::jsonb, -- prerequisites
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (section_id, level_id),
  
  constraint lessons_difficulty_range 
    check (difficulty_level between 1 and 10)
);

create index lessons_section_idx on lessons (section_id, section_order);
create index lessons_level_idx on lessons (level_id);
```

#### 6. `lesson_vocabulary`
**Purpose:** Words assigned to each lesson

```sql
create table public.lesson_vocabulary (
  id uuid primary key default gen_random_uuid(),
  
  lesson_id uuid not null references lessons (id) on delete cascade,
  word_id uuid not null references vocabulary_words (id) on delete cascade,
  
  -- Lesson-specific settings
  introduction_order integer, -- order words are introduced in this lesson
  is_primary boolean default true, -- primary vs. review word
  context_notes text, -- how this word is used in this lesson
  
  created_at timestamptz not null default now(),
  
  unique (lesson_id, word_id)
);

create index lesson_vocabulary_lesson_idx on lesson_vocabulary (lesson_id);
create index lesson_vocabulary_word_idx on lesson_vocabulary (word_id);
```

---

### Sentence Generation System

#### 7. `sentence_templates`
**Purpose:** Templates for dynamic sentence generation

```sql
create table public.sentence_templates (
  id uuid primary key default gen_random_uuid(),
  
  template_key text unique not null,
  
  -- Template structure
  template_pattern text not null, -- e.g., "{subject} {verb} {object}"
  
  -- Translations (with placeholders)
  en_pattern text not null,
  fr_pattern text,
  es_pattern text,
  
  -- Grammar rules
  rules jsonb not null default '{}'::jsonb, -- grammatical constraints
  
  -- Examples:
  -- {
  --   "subject": {"part_of_speech": ["noun", "pronoun"], "number": "singular"},
  --   "verb": {"part_of_speech": "verb", "tense": "present", "agrees_with": "subject"},
  --   "object": {"part_of_speech": "noun", "gender": "any"}
  -- }
  
  difficulty_level integer default 1,
  tags text[] default array[]::text[],
  
  created_at timestamptz not null default now(),
  
  constraint sentence_templates_difficulty_range 
    check (difficulty_level between 1 and 10)
);

create index sentence_templates_difficulty_idx on sentence_templates (difficulty_level);
create index sentence_templates_tags_idx on sentence_templates using gin (tags);
```

#### 8. `generated_sentences`
**Purpose:** Cache of validated generated sentences

```sql
create table public.generated_sentences (
  id uuid primary key default gen_random_uuid(),
  
  template_id uuid references sentence_templates (id) on delete cascade,
  
  hebrew text not null,
  niqqud text,
  en text not null,
  fr text,
  es text,
  
  -- Words used in this sentence
  word_ids uuid[] not null,
  
  -- Validation
  is_validated boolean default false,
  validation_score float, -- 0-1 score from grammar engine
  
  audio_url text,
  difficulty_level integer,
  
  -- Usage tracking
  times_used integer default 0,
  last_used_at timestamptz,
  
  created_at timestamptz not null default now(),
  
  constraint generated_sentences_validation_score_range 
    check (validation_score is null or (validation_score >= 0 and validation_score <= 1))
);

create index generated_sentences_template_idx on generated_sentences (template_id);
create index generated_sentences_validated_idx on generated_sentences (is_validated);
create index generated_sentences_word_ids_idx on generated_sentences using gin (word_ids);
```

#### 9. `lesson_sentences`
**Purpose:** Pre-defined sentences for specific lessons

```sql
create table public.lesson_sentences (
  id uuid primary key default gen_random_uuid(),
  
  lesson_id uuid not null references lessons (id) on delete cascade,
  
  hebrew text not null,
  niqqud text,
  en text not null,
  fr text,
  es text,
  
  audio_url text,
  
  -- Sentence metadata
  word_ids uuid[] not null,
  exercise_type text, -- 'recognize', 'compose', 'speak', etc.
  difficulty_level integer,
  
  sentence_order integer, -- order within lesson
  
  created_at timestamptz not null default now(),
  
  constraint lesson_sentences_exercise_type_valid 
    check (exercise_type in (
      'recognize', 'compose', 'speak', 'read', 'write', 'listen'
    ))
);

create index lesson_sentences_lesson_idx on lesson_sentences (lesson_id, sentence_order);
create index lesson_sentences_word_ids_idx on lesson_sentences using gin (word_ids);
```

---

### User Progress & Personalization Tables

#### 10. `user_word_progress`
**Purpose:** Per-user vocabulary mastery tracking

```sql
create table public.user_word_progress (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id uuid not null references vocabulary_words (id) on delete cascade,
  
  -- Mastery tracking
  mastery_level integer not null default 0, -- 0-5 scale
  times_seen integer default 0,
  times_correct integer default 0,
  times_incorrect integer default 0,
  
  -- Spaced repetition (SM-2 algorithm)
  ease_factor float default 2.5,
  interval_days float default 1,
  next_review_date timestamptz,
  
  -- Context
  first_seen_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  learned_in_lesson_id uuid references lessons (id),
  
  -- Personalization
  user_notes text,
  user_difficulty_override integer, -- user can mark as easier/harder
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (user_id, word_id),
  
  constraint user_word_progress_mastery_range 
    check (mastery_level between 0 and 5),
  constraint user_word_progress_ease_factor_range 
    check (ease_factor >= 1.3)
);

create index user_word_progress_user_idx on user_word_progress (user_id);
create index user_word_progress_word_idx on user_word_progress (word_id);
create index user_word_progress_next_review_idx on user_word_progress (user_id, next_review_date);
```

#### 11. `user_audio`
**Purpose:** User's custom audio recordings

```sql
create table public.user_audio (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id uuid references vocabulary_words (id) on delete cascade,
  
  audio_url text not null,
  audio_type text not null, -- 'word', 'example', 'conjugation'
  
  -- For conjugations
  conjugation_id uuid references word_conjugations (id) on delete set null,
  
  -- Metadata
  recording_quality text default 'good', -- 'excellent', 'good', 'fair', 'poor'
  is_preferred boolean default false, -- user's preferred recording for this word
  
  notes text,
  
  created_at timestamptz not null default now(),
  
  constraint user_audio_type_valid 
    check (audio_type in ('word', 'example', 'conjugation')),
  constraint user_audio_quality_valid 
    check (recording_quality in ('excellent', 'good', 'fair', 'poor'))
);

create index user_audio_user_idx on user_audio (user_id);
create index user_audio_word_idx on user_audio (word_id);
```

#### 12. `user_lesson_progress`
**Purpose:** Track which lessons user has started/completed

```sql
create table public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  
  status text not null default 'locked', -- 'locked', 'available', 'started', 'completed'
  
  started_at timestamptz,
  completed_at timestamptz,
  
  -- Performance
  attempts integer default 0,
  best_score float,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (user_id, lesson_id),
  
  constraint user_lesson_progress_status_valid 
    check (status in ('locked', 'available', 'started', 'completed'))
);

create index user_lesson_progress_user_idx on user_lesson_progress (user_id);
create index user_lesson_progress_status_idx on user_lesson_progress (user_id, status);
```

---

### Storage Buckets

#### New Storage Buckets to Create

```sql
-- Vocabulary audio (native speakers, professional recordings)
insert into storage.buckets (id, name, public)
values ('vocabulary-audio', 'vocabulary-audio', true);

-- User-recorded vocabulary audio
insert into storage.buckets (id, name, public)
values ('user-vocabulary-audio', 'user-vocabulary-audio', false);

-- Word images (illustrations, photos)
insert into storage.buckets (id, name, public)
values ('word-images', 'word-images', true);
```

#### Storage Policies

```sql
-- Vocabulary audio: public read
create policy "Anyone can read vocabulary audio"
  on storage.objects for select
  using (bucket_id = 'vocabulary-audio');

-- User vocabulary audio: user-scoped
create policy "Users can upload their own vocabulary audio"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'user-vocabulary-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read their own vocabulary audio"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'user-vocabulary-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Word images: public read, admin write
create policy "Anyone can read word images"
  on storage.objects for select
  using (bucket_id = 'word-images');
```

---

## Migration Strategy

### Phase 1: Schema Setup (Week 1)

#### Step 1.1: Create New Tables
1. Run migrations to create all new tables in the order listed above
2. Set up RLS policies for each table
3. Create storage buckets
4. Test schema with sample data

#### Step 1.2: Create Helper Functions

```sql
-- Function to calculate next review date (SM-2)
create or replace function calculate_next_review(
  p_ease_factor float,
  p_interval_days float,
  p_quality integer -- 0-5 rating
)
returns table (
  new_ease_factor float,
  new_interval_days float,
  next_review_date timestamptz
)
language plpgsql
as $$
declare
  v_ease float;
  v_interval float;
begin
  -- SM-2 algorithm
  v_ease := greatest(1.3, p_ease_factor + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02)));
  
  if p_quality < 3 then
    v_interval := 1;
  else
    v_interval := p_interval_days * v_ease;
  end if;
  
  return query select 
    v_ease,
    v_interval,
    (now() + (v_interval || ' days')::interval)::timestamptz;
end;
$$;

-- Function to generate sentences from template
create or replace function generate_sentence_from_template(
  p_template_id uuid,
  p_word_ids uuid[]
)
returns jsonb
language plpgsql
as $$
declare
  v_template sentence_templates;
  v_result jsonb;
begin
  -- Get template
  select * into v_template from sentence_templates where id = p_template_id;
  
  -- Validate words match template rules
  -- (Implementation would check grammatical agreement)
  
  -- Build sentence
  -- (Implementation would construct Hebrew and translations)
  
  return v_result;
end;
$$;
```

---

### Phase 2: Data Migration (Week 2-3)

#### Step 2.1: Migrate Duolingo Vocabulary

**Script:** `scripts/migrate-duolingo-vocabulary.mjs`

```javascript
// Pseudocode structure
import vocabulary from './public/hebrew_duolingo_app_bundle/vocabulary.json';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

for (const entry of vocabulary.entries) {
  const fields = entry.source.original_fields;
  
  // Insert into vocabulary_words
  const { data: word } = await supabase
    .from('vocabulary_words')
    .insert({
      word_key: generateKey(fields.Hebrew),
      hebrew: fields.Hebrew,
      niqqud: fields.Niqqud,
      transliteration: fields.Transliteration,
      en: fields.Translation,
      part_of_speech: mapPartOfSpeech(fields.Type),
      gender: fields.Gender || null,
      number: fields.Number || null,
      tags: fields.Tags ? [fields.Tags] : [],
      frequency_rank: calculateRank(entry),
      difficulty_level: calculateDifficulty(entry)
    })
    .select()
    .single();
  
  // Handle audio if present
  if (fields.Audio) {
    const audioPath = extractAudioPath(fields.Audio);
    await supabase
      .from('word_media')
      .insert({
        word_id: word.id,
        media_type: 'audio',
        media_url: audioPath,
        audio_quality: 'native',
        is_default: true
      });
  }
}
```

**Key Decisions:**
- Skip duplicate words (keep highest quality entry)
- Map Anki tags to difficulty levels
- Calculate frequency rank from card statistics
- Copy audio files to Supabase storage (or keep existing URLs)

#### Step 2.2: Migrate catalog.json

**Script:** `scripts/migrate-catalog.mjs`

```javascript
// Much simpler - only 40 words
import catalog from './lib/learn/words/catalog.json';

for (const word of catalog) {
  await supabase
    .from('vocabulary_words')
    .upsert({
      word_key: word.id,
      hebrew: word.hebrew,
      niqqud: word.hebrew, // catalog doesn't have separate niqqud
      transliteration: word.reading,
      en: word.english,
      fr: word.fr || word.english,
      es: word.es || word.english,
      part_of_speech: word.partOfSpeech,
      gender: word.gender,
      difficulty_level: 1, // Section 2 fundamentals = basic
      tags: ['section-2', 'fundamentals']
    }, {
      onConflict: 'word_key'
    });
}
```

#### Step 2.3: Extract Inline TypeScript Vocabulary

For levels 13-16 and new levels, create migration scripts that:

1. Parse the TypeScript files
2. Extract word() calls
3. Insert into database with proper lesson associations

**Script:** `scripts/extract-inline-vocabulary.mjs`

```javascript
// Parse level files and extract vocabulary
const levels = [
  { file: 'level-thirteen.ts', section: 3, level: 13 },
  { file: 'level-ahava.ts', section: 2, level: 5 }, // example
  // ... etc
];

for (const {file, section, level} of levels) {
  // First, create lesson entry
  const { data: lesson } = await supabase
    .from('lessons')
    .insert({
      section_id: section,
      level_id: level,
      title_en: extractTitle(file),
      section_order: section,
      level_order: level
    })
    .select()
    .single();
  
  // Extract words from file (would use AST parser or regex)
  const words = parseWordsFromFile(file);
  
  for (const word of words) {
    // Insert word if doesn't exist
    const { data: vocabWord } = await supabase
      .from('vocabulary_words')
      .upsert({
        word_key: word.id,
        hebrew: word.hebrew,
        en: word.gloss.en,
        fr: word.gloss.fr,
        es: word.gloss.es,
        part_of_speech: inferPartOfSpeech(word),
        difficulty_level: level
      }, {
        onConflict: 'word_key'
      })
      .select()
      .single();
    
    // Link to lesson
    await supabase
      .from('lesson_vocabulary')
      .insert({
        lesson_id: lesson.id,
        word_id: vocabWord.id,
        is_primary: true
      });
  }
  
  // Extract sentences
  const sentences = parseSentencesFromFile(file);
  
  for (const sentence of sentences) {
    await supabase
      .from('lesson_sentences')
      .insert({
        lesson_id: lesson.id,
        hebrew: sentence.hebrew,
        en: sentence.gloss.en,
        fr: sentence.gloss.fr,
        es: sentence.gloss.es,
        word_ids: sentence.word_ids,
        exercise_type: 'compose',
        sentence_order: sentence.index
      });
  }
}
```

---

### Phase 3: Audio Migration (Week 3-4)

#### Step 3.1: Copy Existing Audio Files

```bash
# Upload Duolingo bundle audio to Supabase storage
cd public/hebrew_duolingo_app_bundle/audio

for file in *.mp3; do
  supabase storage upload vocabulary-audio "duolingo/$file" "$file"
done
```

**Update `word_media` table with new URLs:**

```sql
update word_media
set media_url = replace(media_url, 'audio/', 'vocabulary-audio/duolingo/')
where media_url like 'audio/%';
```

#### Step 3.2: User Audio Upload Interface

Create UI components for users to record and upload their own audio:

**Component:** `components/vocabulary/audio-recorder.tsx`

```typescript
// Pseudocode
export function AudioRecorder({ wordId }: { wordId: string }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  async function uploadAudio() {
    if (!audioBlob) return;
    
    // Upload to Supabase storage
    const fileName = `${user.id}/${wordId}-${Date.now()}.mp3`;
    const { data, error } = await supabase.storage
      .from('user-vocabulary-audio')
      .upload(fileName, audioBlob);
    
    if (error) throw error;
    
    // Save reference in database
    await supabase
      .from('user_audio')
      .insert({
        user_id: user.id,
        word_id: wordId,
        audio_url: data.path,
        audio_type: 'word',
        recording_quality: 'good',
        is_preferred: true
      });
  }
  
  return (
    // UI for recording, playback, upload
  );
}
```

---

### Phase 4: Code Refactoring (Week 4-5)

#### Step 4.1: Create Data Access Layer

**File:** `lib/vocabulary/db.ts`

```typescript
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type Word = Database['public']['Tables']['vocabulary_words']['Row'];

export async function getWordById(wordId: string): Promise<Word | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('vocabulary_words')
    .select('*')
    .eq('id', wordId)
    .single();
  return data;
}

export async function getWordsByKey(keys: string[]): Promise<Word[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('vocabulary_words')
    .select('*')
    .in('word_key', keys);
  return data || [];
}

export async function getLessonVocabulary(lessonId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('lesson_vocabulary')
    .select(`
      *,
      word:vocabulary_words (*)
    `)
    .eq('lesson_id', lessonId)
    .order('introduction_order');
  return data || [];
}

export async function getLessonSentences(lessonId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('lesson_sentences')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('sentence_order');
  return data || [];
}

export async function getUserWordProgress(userId: string, wordId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_word_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .single();
  return data;
}

export async function updateWordProgress(
  userId: string,
  wordId: string,
  quality: number // 0-5 rating
) {
  const supabase = createClient();
  
  // Get current progress
  const progress = await getUserWordProgress(userId, wordId);
  
  if (!progress) {
    // First time seeing this word
    return await supabase
      .from('user_word_progress')
      .insert({
        user_id: userId,
        word_id: wordId,
        mastery_level: quality >= 3 ? 1 : 0,
        times_seen: 1,
        times_correct: quality >= 3 ? 1 : 0,
        times_incorrect: quality < 3 ? 1 : 0,
        next_review_date: calculateNextReview(2.5, 1, quality)
      });
  }
  
  // Update existing progress
  const { new_ease_factor, new_interval_days, next_review_date } = 
    await calculateNextReview(
      progress.ease_factor,
      progress.interval_days,
      quality
    );
  
  return await supabase
    .from('user_word_progress')
    .update({
      mastery_level: calculateMasteryLevel(progress, quality),
      times_seen: progress.times_seen + 1,
      times_correct: progress.times_correct + (quality >= 3 ? 1 : 0),
      times_incorrect: progress.times_incorrect + (quality < 3 ? 1 : 0),
      ease_factor: new_ease_factor,
      interval_days: new_interval_days,
      next_review_date,
      last_reviewed_at: new Date()
    })
    .eq('user_id', userId)
    .eq('word_id', wordId);
}
```

#### Step 4.2: Refactor Level Files

**Before (inline):**
```typescript
const shalom = word("שלום", "hello", "bonjour", "hola");
const ani = word("אני", "I", "je", "yo");

const sentences = [
  sentence("greeting", { en: "Hello", fr: "Bonjour", es: "Hola" }, [shalom])
];
```

**After (database):**
```typescript
import { getLessonVocabulary, getLessonSentences } from '@/lib/vocabulary/db';

export async function loadLevelData(lessonId: string) {
  const [vocabulary, sentences] = await Promise.all([
    getLessonVocabulary(lessonId),
    getLessonSentences(lessonId)
  ]);
  
  return {
    vocabulary: vocabulary.map(item => ({
      id: item.word.word_key,
      hebrew: item.word.hebrew,
      gloss: {
        en: item.word.en,
        fr: item.word.fr || item.word.en,
        es: item.word.es || item.word.en
      },
      audio: getWordAudio(item.word.id)
    })),
    sentences: sentences.map(s => ({
      id: s.id,
      hebrew: s.hebrew,
      gloss: {
        en: s.en,
        fr: s.fr || s.en,
        es: s.es || s.en
      },
      words: s.word_ids
    }))
  };
}
```

#### Step 4.3: Update Pathway System

**File:** `lib/learn/pathway/section-2-fundamentals.ts`

Replace `requireWord()` calls with database queries:

```typescript
// Before
const word = requireWord('dag');

// After
const word = await getWordByKey('dag');
```

Add caching layer for performance:

```typescript
import { cache } from 'react';

export const getCachedLessonData = cache(async (lessonId: string) => {
  return await loadLevelData(lessonId);
});
```

---

### Phase 5: Dynamic Sentence Generation (Week 6-8)

#### Step 5.1: Define Grammar Rules Engine

**File:** `lib/vocabulary/grammar-engine.ts`

```typescript
type GrammarRule = {
  type: 'agreement' | 'order' | 'preposition' | 'tense';
  constraint: (words: Word[], context: SentenceContext) => boolean;
  error_message: string;
};

const hebrewGrammarRules: GrammarRule[] = [
  {
    type: 'agreement',
    constraint: (words, context) => {
      // Check subject-verb agreement (gender, number, person)
      const subject = words.find(w => w.role === 'subject');
      const verb = words.find(w => w.role === 'verb');
      
      if (!subject || !verb) return true;
      
      // Get verb conjugation
      const conjugation = getConjugation(verb, {
        person: inferPerson(subject),
        gender: subject.gender,
        number: subject.number,
        tense: context.tense
      });
      
      return conjugation !== null;
    },
    error_message: 'Subject and verb do not agree'
  },
  {
    type: 'order',
    constraint: (words, context) => {
      // Hebrew word order: typically VSO or SVO depending on context
      const roles = words.map(w => w.role);
      
      // Check if order is grammatically valid
      return isValidWordOrder(roles, context.sentence_type);
    },
    error_message: 'Invalid word order'
  },
  {
    type: 'preposition',
    constraint: (words, context) => {
      // Check if verb requires specific preposition
      const verb = words.find(w => w.part_of_speech === 'verb');
      const prep = words.find(w => w.part_of_speech === 'preposition');
      
      if (!verb) return true;
      
      const requiredPrep = getRequiredPreposition(verb);
      if (!requiredPrep) return true;
      
      return prep && prep.word_key === requiredPrep;
    },
    error_message: 'Verb requires specific preposition'
  }
];

export function validateSentence(
  template: SentenceTemplate,
  words: Word[]
): ValidationResult {
  const errors: string[] = [];
  let score = 1.0;
  
  // Check template constraints
  for (const [slot, rules] of Object.entries(template.rules)) {
    const word = words.find(w => w.role === slot);
    
    if (!word) {
      errors.push(`Missing ${slot}`);
      score -= 0.2;
      continue;
    }
    
    // Check part of speech
    if (!rules.part_of_speech.includes(word.part_of_speech)) {
      errors.push(`${slot} must be ${rules.part_of_speech.join(' or ')}`);
      score -= 0.3;
    }
    
    // Check other constraints
    if (rules.gender && word.gender !== rules.gender) {
      errors.push(`${slot} gender mismatch`);
      score -= 0.2;
    }
  }
  
  // Check grammar rules
  for (const rule of hebrewGrammarRules) {
    if (!rule.constraint(words, { tense: 'present', sentence_type: 'declarative' })) {
      errors.push(rule.error_message);
      score -= 0.4;
    }
  }
  
  return {
    is_valid: errors.length === 0 && score >= 0.8,
    score,
    errors
  };
}
```

#### Step 5.2: Sentence Generator

**File:** `lib/vocabulary/sentence-generator.ts`

```typescript
export async function generateSentence(
  templateId: string,
  lessonId: string,
  constraints?: {
    difficulty?: number;
    words?: string[]; // specific words to include
    avoid_words?: string[]; // words to exclude
  }
): Promise<GeneratedSentence | null> {
  const supabase = createClient();
  
  // Get template
  const { data: template } = await supabase
    .from('sentence_templates')
    .select('*')
    .eq('id', templateId)
    .single();
  
  if (!template) return null;
  
  // Get available words for this lesson
  const { data: lessonWords } = await supabase
    .from('lesson_vocabulary')
    .select('word:vocabulary_words(*)')
    .eq('lesson_id', lessonId);
  
  const words = lessonWords?.map(lw => lw.word) || [];
  
  // Try to fill template slots
  const attempts = 100; // max attempts to find valid combination
  
  for (let i = 0; i < attempts; i++) {
    const selectedWords: Word[] = [];
    
    // Fill each slot according to template rules
    for (const [slot, rules] of Object.entries(template.rules)) {
      const candidates = words.filter(w => {
        // Check part of speech
        if (!rules.part_of_speech.includes(w.part_of_speech)) return false;
        
        // Check gender constraint
        if (rules.gender && rules.gender !== 'any' && w.gender !== rules.gender) return false;
        
        // Check number constraint
        if (rules.number && w.number !== rules.number) return false;
        
        // Check if word is already used
        if (selectedWords.some(sw => sw.id === w.id)) return false;
        
        // Check constraints
        if (constraints?.words && !constraints.words.includes(w.word_key)) return false;
        if (constraints?.avoid_words?.includes(w.word_key)) return false;
        
        return true;
      });
      
      if (candidates.length === 0) break;
      
      // Pick random candidate
      const word = candidates[Math.floor(Math.random() * candidates.length)];
      selectedWords.push({ ...word, role: slot });
    }
    
    // Validate sentence
    const validation = validateSentence(template, selectedWords);
    
    if (validation.is_valid) {
      // Construct sentence
      const sentence = await constructSentence(template, selectedWords);
      
      // Save to cache
      await supabase
        .from('generated_sentences')
        .insert({
          template_id: templateId,
          hebrew: sentence.hebrew,
          niqqud: sentence.niqqud,
          en: sentence.en,
          fr: sentence.fr,
          es: sentence.es,
          word_ids: selectedWords.map(w => w.id),
          is_validated: true,
          validation_score: validation.score,
          difficulty_level: calculateDifficulty(selectedWords)
        });
      
      return sentence;
    }
  }
  
  return null; // Failed to generate valid sentence
}

async function constructSentence(
  template: SentenceTemplate,
  words: Word[]
): Promise<GeneratedSentence> {
  // Build Hebrew sentence
  const hebrewParts = [];
  const pattern = template.template_pattern.split(' ');
  
  for (const slot of pattern) {
    const cleanSlot = slot.replace(/[{}]/g, '');
    const word = words.find(w => w.role === cleanSlot);
    
    if (!word) continue;
    
    // For verbs, get correct conjugation
    if (word.part_of_speech === 'verb') {
      const subject = words.find(w => w.role === 'subject');
      const conjugation = await getConjugation(word.id, {
        person: inferPerson(subject),
        gender: subject?.gender,
        number: subject?.number,
        tense: 'present'
      });
      hebrewParts.push(conjugation.hebrew);
    } else {
      hebrewParts.push(word.hebrew);
    }
  }
  
  const hebrew = hebrewParts.join(' ');
  
  // Build translations using template patterns
  const en = template.en_pattern.replace(/{(\w+)}/g, (_, slot) => {
    const word = words.find(w => w.role === slot);
    return word?.en || '';
  });
  
  return {
    hebrew,
    niqqud: hebrew, // Could add niqqud separately
    en,
    fr: en, // Similar replacement for FR
    es: en, // Similar replacement for ES
    word_ids: words.map(w => w.id)
  };
}
```

#### Step 5.3: Seed Sentence Templates

**Migration:** `supabase/migrations/[timestamp]_seed_sentence_templates.sql`

```sql
-- Simple subject-verb-object template
insert into sentence_templates (template_key, template_pattern, en_pattern, fr_pattern, es_pattern, rules, difficulty_level, tags)
values (
  'svo-present',
  '{subject} {verb} {object}',
  '{subject} {verb} {object}',
  '{subject} {verb} {object}',
  '{subject} {verb} {object}',
  '{
    "subject": {"part_of_speech": ["noun", "pronoun"], "number": "singular"},
    "verb": {"part_of_speech": "verb", "tense": "present", "agrees_with": "subject"},
    "object": {"part_of_speech": "noun"}
  }'::jsonb,
  1,
  array['basic', 'declarative']
);

-- With preposition (את ה)
insert into sentence_templates (template_key, template_pattern, en_pattern, fr_pattern, es_pattern, rules, difficulty_level, tags)
values (
  'svo-present-et-ha',
  '{subject} {verb} את ה{object}',
  '{subject} {verb} the {object}',
  '{subject} {verb} le/la {object}',
  '{subject} {verb} el/la {object}',
  '{
    "subject": {"part_of_speech": ["noun", "pronoun"], "number": "singular"},
    "verb": {"part_of_speech": "verb", "tense": "present", "takes_et": true},
    "object": {"part_of_speech": "noun", "definite": true}
  }'::jsonb,
  2,
  array['intermediate', 'definite-object']
);

-- Many more templates for different patterns...
```

---

### Phase 6: UI Updates (Week 7-8)

#### Step 6.1: Vocabulary Browser

**Component:** `app/vocabulary/page.tsx`

```typescript
export default async function VocabularyPage() {
  const supabase = createServerClient();
  
  const { data: words } = await supabase
    .from('vocabulary_words')
    .select('*')
    .order('word_key')
    .limit(50);
  
  return (
    <div>
      <h1>Vocabulary Browser</h1>
      <VocabularyList words={words} />
    </div>
  );
}
```

#### Step 6.2: Admin Panel for Content Management

**Component:** `app/admin/vocabulary/page.tsx`

```typescript
// Admin interface to:
// - Add/edit words
// - Upload audio/images
// - Create sentence templates
// - Generate and validate sentences
// - Assign words to lessons
```

---

## Performance Considerations

### Caching Strategy

1. **React Server Components:** Use `cache()` for lesson data
2. **CDN Caching:** Public audio/images served via CDN
3. **Database:** Add indexes on frequently queried columns
4. **Redis:** Cache generated sentences, word lookups

### Query Optimization

```sql
-- Composite index for user progress queries
create index user_word_progress_user_next_review_idx 
  on user_word_progress (user_id, next_review_date)
  where next_review_date is not null;

-- Index for sentence generation
create index vocabulary_words_lesson_lookup_idx 
  on vocabulary_words (part_of_speech, difficulty_level, gender)
  where difficulty_level <= 5;

-- GIN index for array searches
create index generated_sentences_word_ids_idx 
  on generated_sentences using gin (word_ids);
```

---

## Testing Strategy

### Unit Tests

```typescript
// test/vocabulary/grammar-engine.test.ts
describe('Grammar Engine', () => {
  it('validates subject-verb agreement', async () => {
    const words = [
      { role: 'subject', gender: 'masculine', number: 'singular' },
      { role: 'verb', part_of_speech: 'verb' }
    ];
    
    const result = validateSentence(template, words);
    expect(result.is_valid).toBe(true);
  });
  
  it('rejects invalid word order', () => {
    // ...
  });
});
```

### Integration Tests

```typescript
// test/vocabulary/sentence-generation.test.ts
describe('Sentence Generation', () => {
  it('generates valid sentence from template', async () => {
    const sentence = await generateSentence(templateId, lessonId);
    expect(sentence).not.toBeNull();
    expect(sentence.hebrew).toMatch(/[\u0590-\u05FF]+/);
  });
});
```

### Migration Tests

```typescript
// test/migration/data-integrity.test.ts
describe('Data Migration', () => {
  it('migrates all Duolingo words', async () => {
    const count = await supabase
      .from('vocabulary_words')
      .select('count');
    
    expect(count).toBeGreaterThan(10000);
  });
  
  it('preserves audio references', async () => {
    const wordsWithAudio = await supabase
      .from('word_media')
      .select('count')
      .eq('media_type', 'audio');
    
    expect(wordsWithAudio).toBeGreaterThan(5000);
  });
});
```

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 1. Schema Setup | Week 1 | Database tables, storage buckets, RLS policies |
| 2. Data Migration | Week 2-3 | All vocabulary in Supabase, audio copied |
| 3. Audio Migration | Week 3-4 | Storage setup, user upload interface |
| 4. Code Refactoring | Week 4-5 | Data access layer, level files updated |
| 5. Sentence Generation | Week 6-8 | Grammar engine, template system, validation |
| 6. UI Updates | Week 7-8 | Vocabulary browser, admin panel |
| **Total** | **8 weeks** | Full migration complete |

---

## Rollback Plan

In case of issues:

1. **Keep JSON files** in place during migration
2. **Feature flag** to switch between JSON and database
3. **Parallel running** - both systems active during transition
4. **Backup database** before each phase
5. **Monitoring** - log any errors, track performance

```typescript
// Feature flag example
const USE_DATABASE = process.env.NEXT_PUBLIC_USE_DB_VOCABULARY === 'true';

export async function getVocabulary(lessonId: string) {
  if (USE_DATABASE) {
    return await getLessonVocabulary(lessonId);
  } else {
    return await loadFromJSON(lessonId);
  }
}
```

---

## Success Metrics

- ✅ All 10,664 Duolingo words migrated
- ✅ Zero data loss
- ✅ Page load time < 2s for lesson data
- ✅ Sentence generation < 100ms
- ✅ Grammar validation accuracy > 95%
- ✅ User audio upload success rate > 98%
- ✅ Zero downtime during migration

---

## Conclusion

This migration represents a fundamental architectural shift that will enable:
- **Scalability:** Support thousands of users with personalized progress
- **Flexibility:** Easy content updates without code deployments
- **Quality:** User audio recordings for accurate pronunciation
- **Intelligence:** Dynamic sentence generation with grammatical rules
- **Growth:** Foundation for images, advanced exercises, AI features

The phased approach minimizes risk while delivering incremental value. By week 8, the system will be fully migrated with robust testing and monitoring in place.
