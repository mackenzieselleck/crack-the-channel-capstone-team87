-- Fixes the Daily Challenge XP/streak scaffolding from previous migration to better fit Daily Challenges
-- Changes:
--   1. record_daily_solve uses Melbourne date, not current_date (the database runs in UTC,
--      so solves before ~10-11am Melbourne time would record against previous day).
--   2. record_daily_solve validates tier (1-3) and hints used (0-3), not just the minimum.
--   3. record_daily_solve locks profile row while updating, so two simultaneous
--      solves can't occur
--   4. record_daily_solve treats null xp / streak values as 0, so they can't wipe the total
--   5. anon is explicitly revoked: Supabase grants execute on public schema functions to
--      anon by default, and revoking from "public" alone won't remove that grant
--   6. prevent_user_edit_protected_columns gets a fixed search_path


-- 6. Harden the protected-columns trigger function without changing its body.
alter function prevent_user_edit_protected_columns() set search_path = public;


-- 1-4. Replace record_daily_solve. Same name, parameters and return type, so
-- create or replace updates it in place and existing privileges carry over
create or replace function record_daily_solve(p_user_id uuid, p_tier int, p_hints_used int, p_attempt int)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_xp     int;
  v_last   date;
  v_streak int;
  v_best   int;
  -- a "day" is the Melbourne date
  v_today  date := (now() at time zone 'Australia/Melbourne')::date;
begin
  -- Validate every input, even though only the server can call
  if p_tier is null or p_tier not between 1 and 3 then raise exception 'invalid tier'; end if;
  if p_attempt is null or p_attempt not between 1 and 3 then raise exception 'invalid attempt number'; end if;
  if p_hints_used is null or p_hints_used not between 0 and 3 then raise exception 'invalid hints used'; end if;

  -- XP = max(10, tier x 50 - hints used x 10 - (attempt - 1) x 15)
  v_xp := greatest(10, p_tier * 50 - p_hints_used * 10 - (p_attempt - 1) * 15);

  -- Lock row so two simultaneous solves can't both occur
  select last_challenge, coalesce(challenge_streak, 0), coalesce(best_streak, 0)
    into v_last, v_streak, v_best
    from profiles where id = p_user_id
    for update;

  if not found then raise exception 'unknown user'; end if;

  if v_last = v_today then
    null;                         -- already solved a tier today? xp only, streak unchanged
  elsif v_last = v_today - 1 then
    v_streak := v_streak + 1;     -- solved yesterday: streak continues
  else
    v_streak := 1;                -- missed a day, or first ever solve: streak restarts at 1
  end if;

  v_best := greatest(v_best, v_streak);

  -- allow this trusted update past the protected columns trigger, then switch the flag off
  perform set_config('app.trusted_profile_update', 'true', true);
  update profiles
     set xp = coalesce(xp, 0) + v_xp,
         challenge_streak = v_streak,
         best_streak = v_best,
         last_challenge = v_today
   where id = p_user_id;
  perform set_config('app.trusted_profile_update', 'false', true);

  return jsonb_build_object('xpAwarded', v_xp, 'streak', v_streak, 'bestStreak', v_best);
end $$;


-- 5. Service role only: not callable by logged out visitors
-- or from a learner's own session (authenticated)
revoke all on function record_daily_solve(uuid, int, int, int) from public, anon, authenticated;
grant execute on function record_daily_solve(uuid, int, int, int) to service_role;