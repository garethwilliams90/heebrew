create table public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint decks_title_length check (char_length(btrim(title)) between 1 and 80),
  constraint decks_description_length check (char_length(description) <= 400)
);

comment on table public.decks is
  'Decks created by a learner.';

create table public.deck_edits (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  deck_id text not null,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  primary key (user_id, deck_id),
  constraint deck_edits_builtin check (deck_id in ('nature', 'hebrew-from-scratch')),
  constraint deck_edits_title_length check (char_length(btrim(title)) between 1 and 80),
  constraint deck_edits_description_length check (char_length(description) <= 400)
);

comment on table public.deck_edits is
  'A learner''s title and description for a built-in deck.';

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  deck_id text not null,
  source_card_id text,
  english text not null,
  part_of_speech text not null,
  example text not null default '',
  hebrew text not null,
  hebrew_example text not null default '',
  gender text,
  hidden boolean not null default false,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint cards_deck_id_length check (char_length(deck_id) between 1 and 80),
  constraint cards_source_card_id_length check (
    source_card_id is null or char_length(source_card_id) between 1 and 128
  ),
  constraint cards_english_length check (char_length(btrim(english)) between 1 and 200),
  constraint cards_hebrew_length check (char_length(btrim(hebrew)) between 1 and 200),
  constraint cards_example_length check (char_length(example) <= 400),
  constraint cards_hebrew_example_length check (char_length(hebrew_example) <= 400),
  constraint cards_part_of_speech check (
    part_of_speech in (
      'noun',
      'verb',
      'adjective',
      'adverb',
      'pronoun',
      'preposition',
      'conjunction',
      'particle',
      'interjection',
      'phrase',
      'question'
    )
  ),
  constraint cards_gender check (gender is null or gender in ('masculine', 'feminine')),
  constraint cards_user_deck_source_key unique (user_id, deck_id, source_card_id)
);

comment on table public.cards is
  'Learner cards. A source_card_id marks an edit or removal of a built-in card.';

comment on column public.cards.source_card_id is
  'Built-in card id this row replaces. Null for a card the learner added.';

comment on column public.cards.hidden is
  'True when the learner removed a built-in card.';

create index cards_user_deck_idx on public.cards (user_id, deck_id);

create trigger decks_set_updated_at
  before update on public.decks
  for each row
  execute function public.set_card_progress_updated_at();

create trigger deck_edits_set_updated_at
  before update on public.deck_edits
  for each row
  execute function public.set_card_progress_updated_at();

create trigger cards_set_updated_at
  before update on public.cards
  for each row
  execute function public.set_card_progress_updated_at();

alter table public.decks enable row level security;
alter table public.deck_edits enable row level security;
alter table public.cards enable row level security;

create policy "Users can read their own decks"
  on public.decks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own decks"
  on public.decks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own decks"
  on public.decks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own decks"
  on public.decks
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read their own deck edits"
  on public.deck_edits
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own deck edits"
  on public.deck_edits
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own deck edits"
  on public.deck_edits
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own deck edits"
  on public.deck_edits
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read their own cards"
  on public.cards
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own cards"
  on public.cards
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own cards"
  on public.cards
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own cards"
  on public.cards
  for delete
  to authenticated
  using (auth.uid() = user_id);
