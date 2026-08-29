-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Creates the table behind the Income / Expense page: one row per user per
-- financial year, and locks it down so each signed-in user can only ever see
-- or change their own rows.
--
-- This is deliberately separate from `snapshots`. Snapshots are per-day and
-- carry the whole dashboard forward; the ledger is per financial year and has
-- no day dimension at all.

create table if not exists public.ledgers (
  user_id uuid not null references auth.users(id) on delete cascade,
  fy text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, fy)
);

alter table public.ledgers enable row level security;

create policy "Users can view their own ledgers"
  on public.ledgers for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ledgers"
  on public.ledgers for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ledgers"
  on public.ledgers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own ledgers"
  on public.ledgers for delete
  using (auth.uid() = user_id);
