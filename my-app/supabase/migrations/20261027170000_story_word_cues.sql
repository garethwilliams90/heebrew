-- Word timings for highlighting the Hebrew transcript while a story plays.

alter table public.stories
  add column if not exists word_cues jsonb not null default '[]'::jsonb;

alter table public.stories
  drop constraint if exists stories_word_cues_array;

alter table public.stories
  add constraint stories_word_cues_array check (jsonb_typeof(word_cues) = 'array');

comment on column public.stories.word_cues is
  'Start and end times, in milliseconds, for each whitespace-separated Hebrew word, in transcript order.';
