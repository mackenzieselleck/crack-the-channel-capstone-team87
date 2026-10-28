-- Profiles: gamification logic (FR-19 XP, FR-20 badges, ADR-014 daily challenge XP/streaks)
-- Covers QA cases PROG-06, PROG-08, PROG-09 plus the protected-columns guard on profiles.
--
-- Run with:  npx supabase start   (once, needs Docker running)
--            npx supabase test db
--
-- Everything runs inside one transaction that is rolled back at the end, so no test data is left behind.

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
grant usage on schema extensions to anon, authenticated, service_role;

select plan(55);

-- ---------------------------------------------------------------------------
-- Fixtures (created as postgres, before switching into a learner's session)
-- ---------------------------------------------------------------------------

-- three learners; inserting into auth.users fires handle_new_user(), which creates their profile rows
insert into auth.users (id, email) values
  ('a0000000-0000-0000-0000-000000000001', 'quiz-learner@pgtap.test'),
  ('a0000000-0000-0000-0000-000000000002', 'other-learner@pgtap.test'),
  ('a0000000-0000-0000-0000-000000000003', 'daily-learner@pgtap.test');

-- a published module with 2 reading pages and 10 questions (so 60%, 70% etc. are exact scores)
insert into modules (id, slug, title, position, pass_mark, xp_reward, is_published)
values ('b0000000-0000-0000-0000-000000000001', 'pgtap-module', 'pgTAP Module', 999, 70, 120, true);

insert into module_pages (module_id, position, title) values
  ('b0000000-0000-0000-0000-000000000001', 0, 'Page 1'),
  ('b0000000-0000-0000-0000-000000000001', 1, 'Page 2');

-- the correct answer to every question is option 0
insert into quiz_questions (id, module_id, position, prompt, options, explanation)
select ('c0000000-0000-0000-0000-' || lpad(g::text, 12, '0'))::uuid,
       'b0000000-0000-0000-0000-000000000001', g, 'Question ' || g, '["right", "wrong"]'::jsonb, 'Because.'
  from generate_series(0, 9) g;

insert into answer_keys (question_id, correct_index)
select id, 0 from quiz_questions where module_id = 'b0000000-0000-0000-0000-000000000001';

insert into badges (id, slug, title, description, threshold, module_id, artboard, icon_url, position)
values ('d0000000-0000-0000-0000-000000000001', 'pgtap-badge', 'pgTAP Badge', 'Passed the pgTAP module.',
        'module_pass:pgtap-module', 'b0000000-0000-0000-0000-000000000001',
        'PgTapBadge', '/images/badges/pgtap-badge.png', 999);

-- learner 1 has finished the reading, learner 2 has only read 1 of 2 pages
insert into module_progress (user_id, module_id, pages_completed) values
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 2),
  ('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 1);

-- answers with the first n questions right and the rest wrong, i.e. a score of n x 10%
-- Security definer allows the test fixture to read protected answer keys.
create function public.pgtap_answers(n int) returns jsonb language sql security definer set search_path = public as $$
  select jsonb_object_agg(id, case when position < n then 0 else 1 end)
    from quiz_questions where module_id = 'b0000000-0000-0000-0000-000000000001'
$$;
grant execute on function public.pgtap_answers(int) to authenticated, anon;

-- Expected badge response comes from the known fixture/catalogue row, not from
-- award_badges(), so the assertion still checks the function's returned shape.
create function public.pgtap_badge_json(p_slug text) returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'id', id, 'slug', slug, 'title', title, 'description', description,
    'artboard', artboard, 'iconUrl', icon_url)
  from badges where slug = p_slug
$$;
grant execute on function public.pgtap_badge_json(text) to authenticated, service_role;

-- ===========================================================================
-- 1. Module completion XP + badges via submit_quiz()  (PROG-06, PROG-08, PROG-09)
-- ===========================================================================

set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated"}';

-- below the pass mark (60%)
select is(
  submit_quiz('b0000000-0000-0000-0000-000000000001', pgtap_answers(6)) - 'results',
  '{"score": 60, "passed": false, "correctCount": 6, "total": 10, "xpAwarded": 0, "badgesAwarded": []}'::jsonb,
  'scoring 60% fails and awards no XP or badges'
);
select is((select xp from profiles where id = auth.uid()), 0, 'a failed attempt leaves profile XP at 0');
select is((select count(*)::int from user_badges where user_id = auth.uid()), 0, 'a failed attempt awards no badge');

