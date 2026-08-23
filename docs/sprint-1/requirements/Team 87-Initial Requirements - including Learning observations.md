## Crack the Channel - Requirements & User Stories Baseline

| Team | Team 87 - IBM Cyber Security: Quantum Risks |
| --- | --- |
| Client | IBM via RMIT Capstone Consultancy |
| Project | Crack the Channel - Interactive QKD (BB84) Learning Platform |
| Prepared by | Byreddy Srilekha – Business Analyst |
| Document Status | Sprint 1 - Initial Requirements Baseline |
| Purpose | This is an initial Sprint 1 baseline and will be refined following user research, beginner-learning observations, UX findings, technical feasibility work, and Product Owner feedback |

## 1. Purpose of This Document

This document establishes the initial Business Analysis requirements baseline for the Crack the Channel - Interactive QKD (BB84) Learning Platform.

The requirements translate the agreed project scope into a structured set of:

- Business and product requirements

- Functional requirements

- Learning experience requirements

- UX/accessibility requirements

- Non-functional requirements

- User stories

- Acceptance criteria

- Business rules and constraints

- Open questions and assumptions

- Requirements traceability

## 2. Product Context

## 2.1 Problem Statement

RMIT students have limited exposure to quantum computing and quantum-related concepts. IBM is partnering with RMIT to provide first-year Cyber Security and Information Security students with a hands-on way to develop quantum literacy in preparation for IBM's planned Quantum Boot Camp.


The platform therefore needs to make BB84 understandable and interactive for learners with little or no prior quantum-security knowledge.

## 2.2 Product Objective

The platform will provide a browser-based interactive learning experience in which a beginner learner can understand and interact with the BB84 quantum key distribution protocol, participate in a sender/receiver exchange, introduce an eavesdropper, and observe the resulting change in error rate.

## 2.3 Target Users Primary User

First-year RMIT students studying Cyber Security or Information Security who have little or no prior knowledge of quantum security.

## Secondary/Future User

Participants in IBM's planned Quantum Boot Camp.

The experience should therefore assume that the learner may have zero prior quantum knowledge.

## 3. Scope Baseline

## 3.1 In Scope

The current agreed scope includes:

- Browser-based learning platform

- Login and team page

- Interactive BB84 key-exchange simulation

- Real Qiskit-based quantum circuits

- Alice/sender learning experience

- Bob/receiver learning experience

- Eavesdropper/Eve interaction

- Visible error-rate/QBER feedback

- Beginner-friendly learning experience

- Plain-language educational content

- UX/UI designed around beginner learners

- Usability testing and evaluation

- Technical documentation and evaluation materials required for handover

The project brief explicitly identifies the working web platform, Eve mode/live feedback,

beginnerfocused UX/content, and documentation/evaluation materials as key deliverables. 3.2 Out

## of Scope

The following are explicitly outside the current project scope:

- Cryptographic asset discovery

- CBOM scanning

- Shor's algorithm risk analysis

- Grover's algorithm risk analysis


- QKD protocols beyond BB84

- Production-based authentication/user management

- Live attacks or real-world systems

- Sensitive data

The proposal also states that real IBM Quantum hardware is a nice-to-have rather than a

dependency, and that a Qiskit-compatible simulator may be used.

## 4. Learning Objectives

The learning experience should allow a beginner learner to:

## LO-01 - Understand BB84

Understand the basic purpose and high-level process of the BB84 protocol.

## LO-02 - Understand the participants

Understand the roles of Alice and Bob within the key-exchange process.

## LO-03 - Interact with the protocol

Participate in an interactive BB84 key exchange rather than only reading a static explanation.

## LO-04 - Understand measurement/basis concepts

Develop an introductory understanding of the concepts required to follow the exchange.

## LO-05 - Understand eavesdropping

Understand how Eve can interfere with the communication process.

## LO-06 - Understand error detection

Observe and understand how eavesdropping can result in an increased error rate/QBER.

## LO-07 - Interpret the outcome

Understand what the simulation result means in plain language.

These objectives support the project's stated success criteria that a beginner should be able to understand and interact with BB84, complete a key exchange, introduce an eavesdropper and understand the resulting change in error rate.

- 5. Functional Requirements

## FR-01 - Platform Access

## Requirement:

The system shall provide an entry point through which an intended learner can access the Crack the

Channel learning platform.

Priority: Must Have


Notes: Detailed authentication behaviour remains subject to scope and Product Owner confirmation because production-grade user management is explicitly out of scope.

