# Crack the Channel - Learning Flow, Interaction & Key Screens

Updated against the **Final Requirements & User Stories Baseline Revision 3.0**. This document combines the BB84 learning flow, Alice/Bob/Eve interaction model, and consolidated key screens required for the beginner learning experience.

## 1. BB84 Learning Flow

The core BB84 exchange remains a five-stage learning flow, following BA Learning Observation 15:

```text
Preparation -> Measurement -> Basis Reconciliation -> Error Estimation -> Post-processing
```

The purpose of this structure is to reduce cognitive load by revealing the protocol progressively rather than presenting the full BB84 process at once. Each stage has a clear learner goal, an observable interaction or result, contextual feedback, and a clear next step.

The exchange must be interactive and backed by executable Qiskit-based quantum circuits rather than being only a scripted visual demonstration. Eve is now an active **Must Have** learning experience rather than a future placeholder. When the Eve scenario is active, her interference occurs between Alice's preparation/transmission and Bob's measurement while the five-stage BB84 learning sequence remains intact.

### 1.1 Preparation - Alice / Sender

- **Learner goal:** Understand how Alice participates as the sender in BB84.
- **Learner action:** Follows the sender-side process, including preparing/transmitting qubits and making the relevant basis choices presented by the simulation.
- **System behaviour:** Alice's role and the purpose of her actions are explained before or during interaction. The learner can observe the resulting prepared quantum states and transmission outcome.
- **Feedback:** Significant actions receive immediate, beginner-friendly feedback and the learner can identify what happens next.
- **Screen:** Alice interaction screen.
- **Requirements:** FR-04, FR-05, FR-10, LO-03, LO-04, LO-05, US-06, US-07, LR-05, LR-06, UX-03, UX-05.
- **BA observations:** Obs 12, Obs 15, Obs 17.

### Eve Interference Branch - Active Scenario

Eve is not a sixth core BB84 stage. Instead, Eve is an interactive scenario that can alter the transmission between Alice's preparation and Bob's measurement.

- **Learner goal:** Understand how an eavesdropper can interfere with the BB84 communication process.
- **Learner action:** Enters/activates the Eve scenario and interacts with Eve's interception behaviour.
- **System behaviour:** Eve's role is clearly explained and visually distinct from Alice and Bob. The learner can observe how Eve's interference changes the later exchange outcome and error rate.
- **Feedback:** Eve's actions produce observable consequences rather than being explained only through text.
- **Screen:** Eve interaction screen.
- **Requirements:** FR-08, FR-09, LO-06, LO-07, US-10 to US-13, LR-05, LR-06, UX-02, UX-05.
- **BA observations:** Obs 15, Obs 16, Obs 17.

### 1.2 Measurement - Bob / Receiver

- **Learner goal:** Understand how Bob participates as the receiver and how measurement produces a classical result.
- **Learner action:** Follows the receiver-side process and measures incoming qubits using the measurement-basis choices presented by the simulation.
- **System behaviour:** Bob's role is clearly introduced and visually distinct from Alice and Eve. The distinction between an incoming quantum state and the classical measurement outcome is shown visually and/or interactively at the moment of measurement.
- **Feedback:** Measurement results are immediately visible and explained in beginner-friendly language.
- **Screen:** Bob interaction screen.
- **Requirements:** FR-04, FR-06, FR-10, LO-03, LO-04, LO-05, US-06, US-08, LR-05, LR-06, UX-02, UX-03, UX-05.
- **BA observations:** Obs 12, Obs 15, Obs 17.

### 1.3 Basis Reconciliation

- **Learner goal:** Understand why some measurement results contribute to the exchange outcome and others are discarded.
- **Learner action:** Compares Alice's and Bob's basis information and identifies which results are relevant to keep or discard.
- **System behaviour:** Matching/relevant and mismatched/discarded information is visually distinguishable. The result is presented in a beginner-friendly way rather than as unexplained technical output.
- **Feedback:** The learner receives confirmation of the comparison outcome and can see how it contributes to the resulting key-exchange process.
- **Screen:** Shared basis-comparison / exchange-outcome view.
- **Requirements:** FR-07, FR-10, LO-01, LO-04, US-09, US-14, LR-05, LR-06, UX-03, UX-05.
- **BA observations:** Obs 15, Obs 17.

### 1.4 Error Estimation - QBER