-- exactly the pass mark (70%) counts as a pass
select is(
  submit_quiz('b0000000-0000-0000-0000-000000000001', pgtap_answers(7)) - 'results',
  jsonb_build_object(
    'score', 70, 'passed', true, 'correctCount', 7, 'total', 10, 'xpAwarded', 120,
    'badgesAwarded', jsonb_build_array(pgtap_badge_json('pgtap-badge'))
  ),
  'scoring exactly 70% passes and reports the module XP reward and badge'
);
select is((select xp from profiles where id = auth.uid()), 120, 'first pass adds the module''s xp_reward to the profile');
select results_eq(
  'select badge_id from user_badges where user_id = auth.uid()',
  $$values ('d0000000-0000-0000-0000-000000000001'::uuid)$$,
  'first pass awards the badge tied to the module'
);
select is(
  current_setting('app.trusted_profile_update', true), 'false',
  'trusted-update flag is switched back off after awarding XP'
);

-- retaking an already passed module awards nothing more, even with a higher score
select is(
  (submit_quiz('b0000000-0000-0000-0000-000000000001', pgtap_answers(10)) - 'results')
    @> '{"score": 100, "passed": true, "xpAwarded": 0, "badgesAwarded": []}'::jsonb,
  true,
  'retaking a passed module at 100% awards 0 XP and no badges'
);
select is((select xp from profiles where id = auth.uid()), 120, 'retake does not add XP again');
select is((select count(*)::int from user_badges where user_id = auth.uid()), 1, 'retake does not duplicate the badge');

-- failing after a pass keeps what was already earned
select is(
  (submit_quiz('b0000000-0000-0000-0000-000000000001', pgtap_answers(0)) - 'results')
    @> '{"passed": false, "xpAwarded": 0}'::jsonb,
  true,
  'failing after a pass awards nothing'
);
select is((select xp from profiles where id = auth.uid()), 120, 'failing after a pass does not take XP away');
select is((select quiz_passed from module_progress where user_id = auth.uid()), true,
  'failing after a pass keeps the module marked as passed');
select is((select count(*)::int from quiz_attempts where user_id = auth.uid()), 4, 'every attempt is recorded');

-- learner 2 has not finished the reading
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000002","role":"authenticated"}';
select throws_ok(
  $$select submit_quiz('b0000000-0000-0000-0000-000000000001', pgtap_answers(10))$$,
  'P0001', 'finish the reading before taking the test',
  'cannot earn module XP before finishing the reading'
);
select is((select xp from profiles where id = auth.uid()), 0, 'learner with unfinished reading still has 0 XP');

-- Logged out visitors cannot execute the submission function at all.
reset role;
set local request.jwt.claims = '';
set local role anon;
select throws_ok(
  $$select submit_quiz('b0000000-0000-0000-0000-000000000001', pgtap_answers(10))$$,
  '42501', null,
  'an anonymous visitor cannot submit a module test'
);

-- ===========================================================================
-- 2. Learners cannot change their own gamification stats  (PROG-08, ADR-014)
-- ===========================================================================

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000002","role":"authenticated"}';

select throws_ok(
  $$update profiles set xp = 999999 where id = auth.uid()$$,
  'P0001', 'User cannot modify xp directly',
  'learner cannot set their own XP'
);
select throws_ok(
  $$update profiles set challenge_streak = 365 where id = auth.uid()$$,
  'P0001', 'User cannot modify challenge streak directly',
  'learner cannot set their own challenge streak'
);
select throws_ok(
  $$update profiles set best_streak = 365 where id = auth.uid()$$,
  'P0001', 'User cannot modify best streak directly',
  'learner cannot set their own best streak'
);
select throws_ok(
  $$update profiles set last_challenge = current_date where id = auth.uid()$$,
  'P0001', 'User cannot modify last challange date directly',
  'learner cannot set their own last challenge date'
);
select throws_ok(
  $$update profiles set created_at = now() - interval '5 years' where id = auth.uid()$$,
  'P0001', 'User cannot modify profile creation date directly',
  'learner cannot backdate their profile'
);
select lives_ok(
  $$update profiles set first_name = 'Ada', last_name = 'Lovelace' where id = auth.uid()$$,
  'learner can still edit their own name'
);
select is((select first_name from profiles where id = auth.uid()), 'Ada', 'name edit is saved');

