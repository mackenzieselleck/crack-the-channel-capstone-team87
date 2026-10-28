-- Badge Logic QA: actual award hooks, catalogue, eligibility, ownership and dismissal.
-- Run from my-app/: npm run db:start, then npm run test:db (Docker required).
-- All fixtures and temporary publication changes are rolled back at the end.
-- This suite does not claim concurrency, PostgREST/realtime delivery, or restart coverage.

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
grant usage on schema extensions to anon, authenticated, service_role;
grant execute on all functions in schema extensions to anon, authenticated, service_role;
select plan(57);

-- Supabase's auth trigger creates each learner's profile. UUIDs are reserved to
-- this file and differ from the profile-gamification suite's transaction fixtures.
insert into auth.users (id, email) values
  ('e1000000-0000-0000-0000-000000000001', 'badge-owner@pgtap.test'),
  ('e1000000-0000-0000-0000-000000000002', 'badge-other@pgtap.test');

create temporary table badge_results (label text primary key, payload jsonb);
grant select, insert on badge_results to authenticated, service_role;

-- The catalogue is application data supplied by migrations, not replacement
-- fixture badges. This makes missing or changed catalogue rules visible to CI.
select results_eq(
  $$select slug from badges where slug is not null order by position$$,
  $$values ('quantum-starter'::text), ('basis-explorer'), ('key-sifter'),
    ('eavesdropper-detective'), ('qiskit-practitioner'), ('daily-challenge'),
    ('consistency-master'), ('overall-champion')$$,
  'the eight badge catalogue slugs exist in display order'
);
select is((select count(*)::int from badges where slug is not null and artboard is not null), 8,
  'all eight catalogue badges have an artboard for the popup');
select is((select count(*)::int from badges where slug is not null
  and icon_url = '/images/badges/' || slug || '.png'), 8,
  'all eight catalogue badges point to their expected static PNG path');
select ok(exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime'
  and schemaname = 'public' and tablename = 'user_badges'),
  'user_badges is included in the realtime publication');

set local role service_role;
select is(award_badges('e1000000-0000-0000-0000-000000000001'), '[]'::jsonb,
  'a new learner earns no badges');
select is(award_badges(null), '[]'::jsonb, 'a null user earns no badges');
select is(award_badges('e1000000-0000-0000-0000-000000000099'), '[]'::jsonb,
  'a missing profile earns no badges and does not raise a foreign-key error');
reset role;
select is((select count(*)::int from user_badges
  where user_id = 'e1000000-0000-0000-0000-000000000001'), 0,
  'eligibility checks did not create an award');

-- Fresh migrations leave modules unpublished. Publish only these catalogue
-- modules in this rolled-back transaction, then complete their actual quizzes.
update modules set is_published = true where slug in
  ('quantum-basics', 'bases-gates-circuits', 'bb84-alice-bob', 'eve-and-qber', 'qiskit-bb84-practice');
insert into module_progress (user_id, module_id, pages_completed)
select 'e1000000-0000-0000-0000-000000000001', m.id, count(p.id)::int
  from modules m join module_pages p on p.module_id = m.id
 where m.slug in ('quantum-basics', 'bases-gates-circuits', 'bb84-alice-bob', 'eve-and-qber', 'qiskit-bb84-practice')
 group by m.id;

-- Test-only helper obtains the real answer keys for deterministic submissions.
-- Learners still call the production submit_quiz function with their own JWT.
create function public.badge_test_answers(module_slug text) returns jsonb
language sql security definer set search_path = public as $$
  select jsonb_object_agg(q.id, k.correct_index)
    from quiz_questions q join answer_keys k on k.question_id = q.id
    join modules m on m.id = q.module_id where m.slug = module_slug
$$;
grant execute on function public.badge_test_answers(text) to authenticated;

set local role authenticated;
set local request.jwt.claims = '{"sub":"e1000000-0000-0000-0000-000000000001","role":"authenticated"}';

