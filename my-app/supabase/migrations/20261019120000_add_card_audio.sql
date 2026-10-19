alter table public.cards
  add column audio_url text,
  add column example_audio_url text;

alter table public.cards
  add constraint cards_audio_url_length check (
    audio_url is null or char_length(audio_url) between 1 and 1000
  ),
  add constraint cards_example_audio_url_length check (
    example_audio_url is null or char_length(example_audio_url) between 1 and 1000
  );

comment on column public.cards.audio_url is
  'Recording of the Hebrew word, when the card was imported with audio.';

comment on column public.cards.example_audio_url is
  'Recording of the Hebrew example, when the card was imported with one.';

insert into storage.buckets (id, name, public)
values ('card-audio', 'card-audio', true)
on conflict (id) do nothing;

create policy "Users can upload their own card audio"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'card-audio'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can read their own card audio"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'card-audio'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can delete their own card audio"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'card-audio'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