## FR-02 - Team Page

Requirement: The system shall provide a team page containing the agreed project/team information.

Priority: Must Have

## Validation Required:

Exact team-page content and presentation should be confirmed with the team/Product Owner.

## FR-03 - BB84 Learning Introduction

Requirement: The system shall introduce the BB84 protocol before requiring the learner to perform the interactive

exchange.

Priority: Must Have

## Acceptance Criteria:

- The learner is introduced to the purpose of BB84.

- Key concepts are explained before they are required during the simulation.

- Content is understandable to a learner with no prior quantum knowledge.

- Technical terminology is explained in plain language.

## FR-04 - Interactive BB84 Simulation

## Requirement:

The system shall provide an interactive BB84 key-exchange simulation using Qiskit-based quantum circuits rather than a scripted or pre-recorded demonstration.

## Priority: Must Have

## Acceptance Criteria:

- The learner can initiate the BB84 exchange.

- The exchange uses an executable Qiskit circuit.

- The learner can observe relevant stages/results of the exchange.

- The simulation produces an actual outcome rather than displaying a predetermined animation.

- The implementation is compatible with the agreed Qiskit simulator/environment.

The project brief explicitly requires real Qiskit circuits rather than a scripted or pre-recorded demonstration.

## FR-05 - Alice Learning Experience


## Requirement:

The system shall provide an Alice/sender experience that enables the learner to understand and participate in the sender side of the BB84 exchange.

## Priority: Must Have

## Acceptance Criteria:

- Alice's role is clearly introduced.

- The learner can follow the relevant sender-side steps.

- Actions are explained before or while they are performed.

- The learner can understand the purpose of Alice's actions.

## FR-06 - Bob Learning Experience

## Requirement:

The system shall provide a Bob/receiver experience that enables the learner to understand and participate in the receiver side of the BB84 exchange.

Priority: Must Have

## Acceptance Criteria:

- Bob's role is clearly introduced.

- The learner can follow the relevant receiver-side steps.

- Actions are explained before or while they are performed.

- The learner can understand the purpose of Bob's actions.

## FR-07 - Key Exchange Outcome

Requirement: The system shall present the outcome of the BB84 exchange in a way that allows the learner to understand the resulting key-exchange process.

Priority: Must Have

## Acceptance Criteria:

- The relevant exchange outcome is presented to the learner.

- The learner can distinguish between relevant and discarded information where applicable.

- The outcome is accompanied by an explanation suitable for a beginner.

- The learner is not expected to interpret unexplained technical output.

## Validation Required:

Exact displayed data and level of protocol detail should be confirmed with the technical team and Product Owner.

## FR-08 - Eve/Eavesdropper Mode

## Requirement:


The system shall provide an interactive Eve/eavesdropper mode that allows the learner to introduce eavesdropping into the BB84 exchange.

Priority: Must Have

## Acceptance Criteria:

- The learner can activate or enter the Eve scenario.

- Eve's role is clearly explained.

- The learner can observe the effect of Eve's interference.

- The interaction demonstrates the security principle rather than merely describing it.

The brief explicitly requires an interactive Eve role that intercepts the exchange.

## FR-09 - QBER/Error-Rate Feedback

## Requirement:

The system shall provide visible error-rate/QBER feedback associated with the BB84 exchange.

Priority: Must Have

## Acceptance Criteria:

- An error-rate/QBER result is displayed.

- The learner can compare the exchange with and without eavesdropping where technically feasible.

- The effect of Eve's interference is visually distinguishable.

- The meaning of QBER/error rate is explained in beginner-friendly language.

- The learner can understand why an increased error rate is relevant to detecting eavesdropping.

The project brief specifically requires live QBER/error-rate visualisation that visibly responds when eavesdropping occurs.

## FR-10 - Learning Feedback

## Requirement:

The system shall provide contextual explanations or feedback at points where learner understanding is required to proceed.

Priority: Must Have

## Acceptance Criteria:

- Important actions have sufficient explanation.

- Unfamiliar terminology is explained.

- The learner receives meaningful feedback after major simulation stages.

- Feedback explains what happened and why, rather than only displaying technical values.

## FR-11 - Simulation Results


## Requirement:

The system shall present simulation results in a form that supports learner interpretation.

Priority: Should Have

## Acceptance Criteria:

- Relevant results are visible.

- Results are presented in an understandable sequence.

- Technical outputs are accompanied by explanatory context.

- The learner can understand the relationship between the simulation action and its result.

