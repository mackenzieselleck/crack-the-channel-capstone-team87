-- Supabase grants execute on new public functions to anon by default
-- picked up with db tests
revoke execute on function increment_progress(uuid, int) from anon;
revoke execute on function submit_quiz(uuid, jsonb) from anon;

notify pgrst, 'reload schema';