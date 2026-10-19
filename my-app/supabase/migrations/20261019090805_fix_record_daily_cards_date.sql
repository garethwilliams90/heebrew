-- current_date is a SQL keyword. pg_catalog.current_date is parsed as a column
-- of a table named pg_catalog, which raises 42P01 when the function runs.
create or replace function public.record_daily_cards(practice_date date, amount integer)
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

  if practice_date is null
    or practice_date < (current_date - 1)
    or practice_date > (current_date + 1) then
    raise exception 'invalid date';
  end if;

  insert into public.daily_card_practice (user_id, practiced_on, cards)
  values (auth.uid(), practice_date, amount)
  on conflict (user_id, practiced_on)
  do update set cards = public.daily_card_practice.cards + excluded.cards;
end;
$$;