- **Learner goal:** Understand what QBER/error rate means and why an increased error rate can indicate eavesdropping.
- **Learner action:** Observes and interprets the QBER/error-rate result from the exchange.
- **System behaviour:** QBER is displayed visibly and explained in plain language. When Eve is active, the learner can connect Eve's interference with the observed error-rate change.
- **Feedback:** The result explains what happened, why it matters, and what the learner should do next.
- **Screen:** QBER/error-rate feedback screen or panel.
- **Requirements:** FR-09, FR-10, LO-07, US-12 to US-15, LR-02, LR-06, UX-05.
- **BA observations:** Obs 15, Obs 17.

### 1.5 Post-processing / Outcome

- **Learner goal:** Understand the overall meaning of the completed BB84 exchange.
- **Learner action:** Reviews the exchange outcome and plain-language explanation.
- **System behaviour:** Relevant simulation results are presented in an understandable sequence with explanatory context. The learner can connect their actions, any Eve interference, the QBER result, and the final exchange outcome.
- **Feedback:** The final result summarises what the learner achieved and supports progression to the next learning activity.
- **Screen:** Outcome/results screen.
- **Requirements:** FR-07, FR-10, FR-11, LO-08, US-09, US-16, LR-06, UX-03, UX-05.
- **BA observations:** Obs 15, Obs 17.

### Cross-Stage Rules

#### Immediate contextual feedback

Feedback must follow significant learner actions and major simulation stages. It should explain what happened and why, not simply display a technical value.

**Requirements:** FR-10, LR-06, UX-05.  
**BA observation:** Obs 17.

#### Clear progression and next steps

At each major point, the learner should be able to identify:

1. where they are;
2. what they are doing;
3. why they are doing it; and
4. what happens next.

Progress indicators should distinguish completed, current and incomplete activities.

**Requirements:** FR-13, FR-22, LR-07, UX-03, UX-08.  
**BA observations:** Obs 4, Obs 18.

#### Role distinction

Alice, Bob and Eve must remain visually and conceptually distinguishable whenever they appear.

**Requirements:** UX-02, LO-03, LO-06.

#### Qiskit authenticity

The interactive BB84 simulation must use executable Qiskit-based circuits. The interface should expose meaningful actions and outcomes while hiding unnecessary implementation complexity from beginners.

**Requirements:** FR-04, NFR-03, LR-08, UX-04.  
**BA observations:** Obs 7, Obs 9.

#### AI support is supplementary

The AI learning Bot may provide relevant explanations, hints and guidance throughout the pathway, but it must not replace the structured learning flow and failure of the AI service must not block the core BB84 experience.

**Requirements:** FR-16, LR-11, NFR-08, UX-12, US-20 to US-22.

### Sequence Summary

```text
Core:
Preparation (Alice)
        |
        +---- Eve scenario active? ----> Eve interference
        |                                  |
        +----------------------------------+
                         |
                Measurement (Bob)
                         |
               Basis Reconciliation
                         |
              Error Estimation / QBER
                         |
             Post-processing / Outcome
```

Feedback follows every meaningful stage and action, not only the final result.

### Traceability - BB84 Learning Flow

| Stage / Rule | Requirements | BA Observation |
|---|---|---|
| Preparation / Alice | FR-04, FR-05, FR-10, US-06, US-07, LR-05, LR-06, UX-03, UX-05 | Obs 12, 15, 17 |
| Eve interference branch | FR-08, FR-09, US-10 to US-13, UX-02, UX-05 | Obs 15, 16, 17 |
| Measurement / Bob | FR-04, FR-06, FR-10, US-06, US-08, UX-02, UX-05 | Obs 12, 15, 17 |
| Basis Reconciliation | FR-07, FR-10, US-09, LR-05, LR-06, UX-05 | Obs 15, 17 |
| Error Estimation / QBER | FR-09, FR-10, LO-07, US-12 to US-15, UX-05 | Obs 15, 17 |
| Post-processing / Outcome | FR-07, FR-10, FR-11, LO-08, US-09, US-16 | Obs 15, 17 |
| Progression / next steps | FR-13, FR-22, LR-07, UX-03, UX-08 | Obs 4, 18 |
| Qiskit authenticity | FR-04, NFR-03, LR-08, UX-04 | Obs 7, 9 |

## 2. Alice, Bob and Eve Interaction

This section documents the role-specific interaction model used inside the BB84 learning flow.

The final requirements require active Alice/sender, Bob/receiver and Eve/eavesdropper experiences. Each role must be introduced clearly, support interaction or observable consequences, and remain visually and conceptually distinct.

