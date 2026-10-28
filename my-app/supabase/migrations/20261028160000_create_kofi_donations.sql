-- Public Ko-fi donations. The webhook inserts with the service role after
-- checking KOFI_VERIFICATION_TOKEN. Visitors can read public rows only.

create table public.kofi_donations (
  id uuid primary key default gen_random_uuid(),
  message_id text not null,
  transaction_id text,
  event_type text not null,
  from_name text,
  message text,
  amount numeric(12, 2) not null,
  currency text not null,
  is_public boolean not null default false,
  donated_at timestamptz not null,
  created_at timestamptz not null default pg_catalog.now(),
  constraint kofi_donations_message_id_unique unique (message_id),
  constraint kofi_donations_type_length check (char_length(event_type) between 1 and 40),
  constraint kofi_donations_amount check (amount >= 0 and amount <= 100000),
  constraint kofi_donations_currency check (currency ~ '^[A-Z]{3}$'),
  constraint kofi_donations_name_length check (from_name is null or char_length(from_name) <= 80),
  constraint kofi_donations_message_length check (message is null or char_length(message) <= 500),
  constraint kofi_donations_private_text check (
    is_public or (from_name is null and message is null)
  )
);

comment on table public.kofi_donations is
  'Donations received from the Ko-fi webhook. Names and messages are stored only when the supporter marked the donation public.';

create index kofi_donations_public_idx
  on public.kofi_donations (donated_at desc)
  where is_public;

alter table public.kofi_donations enable row level security;

revoke all on table public.kofi_donations from public, anon, authenticated;
grant select on table public.kofi_donations to anon, authenticated;

create policy "Anyone can read public Ko-fi donations"
  on public.kofi_donations
  for select
  to anon, authenticated
  using (is_public);