- 6. Learning Experience Requirements

Priority method used: MoSCoW prioritisation is used to distinguish essential functionality from desirable enhancements within the three-sprint delivery timeframe.

## LR-01 - Beginner -First Content

All core educational content shall be written for a learner with no prior quantum-security knowledge.

Priority: Must Have

## LR-02 - Plain Language

The system shall use plain-language explanations for technical concepts introduced during the experience.

Priority: Must Have

## LR-03 - Progressive Learning

The learning experience should introduce concepts progressively rather than requiring the learner to understand all BB84 concepts before interacting with the platform.

Priority: Should Have

## LR-04 - Contextual Explanation

Technical terms should be explained close to the point at which they are introduced or required.

Priority: Must Have

## LR-05 - Learning by Interaction

Where appropriate, concepts should be reinforced through interaction and observable outcomes rather than relying exclusively on text.

Priority: Should Have

## LR-06 - Learner Feedback

The experience should provide feedback that helps the learner understand whether they have successfully completed a stage of the learning process.

Priority: Should Have


- 7. UX & Accessibility Requirements

These requirements will be refined with the UX research and journey-map findings during Sprint 1.

## UX-01 - Beginner-Friendly Navigation

The platform shall provide a clear and predictable navigation flow suitable for first-time learners.

## UX-02 - Clear User Roles

Alice, Bob, and Eve shall be visually and conceptually distinguishable.

## UX-03 - Clear Progression

The learner shall be able to understand:

- 1. Where they are.

- 2. What they are doing.

- 3. Why they are doing it.

- 4. What happens next.

## UX-04 - Reduce Cognitive Load

The interface should avoid presenting unnecessary technical information simultaneously with learner-critical actions.

## UX-05 - Understandable Feedback

Important simulation results should be visually distinguishable and supported by explanatory text.

## UX-06 - Error Prevention

The interface should minimise situations where a beginner can unintentionally perform an action without understanding its purpose.

## UX-07 - Accessibility Consideration

The UX/UI should be designed with accessibility considerations appropriate for a university learning platform.

## Validation Required:

Specific accessibility standards and test criteria should be confirmed with the UX team/Product Owner rather than assumed at this stage.

- 8. Non-Functional Requirements

## NFR-01 - Browser-Based

The platform shall operate as a browser-based web application.

## NFR-02 - Functional Reliability

The core learning flow shall operate consistently enough to support a learner completing the BB84 experience.

## NFR-03 - Qiskit Authenticity


The BB84 simulation shall use executable Qiskit circuits rather than simulated visual output that does not represent the underlying circuit process.

## NFR-04 - Usability

The platform shall be evaluated with users representative of the beginner target audience.

The Sprint 2 plan includes the first usability-testing round, while Sprint 3 includes a second round.

## NFR-05 - Maintainability / Handover

The final implementation shall be supported by technical documentation and evaluation materials required for handover.

## NFR-06 - Security-Conscious Development

The platform shall be developed in a safe environment and shall not require live attacks, sensitive information, or real-world systems.

The proposal explicitly states that the project will use safe and secure environments and will not involve live systems, real attacks, or sensitive data.

## 9. User Stories

## Epic 1 - Access & Orientation

- 1. US-01 - Access the Platform

As a beginner learner I want to access the Crack the Channel platform So that I can begin the BB84 learning experience.

## Acceptance Criteria:

- Given the learner is an intended user, when they access the platform, then the Crack the Channel entry point is available.

- The entry experience clearly identifies the platform and its purpose.

- The learner can identify how to begin the learning experience.

- Access to the learning platform follows the agreed authentication/access behaviour.

- The learner is not presented with an unexplained or broken entry state.

## 2. US-02 - Understand the Learning Goal

As a beginner learner

I want to understand what I will learn and do in the platform So that I know what to expect before starting the simulation.

## Acceptance Criteria:


Given the learner enters the platform, when they view the introduction/orientation, then the main learning objective is clearly communicated.

- The learner is told that they will interact with the BB84 protocol.

- The learner is introduced to the Alice and Bob concept before the relevant interaction. The introduction uses plain language suitable for a learner with little or no prior quantum knowledge.

- The learner can identify what they will learn and what they will do before starting the interactive simulation.

## Epic 2 - BB84 Foundations

## 3. US-03 - Learn BB84 Basics

As a learner with no prior quantum knowledge

I want to receive a simple introduction to BB84

So that I understand the purpose of the protocol before using it.