The exact control pattern - for example, sequential role hand-off, a role selector, or automatic handling of non-selected roles - is a UX implementation decision. Regardless of the chosen pattern, the learner must be able to understand the actions and consequences associated with Alice, Bob and Eve without having to track several unexplained perspectives at once.

### Role Sequence Within the Protocol

```text
Alice prepares/transmits
          |
          +---- if Eve scenario is active ----> Eve intercepts/interferes
          |
          v
Bob receives/measures
          |
          v
Shared comparison and analysis
```

### 2.1 Alice's Sub-flow - Sender

- **Learner goal:** Understand how the sender participates in BB84.
- **Before acting:** Alice's role, task and purpose are introduced.
- **Learner interaction:** Follows and participates in the sender-side steps.
- **Observable outcome:** Prepared/transmitted quantum information is represented visually enough for the learner to understand the effect of the sender-side action.
- **During/after acting:** Contextual feedback explains what happened and supports the next step.
- **Screen:** Alice interaction screen.
- **Requirements:** FR-04, FR-05, FR-10, US-06, US-07, LR-05, LR-06.

### 2.2 Bob's Sub-flow - Receiver

- **Learner goal:** Understand how the receiver participates in BB84.
- **Before acting:** Bob's role is clearly introduced and differentiated from Alice and Eve.
- **Learner interaction:** Follows and participates in the receiver-side measurement steps.
- **Observable outcome:** The change from quantum state to classical measurement outcome is represented visually and/or interactively.
- **During/after acting:** Contextual feedback explains the result and supports the next step.
- **Screen:** Bob interaction screen.
- **Requirements:** FR-04, FR-06, FR-10, US-06, US-08, UX-02, LR-05, LR-06.
- **BA observation:** Obs 12.

### 2.3 Eve's Sub-flow - Eavesdropper

- **Learner goal:** Understand how Eve can interfere with BB84 and why that interference can become detectable.
- **Before acting:** Eve's role and the idea of interception/eavesdropping are explained in beginner-friendly cybersecurity language.
- **Learner interaction:** Enters/activates the Eve scenario and interacts with the interception behaviour provided by the simulation.
- **Observable outcome:** Eve's interference affects later results and can be connected to QBER/error-rate feedback.
- **During/after acting:** The platform explains the consequence of Eve's action rather than only stating that eavesdropping occurred.
- **Screen:** Eve interaction screen.
- **Requirements:** FR-08, FR-09, FR-10, LO-06, LO-07, US-10 to US-13, UX-02, UX-05.

### Feedback Rule - All Roles

Important role-specific actions receive understandable feedback before the learner is expected to continue. Feedback should explain the action, result and next step.

**Requirements:** FR-10, LR-06, UX-03, UX-05, UX-06.  
**BA observation:** Obs 17.

### Traceability - Role Interaction

| Role / Rule | Requirements | BA Observation |
|---|---|---|
| Alice / sender | FR-04, FR-05, US-06, US-07 | - |
| Bob / receiver | FR-04, FR-06, US-06, US-08, UX-02 | Obs 12 |
| Eve / eavesdropper | FR-08, FR-09, US-10 to US-13, UX-02 | Obs 15, 16 |
| Role distinction | UX-02, LO-03, LO-06 | - |
| Feedback per meaningful action | FR-10, LR-06, UX-03, UX-05, UX-06 | Obs 17 |

## 3. Key Screens and Support Surfaces

The key-screen list has been updated to reflect the Final Requirements Baseline Revision 3.0. Eve is now an active simulation experience rather than a future placeholder. The final baseline also adds account/progress, AI learning support, Daily Quantum Challenges and learning-progression features around the core BB84 pathway.

Some requirements may be combined into the same implemented page or presented as persistent panels/widgets rather than separate routes. The list below defines the required UX surfaces, not a mandatory one-route-per-row architecture.

### 3.1 Core Access and Beginner Learning

| Screen / Surface | Purpose | Requirements |
|---|---|---|
| Landing / entry screen | Identifies Crack the Channel, its purpose and how to begin | FR-01, US-01, UX-01 |
| Authentication screen(s) | Login/sign-up/access so progress can be associated with an account | FR-12, US-17, LR-13 |
| Orientation / learning-goal screen | Explains what the learner will learn and do before interaction begins | US-02, UX-03, LO-01 |
| Concept-pathway overview | Shows the structured beginner pathway, current progress and next concepts | FR-13, FR-14, FR-22, LR-03, LR-07, UX-03, UX-08 |
| Concept explainer screens | Introduce BB84, cybersecurity context and required quantum concepts progressively | FR-03, FR-14, LR-01 to LR-05, LO-01, LO-02, LO-05 |
| Team / project page | Presents agreed team/project information | FR-02 |

