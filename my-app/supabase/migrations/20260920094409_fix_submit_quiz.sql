
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
    join answer_keys k on k.question_id = q.id
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