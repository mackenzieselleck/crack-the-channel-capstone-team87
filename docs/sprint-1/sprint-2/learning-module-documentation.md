# Learning Module Feature Documentation

## 1. Overview

Learning modules are built using BA requirements and UX learning module wireframes as a guideline. Each module is segmented into **pages**. As the user works through the content they must press **Next** to access the next module segment. This action increments the progress bar for the module and their progress in saved within the database. Every module ends with a **quiz** and the module is only accepted as complete once the user passes the end test. The system is built so that the module logic exists, but all necessary text and quizzes are data that still needs to be implemented into the database, so all learning content can be added in without code changes needed.

## 2. How it works

- A module is considered broken up into **N reading pages + 1 final test**, so it has N + 1 progress units that go into a user's module progress bar
- Pressing **Next** on a page completes that segment of the module and increments the bar
- The bar will reach N / (N + 1) once the reading has been complete, and 100% **only after the test is passed successfully**.
- Progress can only moves forward. If a user chooses to go back and reread content it doesn't impact their progress
- Reopening a module or starting a new session will resume the user at the first incomplete segment
- Users cannot skip ahead in the learning content. A page can only be completed if the pages before it have been. The test is locked until the module reading is complete.
- Tests are automatically graded on the server. At the moment, failed quiz attempts can be retried as many times as the user would like
- Pass grade can be set per module, at the moment it is set to 70% correct for passing grade
- A completed module keep its completed status even if the user fails if they retake the test again

**For example: a module with 4 pages has 5 units (as each module also includes a test), so the bar will increment 20% -> 40% -> 60% -> 80% -> 100% (after the user passes the test)**

## 3. Architecture

```
Browser (Next.js / React)                        Supabase (Postgres)
┌──────────────────────────────┐                ┌─────────────────────────────────┐
│ app/learn/[slug]/page.tsx    │                │ modules, module_pages,          │
│   └─ ModuleShell             │  select (RLS)  │ quiz_questions   ← content      │
│        ├─ ProgressBar        │ ─────────────► │ module_progress,                │
│        ├─ page content       │                │ quiz_attempts    ← user state   │
│        └─ Quiz               │  rpc()         │ answer_keys      ← hidden       │
│ useModule() hook             │ ─────────────► │ advance_page(), submit_quiz()   │
└──────────────────────────────┘                └─────────────────────────────────┘
```

The frontend **displays** state. All rules (no skipping, grading, pass/fail) are enforced from within the database, so they can't be bypassed by users employing browser dev tools.

## 4. Data model

### Content tables

| Table | Purpose |
|---|---|
| `modules` | One row per learning module: `slug` (used in the URL), `title`, `summary`, `position` (course order), `pass_mark` (% needed to pass test), `is_published` (drafts stay hidden to users) |
| `module_pages` | One row per module page: `position` (starts at 0 like array positioning), `title`, `body` (markdown, empty until content is provided). Page count is what is used to increment progress bar |
| `quiz_questions` | One row per test question: `prompt`, `options` (JSON array of answer choices), `explanation` (shown after submission). |
| `answer_keys` | The correct option index for each question. Is kept in a seperate table so ensure the browser can never access it. |

### User state tables

| Table | Purpose |
|---|---|
| `module_progress` | One row per user per module: `pages_completed` (furthest point a user has reached), `quiz_passed`, `best_score`, `completed_at` (set on first pass of test, can never be overwritten) |
| `quiz_attempts` | A log of user quiz attempts with one row per test submission (score, pass/fail, answers given) |

## 5. Security model

- **Row-level security (RLS)** is enabled on every table
  - Logged in users can only read published modules
  - Users can only view their **own** module progress and attempts
  - `answer_keys` has RLS enabled with no policies and no grants, to ensure only server side functions can read it
- **Table privileges:** browser roles are granted `select` only. RLS filters rows, but the role also needs table level `grant`s, or queries fail with error `42501`.
- **No direct writes:** users have no insert/update permissions. All writes go through the two functions created for the learning modules
- **Identity comes from the login token** (`auth.uid()`) to ensure users can't use someone else's module progress
- Both functions run as `security definer` with a pinned `search_path`, are executable by `authenticated` users only and check that the module is published. This is because functions bypass RLS