### 3.2 Interactive BB84 Simulation

| Screen / Surface | Purpose | Requirements |
|---|---|---|
| Alice interaction screen | Interactive sender-side BB84 experience | FR-04, FR-05, US-06, US-07 |
| Bob interaction screen | Interactive receiver/measurement experience with visible state-to-outcome distinction | FR-04, FR-06, US-06, US-08, UX-02 |
| Eve interaction screen | Interactive eavesdropper/interception experience with observable consequences | FR-08, FR-09, US-10 to US-13, UX-02 |
| Basis-comparison / exchange-outcome screen | Shows relevant vs discarded exchange information and supports understanding of the resulting key-exchange process | FR-07, FR-10, US-09 |
| QBER / error-rate feedback screen | Displays and explains QBER and connects increased error rate with possible eavesdropping | FR-09, FR-10, LO-07, US-12 to US-15 |
| Simulation outcome / results screen | Summarises the completed exchange in plain language and connects actions to outcomes | FR-07, FR-10, FR-11, LO-08, US-09, US-16 |

### 3.3 Continued Learning, Progress and Support

| Screen / Surface | Purpose | Requirements |
|---|---|---|
| Learner progress dashboard | Shows current level, completed/incomplete activities, challenge progress, achievements and an appropriate next activity | FR-13, FR-15, FR-22, FR-23, US-18, US-19, US-29, UX-08 |
| Daily Quantum Challenge screen | Provides ongoing practical/knowledge-based activities tied to previously introduced concepts | FR-17, FR-18, LR-09, LR-10, US-23 to US-26 |
| AI learning Bot surface | Provides beginner-appropriate explanations, hints and guidance without replacing the core pathway | FR-16, LR-11, US-20 to US-22, UX-12 |
| Level / XP / achievement feedback | Shows meaningful progression, points/XP, milestones, badges and celebratory feedback; this may be integrated into the dashboard rather than a separate page | FR-15, FR-19 to FR-21, LR-12, US-27 to US-30, UX-10, UX-11 |
| Resume / next-activity state | Allows authenticated learners to continue from saved progress and identify what to do next; may be part of the dashboard or entry experience | FR-12, FR-13, FR-22, FR-23, LR-13, LR-14, US-19, US-31 |

### Persistent UX Elements Across Screens

The following are cross-screen requirements rather than standalone pages:

- **Visible progress / next-step navigation:** current stage, completed activities, incomplete activities and available next steps must be understandable (FR-13, FR-22, UX-03, UX-08).
- **Contextual explanations and feedback:** significant actions/results should explain what happened and why (FR-10, LR-04, LR-06, UX-05).
- **Beginner-first terminology:** unfamiliar technical terms should be explained close to the point of use (LR-01, LR-02, LR-04).
- **Role distinction:** Alice, Bob and Eve must remain visually and conceptually distinct (UX-02).
- **Reduced cognitive load:** unnecessary technical/Qiskit implementation detail should not compete with the learner's current action (UX-04, Obs 9).
- **Gamification supports learning:** XP, achievements, levels and celebrations should recognise meaningful learning progress rather than reward meaningless repeated interaction (FR-19 to FR-21, UX-10, BR-07).
- **AI support remains optional to the core flow:** AI failure must not block BB84 learning activities (FR-16, NFR-08, BR-09).

## 4. Updated Key-Screen Summary

The previous Eve **future placeholder** is removed. Eve is now a required active simulation surface.

The core beginner BB84 experience therefore requires, at minimum:

```text
Entry / Orientation / Concepts
        |
        v
Alice Interaction
        |
        +---- Eve Scenario (when active)
        |
        v
Bob Interaction
        |
        v
Basis Comparison / Exchange Outcome
        |
        v
QBER / Error-Rate Feedback
        |
        v
Simulation Results
```

Around the core exchange, the final requirements baseline also requires or proposes supporting account, progress, AI, challenge and gamification surfaces according to their Must Have / Should Have priorities.

This document should be used as the UX reference for updating the journey map, wireframes and Sprint 2 implementation flow.