## Acceptance Criteria:

- Given the learner starts the BB84 learning experience, the purpose of BB84 is introduced before the interactive exchange.

- The introduction explains BB84 in plain language suitable for a learner with no prior quantum knowledge.

- Key terminology required for the next activity is explained before it is used.

- The learner can identify the basic purpose of BB84 after the introduction.

## 4. US-04 - Understand Alice and Bob

As a beginner learner

I want to understand Alice's and Bob's roles So that I can follow the key-exchange process.

## Acceptance Criteria:

- V Given the learner is introduced to the BB84 exchange, Alice and Bob are clearly identified as the sender and receiver.

- V The learner is given a simple explanation of each role before performing the relevant steps.

- V The interface visually distinguishes Alice and Bob.

- V The learner can explain the basic purpose of each role after the introduction.

## 5. US-05 - Understand Key Concepts Before Interaction

## As a beginner learner

I want to understand unfamiliar BB84 concepts before I need to use them So that I am not required to guess what an action or result means.


## Acceptance Criteria:

Given the learner reaches an unfamiliar BB84 concept, the concept is explained before the learner

must use it.

Technical terms are accompanied by plain-language explanations.

Required concepts are introduced progressively rather than all at once.

The learner is given enough contextual information to understand the purpose of the next action.

No learner-critical action depends on unexplained terminology.

## Epic 3 - Interactive BB84 Exchange

6. US-06 - Run BB84

As a learner

I want to run an interactive BB84 exchange

So that I can learn the protocol by interacting with an actual Qiskit-based circuit.

## Acceptance Criteria:

Given the learner has completed the introductory material, they can start the BB84 exchange.

The exchange uses an executable Qiskit-based circuit rather than a scripted animation.

The learner can observe the relevant stages/results of the exchange.

The exchange produces an actual simulation outcome.

The simulation runs in the agreed Qiskit-compatible environment

## 7. US-07 - Participate as Alice

As a learner

I want to experience the exchange from Alice's perspective So that I understand how the sender participates in BB84.

## Acceptance Criteria:

Given the learner selects/enters Alice's role, Alice is clearly identified.

The learner can complete the required sender-side steps.

Each learner action is explained before or during the interaction where necessary.

The learner can understand the purpose of Alice's actions.

## 8. US-08 - Participate as Bob

As a learner

I want to experience the exchange from Bob's perspective So that I understand how the receiver participates in BB84.

## Acceptance Criteria:


Given the learner selects/enters Bob's role, Bob is clearly identified. The learner can complete the required receiver-side steps. Each learner action is explained before or during the interaction where necessary.

The learner can understand the purpose of Bob's actions.

- 9. US-09 - Understand the Exchange Outcome

As a learner I want to see and understand the result of the exchange So that I can connect my actions with the resulting key-exchange outcome.

## Acceptance Criteria:

Given the BB84 exchange has completed, the learner is shown the relevant exchange outcome. Relevant and discarded information are distinguishable where applicable. The outcome is accompanied by a beginner-friendly explanation. Technical results are not presented without sufficient explanatory context. The learner can connect the outcome to the actions performed during the exchange.

## Epic 4 - Eve & Quantum Security

- 10. US-10 - Enter Eve Mode

As a learner I want to act as an eavesdropper So that I can understand what happens when communication is intercepted.

## Acceptance Criteria:

Given the learner has completed or reached the required BB84 stage, they can enter the Eve scenario. Eve is clearly identified as the eavesdropper. The learner is told what Eve is doing before the interaction occurs. Eve's interaction affects the exchange rather than being purely descriptive. The learner can identify that communication is being intercepted.

- 11. US-11 - Observe Eve's Impact

As a learner I want to observe the effect of Eve's interference So that I can understand why eavesdropping affects the BB84 exchange.

## Acceptance Criteria:

- Given Eve interferes with the exchange, the learner can observe a measurable effect on the exchange.


The change is visually distinguishable from the normal exchange. The learner receives an explanation of what caused the change. The experience demonstrates the security principle through interaction rather than text alone.


## 12. US-12 - Observe QBER

## As a learner

I want to see the error rate/QBER change when Eve interferes So that I can understand how BB84 can reveal evidence of eavesdropping.

## Acceptance Criteria:

Given Eve has interfered with the exchange, an error-rate/QBER result is displayed.

- The learner can distinguish the relevant effect of Eve's interference.

The visualisation changes in response to the simulated exchange outcome rather than displaying a predetermined result.

