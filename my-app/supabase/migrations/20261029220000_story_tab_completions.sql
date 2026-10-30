-- A learner finishes a story one tab at a time. The story itself
-- can be marked complete only after every tab that the story shows.

create table public.story_tab_completions (
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  tab text not null,
  completed_at timestamptz not null default pg_catalog.now(),
  primary key (story_id, user_id, tab),
  constraint story_tab_completions_tab check (tab in ('story', 'learn', 'words', 'quiz'))
);

comment on table public.story_tab_completions is
  'Which story tabs a learner has finished. The story completion requires all of them.';

alter table public.story_tab_completions enable row level security;

revoke all on table public.story_tab_completions from public, anon;
grant select, insert, delete on table public.story_tab_completions to authenticated;

create policy "Learners read their own tab completions"
  on public.story_tab_completions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners finish a tab on a story they can read"
  on public.story_tab_completions
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.stories where stories.id = story_id)
  );

create policy "Learners clear their own tab completions"
  on public.story_tab_completions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
