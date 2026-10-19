alter table public.card_progress
  add column ease smallint not null default 250,
  add column interval_minutes integer not null default 0,
  add column due_at timestamptz,
  add column reps smallint not null default 0,
  add column lapses smallint not null default 0,
  add column learning_step smallint not null default 0,
  add column card_state text not null default 'new';

alter table public.card_progress
  add constraint card_progress_ease_range check (ease between 130 and 500),
  add constraint card_progress_interval_minutes_nonnegative check (interval_minutes >= 0),
  add constraint card_progress_reps_nonnegative check (reps >= 0),
  add constraint card_progress_lapses_nonnegative check (lapses >= 0),
  add constraint card_progress_learning_step_nonnegative check (learning_step >= 0),
  add constraint card_progress_card_state check (
    card_state in ('new', 'learning', 'review', 'relearning', 'mastered')
  );

comment on column public.card_progress.ease is
  'Anki ease in percent. 250 means a remembered review waits 2.5 times longer.';

comment on column public.card_progress.interval_minutes is
  'Current wait before the next review, in minutes. Learning steps are short; review steps are whole days.';

comment on column public.card_progress.due_at is
  'When this card should be studied again. Null until it leaves the new state.';

comment on column public.card_progress.reps is
  'Successful scheduling steps after the card first graduated or was answered Good.';

comment on column public.card_progress.lapses is
  'Times a review card was missed. Learning misses do not count.';

comment on column public.card_progress.learning_step is
  'Index into the learning or relearning steps. Unused while the card is in review.';

comment on column public.card_progress.card_state is
  'new, learning, review, relearning, or mastered. Letter practice ignores this and keeps mastery linear.';

comment on column public.card_progress.mastery is
  'Ring stage from 0 (new) to 6 (mastered). For vocabulary cards this is derived from the schedule.';

update public.card_progress
set
  card_state = case
    when mastery <= 0 then 'new'
    when mastery = 1 then 'learning'
    when mastery >= 6 then 'mastered'
    else 'review'
  end,
  learning_step = 0,
  interval_minutes = case mastery
    when 0 then 0
    when 1 then 1
    when 2 then 1440
    when 3 then 4320
    when 4 then 11520
    when 5 then 28800
    else 172800
  end,
  due_at = case
    when mastery <= 1 then null
    when mastery >= 6 then pg_catalog.now() + interval '120 days'
    else pg_catalog.now()
  end,
  reps = case when mastery >= 2 then mastery - 1 else 0 end
where mastery > 0;
