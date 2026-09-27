# 011 Answer Confidentiality and Server Side Grading
**Date:** 27.09.26
**Status:** Pending - on Team and Client approval

## Context
If Daily Challenge answers reach the browser the site's users (cyber security students) could potentially gain access to them using browser developer tools. The LLM also has access to enough context to accidentally reveal answers inside hints or feedback. Supabase also allows direct client access to tables which is dictated by Row Level Security (RLS) policies.

## Options Considered
- Option A: Store answers with the challenge and hide them within the UI
- Option B: Send hashed answers to client and compare hashes within browser
- Option C: Store answers in a separate table that no client has read rights to. Grade submissions server side

## Decision
Option C:
- Answers, the mapping of multiple choice options to mistakes, worked solutions and "leak terms" will be stored in a `daily_challenge_answers` table, which has **RLS enabled and no policies**, so only the service role can read it. A `question_pool` table and `review_questions` table will be protected in the same way.
- Public challenge rows will only contain prompt data, option identifiers and display text.
- All grading happens in Next.js API routes via the microservice. Worked solutions will only be returned if the user is correct or has used all attempts.
- The microservice returns a list of leak terms with each challenge, and any LLM written text containing one will be rejected and regenerated, with a fallback to templated text.
- The XP and streak database function can be executed only by the service role.

## Rationale
Option A is unsafe and was immediately passed on. Option B creates additional computation overhead and would require encryption implementation. Option C enforces confidentiality within the database itself and uses the same RLS approach the team is already using.

## Consequences
Answers cannot be read client side and the LLM won't be able to reveal answers. However, the leak check  has limitations. It will match using strings, so a paraphrased answer could potentially slip through. Therefore generated hints should be properly reviewed during testing. Hints are currently delivered with the challenge and the number of hints used is reported by the browser, so the XP hint penalty relies on a level of trust until hint reveals can be tracked server side.