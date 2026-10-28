-- Story recordings play in the browser from a public object URL.
-- Signing them on the server failed wherever the service role key is absent,
-- so visitors saw the story with no audio. Draft paths stay unlisted.

update storage.buckets
set public = true
where id = 'story-audio';

comment on table public.stories is
  'Owner-recorded stories. Audio lives in the story-audio bucket; audio_path is the object key.';
