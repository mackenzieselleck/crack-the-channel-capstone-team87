# 005 AI Agent Integration
**Date:** 23.08.26
**Status:** Approved
**Last Edit:** 26.09.26, Mackenzie Selleck

## Context
The client has encouraged the team to incorporate an AI agent into the platform in some capacity. This is a requirement beyond the original scope brief, and its incorporation wasn’t specified by the client. Therefore, a decision must be made regarding its incorporation into the project.

## Options Considered
- Option A: A tool calling agent, using an existing LLM, restricted to structured tool calls with defined parameters 
- Option B: A plain chatbot, using the same underlying LLM but without tool access, generating explanations and challenge text from its own training knowledge alone
- Option C: A rule-based or scripted agent, using fixed dialogue trees and pre-written hints rather than an LLM

## Decision
A tool calling agent built on an existing LLM, restricted to structured tool calls only. The agent is never permitted to return free form code for execution

This will apply across all agent use cases, including the Daily Quantum Challenge, which randomises across multiple question categories:

- **Categories requiring circuit execution:**
The agent will call run_circuit with structured parameters. The orchestration layer executes it against the sandboxed Qiskit service and returns real results for the agent to build the challenge around.
- **Categories not requiring circuit execution:**
The agent answers directly from its own knowledge, generating the question, correct answer, and explanation with no call to the Qiskit service at all

## Rationale
Option C was rejected because it does not meet the client's request appropriately. The client specifically encouraged the use of an AI agent, and a fixed dialogue tree would not meet these standards.

Option B would technically involve an LLM, but was rejected because an agent without tool access has no way to ground its explanations in what actually happened in a user's simulation run. This may produce agent error or create vague or clunky results. As the primary goal of the platform is teaching, the agent should be able to provide accurate and helpful support to the user.

Option A was chosen because tool calling with structured parameters lets the model request a circuit execution and receive real results. This will ground its explanations and allow the agent to generate challenges in Qiskit without ever handing the model unbounded code.

## Consequences
Because the agent's tool call is an HTTP request to a separate service, every result depends on the microservice being available and responding within the orchestration layer's timeout. The team will need to ensure that failure within the Qiskit service would be handled gracefully in the agent's response. Because the agent has the ability to trigger circuit execution, any resource limits and sandboxing will also apply to agent triggered runs which is why Qiskit isolation was treated as a hard requirement.

The use of an agent in this manner will need the team to ensure that it is done with structured tool calls only. All tools will need to be defined with an explicit and validated parameter schema rather than allowing the agent to freely return code or commands to be executed. 

## Revisions
The core ide of this ADR stands. The AI will use structured tool calls only and won't returns code for execution. Tool calling will also be the approach for the extension "Ask the Tutor" assistant feature. The revisions below record all current and why they have occurred.

| # | Date | Change | Reason | Related |
|---|---|---|---|---|
| 1 | 23.09.26 | The LLM will be open source | Client scope change | ADR 006 |
| 2 | 26.09.26 | The LLM will no longer generate answers from its own knowledge. Code will compute and grades answers instead | Open source models can make math errors that beginners won't always be able to discern | ADR 007 |
| 3 | 26.09.26 | Daily Challenges are generated using fixed workflow | Generation steps won't change as smaller models are less reliable | ADR 008 |


### Revision 1: Open source LLM
**What changed:** Option A  states "a tool calling agent, using an existing LLM", and the Architecture Overview had Claude API as the hopeful choice placeholder until Client approval. The LLM now needs to be open source.
**Why:** The client wants the project to use an open source LLM as paid models with be too costly. These models are usually less reliable especially for university level mathematics and multi step tool use and therefore there were concerns about its ability to perform the original proposed agent workload
**Impact:** Option A still remains as the chosen approach, but the scope of what the LLM will be entrusted to handle has had to be limited significantly. See ADR 006 for further details.

### Revision 2: Answers computed by code, not by the LLM
**What changed:** This ADR originally proposed that the agent would generate the question, answer and explanation from its own knowledge for all question categories that didn't include circuit execution. Now every Daily Challenge answer for every category will be computed and graded using code within the microservice. The LLM now will only write challenge text, hints and feedback.
**Why:** Users are beginners who won't be able to always identify an incorrect answer. Open source models can make mistakes especially in areas involving complicated mathematics. As this is primarily a learning platform we must ensure user's are receiving correct knowledge.
**Impact:** This will ensure every answer is correct. Workload will be increased for the feature as hand written generators and graders will need to be produced. See ADR 007.

### Revision 3: Fixed workflow for Daily Challenge generation
**What changed:** This ADR orginally had the agent calling `run_circuit` and building the challenge around its results. Daily Challenge generation is now a fixed workflow within code where the problem is generated in the microservice -> the LLM writes the text -> it is validated -> then it is stored. The tool calling agent originally proposed will be kept for the potential "Ask the Tutor" assistant extension, where the model will need to choose actions.
**Why:**  Open source models are less reliable for multi step tool loops and a fixed workflow will be easier to test.
**Impact:** Generation makes the challenges predictable and testable. The structured tools and graceful failure handling requirements originally proposed will still apply to the tutorextension. See ADR 008.