insert into badge_results values ('module-1', submit_quiz(
  (select id from modules where slug = 'quantum-basics'), badge_test_answers('quantum-basics')));
select is((select array_agg(b.value->>'slug' order by b.ordinal) from badge_results r,
  jsonb_array_elements(r.payload->'badgesAwarded') with ordinality b(value, ordinal) where r.label = 'module-1'),
  array['quantum-starter'], 'first module pass returns only Quantum Starter');

insert into badge_results values ('module-2', submit_quiz(
  (select id from modules where slug = 'bases-gates-circuits'), badge_test_answers('bases-gates-circuits')));
select is((select array_agg(b.value->>'slug' order by b.ordinal) from badge_results r,
  jsonb_array_elements(r.payload->'badgesAwarded') with ordinality b(value, ordinal) where r.label = 'module-2'),
  array['basis-explorer'], 'second module pass returns only Basis Explorer');

insert into badge_results values ('module-3', submit_quiz(
  (select id from modules where slug = 'bb84-alice-bob'), badge_test_answers('bb84-alice-bob')));
select is((select array_agg(b.value->>'slug' order by b.ordinal) from badge_results r,
  jsonb_array_elements(r.payload->'badgesAwarded') with ordinality b(value, ordinal) where r.label = 'module-3'),
  array['key-sifter'], 'third module pass returns only Key Sifter');

insert into badge_results values ('module-4', submit_quiz(
  (select id from modules where slug = 'eve-and-qber'), badge_test_answers('eve-and-qber')));
select is((select array_agg(b.value->>'slug' order by b.ordinal) from badge_results r,
  jsonb_array_elements(r.payload->'badgesAwarded') with ordinality b(value, ordinal) where r.label = 'module-4'),
  array['eavesdropper-detective'], 'fourth module pass returns only Eavesdropper Detective');
select is((select count(*)::int from user_badges ub join badges b on b.id = ub.badge_id
  where ub.user_id = auth.uid() and b.slug = 'overall-champion'), 0,
  'Overall Champion is absent before the fifth module completion');

insert into badge_results values ('module-5', submit_quiz(
  (select id from modules where slug = 'qiskit-bb84-practice'), badge_test_answers('qiskit-bb84-practice')));
select is((select array_agg(b.value->>'slug' order by b.ordinal) from badge_results r,
  jsonb_array_elements(r.payload->'badgesAwarded') with ordinality b(value, ordinal) where r.label = 'module-5'),
  array['qiskit-practitioner', 'overall-champion'],
  'the fifth module awards Qiskit Practitioner and Overall Champion in the same call');
select is((select count(*)::int from user_badges where user_id = auth.uid()), 6,
  'five module passes leave exactly six earned badge rows');
select is((select count(*)::int from user_badges where user_id = auth.uid() and seen_at is null), 6,
  'new module badge awards are initially unseen');
select ok((select bool_and(payload->>'passed' = 'true') from badge_results),
  'all five catalogue quizzes were actually graded as passing');
select ok((select bool_and((b->>'id') is not null and (b->>'slug') is not null
  and (b->>'title') is not null and (b->>'description') is not null
  and (b->>'artboard') is not null and (b->>'iconUrl') is not null)
  from badge_results r, jsonb_array_elements(r.payload->'badgesAwarded') b),
  'returned badge objects include the popup metadata contract');

insert into badge_results values ('module-repeat', submit_quiz(
  (select id from modules where slug = 'quantum-basics'), badge_test_answers('quantum-basics')));
select is((select payload->'badgesAwarded' from badge_results where label = 'module-repeat'), '[]'::jsonb,
  'a sequential passing retake returns no new badges');
select is((select (payload->>'xpAwarded')::int from badge_results where label = 'module-repeat'), 0,
  'a sequential passing retake awards no extra module XP');

reset role;
set local request.jwt.claims = '';
set local role service_role;
select is(award_badges('e1000000-0000-0000-0000-000000000001'), '[]'::jsonb,
  'repeated central award calls are idempotent');
