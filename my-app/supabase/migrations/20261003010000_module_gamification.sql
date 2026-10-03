-- FR-19 (Learning Points/XP) + FR-20 (Badges and Achievements): a learner earns XP and
-- any badge tied to a module the first time they pass that module's test. Per ADR-014,
-- these rules must be enforced server-side only (never computed in the browser).

-- xp awarded on first pass; configurable per module rather than a single fixed value
alter table modules add column xp_reward int not null default 100 check (xp_reward >= 0);

-- ties a badge to its corresponding module when it's completed, nullable so a future badge can
-- be tied to something other than a single module (e.g. a streak or pathway milestone)
alter table badges add column module_id uuid references modules(id) on delete cascade;
create index if not exists badges_module_id_idx on badges(module_id);

-- WHY THIS FUNCTION NEEDS A BYPASS FLAG:
--
-- The trigger below exists to stop a user from cheating, e.g. opening dev tools and
-- running something like supabase.from('profiles').update({ xp: 999999 }), straight from
-- their own browser ("the client"). Postgres runs this trigger automatically on every
-- single update to the profiles table, no matter where that update came from, so on its
-- own it would also block a legit update, like the one submit_quiz() needs to make
-- after a learner actually passes a module and genuinely earns XP.
--
-- To tell those two cases apart, submit_quiz() leaves a temporary note for the trigger
-- to find, right before it updates profiles:
--
--   set_config('app.trusted_profile_update', 'true', true)
--
-- Think of this as a sticky note stuck to the current database transaction that lets
-- it know that the next update is trusted. The trigger checks for that note first;
-- if it's there, the trigger just approves the update immediately. If it's not there 
-- (which is the case for every normal request from the browser), the trigger falls through
-- to the real checks further down and blocks the attempt. The note is removed again straight
-- after (and would disappear on its own once the transaction ends, so this "trusted" state 
-- never lingers or leaks into anything else.

create or replace function prevent_user_edit_protected_columns()
returns trigger as $$
begin
    -- if the update is trusted skip every check below and allow this update.
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
        if new.created_at is distinct from old.created_at then
             raise exception 'User cannot modify profile creation date directly';
        end if;
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- grades the test, ensures all learning module pages were read prior to completion,
-- and now also awards module-completion xp + badges the first time the module is passed
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

  -- xp/badges are only ever awarded the first time this module is passed (FR-19/FR-20) 
  -- retaking an already-passed test, or failing again, awards nothing further
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
    update profiles set xp = xp + v_xp_reward where id = auth.uid();
    perform set_config('app.trusted_profile_update', 'false', true);

    insert into user_badges (user_id, badge_id)
    select auth.uid(), b.id from badges b where b.module_id = p_module_id;

    select coalesce(
             jsonb_agg(jsonb_build_object('id', b.id, 'title', b.title, 'description', b.description)),
             '[]'::jsonb
           )
      into v_badges
      from badges b where b.module_id = p_module_id;

    v_xp_awarded := v_xp_reward;
  else
    v_badges := '[]'::jsonb;
    v_xp_awarded := 0;
  end if;

  return jsonb_build_object(
    'score', v_score, 'passed', v_passed,
    'correctCount', v_correct, 'total', v_total,
    'results', v_results,
    'xpAwarded', v_xp_awarded,
    'badgesAwarded', v_badges
  );
end $$;

-- creates a badge attached to the current placeholder module, 
-- purely so the feature has something concrete to actually award.
-- Passing the Placeholder Module's quiz should now give both the 
-- XP and this one badge, to confirm this works before the real 
-- modules are added later.
insert into badges (title, description, icon_url, threshold, module_id)
select 'Placeholder Badge', 'Completed the Placeholder Module test with a passing score.', null, 'module_pass:test-module', m.id
from modules m where m.slug = 'test-module';