- QBER/error rate is explained in beginner-friendly language.

The learner can understand why increased error rate is relevant to detecting eavesdropping.

## 13. US-13 - Understand the Security Meaning

As a beginner learner

I want to understand why the observed error-rate change matters So that I understand the security principle demonstrated by BB84.

## Acceptance Criteria:

Given the learner observes a change in error rate/QBER, an explanation links the result to eavesdropping.

The explanation uses plain language suitable for beginners.

The learner can identify that Eve's interference affects the communication.

The learner can explain at a high level why the change provides evidence of eavesdropping.

The explanation connects the observed result to the underlying security principle.

## Epic 5 - Learning Feedback

## 14. US-14 - Receive Contextual Feedback

## As a learner

I want to receive explanations and feedback at important points in the simulation So that I understand what has happened rather than simply seeing technical output.

## Acceptance Criteria:

Given the learner completes an important stage, relevant feedback is displayed.

Feedback explains what happened and why.

Feedback is presented close to the action or outcome it explains.

Feedback does not rely solely on technical values or jargon.

The learner is given enough information to understand the next step.


## 15. US-15 - Understand Technical Terms

As a beginner learner

I want to receive an explanation of technical terms such as QBER in plain language So that I can understand the platform without prior quantum knowledge.

## Acceptance Criteria:

- Given an unfamiliar technical term is introduced, a plain-language explanation is available at or near the point of use.

- Terms such as QBER are explained before or when the learner needs them.

- Explanations avoid requiring prior quantum-security knowledge.

- The learner can understand the meaning of the term in the context of the activity.

- Technical terminology does not prevent the learner from completing the learning flow.

## 16. US-16 - Understand the Final Outcome

## As a learner

I want to receive a clear explanation of the final simulation outcome So

that I can describe what happened during the BB84 exchange.

## Acceptance Criteria:

- Given the simulation has finished, the learner receives a clear summary of the outcome.

- The summary explains what occurred during the BB84 exchange.

- If Eve was used, the summary explains the effect of eavesdropping and the resulting error rate/QBER.

- Technical outputs are accompanied by plain-language interpretation.

- The learner can describe the main security lesson demonstrated by the simulation.

## 10. User Story Traceability

| Epic | User Stories | Supporting Requirements |
| --- | --- | --- |
| Access & Orientation | US-01, US-02 | FR-01, FR-02 |
| BB84 Foundations | US-03, US-04, US-05 | FR-03, LR-01–LR-05 |
| Interactive Exchange | US-06–US-09 | FR-04–FR-07 |
| Eve & Security | US-10–US-13 | FR-08, FR-09 |
| Learning Feedback | US-14–US-16 | FR-10, FR-11, LR-01–LR-06 |
| UX | Cross-cutting | UX-01–UX-07 |
| Technical Quality | Cross-cutting | NFR-01–NFR-06 |

## 11. Business Rules & Constraints

## BR-01 - BB84 Scope

The educational simulation shall focus on BB84 and shall not expand into other QKD protocols during the current project.


## BR-02 - Educational Focus

The product shall prioritise quantum-learning outcomes over unrelated cybersecurity functionality.

## BR-03 - Real Qiskit Circuits

The core BB84 demonstration shall use Qiskit circuits rather than a scripted/pre-recorded simulation.

## BR-04 - Simulator Flexibility

A Qiskit-compatible simulator may be used. Access to real IBM Quantum hardware is not a dependency.

## BR-05 - Beginner Audience

Requirements and UX decisions shall consider learners with little or no prior quantum-security knowledge.

## BR-06 - Safe Environment

The platform shall not require real attacks, sensitive information, or live production systems.

## 12. Acceptance Criteria Principles

Acceptance criteria should be specific, observable, testable, unambiguous, traceable to a requirement or user story, written from the learner/system perspective, and suitable for validation during later sprints.

## Example:

Requirement: FR-09 - QBER/Error-Rate Feedback

Given the learner has completed a BB84 exchange

When Eve is introduced into the exchange

Then the platform shall display the resulting error-rate/QBER information

And explain what the change means for the security of the communication.

This is a measurable basis for development, testing and Sprint 3 evaluation.

## 13. Requirements Traceability to Project Outcomes

