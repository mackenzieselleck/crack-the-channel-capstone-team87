# Crack the Channel - Learning Flow, Interaction & Key Screens

Combines the BB84 learning flow documentation, the Alice/Bob interaction sub-flow, and the consolidated key screens list.

## 1. BB84 Learning Flow

Documents the "BB84 Exchange" stage of the beginner journey map as its own five-stage flow, per BA Learning Observation 15.

Purpose: presenting the full BB84 protocol at once increases cognitive load for a beginner learner (Observation 15). Instead, the exchange is revealed as five sequential sub-stages, each with its own goal, learner action and system feedback, so the learner is never asked to hold the whole protocol in their head at once. This flow sits inside Stage 4 ("BB84 Exchange") of the journey map; the Alice/Bob role split within it is documented in Section 2, and screens named here feed the Section 3 key screens list.

### 1.1 Preparation

- **Learner goal:** Understand that Alice is about to send information encoded in qubits.
- **Learner action:** As Alice, selects/sends qubits using randomly chosen bases.
- **System behaviour:** Alice's role is introduced before the action is required; each action is explained as it happens, not after.
- **Screen:** Alice interaction screen.
- **Requirements:** FR-05, US-07
- **BA observation:** Obs 12 (sets up the state/measurement distinction used in stage 2)

### 1.2 Measurement

- **Learner goal:** Understand that Bob receives and measures using his own randomly chosen bases.
- **Learner action:** As Bob, measures incoming qubits.
- **System behaviour:** Bob's role is visually and conceptually distinct from Alice's (UX-02); the quantum-state-vs-classical-outcome distinction is shown visually at the moment of measurement, not just described in text.
- **Screen:** Bob interaction screen.
- **Requirements:** FR-06, US-08, UX-02
- **BA observation:** Obs 12 (measurement needs visualisation, this is the exact moment it applies)

### 1.3 Basis Reconciliation

- **Learner goal:** See which of Alice's and Bob's basis choices matched.
- **Learner action:** Observes Alice and Bob comparing (not revealing) their basis choices.
- **System behaviour:** Relevant (matched) vs. discarded (mismatched) bits are visually distinguishable.
- **Screen:** Shared exchange-outcome view.
- **Requirements:** FR-07 (partial), US-09 (partial)

### 1.4 Error Estimation

- **Learner goal:** Understand QBER and what an increased error rate means.
- **Learner action:** Views the error-rate/QBER result for this exchange.
- **System behaviour:** QBER is explained in beginner-friendly language; the explanation connects "higher error rate" to "possible eavesdropping," not just a raw number.
- **Screen:** QBER feedback panel.
- **Requirements:** FR-09, LO-07
- **BA observation:** Obs 17 (learners need to know if something is "right", this is the confirmation moment)

### 1.5 Post-processing

- **Learner goal:** Understand what the finished exchange means overall.
- **Learner action:** Views a plain-language summary of the completed exchange.
- **System behaviour:** Technical output is never shown without an explanatory wrapper; the learner can connect their actions to the result.
- **Screen:** Outcome/result screen.
- **Requirements:** FR-07, FR-10, FR-11, LO-08, US-09, US-16
- **BA observation:** Obs 17 (feedback after every meaningful action, culminating here)

### Cross-Stage Rule: Feedback After Every Action

Feedback is not saved for the end of the exchange, it appears after each of the five stages above. This is the single most-requested confidence builder in the student survey (tied for the biggest worry, 6 of 25: "hard to tell if I am doing it right") and is backed separately by Observation 17. Requirements: LR-06, UX-05, UX-06.

### Sequence Summary

```
Preparation -> Measurement -> Basis Reconciliation -> Error Estimation -> Post-processing
   (Alice)         (Bob)             (shared)              (shared)             (shared)
```

Feedback follows every stage above, not only the last.

### Traceability - BB84 Learning Flow

| Stage | Requirements | BA Observation |
|---|---|---|
| Preparation | FR-05, US-07 | Obs 12 |
| Measurement | FR-06, US-08, UX-02 | Obs 12 |
| Basis Reconciliation | FR-07, US-09 | - |
| Error Estimation | FR-09, LO-07 | Obs 17 |
| Post-processing | FR-07, FR-10, FR-11, LO-08, US-09, US-16 | Obs 17 |
| All stages (feedback rule) | LR-06, UX-05, UX-06 | Obs 17 |

