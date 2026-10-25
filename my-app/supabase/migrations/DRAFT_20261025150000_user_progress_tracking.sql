-- Phase 2: User Progress & Personalization Tables (DRAFT - NOT YET APPLIED)
-- 
-- This migration is a DRAFT for planning purposes. It will be applied in Phase 2.
-- 
-- These tables track individual learner progress, custom recordings, and mastery levels.
-- They connect to Phase 1's vocabulary_words table via foreign keys.
--
-- Connection to Phase 1:
-- - user_word_progress.word_id → vocabulary_words.id
-- - user_audio.word_id → vocabulary_words.id  
-- - user_audio.conjugation_id → word_conjugations.id
--
-- Each user has their own progress tracking for every word they encounter.

-- =============================================================================
-- user_word_progress: Per-user vocabulary mastery tracking
-- =============================================================================

create table public.user_word_progress (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id uuid not null references vocabulary_words (id) on delete cascade,
  
  -- Mastery tracking
  mastery_level integer not null default 0, -- 0 (new) to 5 (mastered)
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
  learned_in_lesson_id uuid, -- references lessons (id), added in Phase 3
  
  -- Personalization
  user_notes text,
  user_difficulty_override integer, -- user can mark word as easier/harder
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (user_id, word_id),
  
  constraint user_word_progress_mastery_range 
    check (mastery_level between 0 and 5),
  constraint user_word_progress_ease_factor_range 
    check (ease_factor >= 1.3),
  constraint user_word_progress_times_seen_positive
    check (times_seen >= 0),
  constraint user_word_progress_times_correct_valid
    check (times_correct >= 0 and times_correct <= times_seen),
  constraint user_word_progress_times_incorrect_valid
    check (times_incorrect >= 0 and times_incorrect <= times_seen)
);

comment on table public.user_word_progress is
  'Tracks each user''s individual progress and mastery level for every vocabulary word they encounter.';

comment on column public.user_word_progress.mastery_level is
  '0 = new/unseen, 1 = learning, 2 = familiar, 3 = comfortable, 4 = well-known, 5 = mastered';

comment on column public.user_word_progress.ease_factor is
  'SM-2 spaced repetition ease factor. Starts at 2.5, minimum 1.3. Higher = easier to remember.';

comment on column public.user_word_progress.interval_days is
  'Days until next review (SM-2 algorithm). Grows with each successful review.';

comment on column public.user_word_progress.next_review_date is
  'When this word should next be reviewed. NULL means not scheduled for review yet.';

comment on column public.user_word_progress.user_difficulty_override is
  'User can manually adjust difficulty: -1 (easier), 0 (normal), +1 (harder)';

-- Indexes
create index user_word_progress_user_idx on user_word_progress (user_id);
create index user_word_progress_word_idx on user_word_progress (word_id);
create index user_word_progress_next_review_idx 
  on user_word_progress (user_id, next_review_date)
  where next_review_date is not null;
create index user_word_progress_mastery_idx 
  on user_word_progress (user_id, mastery_level);

-- RLS Policies
alter table public.user_word_progress enable row level security;

create policy "Users can read their own word progress"
  on public.user_word_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own word progress"
  on public.user_word_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own word progress"
  on public.user_word_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own word progress"
  on public.user_word_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =============================================================================
-- user_audio: User's custom audio recordings
-- =============================================================================

create table public.user_audio (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id uuid references vocabulary_words (id) on delete cascade,
  
  audio_url text not null,
  audio_type text not null, -- 'word', 'example', 'conjugation'
  
  -- For conjugations
  conjugation_id uuid references word_conjugations (id) on delete set null,
  
  -- Metadata
  recording_quality text default 'good',
  is_preferred boolean default false, -- user's preferred recording for this word
  
  notes text,
  
  created_at timestamptz not null default now(),
  
  constraint user_audio_type_valid 
    check (audio_type in ('word', 'example', 'conjugation')),
  constraint user_audio_quality_valid 
    check (recording_quality in ('excellent', 'good', 'fair', 'poor')),
  constraint user_audio_word_or_conjugation
    check (
      (audio_type = 'conjugation' and conjugation_id is not null) or
      (audio_type != 'conjugation' and word_id is not null)
    )
);

comment on table public.user_audio is
  'User-recorded audio for vocabulary words. Users can record their own pronunciations for practice.';

comment on column public.user_audio.is_preferred is
  'If true, this is the user''s preferred audio for this word (shown by default when reviewing).';

comment on column public.user_audio.recording_quality is
  'User-rated quality of their own recording.';