| Project Outcome | Requirements | User Stories | Validation |
| --- | --- | --- | --- |
| Beginner understands BB84 | FR-03, LR-01–LR-05 | US-03–US-05 | Learning evaluation |
| Learner performs exchange | FR-04–FR-07 | US-06–US-09 | Functional testing |
| Learner understands Alice/Bob | FR-05, FR-06 | US-07, US-08 | Usability testing |
| Learner understands Eve | FR-08 | US-10, US-11 | Functional + usability testing |
| Learner understands QBER | FR-09, FR-10 | US-12, US-13 | Usability/evaluation |


| Beginner-friendly experience | LR + UX requirements US-03–US-16 |   | Usability testing |
| --- | --- | --- | --- |
| Working browser platform | FR + NFR requirements | US-01, US-06 | Functional testing |
| Client-ready handover NFR-05 |   | Cross-cutting | Documentation review |

## 14. Requirements Baseline & Change Control:

This Sprint 1 baseline will be refined following BA learning observations, UX research, technical feasibility findings, usability testing and Product Owner feedback. Changes will be recorded through the requirements traceability/change log

## 15.Learning observations - Quantum Business Foundations (section 15 – drafted on 23/8/26)

| Concept | Learning Observation | BA/Project Implication |
| --- | --- | --- |
| Quantum Computing vs Classical computing | Initially, I perceived quantum computing as fast classical computing. The class taught me that quantum computing is a different approach to computing and is meant to solve particular problems rather than substitute classical computers. | The learning platform should not portray quantum computing as “faster computing” since this will create a misconception among learners. |
| Qubits | The notion of qubit was a little bit confusing than that of a classical bit since it cannot be described as simply 0-or-1. | Beginner materials should introduce the notion of qubit slowly and in a comprehensible manner. |
| Superposition | The notion of superposition was clearer to me once I associated it with the notion of the quantum state representing possible outcomes, instead of viewing a qubit as “both 0 and 1”. | The learning platform should use plain language to explain quantum concepts to counteract any misunderstanding. Measurement |
| Measurement | I found out that measurement is a key step in quantum computing learning since one needs to understand the difference between the quantum state and classical outcome. | Interactions in BB84 should make the process of measuring quantum states evident to learners and help understand what they see. |


| Quantum advantage / use cases | I realized that quantum computing may prove useful only in some problem domains and not necessarily superior to classical computing in all cases. | Educational material should relate quantum ideas to practical examples and not present quantum computing as something that replaces classical computing. |
| --- | --- | --- |
| Quantum security | The training program demonstrated the link between quantum technologies and security and explained why businesses have to understand the potential of quantum computing in this context. | The learning system should give enough background knowledge for learners to realize why BB84 and quantum key distribution are important in cybersecurity. |
| Quantum communication | Quantum communication topics might be challenging for newbies since these topics are related to quantum mechanics which is complicated, as well as to cybersecurity | The BB84 exercise should start with introducing the communication problem first, and then move on to Alice, Bob, measurement bases and Eve. |

## 1. Terminology for beginners

Observation: When I started my learning process, I discovered that quantum terminology (qubits, superposition and measurements) can be hard to understand due to a large number of new notions presented at once.

## BA implication:

It would be better to learn new terms step-by-step providing simple explanations and then requiring a learner to use a BB84 simulator.

## 2. Superposition

Observation: The notion of superposition seemed unclear to me since it was explained in a too general way, saying that qubit is “0 and 1 at the same time”. This term needs further explanation to show the difference between state and measurement.

## BA implication:

When presenting any new quantum notions, the platform should use explanations easy to understand for beginners but accurate from the professional perspective.

## 3. Measurement


Observation: Measurement turned out to be important in terms of learning because it is crucial to know the difference between the quantum state and the classical result after it was measured.

## BA implication:

Measurement should be clearly shown in BB84 simulation both graphically and/or in texts.

- 4. Quantum Ideas with Cybersecurity

Observation: The wider knowledge of quantum computing helped me realize that BB84 should not be introduced as a standalone quantum circuit. There must be sufficient background for students to

realize that quantum cryptography has an application in secure communication.

BA implication: The platform needs to outline the role of BB84 in cybersecurity before delving into

the Alice-Bob-Eve interaction.

## Rationale for Initial Requirements:

The current requirements baseline is intentionally based on the confirmed project brief, agreed target learner, learning objectives and defined system scope. As the BA’s quantum/Qiskit upskilling is still in progress, beginner-learning observations are being treated as additional evidence for refinement rather than a prerequisite for establishing the initial requirements. This allows UX and Dev to commence Sprint 1 work using a clear baseline while ensuring that new learning observations, technical findings and team feedback can be incorporated through the planned refinement process.
