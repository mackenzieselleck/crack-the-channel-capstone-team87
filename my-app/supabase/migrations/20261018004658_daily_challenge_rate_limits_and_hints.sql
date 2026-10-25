
-- Server-tracked hint reveals
-- hints_revealed increments by POST /api/challenge/hint
alter table public.daily_challenges
  add column if not exists hints_revealed smallint not null default 0
  check (hints_revealed between 0 and 3);

-- browser can still read its own challenge rows, but NOT the hints column
revoke select on public.daily_challenges from anon, authenticated;
grant select (id, user_id, date, type, difficulty, input_kind, prompt_data, options,
              title, scenario, task, hints_revealed, used_fallback, created_at)
  on public.daily_challenges to authenticated;

-- Keep feedback and XP with each attempt so result page can be reloaded
alter table public.challenge_attempts
  add column if not exists feedback text,
  add column if not exists xp_awarded int;

-- Rate limiting used by lib/rateLimit.ts for both route limits and LLM prompting
create table if not exists public.rate_limits (
  key text not null,                         
  window_start timestamptz not null,
  hits int not null default 0,
  primary key (key, window_start)
);
alter table public.rate_limits enable row level security;   -- no policies = no client access

-- Count one hit and report whether it is within limit
create or replace function public.rate_limit_hit(p_key text, p_limit int, p_window_seconds int)
returns table (allowed boolean, retry_after int)
language plpgsql security definer set search_path = public as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  n int;
begin
  insert into rate_limits as r (key, window_start, hits) values (p_key, w, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning r.hits into n;
  -- Tidy key's expired windows so table stays small
  delete from rate_limits where rate_limits.key = p_key and rate_limits.window_start < w;
  allowed := n <= p_limit;
  retry_after := case when n <= p_limit then 0
                 else greatest(1, ceil(extract(epoch from (w + make_interval(secs => p_window_seconds) - now())))::int) end;
  return next;
end $$;
revoke all on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;

-- Make API pick up new columns and function
notify pgrst, 'reload schema';