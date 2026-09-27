# 007 Daily Challenge Generation and Grading
**Date:** 26.09.26
**Status:** Pending - on Team and Client approval


## Context
ADR 005 originally proposed that all Daily Challenge categories that did't need circuit execution will answer directly from its own knowledge, generate the question, answer and explanation. The site's users will primarily be beginners and therefore will be unable to identify any incorrect answers if an error were to occur with the agent. Open source models (ADR 006) can make istakes when computing complex math which would be involved within the daily challenge task options. If incorrect "correct" answers were to enter the Daily Challenge task pool, the efforts made within the project to provide an education tool to users would be undermined.

## Options Considered
- Option A: The LLM generates the question,answer and explanation from its own knowledge (original ADR 005 approach)
- Option B: The LLM generates the question and answer, and a second call verifies it
- Option C: Deterministic code within the microservice generates, computes and grades every question and answer. The LLM will write text scenarios, hints and feedback. It will also cover multiple choice questions with the support of provided learning content and structured tools.

## Decision
Option C, for **all** Daily Challenge categories, including those that don't require circuit execution. The microservice will handle problem generation, answer computation and grading. The LLM will receive public challenge data when writing challenge text, and itsfeedback will be limited to rephrasing an explanation provide by grading code.

## Rationale
Option A provides no guarantee that answers will be correct, which is unacceptable for a learning platform with a beginner user base. Option B reduces this risk but mitigate it. Option C will guarantee correctness because every answer comes from the microservice. It also means that the Daily Challenge will be able to work if the LLM is unavailable, since every task will have a fallback.

## Consequences
Every answer shown to a user is verifiable and will be able to be tested without an LLM. The LLM can be replaceable. However, new challenge categories will need a coded generator and grader, which is an additional effort that wasn't originally proposed within the scope. Multiple choice questions will be based off learning content and remain LLM written, but will be validated. This will also narrow the scope of the agent.