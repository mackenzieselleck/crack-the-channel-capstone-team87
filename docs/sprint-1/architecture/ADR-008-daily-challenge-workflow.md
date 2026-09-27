# 008 Daily Challenge Generation Workflow
**Date:** 26.09.26
**Status:** Pending - on Team and Client approval

## Context
ADR 005 originally proposed an agent building circuit challenges by calliing `run_circuit` and constructing around results. A tool calling agent has the LLM deciding which tools to call and in what order. The Daily Challenge scope has shifted. Generation will instead follow the same steps every time. It will choose a category, generate a problem, write the text, validate and store it. this shift is due to the incorporation of an open source model which is less reliable.

## Options Considered
- Option A: Agent driven generation, where the model decides which tools to call (ADR 005 originally proposed approach)
- Option B: A fixed workflow via code. The orchestration layer will call the microservice to handle question logic and the LLM will be given a definied writing task
- Option C: No LLM involvement, templated challenge text only

## Decision
Option B will be implemented The workflow shall be as follows: the category is randomly selected -> call the miscroservice's generate endpoint -> LLM writes challenge title, scenario and three tiered hints -> result is validated (Zod schema and with answer leak check) -> stored in database. The tool calling agent behaviour from ADR 005 will still be retained as an option for the hopeful **"Ask the Tutor"** assistant extension.

## Rationale
Option A will add unecessary unpredictability. It will also be harder to test and will be more likely to produce errors. Option C would meet the functional requirements of the feature but would not satisfy the client's suggestion for the project to inclue AI use. Option B is more predictable, cheaper and testable, while still incorporating AI use. LLM models. Therefore the client's request for an AI agent will likely need to be further met by including the tutor extension as the daily challenge is now more like an AI assisted workflow. 

## Consequences
Generation will be reliable and testable. ADR 005's structured tools only proposal will still apply to the tutor feature. The Architecture Overview will need to be altered to describe two AI uses: the Daily Challenge workflow and the tool calling tutor.
