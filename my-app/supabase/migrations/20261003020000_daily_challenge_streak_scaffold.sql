-- Scaffolding for the XP/streak half of ADR-014 ("Daily Challenge Attempts, XP and
-- Streaks" - status is still Pending team/client approval as of this migration).
-- There is no Daily Challenge content, grading endpoint, or orchestration-layer route
-- yet (ADR-009/010/011/012), so nothing calls record_daily_solve() currently.

-- learner's best-ever streak, kept separately from the current one (ADR-014: "their
-- best streak will be kept" even after the current streak resets)
alter table profiles add column best_streak int not null default 0;

-- extend the protected-columns guard to also cover best_streak. (the bypass flag checked
-- just below is explained in full in 20261003010000_module_gamification.sql
create or replace function prevent_user_edit_protected_columns()
returns trigger as $$
begin
    
    if coalesce(current_setting('app.trusted_profile_update', true), 'false') = 'true' then
        return new;
    end if;

    if auth.uid() = old.id then
        if new.xp is distinct from old.xp then
            raise exception 'User cannot modify xp directly';
        end if;
        if new.last_challenge is distinct from old.last_challenge then
            raise exception 'User cannot modify last challange date directly';
        end if;
        if new.challenge_streak is distinct from old.challenge_streak then
            raise exception 'User cannot modify challenge streak directly';
        end if;
        if new.best_streak is distinct from old.best_streak then
            raise exception 'User cannot modify best streak directly';
        end if;
        if new.created_at is distinct from old.created_at then
             raise exception 'User cannot modify profile creation date directly';
        end if;
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- records one correct Daily Challenge solve: awards xp and updates the streak.
create or replace function record_daily_solve(p_user_id uuid, p_tier int, p_hints_used int, p_attempt int)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_xp     int;
  v_last   date;
  v_streak int;
  v_best   int;
  v_today  date := current_date;
begin
  if p_tier is null or p_tier < 1 then raise exception 'invalid tier'; end if;
  if p_attempt is null or p_attempt < 1 or p_attempt > 3 then raise exception 'invalid attempt number'; end if;

  -- ADR-014: XP = max(10, tier x 50 - hints used x 10 - (attempt - 1) x 15)
  v_xp := greatest(10, p_tier * 50 - coalesce(p_hints_used, 0) * 10 - (p_attempt - 1) * 15);

  select last_challenge, challenge_streak, best_streak
    into v_last, v_streak, v_best
    from profiles where id = p_user_id;

  if not found then raise exception 'unknown user'; end if;

  if v_last = v_today then
    -- already solved a tier today: this adds xp only, streak does not move (ADR-014)
    null;
  elsif v_last = v_today - 1 then
    v_streak := v_streak + 1;
  else
    -- missed a day, or this is the learner's first ever solve: streak restarts at 1
    v_streak := 1;
  end if;

  v_best := greatest(v_best, v_streak);

  perform set_config('app.trusted_profile_update', 'true', true);
  update profiles
     set xp = xp + v_xp,
         challenge_streak = v_streak,
         best_streak = v_best,
         last_challenge = v_today
   where id = p_user_id;
  perform set_config('app.trusted_profile_update', 'false', true);

  return jsonb_build_object('xpAwarded', v_xp, 'streak', v_streak, 'bestStreak', v_best);
end $$;

-- service role only (ADR-014), not callable from a learner's own session
revoke all on function record_daily_solve(uuid, int, int, int) from public;
revoke all on function record_daily_solve(uuid, int, int, int) from authenticated;
grant execute on function record_daily_solve(uuid, int, int, int) to service_role;