## 6. Database functions

### `increment_progress(p_module_id, p_page_index)`

Called when the user presses Next on a page (0 based index)

1. Rejects guest users and unpublished modules
2. Rejects an index outside the module's page range
3. Creates the user's `module_progress` row on first use of **Next**
4. Uses `pages_completed = greatest(pages_completed, p_page_index + 1)`, so progress only ever increases
5. Only applies if `p_page_index <= pages_completed`. This blocks users from skipping ahead. Otherwise it raises `cannot skip ahead` exception.
6. Returns the updated progress row.

### `submit_quiz(p_module_id, p_answers)`

`p_answers` is `{ "<question_id>": <selected option index>, ... }`.

1. Rejects guest users and unpublished modules
2. Requires all pages to be completed prior to test (`finish the reading before taking the test`)
3. Requires the module to have at least one question
4. Compares each answer against the modules `answer_keys`. Unanswered questions are counted as incorrect
5. The score is calculated as a percentage and compared to `pass_mark`
6. The user's attempt is then logged in `quiz_attempts`
7. Updates `module_progress`: `quiz_passed` which stays true once the test is passed, `best_score` keeps the highest score reached by the user, and `completed_at` is set on the first passing score
8. Returns `score`, `passed`, `correctCount`, `total`, and per question `results` with explanations

## 7. Frontend

| File | Responsibility |
|---|---|
| `lib/learning/types.ts` | Shared TypeScript types |
| `lib/learning/progress.ts` | Functions: module status, resume position, and course percentage |
| `lib/learning/useModule.ts` | React hook: loads the module and user's progress, resumes at the correct place, and handles Next, Back and quiz submission |
| `components/learning/ModuleShell.tsx` | Page layout: title, progress bar, current page, Back/Next buttons |
| `components/learning/Quiz.tsx` | Test UI: questions, submit, results view with explanations, retry on fail. Shows a "not added yet" message if a module has no questions available |
| `app/learn/[slug]/page.tsx` | Route that reads the slug from the URL and renders `ModuleShell`. |

Use: visit `/learn/<module-slug>` (for example `/learn/test-module`)


## 9. Manual testing checklist - unit tests should still be completed once content has been provided

- [x] `/learn/test-module` loads while logged in
- [x] The bar steps 20% → 40% → 60% → 80% as Next is pressed
- [x] Refreshing mid-module resumes at the first unfinished page
- [x] Clicking Back doesn't regress the bar, and re-pressing Next on completed pages doesn't call the server
- [x] The test is only reachable after the last page, calling `submit_quiz` early fails with `finish the reading before taking the test`
- [x] Choosing the first option on every question passes and shows 100%
- [x] Getting 1 of 3 right scores 33%, fails and shows **Try again**
- [x] A row appears in `quiz_attempts` for each submission

To reset the test data on a **development database only**:

```sql
delete from module_progress;
delete from quiz_attempts;
```

## 10. Process to add in real learning content

For each module:

1. Insert one row in `modules` (leave `is_published = false` while drafting)
2. Insert the modules pages in `module_pages` with `position` values starting from 0 and incrementing by 1
3. Insert questions in `quiz_questions` **and** a matching row in `answer_keys` for every question. A question without a key is dropped from grading but still counts toward the total, which silently lowers scores
4. Set `is_published = true` when ready for user viewing

Page bodies are currently rendered as plain text. Swap the body element in `ModuleShell.tsx` for a markdown renderer once real content exists


## 12. Known limitations of current backend

- Multiple choice questions only. Other question types would need a `type` column and a change to grading would need to occur
- Module ordering or unlocking (finish module 1 before module 2) is not yet implemented
- There is no module list or dashboard page yet. `progress.ts` already provides per-module and overall course percentages for one.
- `completed_at` and `best_score` are stored, no gamification such as badges or xp rewards are in place yet
- Page content is displayed as plain text until a markdown renderer is added