reset role;
select is((select count(*)::int from user_badges
  where user_id = 'e1000000-0000-0000-0000-000000000001'), 6,
  'repeat calls leave one row per earned badge');
select throws_ok(
  $$insert into user_badges(user_id, badge_id) select
    'e1000000-0000-0000-0000-000000000001', id from badges where slug = 'quantum-starter'$$,
  '23505', null, 'the primary key also rejects a duplicate user/badge row');

-- Daily and streak awards use the production service-only reward hook.
set local role service_role;
insert into badge_results values ('daily-first', record_daily_solve(
  'e1000000-0000-0000-0000-000000000001', 1, 0, 1));
reset role;
select is((select payload->'badgesAwarded'->0->>'slug' from badge_results where label = 'daily-first'),
  'daily-challenge', 'first daily solve returns the Daily Challenge badge');
select is((select jsonb_array_length(payload->'badgesAwarded') from badge_results where label = 'daily-first'), 1,
  'first daily solve does not award the seven-day badge');
select is((select (payload->>'xpAwarded')::int from badge_results where label = 'daily-first'), 50,
  'first tier-1 solve without hints awards 50 XP');

update profiles set best_streak = 6 where id = 'e1000000-0000-0000-0000-000000000001';
select is(award_badges('e1000000-0000-0000-0000-000000000001'), '[]'::jsonb,
  'best streak six does not qualify for Consistency Master');
update profiles set best_streak = 6, challenge_streak = 6,
  last_challenge = (now() at time zone 'Australia/Melbourne')::date - 1
 where id = 'e1000000-0000-0000-0000-000000000001';
set local role service_role;
insert into badge_results values ('daily-seven', record_daily_solve(
  'e1000000-0000-0000-0000-000000000001', 2, 2, 2));
reset role;
select is((select payload->'badgesAwarded'->0->>'slug' from badge_results where label = 'daily-seven'),
  'consistency-master', 'seventh consecutive day returns Consistency Master');
select is((select jsonb_array_length(payload->'badgesAwarded') from badge_results where label = 'daily-seven'), 1,
  'seventh day adds one new badge without repeating the daily badge');
select is((select (payload->>'streak')::int from badge_results where label = 'daily-seven'), 7,
  'the reward hook records a seven-day streak');
select is((select (payload->>'xpAwarded')::int from badge_results where label = 'daily-seven'), 65,
  'tier 2 with two hints on attempt 2 awards 65 XP');

update profiles set last_challenge = (now() at time zone 'Australia/Melbourne')::date - 2
 where id = 'e1000000-0000-0000-0000-000000000001';
set local role service_role;
insert into badge_results values ('daily-gap', record_daily_solve(
  'e1000000-0000-0000-0000-000000000001', 1, 3, 3));
reset role;
select is((select payload->'badgesAwarded' from badge_results where label = 'daily-gap'), '[]'::jsonb,
  'a solve after a missed day does not reaward previously earned badges');
select is((select (payload->>'streak')::int from badge_results where label = 'daily-gap'), 1,
  'a missed day resets the current streak to one on the next solve');
select is((select (payload->>'bestStreak')::int from badge_results where label = 'daily-gap'), 7,
  'a missed day preserves the best streak');
select is((select (payload->>'xpAwarded')::int from badge_results where label = 'daily-gap'), 10,
  'the minimum daily reward remains 10 XP');
select results_eq(
  $$select b.slug from user_badges ub join badges b on b.id = ub.badge_id
    where ub.user_id = 'e1000000-0000-0000-0000-000000000001' order by b.position$$,
  $$values ('quantum-starter'::text), ('basis-explorer'), ('key-sifter'),
    ('eavesdropper-detective'), ('qiskit-practitioner'), ('daily-challenge'),
    ('consistency-master'), ('overall-champion')$$,
  'all eight catalogue badges remain earned after the streak breaks'
);

