# 005 AI Agent Integration
**Date:** 23-08-2026
**Status:** Pending - on Team and Client approval

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





