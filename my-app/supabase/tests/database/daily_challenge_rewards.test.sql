-- Daily QA: actual rewards, streak dates, privacy and duplicate row constraints.
-- Fixtures and grants roll back. Sequential checks do not prove race safety.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
grant usage on schema extensions to anon, authenticated, service_role;
grant execute on all functions in schema extensions to anon, authenticated, service_role;
select plan(38);

insert into auth.users (id, email) values
 ('d1000000-0000-0000-0000-000000000001', 'daily-fresh@pgtap.test'),
 ('d1000000-0000-0000-0000-000000000002', 'daily-yesterday@pgtap.test'),
 ('d1000000-0000-0000-0000-000000000003', 'daily-gap@pgtap.test'),
 ('d1000000-0000-0000-0000-000000000004', 'daily-floor@pgtap.test');
select set_config('app.trusted_profile_update', 'true', true);
update profiles set xp = 0, challenge_streak = 0, best_streak = 0, last_challenge = null
 where id::text like 'd1000000-%';
update profiles set xp = 200, challenge_streak = 4, best_streak = 4,
 last_challenge = (now() at time zone 'Australia/Melbourne')::date - 1
 where id = 'd1000000-0000-0000-0000-000000000002';
update profiles set xp = 90, challenge_streak = 4, best_streak = 9,
 last_challenge = (now() at time zone 'Australia/Melbourne')::date - 2
 where id = 'd1000000-0000-0000-0000-000000000003';
select set_config('app.trusted_profile_update', 'false', true);
create temporary table daily_qa_results (label text primary key, payload jsonb);
grant select, insert on daily_qa_results to service_role;

select has_function('public', 'record_daily_solve', array['uuid', 'integer', 'integer', 'integer'], 'reward function exists'); -- 1
select ok(not has_function_privilege('anon', 'public.record_daily_solve(uuid,integer,integer,integer)', 'EXECUTE'), 'anonymous reward RPC access is denied'); -- 2
select ok(not has_function_privilege('authenticated', 'public.record_daily_solve(uuid,integer,integer,integer)', 'EXECUTE'), 'learner reward RPC access is denied'); -- 3
select ok((select relrowsecurity from pg_class where oid = 'public.daily_challenge_answers'::regclass), 'private answers have RLS enabled'); -- 4

set local role service_role;
insert into daily_qa_results values ('first', record_daily_solve('d1000000-0000-0000-0000-000000000001', 1, 0, 1));
select is((select (payload->>'xpAwarded')::int from daily_qa_results where label = 'first'), 50, 'tier one first solve awards 50 XP'); -- 5
select is((select challenge_streak from profiles where id = 'd1000000-0000-0000-0000-000000000001'), 1, 'first solve starts a one-day streak'); -- 6
select is((select best_streak from profiles where id = 'd1000000-0000-0000-0000-000000000001'), 1, 'first solve establishes best streak'); -- 7
select is((select last_challenge from profiles where id = 'd1000000-0000-0000-0000-000000000001'), (now() at time zone 'Australia/Melbourne')::date, 'solve records Melbourne date'); -- 8
insert into daily_qa_results values ('second-tier', record_daily_solve('d1000000-0000-0000-0000-000000000001', 2, 0, 1));
select is((select (payload->>'xpAwarded')::int from daily_qa_results where label = 'second-tier'), 100, 'a different tier on the same day awards its own XP'); -- 9
select is((select xp from profiles where id = 'd1000000-0000-0000-0000-000000000001'), 150, 'the two tier rewards accumulate'); -- 10
select is((select challenge_streak from profiles where id = 'd1000000-0000-0000-0000-000000000001'), 1, 'another tier does not advance the day streak'); -- 11
insert into daily_qa_results values ('third-tier', record_daily_solve('d1000000-0000-0000-0000-000000000001', 3, 3, 3));
select is((select (payload->>'xpAwarded')::int from daily_qa_results where label = 'third-tier'), 90, 'tier three with all deductions awards 90 XP'); -- 12
select is((select xp from profiles where id = 'd1000000-0000-0000-0000-000000000001'), 240, 'third tier reward persists'); -- 13
insert into daily_qa_results values ('floor', record_daily_solve('d1000000-0000-0000-0000-000000000004', 1, 3, 3));
select is((select (payload->>'xpAwarded')::int from daily_qa_results where label = 'floor'), 10, 'reward never drops below 10 XP'); -- 14
insert into daily_qa_results values ('consecutive', record_daily_solve('d1000000-0000-0000-0000-000000000002', 2, 2, 2));
select is((select xp from profiles where id = 'd1000000-0000-0000-0000-000000000002'), 265, 'hint and retry deductions use the agreed reward'); -- 15
select is((select challenge_streak from profiles where id = 'd1000000-0000-0000-0000-000000000002'), 5, 'yesterday solve continues the streak'); -- 16
select is((select best_streak from profiles where id = 'd1000000-0000-0000-0000-000000000002'), 5, 'best streak advances when exceeded'); -- 17
insert into daily_qa_results values ('gap', record_daily_solve('d1000000-0000-0000-0000-000000000003', 1, 0, 1));
select is((select challenge_streak from profiles where id = 'd1000000-0000-0000-0000-000000000003'), 1, 'a missed calendar day resets the current streak'); -- 18
select is((select best_streak from profiles where id = 'd1000000-0000-0000-0000-000000000003'), 9, 'a reset preserves the historical best'); -- 19
select is((select xp from profiles where id = 'd1000000-0000-0000-0000-000000000003'), 140, 'a missed day does not erase prior XP'); -- 20
select throws_ok($$select record_daily_solve('d1000000-0000-0000-0000-000000000099',1,0,1)$$, 'P0001', 'unknown user', 'unknown user is rejected'); -- 21
select throws_ok($$select record_daily_solve('d1000000-0000-0000-0000-000000000001',0,0,1)$$, 'P0001', 'invalid tier', 'tier zero is rejected'); -- 22
select throws_ok($$select record_daily_solve('d1000000-0000-0000-0000-000000000001',4,0,1)$$, 'P0001', 'invalid tier', 'tier four is rejected'); -- 23
select throws_ok($$select record_daily_solve('d1000000-0000-0000-0000-000000000001',null,0,1)$$, 'P0001', 'invalid tier', 'null tier is rejected'); -- 24
select throws_ok($$select record_daily_solve('d1000000-0000-0000-0000-000000000001',1,0,0)$$, 'P0001', 'invalid attempt number', 'attempt zero is rejected'); -- 25
select throws_ok($$select record_daily_solve('d1000000-0000-0000-0000-000000000001',1,0,4)$$, 'P0001', 'invalid attempt number', 'attempt four is rejected'); -- 26
select throws_ok($$select record_daily_solve('d1000000-0000-0000-0000-000000000001',1,-1,1)$$, 'P0001', 'invalid hints used', 'negative hint usage is rejected'); -- 27
select throws_ok($$select record_daily_solve('d1000000-0000-0000-0000-000000000001',1,4,1)$$, 'P0001', 'invalid hints used', 'hint usage over three is rejected'); -- 28
reset role;
set local role anon;
select throws_ok($$select record_daily_solve('d1000000-0000-0000-0000-000000000001',1,0,1)$$, '42501', null, 'anonymous invocation fails at runtime'); -- 29
reset role;
set local role authenticated;
select throws_ok($$select record_daily_solve('d1000000-0000-0000-0000-000000000001',1,0,1)$$, '42501', null, 'learner invocation fails at runtime'); -- 30
reset role;