-- Indexes
create index user_audio_user_idx on user_audio (user_id);
create index user_audio_word_idx on user_audio (word_id);
create index user_audio_conjugation_idx on user_audio (conjugation_id);
create index user_audio_preferred_idx 
  on user_audio (user_id, word_id, is_preferred)
  where is_preferred = true;

-- RLS Policies
alter table public.user_audio enable row level security;

create policy "Users can read their own audio"
  on public.user_audio
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own audio"
  on public.user_audio
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own audio"
  on public.user_audio
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own audio"
  on public.user_audio
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =============================================================================
-- user_lesson_progress: Track which lessons user has started/completed
-- =============================================================================
-- Note: This table references 'lessons' which will be created in Phase 3
-- For now, this is a forward reference and will be uncommented when Phase 3 is implemented

/*
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
    check (status in ('locked', 'available', 'started', 'completed')),
  constraint user_lesson_progress_score_range
    check (best_score is null or (best_score >= 0 and best_score <= 1))
);

comment on table public.user_lesson_progress is
  'Tracks each user''s progress through the curriculum lessons.';

-- Indexes
create index user_lesson_progress_user_idx on user_lesson_progress (user_id);
create index user_lesson_progress_status_idx on user_lesson_progress (user_id, status);
create index user_lesson_progress_lesson_idx on user_lesson_progress (lesson_id);

-- RLS Policies
alter table public.user_lesson_progress enable row level security;

create policy "Users can read their own lesson progress"
  on public.user_lesson_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own lesson progress"
  on public.user_lesson_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own lesson progress"
  on public.user_lesson_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
*/

-- =============================================================================
-- Storage Bucket for User Audio
-- =============================================================================

-- User-recorded vocabulary audio (user-scoped, private)
insert into storage.buckets (id, name, public)
values ('user-vocabulary-audio', 'user-vocabulary-audio', false)
on conflict (id) do nothing;

-- Storage policies
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

create policy "Users can update their own vocabulary audio"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'user-vocabulary-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own vocabulary audio"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'user-vocabulary-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- Helper Functions for Progress Tracking
-- =============================================================================

-- Calculate next review date using SM-2 spaced repetition algorithm
create or replace function calculate_next_review(
  p_ease_factor float,
  p_interval_days float,
  p_quality integer -- 0-5 rating (0=complete blackout, 5=perfect response)
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
  -- Adjust ease factor based on quality
  v_ease := greatest(
    1.3,
    p_ease_factor + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02))
  );
  
  -- Calculate new interval
  if p_quality < 3 then
    -- Failed - reset to 1 day
    v_interval := 1;
  else
    -- Passed - multiply by ease factor
    if p_interval_days <= 1 then
      v_interval := 1; -- First successful review
    elsif p_interval_days <= 6 then
      v_interval := 6; -- Second successful review
    else
      v_interval := round((p_interval_days * v_ease)::numeric, 1); -- Subsequent reviews
    end if;
  end if;
  
  return query select 
    v_ease,
    v_interval,
    (now() + (v_interval || ' days')::interval)::timestamptz;
end;
$$;

comment on function calculate_next_review is
  'SM-2 spaced repetition algorithm. Returns new ease factor, interval, and next review date based on recall quality (0-5).';

-- Update updated_at timestamp
create or replace function update_user_word_progress_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply trigger
create trigger user_word_progress_set_updated_at
  before update on public.user_word_progress
  for each row
  execute function update_user_word_progress_updated_at();

-- =============================================================================
-- Notes on Integration with Phase 1
-- =============================================================================

-- The progress tracking tables integrate with Phase 1 as follows:
--
-- 1. user_word_progress.word_id → vocabulary_words.id
--    Links each user's progress to the shared vocabulary
--
-- 2. user_audio.word_id → vocabulary_words.id
--    Links user recordings to specific words
--
-- 3. user_audio.conjugation_id → word_conjugations.id
--    Allows recording specific conjugated forms
--
-- 4. word_media.uploaded_by → auth.users.id
--    Tracks which admin user uploaded shared media
--
-- Example query to get a user's progress on a word:
--
-- SELECT 
--   vw.word_key,
--   vw.hebrew,
--   vw.en,
--   uwp.mastery_level,
--   uwp.times_seen,
--   uwp.next_review_date,
--   ua.audio_url as user_audio
-- FROM vocabulary_words vw
-- LEFT JOIN user_word_progress uwp ON uwp.word_id = vw.id AND uwp.user_id = auth.uid()
-- LEFT JOIN user_audio ua ON ua.word_id = vw.id AND ua.user_id = auth.uid() AND ua.is_preferred = true
-- WHERE vw.word_key = 'shalom';
