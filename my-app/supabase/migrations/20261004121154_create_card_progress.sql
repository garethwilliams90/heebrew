create table public.card_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  deck_id text not null,
  card_id text not null,
  mastery smallint not null default 0,
  last_practiced_at timestamptz,
  practice_count integer not null default 0,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint card_progress_deck_id_length check (char_length(deck_id) between 1 and 80),
  constraint card_progress_card_id_length check (char_length(card_id) between 1 and 128),
  constraint card_progress_mastery_range check (mastery between 0 and 6),
  constraint card_progress_practice_count_nonnegative check (practice_count >= 0),
  constraint card_progress_user_deck_card_key unique (user_id, deck_id, card_id)
);

comment on table public.card_progress is
  'One row per user, deck, and card. Mastery is 0 (new) through 6 (memorised).';

comment on column public.card_progress.deck_id is
  'App deck id, such as nature or hebrew-from-scratch.';

comment on column public.card_progress.card_id is
  'Card id within the deck, such as tree or hfs-1.';

comment on column public.card_progress.mastery is
  'Familiarity from 0 (new) to 6 (memorised).';

comment on column public.card_progress.last_practiced_at is
  'When the user last graded this card. Null until the first practice.';

comment on column public.card_progress.practice_count is
  'How many times the user has graded this card.';

create index card_progress_user_deck_idx
  on public.card_progress (user_id, deck_id);

create function public.set_card_progress_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.set_card_progress_updated_at() from public, anon, authenticated;

create trigger card_progress_set_updated_at
  before update on public.card_progress
  for each row
  execute function public.set_card_progress_updated_at();

alter table public.card_progress enable row level security;

create policy "Users can read their own card progress"
  on public.card_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own card progress"
  on public.card_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own card progress"
  on public.card_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own card progress"
  on public.card_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);
