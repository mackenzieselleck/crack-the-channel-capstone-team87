# LLM Prompting QA Tests

This report records my review of LLM prompting for challenge text, feedback and module questions. I have separated confirmed implementation gaps from quality risks and areas that still need further testing.

| | |
|---|---|
| **Test date** | 27 October 2026 (Australia/Sydney) |
| **Application** | Crack the Channel |
| **Repository** | `mackenzieselleck/crack-the-channel-capstone-team87` |
| **Branch tested** | `main` - `595f0a9f3abc0b25da14b7c40a4bea049b5ab5ec` |
| **Run with** | Isolated QA copy; actual TypeScript implementation; controlled model responses and simulated external services |
| **Checks** | **42 checks: 29 passed, 13 failed assertions** |
| **Outcome** | **Changes needed before sign-off. Fallbacks and structural validation work, but answer confidentiality and request configuration have reproducible gaps.** |
| **Related test docs** | `Learning-Daily-Challenge-Manual-QA.md`; `Badge-Logic-QA.md` |

Remote main was checked again after testing and still matched the recorded commit.

## 1. Scope of the review

I have assessed the implementation results separately from live-model quality. Controlled responses show what the application accepts or rejects, but do not establish how frequently a live model would produce those responses.

**Scope limitation:** These findings do not establish full E2E coverage with a real provider, database or HTTP transport. No live model was contacted. The 13 failed assertions include overlapping coverage and quality limitations; they are not 13 independent production incidents.

## 2. How to run follow-up tests

Use an isolated test copy, record the exact commit and document any setup changes. The evidence file lists the 42 named checks, classifications and assertion outcomes. Before sign-off, evaluate the configured live provider across challenge categories and tiers, then verify real integration, accuracy, latency, cost and fallback behaviour. Keep production accounts and provider secrets out of the QA records.

## 3. How the tests were performed

The review covered challenge title/scenario/task/hint generation, feedback rewriting, module MCQ generation and verification, JSON validation, retry behaviour, deterministic fallbacks, request configuration, rate-budget decisions, and the challenge-generation route.

Used the isolated QA clone from the badge assessment, updated to latest main. The user's original OneDrive/VS Code workspace was untouched. No production accounts, real provider keys, live provider calls, or production database writes were used.

The tests bundled the actual TypeScript implementation and replaced only the SDK completion method and external database/service boundaries. Captured request objects establish exactly what the application sends to the SDK. Controlled model responses include valid content, malformed JSON, provider errors, leaking answers, contradictory feedback, and invalid questions. Route checks execute the actual Next.js GET handler with simulated authenticated requests and storage.

**42 checks: 29 passed and 13 failed.** These are custom QA assertions, not 42 pre-existing repository tests. Failures include duplicate coverage of the title leak, known semantic limitations, and prompt-only requirements; they are not 13 independent production incidents. No claim is made that a live model produced the injected examples.

## 4. What was tested

### 4.1 Verified working behaviour

| Area | Verified result |
| --- | --- |
| Prompt confidentiality | Challenge requests exclude private answer and worked-solution fields. Feedback requests exclude the leak-term list and raw learner submission. Public options remain present as intended. |
| Parsing | Valid JSON and fenced JSON are accepted; malformed JSON is retried with rejection feedback. |
| Structural validation | Wrong hint counts and excessive lengths are rejected locally, even when a provider returns them. |
| Exact leaks | Exact and whitespace-separated bitstrings in hints are detected and retried. |
| Feedback fallback | Budget denial avoids model calls; provider errors or repeated detectable leaks return the grader's explanation. |
| Reveal policy | Feedback can explain the answer after attempts are exhausted. |
| Module questions | Valid sourced MCQs require a second agreeing response. Fabricated quotes, duplicate options ignoring case/spacing, verifier disagreement, and invalid verifier indices are rejected. |
| Human fallback | Model failure or disabled generation uses a module's human-written quiz question, preserving correct-answer mapping after shuffling. No eligible module returns null without a model call. |
| Static templates | All six category templates satisfy the challenge-text schema. |
| Actual generation route | Malformed model responses produce stored fallback text; answers stay in separate simulated secret storage and outside the response. Unrevealed hints are withheld. Cached challenges avoid another model call. Anonymous requests get 401. Budget-denied generation uses fallback text. |
| Budget decisions | A denied LLM budget response stops generation. Database errors explicitly fail open; see the risk below. |

