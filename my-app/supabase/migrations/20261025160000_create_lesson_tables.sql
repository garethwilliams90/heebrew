-- Phase 3: Lesson & Curriculum Tables
-- Creates the curriculum structure: sections, levels, lesson vocabulary, and sentences

-- =============================================================================
-- lessons: Curriculum structure
-- =============================================================================

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
  unlock_requirements jsonb default '{}'::jsonb,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (section_id, level_id),
  
  constraint lessons_difficulty_range 
    check (difficulty_level between 1 and 10)
);

comment on table public.lessons is
  'Curriculum lessons organized by section and level. Defines the learning pathway.';

comment on column public.lessons.section_id is
  'Section number (1 = Aleph-Bet, 2 = Fundamentals, 3 = Intermediate, etc.)';

comment on column public.lessons.level_id is
  'Level number within the curriculum (can span sections)';

comment on column public.lessons.unlock_requirements is
  'JSON object defining prerequisites: {"requires_level": 12, "requires_exam": 1}';

-- Indexes
create index lessons_section_idx on lessons (section_id, section_order);
create index lessons_level_idx on lessons (level_id);

-- RLS
alter table public.lessons enable row level security;

create policy "Anyone can read lessons"
  on public.lessons
  for select
  using (true);

-- =============================================================================
-- lesson_vocabulary: Words assigned to each lesson
-- =============================================================================

create table public.lesson_vocabulary (
  id uuid primary key default gen_random_uuid(),
  
  lesson_id uuid not null references lessons (id) on delete cascade,
  word_id uuid not null references vocabulary_words (id) on delete cascade,
  
  -- Lesson-specific settings
  introduction_order integer,
  is_primary boolean default true,
  context_notes text,
  
  created_at timestamptz not null default now(),
  
  unique (lesson_id, word_id)
);

comment on table public.lesson_vocabulary is
  'Maps vocabulary words to lessons. Defines which words are taught in each lesson.';

comment on column public.lesson_vocabulary.introduction_order is
  'Order in which words are introduced within the lesson (1, 2, 3...). NULL for review words.';

comment on column public.lesson_vocabulary.is_primary is
  'True if this is a new word being taught. False if reviewing a word from previous lessons.';

-- Indexes
create index lesson_vocabulary_lesson_idx on lesson_vocabulary (lesson_id);
create index lesson_vocabulary_word_idx on lesson_vocabulary (word_id);
create index lesson_vocabulary_lesson_order_idx 
  on lesson_vocabulary (lesson_id, introduction_order)
  where introduction_order is not null;

-- RLS
alter table public.lesson_vocabulary enable row level security;

create policy "Anyone can read lesson vocabulary"
  on public.lesson_vocabulary
  for select
  using (true);

-- =============================================================================
-- lesson_sentences: Pre-defined sentences for lessons
-- =============================================================================

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
  exercise_type text,
  difficulty_level integer,
  
  sentence_order integer,
  
  created_at timestamptz not null default now(),
  
  constraint lesson_sentences_exercise_type_valid 
    check (exercise_type is null or exercise_type in (
      'recognize', 'compose', 'speak', 'read', 'write', 'listen', 'comprehend'
    )),
  constraint lesson_sentences_difficulty_range
    check (difficulty_level is null or difficulty_level between 1 and 10)
);

comment on table public.lesson_sentences is
  'Pre-defined sentences used in lesson exercises. Maps sentences to lessons and tracks which words are used.';

comment on column public.lesson_sentences.word_ids is
  'Array of vocabulary_words.id UUIDs that make up this sentence (in order).';

comment on column public.lesson_sentences.exercise_type is
  'Type of exercise this sentence is used in.';

-- Indexes
create index lesson_sentences_lesson_idx on lesson_sentences (lesson_id, sentence_order);
create index lesson_sentences_word_ids_idx on lesson_sentences using gin (word_ids);
create index lesson_sentences_exercise_type_idx on lesson_sentences (lesson_id, exercise_type);

-- RLS
alter table public.lesson_sentences enable row level security;

create policy "Anyone can read lesson sentences"
  on public.lesson_sentences
  for select
  using (true);

-- =============================================================================
-- Triggers
-- =============================================================================

create trigger lessons_set_updated_at
  before update on public.lessons
  for each row
  execute function update_vocabulary_words_updated_at();

-- =============================================================================
-- Helper Functions
-- =============================================================================

-- Get all words for a lesson (including those in sentences)
create or replace function get_lesson_words(p_lesson_id uuid)
returns table (
  word_id uuid,
  word_key text,
  hebrew text,
  en text,
  is_primary boolean
)
language sql
stable
as $$
  -- Words explicitly assigned to lesson
  select 
    vw.id,
    vw.word_key,
    vw.hebrew,
    vw.en,
    lv.is_primary
  from lesson_vocabulary lv
  join vocabulary_words vw on vw.id = lv.word_id
  where lv.lesson_id = p_lesson_id
  
  union
  
  -- Words used in lesson sentences but not explicitly assigned
  select distinct
    vw.id,
    vw.word_key,
    vw.hebrew,
    vw.en,
    false as is_primary
  from lesson_sentences ls
  cross join unnest(ls.word_ids) as word_id
  join vocabulary_words vw on vw.id = word_id
  where ls.lesson_id = p_lesson_id
    and not exists (
      select 1 from lesson_vocabulary lv
      where lv.lesson_id = p_lesson_id
        and lv.word_id = vw.id
    );
$$;

comment on function get_lesson_words is
  'Returns all words associated with a lesson, either directly via lesson_vocabulary or indirectly via lesson_sentences.';

-- Get sentences for a lesson by exercise type
create or replace function get_lesson_sentences_by_type(
  p_lesson_id uuid,
  p_exercise_type text default null
)
returns table (
  id uuid,
  hebrew text,
  en text,
  audio_url text,
  word_count integer
)
language sql
stable
as $$
  select 
    id,
    hebrew,
    en,
    audio_url,
    array_length(word_ids, 1) as word_count
  from lesson_sentences
  where lesson_id = p_lesson_id
    and (p_exercise_type is null or exercise_type = p_exercise_type)
  order by sentence_order nulls last, id;
$$;

comment on function get_lesson_sentences_by_type is
  'Returns sentences for a lesson, optionally filtered by exercise type.';
