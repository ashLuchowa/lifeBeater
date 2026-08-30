-- Run this ONCE in the Supabase SQL Editor to move snapshots from per-day to
-- per-week. It converts the existing table in place; it does not drop anything.
--
-- A week is identified by its Monday, matching the app and the income ledger.
-- Where several days of the same week were saved, the LATEST day wins — that is
-- the most recent state you had, which is what the week should show.
--
-- Take a backup first (Database -> Backups) if you care about the daily detail:
-- this collapses it, and weekly cannot be turned back into daily.

begin;

-- 1. Collapse each week down to its most recent day.
delete from public.snapshots s
using public.snapshots newer
where s.user_id = newer.user_id
  and date_trunc('week', s.date) = date_trunc('week', newer.date)
  and s.date < newer.date;

-- 2. Move every surviving row onto its Monday.
update public.snapshots
set date = date_trunc('week', date)::date
where date <> date_trunc('week', date)::date;

-- 3. Rename the column so it says what it now holds. The primary key follows
--    the column automatically, so (user_id, week_start) stays unique.
alter table public.snapshots rename column date to week_start;

commit;

-- 4. Replace the daily fill job with a weekly one. Drop the old schedule first;
--    it targets a column that no longer exists.
select cron.unschedule('fill-missing-daily-snapshots');

drop function if exists public.fill_missing_daily_snapshots();

create or replace function public.fill_missing_weekly_snapshots()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  this_week date := date_trunc('week', (now() at time zone 'Australia/Perth')::date)::date;
begin
  insert into public.snapshots (user_id, week_start, data, updated_at)
  select distinct on (s.user_id)
    s.user_id, this_week, s.data, now()
  from public.snapshots s
  where s.week_start <= this_week
  order by s.user_id, s.week_start desc
  on conflict (user_id, week_start) do nothing;
end;
$$;

-- Mondays at 00:05 Perth time (Sunday 16:05 UTC), just after the week turns.
select cron.schedule(
  'fill-missing-weekly-snapshots',
  '5 16 * * 0',
  $$select public.fill_missing_weekly_snapshots();$$
);

-- To remove it later:
-- select cron.unschedule('fill-missing-weekly-snapshots');
