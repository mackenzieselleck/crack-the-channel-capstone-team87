create table public.daily_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null,
  difficulty smallint not null check (difficulty between 1 and 3),
  input_kind text not null,                 -- which input the frontend needs to show
  prompt_data jsonb not null,               -- tables, states, circuits etc. shown to the user
  options jsonb not null default '[]',      -- multiple choice options 
  title text not null, scenario text not null, task text not null,   -- LLM written (or fallback) text
  hints jsonb not null,                     -- three tiered hints
  used_fallback boolean not null default false,  -- true if fallback text was needed (LLM failed)
  created_at timestamptz default now(),
  unique (user_id, date, difficulty)        -- one challenge per user, day and tier
);

-- daily_challenge_answers: SERVER ONLY segment of each challenge
-- RLS is enabled with no policies

create table public.daily_challenge_answers (
  challenge_id uuid primary key references public.daily_challenges(id) on delete cascade,
  answer jsonb not null,                    -- passed back to grader on submission
  worked_solution text not null,            -- revealed only when solved or out of attempts
  leak_terms jsonb not null default '[]',   -- strings LLM feedback shouldn't contain
  seed bigint not null                      -- ensures challenge can be regenerated
);


-- challenge_attempts: every submission, kept for attempt limits and analytics

create table public.challenge_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.daily_challenges(id) on delete cascade,
  attempt_no smallint not null,
  submission jsonb not null,
  correct boolean not null,
  mistake_tag text,                         -- which misconception occurred
  hints_used smallint not null default 0,
  created_at timestamptz default now(),
  unique (user_id, challenge_id, attempt_no)  -- one row per attempt number
);


-- module_chunks: learning module text split into passages for module_mcq questions
-- to implement

create table public.module_chunks (
  id bigint generated always as identity primary key,
  module_id text not null,
  position int not null,                    -- order of the passage within its module
  content text not null
);


-- question_pool: human-written fallback questions for module_mcq, used when the LLM's question fails checks
-- to implement

create table public.question_pool (
  id bigint generated always as identity primary key,
  module_id text not null,
  question text not null, options jsonb not null,
  correct_index smallint not null, explanation text not null
);


-- RLS enabled on every table
-- Policies grant only reads the browser needs
-- Server routes use service role key which bypasses RLS.

alter table public.daily_challenges enable row level security;
alter table public.daily_challenge_answers enable row level security;   -- no policies = no client access
alter table public.challenge_attempts enable row level security;
alter table public.module_chunks enable row level security;
alter table public.question_pool enable row level security;             -- no policies

-- Users can read their own rows
-- All writes go through server routing

create policy "users read own challenges" on public.daily_challenges
  for select using (auth.uid() = user_id);
create policy "users read own attempts" on public.challenge_attempts
  for select using (auth.uid() = user_id);
create policy "signed-in users read content" on public.module_chunks
  for select using (auth.role() = 'authenticated');


