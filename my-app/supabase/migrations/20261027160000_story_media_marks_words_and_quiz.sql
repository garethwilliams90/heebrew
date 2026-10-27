-- Media, personal marks, labeled story words, and a comprehension quiz.
-- Visitors can read rows that belong to a published story or post.
-- Owner writes still go through the service role. Hearts and completion
-- are the signed-in learner's own rows.

create table public.content_media (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories (id) on delete cascade,
  post_id uuid references public.blog_posts (id) on delete cascade,
  kind text not null,
  storage_path text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default pg_catalog.now(),
  constraint content_media_one_parent check (
    (story_id is not null and post_id is null)
    or (story_id is null and post_id is not null)
  ),
  constraint content_media_kind check (kind in ('image', 'gif', 'video')),
  constraint content_media_path check (
    storage_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif|mp4|webm)$'
  ),
  constraint content_media_alt_length check (char_length(alt_text) <= 200),
  constraint content_media_sort check (sort_order between 0 and 100)
);

comment on table public.content_media is
  'Images, GIFs, and videos for a story or a blog post. Files live in the private content-media bucket.';

create index content_media_story_idx on public.content_media (story_id, sort_order);
create index content_media_post_idx on public.content_media (post_id, sort_order);

alter table public.content_media enable row level security;

revoke all on table public.content_media from public, anon, authenticated;
grant select on table public.content_media to anon, authenticated;

create policy "Anyone can read media on published stories and posts"
  on public.content_media
  for select
  using (
    exists (
      select 1 from public.stories
      where stories.id = content_media.story_id and stories.published
    )
    or exists (
      select 1 from public.blog_posts
      where blog_posts.id = content_media.post_id and blog_posts.published
    )
  );

create table public.story_hearts (
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now(),
  primary key (story_id, user_id)
);

comment on table public.story_hearts is
  'A learner marking a published story they want to keep.';

alter table public.story_hearts enable row level security;

revoke all on table public.story_hearts from public, anon;
grant select, insert, delete on table public.story_hearts to authenticated;

create policy "Learners read their own hearts"
  on public.story_hearts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners heart a story they can read"
  on public.story_hearts
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.stories where stories.id = story_id)
  );

create policy "Learners remove their own hearts"
  on public.story_hearts
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create table public.story_completions (
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  completed_at timestamptz not null default pg_catalog.now(),
  primary key (story_id, user_id)
);

comment on table public.story_completions is
  'A learner marking a story complete.';

alter table public.story_completions enable row level security;

revoke all on table public.story_completions from public, anon;
grant select, insert, delete on table public.story_completions to authenticated;

create policy "Learners read their own completions"
  on public.story_completions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners complete a story they can read"
  on public.story_completions
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.stories where stories.id = story_id)
  );

create policy "Learners clear their own completions"
  on public.story_completions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create table public.story_words (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  phrase text not null,
  label text not null,
  start_ms integer not null,
  end_ms integer not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default pg_catalog.now(),
  constraint story_words_phrase_length check (char_length(btrim(phrase)) between 1 and 200),
  constraint story_words_label_length check (char_length(btrim(label)) between 1 and 200),
  constraint story_words_span check (
    start_ms >= 0
    and end_ms > start_ms
    and end_ms - start_ms <= 60000
  ),
  constraint story_words_sort check (sort_order between 0 and 100)
);

comment on table public.story_words is
  'Hebrew phrases the owner labeled, with a slice of the story recording.';

create index story_words_story_idx on public.story_words (story_id, sort_order);

alter table public.story_words enable row level security;

revoke all on table public.story_words from public, anon, authenticated;

create policy "Story words stay on the server"
  on public.story_words
  for select
  to authenticated
  using (false);

create table public.story_questions (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  prompt text not null,
  sort_order integer not null default 0,
  constraint story_questions_prompt_length check (char_length(btrim(prompt)) between 1 and 400),
  constraint story_questions_sort check (sort_order between 0 and 40)
);

comment on table public.story_questions is
  'Comprehension questions the owner wrote for a story.';

create index story_questions_story_idx on public.story_questions (story_id, sort_order);

create table public.story_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.story_questions (id) on delete cascade,
  label text not null,
  correct boolean not null default false,
  sort_order integer not null default 0,
  constraint story_choices_label_length check (char_length(btrim(label)) between 1 and 200),
  constraint story_choices_sort check (sort_order between 0 and 8)
);

comment on table public.story_choices is
  'Multiple-choice answers. At most one choice per question is correct.';

create unique index story_choices_one_correct
  on public.story_choices (question_id)
  where correct;

create index story_choices_question_idx on public.story_choices (question_id, sort_order);

alter table public.story_questions enable row level security;
alter table public.story_choices enable row level security;

revoke all on table public.story_questions from public, anon, authenticated;
revoke all on table public.story_choices from public, anon, authenticated;
grant select on table public.story_questions to anon, authenticated;
grant select on table public.story_choices to anon, authenticated;

create policy "Anyone can read questions on published stories"
  on public.story_questions
  for select
  using (
    exists (
      select 1 from public.stories
      where stories.id = story_questions.story_id and stories.published
    )
  );

create policy "Anyone can read choices on published stories"
  on public.story_choices
  for select
  using (
    exists (
      select 1
      from public.story_questions
      join public.stories on stories.id = story_questions.story_id
      where story_questions.id = story_choices.question_id
        and stories.published
    )
  );

insert into storage.buckets (id, name, public)
values ('content-media', 'content-media', false)
on conflict (id) do update set public = false;
