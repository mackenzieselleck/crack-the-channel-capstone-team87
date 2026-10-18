-- Daily Challenge: table privileges for the server

grant select, insert, update, delete on public.daily_challenges        to service_role;
grant select, insert, update, delete on public.daily_challenge_answers to service_role;
grant select, insert, update         on public.challenge_attempts      to service_role;
grant select, insert, update, delete on public.rate_limits             to service_role;
grant select                         on public.profiles                to service_role;  -- streak/XP display

-- module content
grant select on public.modules         to service_role;   -- only published modules are used
grant select on public.module_pages    to service_role;   -- page text the LLM writes a question from
grant select on public.quiz_questions  to service_role;   -- fallback: the module's own test
grant select on public.answer_keys     to service_role;   -- correct option for the fallback question
grant select on public.module_progress to service_role;   -- which modules the user has passed


-- Make API pick up new privileges
notify pgrst, 'reload schema';