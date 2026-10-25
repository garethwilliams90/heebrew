-- Phase 1: Core Vocabulary Tables
-- Creates the foundation for vocabulary management with words, examples, conjugations, and media

-- =============================================================================
-- vocabulary_words: Master vocabulary list (shared across all users)
-- =============================================================================

create table public.vocabulary_words (
  id uuid primary key default gen_random_uuid(),
  
  -- Identifiers
  word_key text unique not null,
  
  -- Hebrew forms
  hebrew text not null,
  niqqud text,
  hebrew_variations jsonb default '[]'::jsonb,
  
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
  gender text,
  number text,
  binyan text,
  root text,
  
  -- Difficulty & Progression
  difficulty_level integer not null default 1,
  frequency_rank integer,
  
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

comment on table public.vocabulary_words is
  'Master vocabulary list shared across all users. Contains all Hebrew words used in the curriculum.';

comment on column public.vocabulary_words.word_key is
  'Stable unique identifier for the word (e.g., "dag", "shalom"). Used for programmatic lookup.';

comment on column public.vocabulary_words.hebrew_variations is
  'Alternative spellings or forms of the word stored as JSON array.';

comment on column public.vocabulary_words.binyan is
  'For verbs: pa''al, pi''el, hif''il, hitpa''el, nif''al, pu''al, huf''al.';

comment on column public.vocabulary_words.root is
  'Hebrew root letters (shoresh) for the word.';

comment on column public.vocabulary_words.frequency_rank is
  'Word frequency in Hebrew (lower number = more common). Based on corpus data.';

-- Indexes
create index vocabulary_words_word_key_idx on vocabulary_words (word_key);
create index vocabulary_words_difficulty_idx on vocabulary_words (difficulty_level);
create index vocabulary_words_part_of_speech_idx on vocabulary_words (part_of_speech);
create index vocabulary_words_tags_idx on vocabulary_words using gin (tags);
create index vocabulary_words_updated_at_idx on vocabulary_words (updated_at);

-- RLS
alter table public.vocabulary_words enable row level security;

-- Everyone can read vocabulary (it's shared content)
create policy "Anyone can read vocabulary"
  on public.vocabulary_words
  for select
  using (true);

-- =============================================================================
-- word_examples: Example sentences for each word
-- =============================================================================

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

comment on table public.word_examples is
  'Example sentences showing how each word is used in context.';

-- Indexes
create index word_examples_word_id_idx on word_examples (word_id);

-- RLS
alter table public.word_examples enable row level security;

create policy "Anyone can read word examples"
  on public.word_examples
  for select
  using (true);

-- =============================================================================
-- word_conjugations: Verb conjugations (all tenses, persons, genders)
-- =============================================================================

create table public.word_conjugations (
  id uuid primary key default gen_random_uuid(),
  word_id uuid not null references vocabulary_words (id) on delete cascade,
  
  tense text not null,
  person text,
  gender text,
  number text,
  
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

comment on table public.word_conjugations is
  'All conjugated forms of verbs. Used for grammar-aware sentence generation and exercises.';

-- Indexes
create index word_conjugations_word_id_idx on word_conjugations (word_id);
create index word_conjugations_tense_idx on word_conjugations (tense);

-- RLS
alter table public.word_conjugations enable row level security;

create policy "Anyone can read conjugations"
  on public.word_conjugations
  for select
  using (true);

-- =============================================================================
-- word_media: Audio recordings and images per word
-- =============================================================================

create table public.word_media (
  id uuid primary key default gen_random_uuid(),
  word_id uuid not null references vocabulary_words (id) on delete cascade,
  
  media_type text not null,
  media_url text not null,
  
  -- Audio-specific
  speaker text,
  audio_quality text,
  dialect text,
  
  -- Image-specific
  image_type text,
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

comment on table public.word_media is
  'Media assets (audio recordings, images) associated with vocabulary words.';

comment on column public.word_media.speaker is
  'Speaker name or type: "default", "user", specific speaker name.';

comment on column public.word_media.audio_quality is
  'Quality of audio: "native" (native speaker), "synthetic" (TTS), "user" (user-recorded).';

comment on column public.word_media.dialect is
  'Hebrew dialect: "standard", "moroccan", "yemenite", etc.';

-- Indexes
create index word_media_word_id_idx on word_media (word_id);
create index word_media_type_idx on word_media (media_type);
create index word_media_is_default_idx on word_media (word_id, is_default) where is_default = true;

-- RLS
alter table public.word_media enable row level security;

create policy "Anyone can read word media"
  on public.word_media
  for select
  using (true);

-- =============================================================================
-- Storage Buckets for Media
-- =============================================================================

-- Vocabulary audio (native speakers, professional recordings)
insert into storage.buckets (id, name, public)
values ('vocabulary-audio', 'vocabulary-audio', true)
on conflict (id) do nothing;

-- Word images (illustrations, photos)
insert into storage.buckets (id, name, public)
values ('word-images', 'word-images', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can read vocabulary audio"
  on storage.objects for select
  using (bucket_id = 'vocabulary-audio');

create policy "Anyone can read word images"
  on storage.objects for select
  using (bucket_id = 'word-images');

-- Admin users can upload media (future: implement admin role check)
-- For now, authenticated users can upload to test the system
create policy "Authenticated users can upload vocabulary audio"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'vocabulary-audio');

create policy "Authenticated users can upload word images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'word-images');

-- =============================================================================
-- Helper Functions
-- =============================================================================

-- Trigger function to update updated_at timestamp
create or replace function update_vocabulary_words_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply trigger
create trigger vocabulary_words_set_updated_at
  before update on public.vocabulary_words
  for each row
  execute function update_vocabulary_words_updated_at();
