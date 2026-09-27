# 010 Daily Challenge Categories
**Date:** 26.09.26
**Status:** Pending - on Team and Client approval
 
## Context
ADR 005 proposes a Daily Challenge that randomises across several question categories. The team must decide which categories are to be included as challenges. The original design had 3 options: an eavesdropping challenge on a BB84 exchange, a multiple choice question based on the site's learning content, and gate simplification maths. Further categories were proposed during design such as key sifting and decryption, state evolution, normalisation and measurement probability, free text answers, "spot the flaw", "noise or Eve?", and a bigger "boss" challenge.
 
Each category will be judged against the following criteria:
- **Verifiable:** answers can be generated and graded by code (ADR 007)
- **Relevant:** the task reinforces BB84 concepts or the content taught within learning modules
- **Beginner friendly:** it can be solved by hand with no prior quantum knowledge, at three levels of difficulty (ADR 015)
- **Feasible:** it can be built and tested within the MVP timeline

## Options Considered
- Option A: Only the three original categories (BB84 eavesdropping, learning content multiple choice, gate simplification)
- Option B: The three original categories plus the proposed categories that meet all four criteria (key sifting, state evolution, normalisation), with the remaining proposals deferred
- Option C: Every proposed category, including those that will need an LLM to judge free text answers or construct scenarios

## Decision
Option B. Six categories will be included:
 
| Category | What it teaches | Tier 1 | Tier 2 | Tier 3 | Graded by |
|---|---|---|---|---|---|
| **BB84 eavesdropping** (`bb84_eve`) | How eavesdropping raises error rate (QBER), and when Alice and Bob should abort | Calculate the QBER from a sifted key and decide whether to abort | Estimate Eve's intercept rate from the QBER (≈ 4 × QBER) | Play as Eve, choose the highest intercept rate that avoids detection | Qiskit service Aer circuits |
| **Key sifting** (`sifting`) | How Alice and Bob build a shared key by keeping only matching bases, and how the key is used to encrypt a message | Sift a 10 round key | Sift and decrypt 6 bits with XOR | Sift, decrypt and decode a 3 letter word | Qiskit service Aer circuits |
| **State evolution** (`state_evolution`) | Gates as matrices acting on state vectors, and qubit ordering | One gate on one qubit (multiple choice) | One gate on a two qubit state, with a 4×4 matrix shown (multiple choice) | Two gates including CNOT (enter amplitudes) | Microservice `Statevector` |
| **Normalisation** (`normalisation`) | Valid quantum states, and measurement probability, which explains why a wrong basis gives a random bit | Probability of an outcome (multiple choice) | Find the normalisation constant for real amplitudes | Find the normalisation constant for complex amplitudes | Microservice SymPy |
| **Gate simplification** (`gate_simplification`) | Gate identities and circuit equivalence | Identify the single gate equal to a sequence (multiple choice) | Simplify a one qubit circuit using a circuit builder | Simplify a two qubit circuit including CNOT identities | Microservice `Operator.equiv` |
| **Learning content multiple choice** (`module_mcq`) | Recall and understanding of module content | One question written by the LLM from a module the user has completed | Not offered | Not offered | Orchestration layer answer stored server side |
 
The learning content category is only offered at tier 1, and only when the user has completed a module with content. Otherwise another category is picked automatically. The LLM will write the question and the four answer options from a single passage of module text. The supporting quote must appear word for word in the passage and an independent LLM call must choose the same answer. A human written question from that module will be used as a backup incase the LLM fails.
 
The following categories are **deferred**:
 
| Category | Reason for deferral |
|---|---|
| Explain it back (free text explanation) | Grading free text needs an LLM to judge correctness, which open source models cannot do reliably or consistently |
| Spot the flaw (find the mistake in a protocol transcript) | An LLM invented flaw could itself be wrong, a code generated version wouldn't be feasible within the MVP timeline |
| Noise or Eve? (tell channel noise apart from eavesdropping) | Needs a noise model added to the BB84 simulation |
| Boss challenge (several steps chained together) | Depends on the other categories being complete and adds its own UI, not feasible within MVP timeline |
 
## Rationale
Option A would leave out a number of core skill content that should be included for a more robust learning experience. Option C includes categories that fail the verifiable criterion due to the use of an open source model which ADR 007 rules out for a beginner audience. It would also not fit the MVP timeline.
 
Option B covers the learning content more thoroughly. Every included category is generated and graded by code, is solvable by hand, and scales across three tiers of difficulty. The learning content category keeps the LLM's role visible in the challenge, but in a form that can be validated against source text. It is limited to tier 1 because recall questions are closer to its difficulty.
 
## Consequences
All five categories handled by the microservice will need generators and graders to be created. Automated tests will also be needed to cover every tier. Each category will define its own mistake tags for feedback and follow beginner friendly construction.
 
The categories use seven different answer formats (multiple choice, abort decision, number, bit string, text, amplitudes and a circuit builder), and therefore will all need need their own frontend component. All of which add additional build time to the project.
 
The learning content category will stay inactive until module content is loaded. Any deferred categories can remain backlogged and added later without changing the architecture as every category follows the same generate and grade routing (ADR 009).