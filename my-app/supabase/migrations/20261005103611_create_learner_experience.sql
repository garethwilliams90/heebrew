create table public.learner_experience (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  experience integer not null default 0,
  updated_at timestamptz not null default pg_catalog.now(),
  constraint learner_experience_nonnegative check (experience >= 0)
);

comment on table public.learner_experience is
  'Total study experience for one learner. The app turns this into a level.';

create trigger learner_experience_set_updated_at
  before update on public.learner_experience
  for each row
  execute function public.set_card_progress_updated_at();

alter table public.learner_experience enable row level security;

create policy "Users can read their own experience"
  on public.learner_experience
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own experience"
  on public.learner_experience
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own experience"
  on public.learner_experience
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
