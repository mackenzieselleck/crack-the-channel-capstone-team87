# 006 LLM Choice
**Date:** 26.09.26
**Status:** Pending - on Team and Client approval

## Context
ADR 005 established that the AI agent will be built on an existing LLM. The Architecture Overview lists the LLM provider as still to be determined (the architecture diagram used Claude API as a placeholder). The team has since been required to use an **open source LLM**. These models can vary in their reliability. Its integration will need to ensure the API key us stored securely as previously determined within the Architecture Overview.

## Options Considered
- Option A: Use a proprietary model directly through its own SDK (eg: Claude API), as originally presented within the first iteration of the architecture diagram
- Option B: Integrate a specific open source model through a its SDK (eg: Ollama's API)
- Option C: Integrate an open weight model through the use of an **OpenAI compatible Chat Completions API**, with the base URL, model name and key securely stored within environment variables

## Decision
Option C. The agent orchestration layer will use the OpenAI SDK which will point at an `LLM_BASE_URL` and `LLM_MODEL` environment variable. Ollama is used during development, and production will use either an open weight inference provider or a self hosted server (Ollama). The chosen model will need to be an instruct model with good JSON output and native tool calling support. All LLM output will be requested as JSON and validated with Zod before use. Retries and deterministic fallbacks will be implemented for every LLM task.

## Rationale
Option A does not meet the open-source requirement and will prove costly. Option B would tie the codebase to a single hosting method, which could make client handover and deployment harder. Most open weight hosting options expose an OpenAI compatible endpoint, so Option C should allow the team to change the model or host by mply changing environment variables rather than needing to alter code. As open models can make more errors than proprietary models, validation and fallbacks will be needed to ensure effective agent integration.

## Consequences
The team won't be locked into a single provider, token costs will be kept low or zero depending on hosting choice. Structured output support will differ between providers, so the team will need to test JSON generation if the model or host changes.