select throws_ok(
  $$insert into user_badges (user_id, badge_id) values (auth.uid(), 'd0000000-0000-0000-0000-000000000001')$$,
  '42501', null,
  'learner cannot award themselves a badge'
);

-- RLS hides other learners' rows, so updating learner 1 changes nothing
update profiles set first_name = 'Hacked' where id = 'a0000000-0000-0000-0000-000000000001';
select is_empty(
  $$select 1 from profiles where id = 'a0000000-0000-0000-0000-000000000001'$$,
  'learner cannot see another learner''s profile'
);

select throws_ok(
  $$select record_daily_solve(auth.uid(), 3, 0, 1)$$,
  '42501', null,
  'learner cannot call record_daily_solve directly'
);

reset role;
set local request.jwt.claims = '';

select is(
  (select first_name from profiles where id = 'a0000000-0000-0000-0000-000000000001'), null,
  'another learner''s profile was not changed'
);
select is((select xp from profiles where id = 'a0000000-0000-0000-0000-000000000002'), 0,
  'blocked updates left learner 2''s XP untouched');

select is(has_function_privilege('anon', 'public.record_daily_solve(uuid, int, int, int)', 'execute'), false,
  'anon has no execute privilege on record_daily_solve');
select is(has_function_privilege('authenticated', 'public.record_daily_solve(uuid, int, int, int)', 'execute'), false,
  'authenticated has no execute privilege on record_daily_solve');
select is(has_function_privilege('service_role', 'public.record_daily_solve(uuid, int, int, int)', 'execute'), true,
  'service_role can execute record_daily_solve');

-- ===========================================================================
-- 3. Daily challenge XP and streaks via record_daily_solve()  (ADR-014)
-- ===========================================================================

set local role service_role;

-- first ever solve: streak starts at 1
select is(
  record_daily_solve('a0000000-0000-0000-0000-000000000003', 1, 0, 1),
  jsonb_build_object(
    'xpAwarded', 50, 'streak', 1, 'bestStreak', 1,
    'badgesAwarded', jsonb_build_array(pgtap_badge_json('daily-challenge'))),
  'first ever solve: tier 1 first try gives 50 XP, starts the streak and returns the daily badge'
);
select is(
  (select last_challenge from profiles where id = 'a0000000-0000-0000-0000-000000000003'),
  (now() at time zone 'Australia/Melbourne')::date,
  'last_challenge is recorded as today''s Melbourne date'
);

-- another solve on the same day: XP added, streak unchanged
select is(
  record_daily_solve('a0000000-0000-0000-0000-000000000003', 3, 0, 1),
  '{"xpAwarded": 150, "streak": 1, "bestStreak": 1, "badgesAwarded": []}'::jsonb,
  'second solve on the same day adds XP but does not move the streak'
);

-- XP formula: max(10, tier x 50 - hints x 10 - (attempt - 1) x 15)
select is((record_daily_solve('a0000000-0000-0000-0000-000000000003', 2, 2, 2) ->> 'xpAwarded')::int, 65,
  'tier 2, 2 hints, 2nd attempt = 100 - 20 - 15 = 65 XP');
select is((record_daily_solve('a0000000-0000-0000-0000-000000000003', 3, 3, 3) ->> 'xpAwarded')::int, 90,
  'tier 3, 3 hints, 3rd attempt = 150 - 30 - 30 = 90 XP');
select is((record_daily_solve('a0000000-0000-0000-0000-000000000003', 1, 1, 3) ->> 'xpAwarded')::int, 10,
  'tier 1, 1 hint, 3rd attempt = 50 - 10 - 30 = 10 XP (exactly the floor)');
select is((record_daily_solve('a0000000-0000-0000-0000-000000000003', 1, 3, 3) ->> 'xpAwarded')::int, 10,
  'tier 1, 3 hints, 3rd attempt would be -10, so the 10 XP minimum applies');
select is(
  (select format('xp=%s streak=%s', xp, challenge_streak) from profiles where id = 'a0000000-0000-0000-0000-000000000003'),
  format('xp=%s streak=%s', 50 + 150 + 65 + 90 + 10 + 10, 1),
  'all of today''s XP adds up on the profile and the streak is still 1'
);

