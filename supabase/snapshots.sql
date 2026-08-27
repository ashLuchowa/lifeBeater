-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Creates the table that stores one row per saved day, and locks it down so
-- each signed-in user can only ever see or change their own rows.

create table if not exists public.snapshots (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.snapshots enable row level security;

create policy "Users can view their own snapshots"
  on public.snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert their own snapshots"
  on public.snapshots for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own snapshots"
  on public.snapshots for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own snapshots"
  on public.snapshots for delete
  using (auth.uid() = user_id);