## 2. Alice/Bob Interaction

Documents the sender/receiver sub-flow that sits inside stages 1 and 2 of the BB84 Learning Flow above ("Preparation" and "Measurement"), as its own reference.

Purpose: the learner plays both roles in the same exchange, first Alice, then Bob, rather than the two running as separate parallel characters. Each role is introduced, performed and explained on its own before the next role begins, so the learner is never asked to track both perspectives at once. Requirements: FR-05, FR-06, US-07, US-08.

Role distinction: Alice and Bob must be visually and conceptually distinguishable at every point they appear (UX-02), different screens, different visual treatment, never presented as an undifferentiated "the exchange."

### Sequence

```
Alice's turn (sender)  ->  Bob's turn (receiver)
```

This is sequential within the learner's experience, not simultaneous: the learner completes Alice's steps in full, receives feedback, then moves to Bob's steps. It corresponds to Preparation (Alice) followed by Measurement (Bob) in Section 1.

### 2.1 Alice's Sub-flow (Sender)

- **Learner goal:** Understand what it means to send information encoded in qubits.
- **Before acting:** Alice's role is clearly introduced, what she is about to do and why.
- **Learner action:** Selects/sends qubits using randomly chosen bases.
- **During/after acting:** Each action is explained as it happens or immediately after, not deferred to a later summary.
- **Screen:** Alice interaction screen.
- **Requirements:** FR-05, US-07

### 2.2 Bob's Sub-flow (Receiver)

- **Learner goal:** Understand what it means to receive and measure incoming qubits.
- **Before acting:** Bob's role is clearly introduced, distinct from Alice's.
- **Learner action:** Measures incoming qubits using his own randomly chosen bases.
- **During/after acting:** The distinction between the quantum state and the classical outcome produced by measurement is shown visually at this moment (Observation 12), not only described in text.
- **Screen:** Bob interaction screen (visually distinct from Alice's, per UX-02).
- **Requirements:** FR-06, US-08
- **BA observation:** Obs 12

### Feedback Rule (applies to both roles)

Feedback follows each individual action within both Alice's and Bob's sub-flows, not saved until the end of the whole exchange. This is the same cross-stage rule documented in Section 1, applied here at the level of each role's own steps. Requirements: LR-06, UX-05, UX-06. BA observation: Obs 17.

### Traceability - Alice/Bob Interaction

| Sub-flow | Requirements | BA Observation |
|---|---|---|
| Alice (sender) | FR-05, US-07 | - |
| Bob (receiver) | FR-06, US-08, UX-02 | Obs 12 |
| Role distinction (both) | UX-02 | - |
| Feedback per action (both) | LR-06, UX-05, UX-06 | Obs 17 |

## 3. Key Screens

Consolidates every screen named across the beginner journey map, the BB84 learning flow (Section 1), and the Alice/Bob interaction sub-flow (Section 2) into a single list, so wireframing starts from one agreed set rather than screens scattered across three documents.

| Screen | Appears in | Requirements |
|---|---|---|
| Landing/entry screen | Journey Stage 1 (Entry) | FR-01 |
| Orientation screen | Journey Stage 2 (Orientation) | LO-01, UX-03 |
| Concept-pathway overview screen | Journey Stage 3 (Concepts) | FR-14, LR-03 |
| Concept explainer screens | Journey Stage 3 (Concepts) | FR-03, FR-14, LR-01 to LR-05 |
| Alice interaction screen | Section 1.1 / Section 2.1 | FR-05, US-07 |
| Bob interaction screen | Section 1.2 / Section 2.2 | FR-06, US-08, UX-02 |
| Shared exchange-outcome view | Section 1.3 (Basis Reconciliation) | FR-07, US-09 |
| QBER feedback panel | Section 1.4 (Error Estimation) | FR-09, LO-07 |
| Outcome/result screen | Section 1.5 (Post-processing) | FR-07, FR-10, FR-11, LO-08, US-09, US-16 |
| Eve entry-point placeholder | Journey Stage 5 (Eve, future) | FR-08, FR-09, US-10 to US-13 |

Ten screens in total: nine active screens across Entry through the BB84 outcome, plus one placeholder for the future Eve stage. This list is the input to initial wireframing.
