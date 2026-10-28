-- Daily Challenge and LLM budgets: actual rate_limit_hit SQL, not mocked RPCs.
-- Run from my-app after npx supabase start; Docker is required.
-- All fixture rows and test grants are rolled back. No wall-clock sleeps.
-- Sequential checks do not establish independent-connection concurrency safety.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
grant usage on schema extensions to anon, authenticated, service_role;
grant execute on all functions in schema extensions to anon, authenticated, service_role;
select plan(34);

delete from public.rate_limits where key like 'qa:llm-prompting:%';
create temporary table rate_test_results (label text primary key, allowed boolean, retry_after int);
grant select, insert on rate_test_results to service_role;

-- 1-6: the real function must remain server-only and its table protected.
select has_function('public', 'rate_limit_hit', array['text', 'integer', 'integer'],
  'the migrated rate-limit RPC exists');
select has_pk('public', 'rate_limits', 'rate-limit buckets have a primary key');
select ok((select relrowsecurity from pg_class where oid = 'public.rate_limits'::regclass),
  'rate-limit rows have row-level security enabled');
select ok(not has_function_privilege('anon', 'public.rate_limit_hit(text,integer,integer)', 'EXECUTE'),
  'anonymous clients cannot execute the budget RPC');
select ok(not has_function_privilege('authenticated', 'public.rate_limit_hit(text,integer,integer)', 'EXECUTE'),
  'authenticated clients cannot execute the budget RPC');
select ok(has_function_privilege('service_role', 'public.rate_limit_hit(text,integer,integer)', 'EXECUTE'),
  'the server role can execute the budget RPC');

set local role service_role;
insert into rate_test_results select 'first', * from rate_limit_hit('qa:llm-prompting:user:alice', 2, 60);
select is((select allowed from rate_test_results where label = 'first'), true,
  'the first reservation is allowed'); -- 7
select is((select retry_after from rate_test_results where label = 'first'), 0,
  'an allowed reservation has no retry delay'); -- 8
select is((select hits from rate_limits where key = 'qa:llm-prompting:user:alice'), 1,
  'the first reservation persists one hit'); -- 9

insert into rate_test_results select 'second', * from rate_limit_hit('qa:llm-prompting:user:alice', 2, 60);
select is((select allowed from rate_test_results where label = 'second'), true,
  'the reservation exactly at the limit is allowed'); -- 10
select is((select hits from rate_limits where key = 'qa:llm-prompting:user:alice'), 2,
  'a repeated reservation updates the same bucket'); -- 11

insert into rate_test_results select 'third', * from rate_limit_hit('qa:llm-prompting:user:alice', 2, 60);
select is((select allowed from rate_test_results where label = 'third'), false,
  'the first reservation beyond the limit is denied'); -- 12
select ok((select retry_after between 1 and 60 from rate_test_results where label = 'third'),
  'a denied minute bucket returns a bounded positive retry delay'); -- 13
select is((select hits from rate_limits where key = 'qa:llm-prompting:user:alice'), 3,
  'a denied reservation still counts toward the bucket'); -- 14

insert into rate_test_results select 'fourth', * from rate_limit_hit('qa:llm-prompting:user:alice', 2, 60);
select is((select allowed from rate_test_results where label = 'fourth'), false,
  'further reservations remain denied within the window'); -- 15
insert into rate_test_results select 'bob', * from rate_limit_hit('qa:llm-prompting:user:bob', 2, 60);
select is((select allowed from rate_test_results where label = 'bob'), true,
  'a different user key has an independent budget'); -- 16
select is((select hits from rate_limits where key = 'qa:llm-prompting:user:alice'), 4,
  'another user does not alter the exhausted user bucket'); -- 17

insert into rate_test_results select 'global-minute-first', * from rate_limit_hit('qa:llm-prompting:global:min', 1, 60);
select is((select allowed from rate_test_results where label = 'global-minute-first'), true,
  'the first global-minute reservation is allowed'); -- 18
insert into rate_test_results select 'global-minute-next', * from rate_limit_hit('qa:llm-prompting:global:min', 1, 60);
select is((select allowed from rate_test_results where label = 'global-minute-next'), false,
  'callers using the same global key share its exhausted limit'); -- 19