insert into badges(title, slug, threshold) values ('Invalid streak fixture', 'pgtap-invalid-streak', 'streak:seven');
select is(award_badges('e1000000-0000-0000-0000-000000000001'), '[]'::jsonb,
  'a malformed streak threshold is ignored safely');
select is((select count(*)::int from user_badges ub join badges b on b.id = ub.badge_id
  where b.slug = 'pgtap-invalid-streak'), 0, 'the malformed threshold creates no award');

-- Ownership and role restrictions are exercised using actual database roles.
select is(has_function_privilege('anon', 'public.award_badges(uuid)', 'execute'), false,
  'anonymous callers cannot execute award_badges');
select is(has_function_privilege('authenticated', 'public.award_badges(uuid)', 'execute'), false,
  'learners cannot execute award_badges');
select is(has_function_privilege('service_role', 'public.award_badges(uuid)', 'execute'), true,
  'the service role can execute award_badges');
select is(has_function_privilege('anon', 'public.mark_badges_seen(uuid[])', 'execute'), false,
  'anonymous callers cannot dismiss badge popups');
select is(has_function_privilege('authenticated', 'public.mark_badges_seen(uuid[])', 'execute'), true,
  'learners can execute their dismissal function');

set local role authenticated;
set local request.jwt.claims = '{"sub":"e1000000-0000-0000-0000-000000000002","role":"authenticated"}';
select is((select count(*)::int from user_badges), 0,
  'RLS hides another learner''s earned badges');
select throws_ok($$select award_badges('e1000000-0000-0000-0000-000000000002')$$,
  '42501', null, 'a learner award_badges call is denied at execution time');
select throws_ok($$insert into user_badges(user_id, badge_id) select
  auth.uid(), id from badges where slug = 'quantum-starter'$$,
  '42501', null, 'a learner cannot forge a badge award');
select lives_ok($$select mark_badges_seen(array(select id from badges))$$,
  'attempting to dismiss another learner''s badges is a safe no-op');
reset role;
set local request.jwt.claims = '';
select is((select count(*)::int from user_badges where seen_at is not null
  and user_id = 'e1000000-0000-0000-0000-000000000001'), 0,
  'another learner did not change any saved dismissal');

set local role authenticated;
set local request.jwt.claims = '{"sub":"e1000000-0000-0000-0000-000000000001","role":"authenticated"}';
select is((select count(*)::int from user_badges), 8,
  'the owner can read all eight of their earned badges');
select lives_ok($$select mark_badges_seen(array(select id from badges where slug = 'quantum-starter'))$$,
  'the owner can dismiss one of their own badges');
select is((select count(*)::int from user_badges where seen_at is not null), 1,
  'only the requested badge is marked seen');

-- Give that dismissal an older timestamp so a repeated update would be visible,
-- even though now() is constant throughout this transaction.
reset role;
set local request.jwt.claims = '';
update user_badges set seen_at = now() - interval '1 day'
 where user_id = 'e1000000-0000-0000-0000-000000000001'
   and badge_id = (select id from badges where slug = 'quantum-starter');
set local role authenticated;
set local request.jwt.claims = '{"sub":"e1000000-0000-0000-0000-000000000001","role":"authenticated"}';
select lives_ok($$select mark_badges_seen(array(select id from badges where slug = 'quantum-starter'))$$,
  'repeating a saved dismissal succeeds');
select is((select seen_at from user_badges where badge_id =
  (select id from badges where slug = 'quantum-starter')), now() - interval '1 day',
  'a repeated dismissal preserves its previously saved timestamp');
select lives_ok($$select mark_badges_seen(array(select id from badges))$$,
  'the owner can dismiss the remaining badges');
select is((select count(*)::int from user_badges where seen_at is not null), 8,
  'all eight earned badges have saved dismissals');
select is((select count(*)::int from user_badges), 8,
  'dismissing notifications does not delete earned badges');
reset role;
set local request.jwt.claims = '';
select is(award_badges('e1000000-0000-0000-0000-000000000001'), '[]'::jsonb,
  'dismissed badges are not reawarded');

select * from finish();
rollback;
