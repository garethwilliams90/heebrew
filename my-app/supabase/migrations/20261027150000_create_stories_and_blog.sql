-- Stories and the owner blog.
-- Visitors may read published rows. Writes happen only through the service role
-- after the server has checked the signed-in owner. No insert, update, or
-- delete policies are created on purpose.

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  title text not null,
  hebrew_transcript text not null,
  transcript_en text not null default '',
  transcript_fr text not null default '',
  transcript_es text not null default '',
  audio_path text not null,
  published boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint stories_level check (level in ('beginner', 'intermediate', 'advanced')),
  constraint stories_title_length check (char_length(btrim(title)) between 1 and 120),
  constraint stories_hebrew_length check (char_length(hebrew_transcript) between 1 and 20000),
  constraint stories_en_length check (char_length(transcript_en) <= 20000),
  constraint stories_fr_length check (char_length(transcript_fr) <= 20000),
  constraint stories_es_length check (char_length(transcript_es) <= 20000),
  constraint stories_audio_path check (
    audio_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp3|m4a|wav|webm)$'
  ),
  constraint stories_published_copy check (
    not published
    or (
      char_length(btrim(hebrew_transcript)) > 0
      and char_length(btrim(transcript_en)) > 0
      and char_length(btrim(transcript_fr)) > 0
      and char_length(btrim(transcript_es)) > 0
    )
  )
);

comment on table public.stories is
  'Owner-recorded stories. Audio lives in the private story-audio bucket; audio_path is the object key.';

create index stories_level_idx on public.stories (level, created_at desc);

create trigger stories_set_updated_at
  before update on public.stories
  for each row
  execute function public.set_card_progress_updated_at();

alter table public.stories enable row level security;

revoke all on table public.stories from public, anon, authenticated;
grant select on table public.stories to anon, authenticated;

create policy "Anyone can read published stories"
  on public.stories
  for select
  using (published = true);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  body text not null,
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint blog_posts_slug_unique unique (slug),
  constraint blog_posts_slug_shape check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(slug) between 1 and 96
  ),
  constraint blog_posts_title_length check (char_length(btrim(title)) between 1 and 160),
  constraint blog_posts_body_length check (char_length(btrim(body)) between 1 and 20000),
  constraint blog_posts_published_time check (not published or published_at is not null)
);

comment on table public.blog_posts is
  'Posts written by the app owner. Other people can read published posts only.';

create index blog_posts_published_idx on public.blog_posts (published_at desc) where published;

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row
  execute function public.set_card_progress_updated_at();

alter table public.blog_posts enable row level security;

revoke all on table public.blog_posts from public, anon, authenticated;
grant select on table public.blog_posts to anon, authenticated;

create policy "Anyone can read published posts"
  on public.blog_posts
  for select
  using (published = true);

insert into storage.buckets (id, name, public)
values ('story-audio', 'story-audio', false)
on conflict (id) do update set public = false;