insert into rate_test_results select 'global-day', * from rate_limit_hit('qa:llm-prompting:global:day', 1, 86400);
select is((select allowed from rate_test_results where label = 'global-day'), true,
  'the daily global key has its own bucket'); -- 20
select is((select hits from rate_limits where key = 'qa:llm-prompting:global:min'), 2,
  'using the daily key does not reset the minute key'); -- 21

insert into rate_test_results select 'zero', * from rate_limit_hit('qa:llm-prompting:zero', 0, 60);
select is((select allowed from rate_test_results where label = 'zero'), false,
  'a zero budget denies its first reservation'); -- 22
select ok((select retry_after between 1 and 60 from rate_test_results where label = 'zero'),
  'a zero budget still supplies a positive bounded retry delay'); -- 23

-- Seed expired and future buckets instead of sleeping across a clock boundary.
insert into rate_limits (key, window_start, hits) values
  ('qa:llm-prompting:rollover', now() - interval '2 hours', 99),
  ('qa:llm-prompting:untouched', now() - interval '2 hours', 99),
  ('qa:llm-prompting:rollover', now() + interval '2 hours', 7);
insert into rate_test_results select 'rollover', * from rate_limit_hit('qa:llm-prompting:rollover', 2, 60);
select is((select count(*)::int from rate_limits where key = 'qa:llm-prompting:rollover'
  and window_start < to_timestamp(floor(extract(epoch from now()) / 60) * 60)), 0,
  'a new window removes the same key''s expired buckets'); -- 24
select is((select hits from rate_limits where key = 'qa:llm-prompting:untouched'), 99,
  'cleanup does not remove another key''s expired bucket'); -- 25
select is((select hits from rate_limits where key = 'qa:llm-prompting:rollover'
  and window_start = now() + interval '2 hours'), 7,
  'cleanup preserves a future bucket'); -- 26
select is((select hits from rate_limits where key = 'qa:llm-prompting:rollover'
  and window_start = to_timestamp(floor(extract(epoch from now()) / 60) * 60)), 1,
  'the current window starts with one hit despite an exhausted expired bucket'); -- 27
reset role;

-- Exercise permissions, not just their metadata. The JWT cannot grant an RPC
-- permission deliberately restricted to service_role.
set local role authenticated;
set local request.jwt.claims = '{"sub":"e2000000-0000-0000-0000-000000000001","role":"authenticated"}';
select is((select count(*)::int from rate_limits where key like 'qa:llm-prompting:%'), 0,
  'a learner cannot read the server budget rows through RLS'); -- 28
select throws_ok($$select * from public.rate_limit_hit('qa:llm-prompting:forbidden', 2, 60)$$,
  '42501', null, 'a learner cannot reserve or reset budget through the RPC'); -- 29
reset role;
set local role anon;
select throws_ok($$select * from public.rate_limit_hit('qa:llm-prompting:forbidden', 2, 60)$$,
  '42501', null, 'an anonymous client cannot invoke the budget RPC'); -- 30
reset role;
set local role authenticated;
select throws_ok($$insert into public.rate_limits (key, window_start, hits)
  values ('qa:llm-prompting:forbidden', now(), 0)$$,
  '42501', null, 'a learner cannot insert budget rows directly'); -- 31
reset role;
select is((select count(*)::int from rate_limits where key = 'qa:llm-prompting:forbidden'), 0,
  'rejected client operations do not create a budget row'); -- 32

set local role service_role;
insert into rate_test_results select 'hour', * from rate_limit_hit('qa:llm-prompting:hour', 0, 3600);
select ok((select not allowed and retry_after between 1 and 3600 from rate_test_results where label = 'hour'),
  'an exhausted hourly window returns an hourly bounded retry delay'); -- 33
insert into rate_test_results select 'day-denied', * from rate_limit_hit('qa:llm-prompting:day-denied', 0, 86400);
select ok((select not allowed and retry_after between 1 and 86400 from rate_test_results where label = 'day-denied'),
  'an exhausted daily window returns a daily bounded retry delay'); -- 34
reset role;

select * from finish();
rollback;
