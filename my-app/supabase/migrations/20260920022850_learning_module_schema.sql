-- learning modules
create table modules (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  summary      text,
  position     int  not null,                    
  pass_mark    int  not null default 70 check (pass_mark between 1 and 100),
  is_published boolean not null default false
);

-- segments for each module
create table module_pages (
  id        uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  position  int  not null,
  title     text not null,
  body      text not null default '',            -- markdown
  unique (module_id, position)
);

-- test for end of module
create table quiz_questions (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references modules(id) on delete cascade,
  position    int  not null,
  prompt      text not null,
  options     jsonb not null,                    -- multiple choice
  explanation text,                              
  unique (module_id, position)
);

-- question answer keys
create table answer_keys (
  question_id   uuid primary key references quiz_questions(id) on delete cascade,
  correct_index int not null
);

-- user learning progress
create table module_progress (
  user_id         uuid not null references auth.users(id) on delete cascade,
  module_id       uuid not null references modules(id) on delete cascade,
  pages_completed int  not null default 0,       -- how many pages the user has progressed through
  quiz_passed     boolean not null default false,
  best_score      int,
  completed_at    timestamptz,
  updated_at      timestamptz not null default now(),
  primary key (user_id, module_id)
);

-- user attempts on module quiz
create table quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  module_id  uuid not null references modules(id) on delete cascade,
  score      int  not null,
  passed     boolean not null,
  answers    jsonb not null,
  created_at timestamptz not null default now()
);

-- RLS policies for learning module tables
alter table modules          enable row level security;
alter table module_pages     enable row level security;
alter table quiz_questions   enable row level security;
alter table answer_keys enable row level security;
alter table module_progress  enable row level security;
alter table quiz_attempts    enable row level security;

-- users can read published learning modules
create policy "read published modules" on modules
  for select to authenticated using (is_published);

-- users can read pages of learning module if its published
create policy "read pages of published modules" on module_pages
  for select to authenticated
  using (exists (select 1 from modules m where m.id = module_id and m.is_published));

-- users can read module quiz of learning module if its published
create policy "read questions of published modules" on quiz_questions
  for select to authenticated
  using (exists (select 1 from modules m where m.id = module_id and m.is_published));

-- users are able to read their learning progress
create policy "read own progress" on module_progress
  for select to authenticated using (user_id = auth.uid());

-- users are able to read their quiz attempts
create policy "read own attempts" on quiz_attempts
  for select to authenticated using (user_id = auth.uid());



-- function is called when user clicks next on learning module segment and increments user learning progress forward
create or replace function increment_progress(p_module_id uuid, p_page_index int)
returns module_progress
language plpgsql security definer set search_path = public as $$
-- declares needed variables for progress increment
declare
  v_count int;
  v_row   module_progress;
begin
-- if user isn't authenticated, raises exception and ends function
  if auth.uid() is null then raise exception 'not authenticated'; end if;
-- if module isn't published, raises exception and ends function
  if not exists (select 1 from modules where id = p_module_id and is_published) then
    raise exception 'module not available';
  end if;
-- if page index is out of bounds or higher than the current v_count, raise exception
  select count(*) into v_count from module_pages where module_id = p_module_id;
  if p_page_index < 0 or p_page_index >= v_count then
    raise exception 'invalid step index';
  end if;
-- creates user learning progress row on first next click for module if already exists it does nothing
  insert into module_progress (user_id, module_id)
  values (auth.uid(), p_module_id)
  on conflict do nothing;
-- updates user learning progress for module
  update module_progress
     set pages_completed = greatest(pages_completed, p_page_index + 1),
         updated_at = now()
   where user_id = auth.uid()
     and module_id = p_module_id
     and p_page_index <= pages_completed          -- can't skip ahead
  returning * into v_row;
-- stops user from skipping ahead in learning content
  if not found then raise exception 'cannot skip ahead'; end if;
  return v_row;
end $$;


-- grades the tests and ensures all learning module pages were read prior to completion
create or replace function submit_quiz(p_module_id uuid, p_answers jsonb)
returns jsonb
language plpgsql security definer set search_path = public as $$
-- declares variables needed for automatic quiz grading
declare
  v_count    int;
  v_progress module_progress;
  v_total    int;
  v_correct  int;
  v_score    int;
  v_pass     int;
  v_passed   boolean;
  v_results  jsonb;
begin
  -- if user isn't authenticated, raises exception and ends function
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  -- if module isn't published, raises exception and ends function
  if not exists (select 1 from modules where id = p_module_id and is_published) then
    raise exception 'module not available';
  end if;
  -- gets count and passing mark from learning modules
  select count(*) into v_count from module_pages where module_id = p_module_id;
  select pass_mark into v_pass from modules where id = p_module_id;
  -- checks to see that the user has completed all reading
  select * into v_progress
    from module_progress
   where user_id = auth.uid() and module_id = p_module_id;
  -- raises exception if they haven't
  if not found or v_progress.pages_completed < v_count then
    raise exception 'finish the reading before taking the test';
  end if;
  -- counts quiz questions, raises exception if no quiz questions exist for module
  select count(*) into v_total from quiz_questions where module_id = p_module_id;
  if v_total = 0 then raise exception 'this module has no test'; end if;
-- takes answers from quiz submission and creates json object for each graded question then collates them into a result array
  select jsonb_agg(
           jsonb_build_object(
             'questionId',  q.id,
             'correct',     coalesce((p_answers ->> q.id::text)::int = k.correct_index, false),
             'explanation', q.explanation
           ) order by q.position)
    into v_results
    from quiz_questions q
    join quiz_answer_keys k on k.question_id = q.id
   where q.module_id = p_module_id;

  -- unpacks array and counts correct answers
  select count(*) filter (where (r ->> 'correct')::boolean)
    into v_correct
    from jsonb_array_elements(v_results) r;
  -- uses count to calculate if user has met passing score threshold
  v_score  := round(100.0 * v_correct / v_total);
  v_passed := v_score >= v_pass;

  -- inserts result into user's quiz attempts
  insert into quiz_attempts (user_id, module_id, score, passed, answers)
  values (auth.uid(), p_module_id, v_score, v_passed, p_answers);

  update module_progress
     set quiz_passed  = quiz_passed or v_passed,
         best_score   = greatest(coalesce(best_score, 0), v_score),
         completed_at = case when v_passed and completed_at is null then now() else completed_at end,
         updated_at   = now()
   where user_id = auth.uid() and module_id = p_module_id;

-- returns grading results
  return jsonb_build_object(
    'score', v_score, 'passed', v_passed,
    'correctCount', v_correct, 'total', v_total,
    'results', v_results
  );
end $$;

-- revokes automatic grants on execution and ensures only authenticated users are granted access
revoke all on function increment_progress(uuid, int) from public;
revoke all on function submit_quiz(uuid, jsonb) from public;
grant execute on function increment_progress(uuid, int) to authenticated;
grant execute on function submit_quiz(uuid, jsonb) to authenticated;