insert into daily_challenges (id,user_id,date,type,difficulty,input_kind,prompt_data,title,scenario,task,hints) values
 ('d2000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001','2026-10-28','sifting',1,'bits','{}','Fixture','Fixture','Fixture','["private hint"]');
select throws_ok($$insert into daily_challenges (user_id,date,type,difficulty,input_kind,prompt_data,title,scenario,task,hints)
 values ('d1000000-0000-0000-0000-000000000001','2026-10-28','sifting',1,'bits','{}','Duplicate','Fixture','Fixture','[]')$$,
 '23505', null, 'one challenge per user/day/tier is enforced'); -- 31
select lives_ok($$insert into daily_challenges (user_id,date,type,difficulty,input_kind,prompt_data,title,scenario,task,hints)
 values ('d1000000-0000-0000-0000-000000000001','2026-10-29','sifting',1,'bits','{}','New day','Fixture','Fixture','[]')$$,
 'a new calendar day permits a new challenge in the same tier'); -- 32
select lives_ok($$insert into daily_challenges (user_id,date,type,difficulty,input_kind,prompt_data,title,scenario,task,hints)
 values ('d1000000-0000-0000-0000-000000000002','2026-10-28','sifting',1,'bits','{}','Other learner','Fixture','Fixture','[]')$$,
 'another learner has an independent daily challenge'); -- 33
insert into challenge_attempts (user_id,challenge_id,attempt_no,submission,correct) values
 ('d1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000001',1,'{"bits":"0"}',false);
select throws_ok($$insert into challenge_attempts (user_id,challenge_id,attempt_no,submission,correct)
 values ('d1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000001',1,'{"bits":"1"}',true)$$,
 '23505', null, 'the same attempt number cannot be inserted twice'); -- 34
insert into daily_challenge_answers (challenge_id,answer,worked_solution,seed) values
 ('d2000000-0000-0000-0000-000000000001','{"bits":"1"}','Private solution',87);
set local role authenticated;
set local request.jwt.claims = '{"sub":"d1000000-0000-0000-0000-000000000001","role":"authenticated"}';
select is((select count(*)::int from daily_challenge_answers), 0, 'a learner cannot read private answers through RLS'); -- 35
select throws_ok($$select hints from daily_challenges$$, '42501', null, 'a learner cannot bypass hint reveal by selecting its private column'); -- 36
select throws_ok($$insert into challenge_attempts (user_id,challenge_id,attempt_no,submission,correct)
 values ('d1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000001',2,'{}',true)$$,
 '42501', null, 'a learner cannot forge a correct attempt directly'); -- 37
select is((select count(*)::int from challenge_attempts), 1, 'a learner can read its saved attempt'); -- 38
reset role;
select * from finish();
rollback;
