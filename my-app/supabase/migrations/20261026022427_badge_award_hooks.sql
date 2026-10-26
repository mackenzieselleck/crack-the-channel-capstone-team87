-- call award_badges() wherever progress that can earn a badge is recorded

-- submit_quiz: grading unchanged, XP is still only awarded on first pass
-- badges are checked on every pass, so a badge added after someone passed is still awarded
create or replace function submit_quiz(p_module_id uuid, p_answers jsonb)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_count       int;
  v_progress    module_progress;
  v_total       int;
  v_correct     int;
  v_score       int;
  v_pass        int;
  v_passed      boolean;
  v_results     jsonb;
  v_first_pass  boolean;
  v_xp_reward   int;
  v_xp_awarded  int;
  v_badges      jsonb;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from modules where id = p_module_id and is_published) then
    raise exception 'module not available';
  end if;

  select count(*) into v_count from module_pages where module_id = p_module_id;
  select pass_mark, xp_reward into v_pass, v_xp_reward from modules where id = p_module_id;

  select * into v_progress
    from module_progress
   where user_id = auth.uid() and module_id = p_module_id;

  if not found or v_progress.pages_completed < v_count then
    raise exception 'finish the reading before taking the test';
  end if;

  select count(*) into v_total from quiz_questions where module_id = p_module_id;
  if v_total = 0 then raise exception 'this module has no test'; end if;

  select jsonb_agg(
           jsonb_build_object(
             'questionId',  q.id,
             'correct',     coalesce((p_answers ->> q.id::text)::int = k.correct_index, false),
             'explanation', q.explanation
           ) order by q.position)
    into v_results
    from quiz_questions q
    join answer_keys k on k.question_id = q.id
   where q.module_id = p_module_id;

  select count(*) filter (where (r ->> 'correct')::boolean)
    into v_correct
    from jsonb_array_elements(v_results) r;
  v_score  := round(100.0 * v_correct / v_total);
  v_passed := v_score >= v_pass;

  v_first_pass := v_passed and v_progress.completed_at is null;

  insert into quiz_attempts (user_id, module_id, score, passed, answers)
  values (auth.uid(), p_module_id, v_score, v_passed, p_answers);

  update module_progress
     set quiz_passed  = quiz_passed or v_passed,
         best_score   = greatest(coalesce(best_score, 0), v_score),
         completed_at = case when v_passed and completed_at is null then now() else completed_at end,
         updated_at   = now()
   where user_id = auth.uid() and module_id = p_module_id;

  if v_first_pass then
    perform set_config('app.trusted_profile_update', 'true', true);
    update profiles set xp = coalesce(xp, 0) + v_xp_reward where id = auth.uid();
    perform set_config('app.trusted_profile_update', 'false', true);
    v_xp_awarded := v_xp_reward;
  else
    v_xp_awarded := 0;
  end if;

  -- after module_progress update, award_badges sees quiz_passed = true
  v_badges := case when v_passed then award_badges(auth.uid()) else '[]'::jsonb end;

  return jsonb_build_object(
    'score', v_score, 'passed', v_passed,
    'correctCount', v_correct, 'total', v_total,
    'results', v_results,
    'xpAwarded', v_xp_awarded,
    'badgesAwarded', v_badges
  );
end $$;

revoke all on function submit_quiz(uuid, jsonb) from public, anon;
grant execute on function submit_quiz(uuid, jsonb) to authenticated;


-- record_daily_solve: unchanged apart from awarding badges after profile update
-- Daily Challenge and streak badges see new last_challenge and best_streak
create or replace function record_daily_solve(p_user_id uuid, p_tier int, p_hints_used int, p_attempt int)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_xp     int;
  v_last   date;
  v_streak int;
  v_best   int;
  v_badges jsonb;
  v_today  date := (now() at time zone 'Australia/Melbourne')::date;
begin
  if p_tier is null or p_tier not between 1 and 3 then raise exception 'invalid tier'; end if;
  if p_attempt is null or p_attempt not between 1 and 3 then raise exception 'invalid attempt number'; end if;
  if p_hints_used is null or p_hints_used not between 0 and 3 then raise exception 'invalid hints used'; end if;

  v_xp := greatest(10, p_tier * 50 - p_hints_used * 10 - (p_attempt - 1) * 15);

  select last_challenge, coalesce(challenge_streak, 0), coalesce(best_streak, 0)
    into v_last, v_streak, v_best
    from profiles where id = p_user_id
    for update;

  if not found then raise exception 'unknown user'; end if;

  if v_last = v_today then
    null;
  elsif v_last = v_today - 1 then
    v_streak := v_streak + 1;
  else
    v_streak := 1;
  end if;

  v_best := greatest(v_best, v_streak);

  perform set_config('app.trusted_profile_update', 'true', true);
  update profiles
     set xp = coalesce(xp, 0) + v_xp,
         challenge_streak = v_streak,
         best_streak = v_best,
         last_challenge = v_today
   where id = p_user_id;
  perform set_config('app.trusted_profile_update', 'false', true);

  v_badges := award_badges(p_user_id);

  return jsonb_build_object('xpAwarded', v_xp, 'streak', v_streak,
                            'bestStreak', v_best, 'badgesAwarded', v_badges);
end $$;

revoke all on function record_daily_solve(uuid, int, int, int) from public, anon, authenticated;
grant execute on function record_daily_solve(uuid, int, int, int) to service_role;


notify pgrst, 'reload schema';