-- Run this once in the Supabase SQL Editor, AFTER enabling the pg_cron
-- extension (Database -> Extensions -> search "pg_cron" -> Enable).
--
-- Once a day, for every user who has at least one snapshot, this makes sure
-- "today" (Australia/Perth time) has its own row -- carrying forward their
-- most recent prior snapshot if nothing was saved that day. It never
-- touches a day that already has a row, so real edits are never overwritten.

create or replace function public.fill_missing_daily_snapshots()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'Australia/Perth')::date;
begin
  insert into public.snapshots (user_id, date, data, updated_at)
  select distinct on (s.user_id)
    s.user_id, today, s.data, now()
  from public.snapshots s
  where s.date <= today
  order by s.user_id, s.date desc
  on conflict (user_id, date) do nothing;
end;
$$;

-- Runs at 00:05 Perth time (16:05 UTC) every day -- just after local midnight.
select cron.schedule(
  'fill-missing-daily-snapshots',
  '5 16 * * *',
  $$select public.fill_missing_daily_snapshots();$$
);

-- To remove it later:
-- select cron.unschedule('fill-missing-daily-snapshots');
