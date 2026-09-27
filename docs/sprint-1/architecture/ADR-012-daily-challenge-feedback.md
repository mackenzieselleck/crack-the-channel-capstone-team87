# 012 Mistake Based Feedback and Multiple Choice Distractors
**Date:** 27.09.26
**Status:** Pending - on Team and Client approval

## Context
The platform's primary goal is teaching, so a wrong answer should be accompanied with an explaination as to *why* it is wrong. Asking an open source LLM to work out why a user's mistake can be unreliable. Randomly generated wrong options in multiple choice questions will also add little teaching value as users may find the answer obvious.

## Options Considered
- Option A: Simple correct/incorrect results, followed by the worked solution
- Option B: The LLM diagnoses the user's mistake and writes feedback
- Option C: Grading code identifies the specific misconception using a **mistake tag** and provides a basic code written explanation, the LLM is used to rephrase. Multiple choice distractors are computed by the LLM from known misconceptions

## Decision
Option C. Each category will have a defined catalogue of mistake tags (eg: `wrong_ordering`, `forgot_sqrt`, `kept_all`, `qber_is_rate`) with a valid explanation. Distractors are  then computed from these misconceptions (eg: wrong qubit ordering, missing normalisation, sign errors, treating QBER as the intercept rate), so choosing one maps directly to a tag. Where two misconceptions could produce the same wrong value, only one tag is kept so feedback never names the wrong mistake. The LLM then will be called to rephrase the explanation in a friendly tone without adding in additional facts. The explanation text will be used as a fallback if the LLM fails. Every attempt stores its mistake tag.

## Rationale
Option A misses a key teaching tool that we need to better user experience. Option B gives feedback but it may be wrong with no reliable way to check which will be detrimental to the user's learning journey. Option C gives targeted, trustworthy feedback and keeps the LLM with the role performing reliably (ADR 007).

## Consequences
Feedback is precise and verifiable, and stored mistake tags can be used for usability testing data showing which concepts users are struggling with and where module content needs improvement. However, each new category requires its mistake catalogue to be written by hand, and answers that match no known misconception receive generic feedback. This will create additional build requirements.