## 5. Issues and observations

### 5.1 LLM-01 - Answers in titles bypass leak validation - high

**Location:** `my-app/lib/daily-challenge/prompts.ts:73`.

Injected otherwise-valid output with title `The key is 101101` and leak term `101101`. The writer accepted it. A separate test of the actual generation GET handler confirmed it is stored and returned as the public title.

The leak check concatenates scenario, task, and hints but omits title. Include all learner-visible generated fields in validation. This is a reproduced validation bypass; live-model incidence was not measured.

### 5.2 LLM-02 - Case changes bypass alphabetic answer checks - medium

**Location:** `my-app/lib/daily-challenge/llm.ts:100`.

`leaks('The word is SECRET.', ['secret'])` returns false. The alphabetic branch uses a case-sensitive regular expression, unlike the lowercase-normalised nonalphabetic branch. This matters for the word-answer sifting category. Use consistent case normalisation or a case-insensitive match while preserving appropriate boundaries.

### 5.3 LLM-03 - Compatibility helper is not used in requests - medium, provider-dependent impact

**Location:** `my-app/lib/daily-challenge/llm.ts:29` and the `response_format` construction in `llmJson`.

`providerSchema()` removes keywords the implementation identifies as incompatible with some strict providers, but requests use raw `z.toJSONSchema(schema)`. Captured requests retain constraints such as `minLength` and `maxItems` despite the helper removing them successfully in isolation.

This confirms the wiring gap, not rejection by the currently deployed provider. Exercise the configured provider's schema subset and use the intended compatible schema where appropriate; retain local Zod checks.

### 5.4 LLM-04 - Table summarisation is not used - low

**Location:** `my-app/lib/daily-challenge/prompts.ts:51` and `writeChallengeText` public-data construction.

The summariser converts long object arrays to descriptions, but the writer sends `ch.prompt_data` directly. A 48-row fixture was sent in full. This defeats the documented token-saving measure. Apply summarisation to writer input and verify the generated task still points users to the table rendered by the site.

### 5.5 LLM-05 - Model timeout budgets can exhaust the route - medium

**Location:** `my-app/lib/daily-challenge/llm.ts:55`; feedback and MCQ calls in `prompts.ts`; challenge routes declare `maxDuration = 60`.

Captured request options allow two feedback attempts at 30 seconds each: 60 seconds before grading, database operations, and response handling. A module-question path can allow 15 + 15 seconds for generation, 10 for verification, and 12 + 12 for challenge text: **64 seconds** of model calls alone.

These are verified configured budgets, not measured 60-second failures or deployed-host timeout observations. Use a shared deadline and reserve time for fallback, persistence, and response handling.

### 5.6 LLM-06 - Reasoning-effort configuration is ignored - low

**Location:** `my-app/lib/daily-challenge/llm.ts:17` and request construction.

With `LLM_REASONING_EFFORT=low` supplied before module initialisation, captured request objects contain no `reasoning_effort`. The variable is declared but unused. Either pass supported configuration through or remove/document the unused setting.

## 6. Guard limitations and quality risks

These require qualification rather than being presented as observed live-model mistakes:

