-- Placeholder module for testing the full flow (reading -> progress bar -> test -> completion).
-- Run in the Supabase SQL editor AFTER learning_schema.sql.
-- Replace or delete once real content exists: delete from modules where slug = 'test-module';
-- (child rows cascade automatically)

do $$
declare
  v_module uuid;
  v_q1 uuid;
  v_q2 uuid;
  v_q3 uuid;
begin
  insert into modules (slug, title, summary, position, pass_mark, is_published)
  values ('test-module', 'Placeholder Module', 'Used to test the learning flow.', 1, 70, true)
  returning id into v_module;

  -- 4 reading segments => 5 progress units (4 reading + 1 test), so the bar goes 20/40/60/80/100%
  insert into module_pages (module_id, position, title, body) values
    (v_module, 0, 'Part 1: Placeholder', 'Placeholder reading content for part 1.'),
    (v_module, 1, 'Part 2: Placeholder', 'Placeholder reading content for part 2.'),
    (v_module, 2, 'Part 3: Placeholder', 'Placeholder reading content for part 3.'),
    (v_module, 3, 'Part 4: Placeholder', 'Placeholder reading content for part 4.');

  -- 3 questions; the correct answer is always option index 0 (the first option) to make testing easy
  insert into quiz_questions (module_id, position, prompt, options, explanation)
  values (v_module, 0, 'Placeholder question 1?',
          '["Correct answer", "Wrong answer A", "Wrong answer B"]'::jsonb,
          'Explanation for question 1.')
  returning id into v_q1;

  insert into quiz_questions (module_id, position, prompt, options, explanation)
  values (v_module, 1, 'Placeholder question 2?',
          '["Correct answer", "Wrong answer A", "Wrong answer B", "Wrong answer C"]'::jsonb,
          'Explanation for question 2.')
  returning id into v_q2;

  insert into quiz_questions (module_id, position, prompt, options, explanation)
  values (v_module, 2, 'Placeholder question 3?',
          '["Correct answer", "Wrong answer A"]'::jsonb,
          'Explanation for question 3.')
  returning id into v_q3;

  insert into answer_keys (question_id, correct_index) values
    (v_q1, 0), (v_q2, 0), (v_q3, 0);
end $$;