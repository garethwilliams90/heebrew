-- A short lesson on a story, and the pathway levels that teach the same idea.
-- Visitors read lessons and links on published stories. Owner writes go
-- through the service role. No insert, update, or delete policies.

create table public.story_lessons (
  story_id uuid primary key references public.stories (id) on delete cascade,
  concept_he text not null default '',
  concept_en text not null default '',
  concept_fr text not null default '',
  concept_es text not null default '',
  title_en text not null default '',
  title_fr text not null default '',
  title_es text not null default '',
  body_en text not null default '',
  body_fr text not null default '',
  body_es text not null default '',
  constraint story_lessons_concept_he_length check (char_length(concept_he) <= 80),
  constraint story_lessons_concept_en_length check (char_length(concept_en) <= 120),
  constraint story_lessons_concept_fr_length check (char_length(concept_fr) <= 120),
  constraint story_lessons_concept_es_length check (char_length(concept_es) <= 120),
  constraint story_lessons_title_en_length check (char_length(title_en) <= 160),
  constraint story_lessons_title_fr_length check (char_length(title_fr) <= 160),
  constraint story_lessons_title_es_length check (char_length(title_es) <= 160),
  constraint story_lessons_body_en_length check (char_length(body_en) <= 8000),
  constraint story_lessons_body_fr_length check (char_length(body_fr) <= 8000),
  constraint story_lessons_body_es_length check (char_length(body_es) <= 8000)
);

comment on table public.story_lessons is
  'The learning concept a story teaches: a short title, the lesson, and the Hebrew form of the concept.';

create table public.story_lesson_examples (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  sort_order integer not null default 0,
  hebrew text not null,
  gloss_en text not null default '',
  gloss_fr text not null default '',
  gloss_es text not null default '',
  constraint story_lesson_examples_hebrew_length check (char_length(btrim(hebrew)) between 1 and 200),
  constraint story_lesson_examples_en_length check (char_length(gloss_en) <= 400),
  constraint story_lesson_examples_fr_length check (char_length(gloss_fr) <= 400),
  constraint story_lesson_examples_es_length check (char_length(gloss_es) <= 400),
  constraint story_lesson_examples_sort check (sort_order between 0 and 12)
);

comment on table public.story_lesson_examples is
  'Hebrew examples for a story lesson, with a gloss in each interface language.';

create index story_lesson_examples_story_idx on public.story_lesson_examples (story_id, sort_order);

create table public.story_pathway_links (
  story_id uuid not null references public.stories (id) on delete cascade,
  level_id text not null,
  primary key (story_id, level_id),
  constraint story_pathway_links_level check (level_id ~ '^[a-z0-9-]{1,32}$')
);

comment on table public.story_pathway_links is
  'Pathway level ids a story lesson is attached to. level_id matches the curriculum, such as s3-l0.';

create index story_pathway_links_level_idx on public.story_pathway_links (level_id);

alter table public.story_lessons enable row level security;
alter table public.story_lesson_examples enable row level security;
alter table public.story_pathway_links enable row level security;

revoke all on table public.story_lessons from public, anon, authenticated;
revoke all on table public.story_lesson_examples from public, anon, authenticated;
revoke all on table public.story_pathway_links from public, anon, authenticated;

grant select on table public.story_lessons to anon, authenticated;
grant select on table public.story_lesson_examples to anon, authenticated;
grant select on table public.story_pathway_links to anon, authenticated;

create policy "Anyone can read lessons on published stories"
  on public.story_lessons
  for select
  using (
    exists (
      select 1 from public.stories
      where stories.id = story_lessons.story_id and stories.published
    )
  );

create policy "Anyone can read lesson examples on published stories"
  on public.story_lesson_examples
  for select
  using (
    exists (
      select 1 from public.stories
      where stories.id = story_lesson_examples.story_id and stories.published
    )
  );

create policy "Anyone can read pathway links on published stories"
  on public.story_pathway_links
  for select
  using (
    exists (
      select 1 from public.stories
      where stories.id = story_pathway_links.story_id and stories.published
    )
  );