- **Single-character answers:** the leak checker deliberately ignores terms shorter than two characters. `leaks('The answer is X.', ['X'])` returns false. Consider category-aware protection; globally blocking every single character would cause false positives.
- **Equivalent wording:** `25 percent` is not detected for leak term `25%`. ADR-011 already acknowledges string-matching/paraphrase limitations. Exact matching alone cannot establish answer confidentiality.
- **Contradictory feedback:** when `correct=false`, a schema-valid response saying “Correct! Your answer is right…” is accepted. The system prompt forbids contradictory facts, but the runtime checks only shape and listed answer strings. Grading and XP are still determined by code; the misleading learner message is the risk.
- **MCQ semantics:** a true supporting quote plus two agreeing model responses can still accept a wrong selected answer. The controlled fixture chose “Router” for the unit storing quantum information while quoting the passage's correct qubit statement. Agreement is a useful filter, not a correctness guarantee.
- **Prompt-only MCQ rules:** “All of the above” is accepted despite the prompt prohibiting it. Reject this mechanically where desired and review distractor quality with a live-model evaluation set.
- **Cost control fails open:** a simulated rate-limit database outage makes `llmAllowed` return true. This is explicitly intentional in source, but removes the LLM cost/abuse limit during outages. Consider using deterministic fallback when only the LLM budget check is unavailable.
- **Prompt injection resistance:** source passages are embedded in user messages, and generated MCQ text is fed into verification. There is no explicit instruction to treat passage/question instructions as untrusted data. No live injection experiment was performed, so exploitability is unverified.

## 7. Supporting test results and what remains unverified

- `npm test` was run on this main commit. All eight suites failed to start because configured `tests/setup.ts` is missing. No existing unit tests ran in that invocation. The standalone custom QA harness did run independently.
- The Python challenge test command was attempted, but this Python environment has no `pytest`; those tests did not execute. Full Qiskit setup was not installed for this prompting-focused assessment.
- No live Groq/Ollama/other configured provider was contacted. Provider schema acceptance, real generation quality, hallucination rate, prompt-injection success rate, actual latency, and token cost remain unverified.
- No browser layout/accessibility regression run was performed for this backend prompting assessment. The actual generation handler was exercised directly; database/HTTP/SDK transport were simulated.
- The “Ask the Tutor” feature is described as an extension in architecture documents; the active LLM call sites found are the daily-challenge workflow assessed here.
- No application fixes, commits, pushes, or GitHub issues were created. QA temporary bundles were removed; only the pre-existing generated AGENTS.md change remains in the isolated clone.

## 8. Recommended next steps

My recommended order of work is:

1. Fix title and case-sensitive answer leaks first.
2. Apply provider-schema conversion and enforce a route-wide deadline.
3. Wire table summarisation and reasoning settings correctly.
4. Add regression tests for the reproduced gaps and restore the missing unit-test setup.
5. Run an approved live-provider evaluation across categories and tiers, including repeated generations, equivalent-answer phrasing, injection-bearing passages, accuracy, hint progression, latency, and fallback rates.

Evidence: `llm-prompt-check-results.json` contains all 42 named checks, classifications, and assertion outcomes.

### Final status

| Status | Checks / findings |
|---|---|
| **CONTROLLED CHECKS (42)** | **29 passed, 13 failed assertions**; custom QA checks rather than 42 existing repository tests |
| **IMPLEMENTATION FINDINGS (6)** | LLM-01 title leaks; LLM-02 case-sensitive leaks; LLM-03 schema helper wiring; LLM-04 table summarisation; LLM-05 timeout budgets; LLM-06 reasoning configuration |
| **QUALITY AND GUARD LIMITATIONS** | Single-character and equivalent-answer leaks, contradictory feedback, MCQ correctness and prompt-only rules, fail-open cost control, and unverified injection resistance |
| **EXISTING UNIT TESTS** | All eight suites failed to start because `tests/setup.ts` is missing; no existing unit tests ran in that invocation |
| **PYTHON CHALLENGE TESTS** | Did not execute because `pytest` is unavailable |
| **LIVE-PROVIDER VALIDATION** | Not performed; provider acceptance, content quality, latency, cost and injection success remain unverified |
| **BROWSER REGRESSION** | No layout or accessibility regression run; generation handler exercised directly with simulated boundaries |
| **RELEASE SIGN-OFF** | **Not established**; changes and further validation required |

**Conclusion:** My assessment is that fallback handling and structural validation are supported by the controlled results, but answer protection and request configuration need changes. I would not give sign-off until the reproduced gaps are addressed and the outstanding live-provider checks are completed. The injected responses demonstrate validation behaviour, not observed live-model incidents.