-- solved yesterday: streak continues and best streak follows it
update profiles set last_challenge = (now() at time zone 'Australia/Melbourne')::date - 1,
                    challenge_streak = 4, best_streak = 4
 where id = 'a0000000-0000-0000-0000-000000000003';
select is(
  record_daily_solve('a0000000-0000-0000-0000-000000000003', 1, 0, 1) - 'xpAwarded',
  '{"streak": 5, "bestStreak": 5, "badgesAwarded": []}'::jsonb,
  'solving the day after the last solve extends the streak and raises best streak'
);

-- missed a day: streak resets to 1 but best streak is kept
update profiles set last_challenge = (now() at time zone 'Australia/Melbourne')::date - 2,
                    challenge_streak = 5, best_streak = 7
 where id = 'a0000000-0000-0000-0000-000000000003';
select is(
  record_daily_solve('a0000000-0000-0000-0000-000000000003', 1, 0, 1) - 'xpAwarded',
  jsonb_build_object(
    'streak', 1, 'bestStreak', 7,
    'badgesAwarded', jsonb_build_array(pgtap_badge_json('consistency-master'))),
  'missing a day resets the streak but preserves the best and awards its qualifying badge'
);

-- a streak that was never broken but is below the best does not lower best streak
update profiles set last_challenge = (now() at time zone 'Australia/Melbourne')::date - 1,
                    challenge_streak = 2, best_streak = 7
 where id = 'a0000000-0000-0000-0000-000000000003';
select is(
  record_daily_solve('a0000000-0000-0000-0000-000000000003', 1, 0, 1) - 'xpAwarded',
  '{"streak": 3, "bestStreak": 7, "badgesAwarded": []}'::jsonb,
  'continuing a streak below the best leaves best streak alone'
);

-- null stats are treated as 0 rather than wiping the total
update profiles set xp = null, challenge_streak = null, best_streak = 0, last_challenge = null
 where id = 'a0000000-0000-0000-0000-000000000003';
select lives_ok($$select record_daily_solve('a0000000-0000-0000-0000-000000000003', 2, 0, 1)$$,
  'a solve succeeds for a profile with null stats');
select is(
  (select format('xp=%s streak=%s best=%s', xp, challenge_streak, best_streak) from profiles where id = 'a0000000-0000-0000-0000-000000000003'),
  'xp=100 streak=1 best=1',
  'null XP and streak are treated as 0'
);

-- invalid inputs are rejected and change nothing
select throws_ok($$select record_daily_solve('a0000000-0000-0000-0000-000000000003', 0, 0, 1)$$,
  'P0001', 'invalid tier', 'tier 0 is rejected');
select throws_ok($$select record_daily_solve('a0000000-0000-0000-0000-000000000003', 4, 0, 1)$$,
  'P0001', 'invalid tier', 'tier 4 is rejected');
select throws_ok($$select record_daily_solve('a0000000-0000-0000-0000-000000000003', null, 0, 1)$$,
  'P0001', 'invalid tier', 'a null tier is rejected');
select throws_ok($$select record_daily_solve('a0000000-0000-0000-0000-000000000003', 1, 0, 0)$$,
  'P0001', 'invalid attempt number', 'attempt 0 is rejected');
select throws_ok($$select record_daily_solve('a0000000-0000-0000-0000-000000000003', 1, 0, 4)$$,
  'P0001', 'invalid attempt number', 'a 4th attempt is rejected');
select throws_ok($$select record_daily_solve('a0000000-0000-0000-0000-000000000003', 1, -1, 1)$$,
  'P0001', 'invalid hints used', 'negative hints are rejected (would inflate XP)');
select throws_ok($$select record_daily_solve('a0000000-0000-0000-0000-000000000003', 1, 4, 1)$$,
  'P0001', 'invalid hints used', 'more than 3 hints is rejected');
select throws_ok($$select record_daily_solve('a0000000-0000-0000-0000-000000000003', 1, null, 1)$$,
  'P0001', 'invalid hints used', 'null hints is rejected');
select throws_ok($$select record_daily_solve('a0000000-0000-0000-0000-0000000000ff', 1, 0, 1)$$,
  'P0001', 'unknown user', 'an unknown user is rejected');
select is((select xp from profiles where id = 'a0000000-0000-0000-0000-000000000003'), 100,
  'rejected solves did not change XP');

select * from finish();
rollback;
