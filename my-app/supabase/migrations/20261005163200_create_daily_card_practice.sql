create table public.daily_card_practice (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  practiced_on date not null,
  cards integer not null default 0,
  updated_at timestamptz not null default pg_catalog.now(),
  primary key (user_id, practiced_on),
  constraint daily_card_practice_cards_nonnegative check (cards >= 0)
);

comment on table public.daily_card_practice is
  'How many flashcards a learner graded on one local calendar day.';

comment on column public.daily_card_practice.practiced_on is
  'The learner''s local date, sent by the app as YYYY-MM-DD.';

create trigger daily_card_practice_set_updated_at
  before update on public.daily_card_practice
  for each row
  execute function public.set_card_progress_updated_at();

alter table public.daily_card_practice enable row level security;

create policy "Users can read their own daily practice"
  on public.daily_card_practice
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own daily practice"
  on public.daily_card_practice
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own daily practice"
  on public.daily_card_practice
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Adds today's graded cards in one step so two sessions cannot overwrite each other.
create function public.record_daily_cards(practice_date date, amount integer)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if amount is null or amount < 1 or amount > 100 then
    raise exception 'invalid amount';
  end if;

  -- Allow a day either side of UTC so a local date near midnight still counts.
  if practice_date is null
    or practice_date < (pg_catalog.current_date - 1)
    or practice_date > (pg_catalog.current_date + 1) then
    raise exception 'invalid date';
  end if;

  insert into public.daily_card_practice (user_id, practiced_on, cards)
  values (auth.uid(), practice_date, amount)
  on conflict (user_id, practiced_on)
  do update set cards = public.daily_card_practice.cards + excluded.cards;
end;
$$;

revoke all on function public.record_daily_cards(date, integer) from public, anon;
grant execute on function public.record_daily_cards(date, integer) to authenticated;
