insert into storage.buckets (id, name, public)
values ('lesson-audio', 'lesson-audio', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read lesson audio" on storage.objects;
create policy "Public can read lesson audio"
  on storage.objects
  for select
  to public
  using (bucket_id = 'lesson-audio');

drop policy if exists "Temporary lesson audio upload" on storage.objects;
drop policy if exists "Temporary lesson audio replace" on storage.objects;
