**Revised Requirements & User Stories** 

# **Crack the Channel - Re uirements & User Stories Baseline** **<u>q</u>** 

|**Team**|Team 87 - IBM Cyber Security: Quantum Risks|
|---|---|
|**Client**|IBM via RMIT Capstone Consultancy|
|**Project**|Crack the Channel - Interactive QKD (BB84) Learning Platform|
|**Prepared by**|Byreddy Srilekha - Business Analyst|
|**Document Status**|<sup>Sprint 2 - Refined Requirements Baseline</sup><br>Revision: 2.0|
|**Purpose**|This is a revised Sprint 2 baseline and refined user research,<br>beginner-learning observations, UX findings, technical feasibility<br>work, and Product Owner feedback|



## **1. Purpose of This Document** 

This document establishes the refined Business Analysis requirements baseline for the Crack the Channel-Interactive QKD (BB84) Learning Platform. 

The requirements have been refined using: 

- the original project brief and agreed scope; 

- Product Owner/Supervisor feedback from Emily Chin; 

- beginner learning observations; 

- IBM Quantum Learning courses and modules; 

- Qiskit learning activities; 

- existing learner research and survey findings; 

- UX considerations; 

- technical feasibility discussions; and 

- the team's updated Sprint 2 development direction. 

The requirements translate these findings into: 

- business and product requirements; 

- functional requirements; 

- learning experience requirements; 

- UX/accessibility requirements; 

- non-functional requirements; 

- user stories; 

- acceptance criteria; 

- business rules and constraints; 

- learning experience observations; 

- requirements traceability; and 

- requirements-change rationale. 

The original project objective of providing an interactive, beginner-focused BB84 experience using Qiskit remains the core of the platform. The additional AI, progression, Daily Quantum Challenge and gamification features extend this learning experience rather than replace it. 

## **2. Product Context** 

#### **2.1 Problem Statement** 

First-year Cyber Security and Information Security students may have little or no prior knowledge of quantum computing and quantum security. 

Traditional text- and video-based learning can make abstract quantum concepts difficult to understand because learners cannot easily see how concepts such as measurement, basis selection and eavesdropping affect a communication process. 

The platform therefore needs to introduce quantum concepts progressively and allow learners to understand BB84 by doing, rather than relying primarily on passive content. 

Learning observations also indicate that beginners can experience difficulty when multiple new quantum concepts are introduced simultaneously. The platform should therefore combine concise explanations with visualisations, interaction, practical activities and feedback. 

In addition, following Product Owner feedback, the platform should provide an ongoing learning journey that gives learners meaningful reasons to return and continue developing their knowledge. 

#### **2.2 Product Objective** 

Crack the Channel will provide a browser-based interactive learning platform where a beginner learner can: 

- understand the purpose of BB84; 

- learn the quantum concepts required to understand BB84; 

- follow a structured learning pathway; 

- understand the roles of Alice, Bob and Eve; 

- participate in an interactive BB84 key exchange; 

- interact with genuine Qiskit-based quantum circuits; 

- observe the effects of eavesdropping; 

- observe and interpret QBER/error-rate changes; 

- receive contextual learning feedback; 

- access an AI learning Bot for support; 

- complete Daily Quantum Challenges; 

- progress through increasingly difficult learning levels; 

- track their learning progress; 

- earn points/XP for meaningful learning activities; 

- earn badges or achievements for meaningful milestones; 

- receive appropriate celebratory feedback; 

- return to the platform for further learning and challenges. 

This retains the original objective of making BB84 interactive and accessible to beginners while extending the platform into a more complete learning journey. 

## **2.3 Target Users** 

#### **Primary User-Beginner Learner** 

First-year RMIT Cyber Security and Information Security students with little or no prior knowledge of quantum computing or quantum security. 

The platform should therefore assume that the learner may have zero prior quantum knowledge. 

#### **Secondary User-Teachers and Tutors** 

Teachers and tutors who may use the platform as a supporting educational resource, demonstration tool or guided learning activity. 

#### **Future/Extended Audience** 

The platform may also support participants in IBM's planned Quantum Boot Camp where appropriate. 

## **3. Scope Baseline** 

## **3.1 In Scope** 

The refined scope includes: 

- browser-based learning platform; 

- basic user registration/login and authentication; 

- learner account/profile; 

- persistent learning progress; 

- team/project page; 

- structured beginner learning pathway; 

- supporting quantum and BB84 educational content; 

- dedicated learning-content area; 

- visual diagrams and explanations; 

- interactive BB84 key-exchange simulation; 

- executable Qiskit-based quantum circuits; 

- Alice/sender experience; 

- Bob/receiver experience; 

- Eve/eavesdropper experience; 

- visible QBER/error-rate feedback; 

- contextual learning feedback; 

- learner progress dashboard; 

- progressive learning levels; 

- Daily Quantum Challenges; 

- progressively challenging activities; 

- AI learning Bot; 

- AI-assisted explanations, hints and guidance; 

- points/XP where implemented; 

- learning milestones; 

- badges/achievements where feasible; 

- celebratory feedback; 

- continued learning and return engagement; 

- usability testing; 

- technical documentation; and 

- evaluation and handover materials. 

The revised scope explicitly incorporates the team's new direction around authentication, progress, AI, challenges and gamified progression. 

## **3.2 Out of Scope** 

The following remain outside the current project scope: 

- cryptographic asset discovery; 

- CBOM scanning; 

- Shor's algorithm risk analysis; 

- Grover's algorithm risk analysis; 

- QKD protocols beyond BB84; 

- real-world cyber attacks; 

- live production systems; 

- sensitive user information; 

- production-grade enterprise authentication; 

- unrestricted execution of AI-generated code; 

- dependence on real IBM Quantum hardware. 

Real IBM Quantum hardware may be considered as a future enhancement but is not a dependency for the project. 

## **4. Learning Objectives** 

The learning experience should allow a beginner learner to: 

#### **LO-01-Understand BB84** 

Understand the basic purpose and high-level process of the BB84 protocol. 

#### **LO-02-Understand Quantum Foundations** 

Develop an introductory understanding of the quantum concepts required to follow BB84. 

#### **LO-03-Understand the Participants** 

Understand the roles of Alice and Bob within the key-exchange process. 

#### **LO-04-Interact with the Protocol** 

Participate in an interactive BB84 key exchange rather than only reading a static explanation. 

#### **LO-05-Understand Measurement and Basis Concepts** 

Develop an introductory understanding of measurement and basis concepts required to follow the exchange. 

#### **LO-06-Understand Eavesdropping** 

Understand how Eve can interfere with the communication process. 

#### **LO-07-Understand Error Detection** 

Observe and understand how eavesdropping can result in an increased error rate/QBER. 

#### **LO-08-Interpret the Outcome** 

Understand what the simulation result means in plain language. 

#### **LO-09-Apply Learning** 

Apply previously introduced quantum and BB84 concepts through practical activities and challenges. 

#### **LO-10-Develop Progressively** 

Progress from foundational quantum concepts towards more complex BB84 and quantum-security activities. 

#### **LO-11-Use Learning Support** 

Use explanations, feedback, hints and the AI learning Bot to clarify concepts and overcome learning difficulties. 

#### **LO-12-Recognise Learning Progress** 

Understand personal progress through levels, completed activities and meaningful achievements. 

## **5. Functional Requirements** 

#### **FR-01-Platform Access** 

#### **Requirement:** 

The system shall provide an entry point through which an intended learner can access the Crack the Channel learning platform. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- The platform is accessible through a browser. 

- The entry experience clearly identifies the platform and its purpose. 

- The learner can identify how to begin. 

- Access behaviour follows the agreed authentication design. 

#### **FR-02-Team Page** 

#### **Requirement:** 

The system shall provide a team/project page containing the agreed project information. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- The page is accessible through the platform. 

- Agreed team/project information is displayed. 

- Information is presented clearly. 

- Final content is confirmed with the team/Product Owner. 

#### **FR-03-BB84 Learning Introduction** 

#### **Requirement:** 

The system shall introduce BB84 and the concepts required to understand the protocol before requiring the learner to perform the interactive exchange. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- The purpose of BB84 is introduced. 

- Required concepts are explained before they are used. 

- Content is understandable to a learner with no prior quantum knowledge. 

- Technical terminology is explained in plain language. 

- The learner receives sufficient cybersecurity context to understand why BB84 is relevant. 

#### **FR-04-Interactive BB84 Simulation** 

#### **Requirement:** 

The system shall provide an interactive BB84 key-exchange simulation using executable Qiskit-based quantum circuits. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- The learner can initiate the BB84 exchange. 

- The exchange uses an executable Qiskit circuit. 

- Relevant stages/results are observable. 

- The simulation produces an actual outcome. 

- The implementation is compatible with the agreed Qiskit environment. 

The original project requirements specifically identify executable Qiskit circuits rather than a purely visual/scripted demonstration. 

#### **FR-05-Alice Learning Experience** 

#### **Requirement:** 

The system shall provide an Alice/sender experience that enables the learner to understand and participate in the sender side of BB84. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- Alice's role is clearly introduced. 

- The learner can follow relevant sender-side steps. 

- Actions are explained before or during interaction. 

- The learner can understand the purpose of Alice's actions. 

#### **FR-06-Bob Learning Experience** 

#### **Requirement:** 

The system shall provide a Bob/receiver experience that enables the learner to understand and participate in the receiver side of BB84. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- Bob's role is clearly introduced. 

- The learner can follow relevant receiver-side steps. 

- Actions are explained before or during interaction. 

- The learner can understand the purpose of Bob's actions. 

#### **FR-07-Key Exchange Outcome** 

#### **Requirement:** 

The system shall present the outcome of the BB84 exchange in a way that allows the learner to understand the resulting key-exchange process. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- The exchange outcome is presented. 

- Relevant and discarded information are distinguishable where applicable. 

- The outcome includes a beginner-friendly explanation. 

- Technical output is not presented without sufficient context. 

#### **FR-08-Eve/Eavesdropper Mode** 

#### **Requirement:** 

The system shall provide an interactive Eve/eavesdropper mode that allows the learner to introduce eavesdropping into the BB84 exchange. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- The learner can enter/activate the Eve scenario. 

- Eve's role is clearly explained. 

- The learner can observe the effect of Eve's interference. 

- The interaction demonstrates the security principle rather than only describing it. 

#### **FR-09-QBER/Error-Rate Feedback** 

#### **Requirement:** 

The system shall provide visible error-rate/QBER feedback associated with the BB84 exchange. 

**Priority:** Must Have 

#### **Acceptance Criteria:** 

- An error-rate/QBER result is displayed. 

- The learner can observe the effect of eavesdropping. 

- Eve's effect is visually distinguishable. 

- QBER/error rate is explained in beginner-friendly language. 

- The learner can understand why an increased error rate is relevant to detecting eavesdropping. 

#### **FR-10-Contextual Learning Feedback** 

#### **Requirement:** 

The system shall provide contextual explanations or feedback at points where learner understanding is required to proceed. 

**Priority:** Must Have 

#### **Acceptance Criteria:** 

- Important actions have sufficient explanation. 

- Unfamiliar terminology is explained. 

- Feedback is provided after major learning/simulation stages. 

- Feedback explains what happened and why. 

- Feedback supports the learner's next action. 

#### **FR-11-Simulation Results** 

#### **Requirement:** 

The system shall present simulation results in a form that supports learner interpretation. 

**Priority:** Should Have 

#### **Acceptance Criteria:** 

- Relevant results are visible. 

- Results are presented in an understandable sequence. 

- Technical outputs include explanatory context. 

- The learner can understand the relationship between their action and the result. 

#### **FR-12-User Authentication** 

#### **Requirement:** 

The system shall provide basic user authentication so that learners can maintain an individual learning account. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- Learners can access the agreed login/sign-up functionality. 

- Learning progress is associated with the learner's account. 

- Authentication information is handled through the approved authentication service. 

- Learners can return to the platform and access their saved learning journey. 

#### **Implementation consideration:** 

The project may use the agreed Supabase authentication solution rather than implementing password security from scratch. 

#### **FR-13-Learner Progress** 

#### **Requirement:** 

The system shall record and display learner progress through the learning pathway. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- Completed activities can be recorded. 

- Learners can identify completed and incomplete activities. 

- Progress is associated with their account. 

- Learners can resume their learning journey. 

- Progress is displayed in an understandable format. 

#### **FR-14-Structured Learning Content** 

#### **Requirement:** 

The system shall provide structured learning content that introduces the concepts required for BB84 progressively. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- Content is divided into manageable sections. 

- Concepts are introduced progressively. 

- Technical terminology is explained. 

- Relevant diagrams/visualisations are used where appropriate. 

- Content connects to interactive activities. 

- Optional deeper-learning material does not disrupt the core pathway. 

#### **FR-15-Learning Levels** 

#### **Requirement:** 

The system should organise learning activities into progressive levels that develop knowledge from introductory quantum concepts towards BB84 and quantum-security concepts. 

#### **Priority:** Should Have 

#### **Acceptance Criteria:** 

- Each level has a clear learning purpose. 

- Levels increase in difficulty. 

- Learners can identify their current level. 

- Relevant completed activities contribute to progression. 

- Later activities build on previously introduced concepts. 

#### **FR-16-AI Learning Bot** 

#### **Requirement:** 

The system should provide an AI learning Bot that supports learners during the learning journey by answering relevant questions, explaining quantum concepts and providing guidance during learning activities. 

#### **Priority:** Should Have 

#### **Acceptance Criteria:** 

- The AI Bot is accessible within the platform. 

- Learners can ask questions about relevant quantum-computing and BB84 concepts. 

- Responses use beginner-appropriate language. 

- The Bot can provide explanations, hints and guidance. 

- The Bot supports learning rather than simply completing the learner's work. 

- AI functionality remains within the defined educational scope. 

- AI failure does not prevent access to core learning content or BB84 activities. 

#### **FR-17-Daily Quantum Challenges** 

#### **Requirement:** 

The system should provide Daily Quantum Challenges that allow learners to practise and apply concepts introduced through the learning pathway. 

#### **Priority:** Should Have 

#### **Acceptance Criteria:** 

- A Daily Quantum Challenge is available to learners. 

- Challenges relate to previously introduced concepts. 

- Challenges may use practical, scenario-based or knowledge-based activities. 

- Challenges are appropriate to the learner's progression. 

- Learners receive feedback after completion. 

- Feedback explains the reasoning behind the result. 

- Challenge completion can contribute to learner progression. 

- Challenges provide an ongoing opportunity for practice. 

#### **FR-18-Progressive Challenge Difficulty** 

#### **Requirement:** 

The system should provide progressively challenging activities so learners can develop their quantum and BB84 knowledge over time. 

#### **Priority:** Should Have 

#### **Acceptance Criteria:** 

- Early activities focus on foundational concepts. 

- Later activities require application of multiple concepts. 

- Difficulty aligns with learner progression. 

- Learners can identify their progression through challenge levels. 

#### **FR-19-Learning Points/XP** 

#### **Requirement:** 

The system should provide points/XP or an equivalent progress indicator for meaningful learning activities. 

#### **Priority:** Should Have 

#### **Acceptance Criteria:** 

- Learners can receive points/XP for defined learning activities. 

- Points are associated with meaningful learning actions. 

- Learners can view their accumulated progress. 

- The system avoids rewarding meaningless repeated interaction where technically feasible. 

**FR-20-Badges and Achievements** 

#### **Requirement:** 

The system should provide badges, achievements or milestones for meaningful learning accomplishments. 

#### **Priority:** Should Have 

#### **Acceptance Criteria:** 

- Achievements have defined criteria. 

- Learners receive visible confirmation when an achievement is earned. 

- Earned achievements are retained in the learner profile. 

- Achievement criteria are understandable. 

- Achievements represent meaningful learning progress. 

#### **FR-21-Celebratory Feedback** 

#### **Requirement:** 

The system should provide appropriate celebratory feedback when learners complete significant learning milestones. 

#### **Priority:** Should Have 

#### **Acceptance Criteria:** 

- Defined milestones trigger appropriate feedback. 

- Feedback clearly identifies what the learner achieved. 

- Celebratory feedback does not prevent the learner from continuing. 

- Celebrations support motivation without distracting from learning. 

#### **FR-22-Learner Progress Dashboard** 

#### **Requirement:** 

The system shall provide a clear representation of the learner's learning progress. 

#### **Priority:** Must Have 

#### **Acceptance Criteria:** 

- Current learning level is visible. 

- Completed activities can be identified. 

- Challenge progress can be viewed. 

- Earned achievements can be viewed. 

- The learner can identify an appropriate next activity. 

#### **FR-23-Continued Learning and Return Engagement** 

#### **Requirement:** 

The system should provide continuing learning activities, visible progression and meaningful achievements that encourage learners to return to the platform. 

#### **Priority:** Should Have 

#### **Acceptance Criteria:** 

- Learners can identify future learning goals. 

- Daily Challenges provide ongoing practice opportunities. 

- Progress towards levels and achievements is visible. 

- Learners can continue from their previous progress. 

- The platform provides continuing learning activities rather than ending after one BB84 simulation. 

## **6. Learning Experience Requirements** 

#### **LR-01-Beginner-First Content** 

All core educational content shall be written for a learner with no prior quantum-security knowledge. 

**Priority:** Must Have 

#### **LR-02-Plain Language** 

Technical concepts shall be explained using language appropriate for beginners. 

**Priority:** Must Have 

#### **LR-03-Progressive Learning** 

Quantum and BB84 concepts shall be introduced progressively rather than presenting all required concepts simultaneously. 

#### **Priority:** Must Have 

#### **LR-04-Contextual Explanation** 

Technical terms shall be explained close to the point where they are introduced or required. 

#### **Priority:** Must Have 

#### **LR-05-Learning by Interaction** 

Concepts shall be reinforced through interaction and observable outcomes rather than relying exclusively on text. 

#### **Priority:** Must Have 

#### **LR-06-Immediate Learner Feedback** 

The experience shall provide understandable feedback following significant learner actions and activities. 

**Priority:** Must Have 

#### **LR-07-Structured Learning Pathway** 

Learning shall be organised into manageable stages that progressively develop the knowledge required for BB84. 

#### **Priority:** Must Have 

#### **LR-08-Practical Application** 

Learners shall have opportunities to apply concepts through interactive activities and Qiskit-based experiences. 

#### **Priority:** Must Have 

#### **LR-09-Challenge-Based Reinforcement** 

Daily Challenges should reinforce concepts previously introduced through the learning pathway. 

**Priority:** Should Have 

#### **LR-10-Progressive Challenge Difficulty** 

Challenge difficulty should increase in accordance with learner progression. 

**Priority:** Should Have 

#### **LR-11-AI Learning Support** 

The AI Bot should support understanding through explanations, hints and guidance rather than replacing the structured learning experience. 

#### **Priority:** Should Have 

#### **LR-12-Achievement-Based Motivation** 

Achievements, milestones and celebrations should recognise meaningful learning progress. 

**Priority:** Should Have 

#### **LR-13-Persistent Learning Journey** 

Authenticated learners shall be able to retain relevant learning progress across sessions. 

**Priority:** Must Have 

#### **LR-14-Motivation to Return** 

The platform should provide meaningful reasons for learners to return, including continuing learning activities, Daily Challenges, progression goals and achievements. 

**Priority:** Should Have 

## **7. UX & Accessibility Requirements** 

#### **UX-01-Beginner-Friendly Navigation** 

The platform shall provide a clear and predictable navigation flow suitable for first-time learners. 

#### **UX-02-Clear User Roles** 

Alice, Bob and Eve shall be visually and conceptually distinguishable. 

#### **UX-03-Clear Progression** 

The learner shall be able to understand: 

1. Where they are. 

2. What they are doing. 

3. Why they are doing it. 

4. What happens next. 

#### **UX-04-Reduced Cognitive Load** 

The interface shall avoid presenting unnecessary technical information simultaneously with learnercritical actions. 

#### **UX-05-Understandable Feedback** 

Important simulation and challenge results shall be visually distinguishable and supported by explanatory text. 

#### **UX-06-Error Prevention** 

The interface shall minimise situations where a beginner can unintentionally perform an action without understanding its purpose. 

#### **UX-07-Accessibility** 

The UX/UI shall incorporate appropriate accessibility considerations for a university learning platform. 

Specific accessibility standards and test criteria should be confirmed with the UX team/Product Owner rather than assumed. 

#### **UX-08-Visible Learning Progress** 

The learner shall be able to identify: 

- their current level; 

- completed activities; 

- incomplete activities; 

- available next steps; and 

- relevant progression towards achievements. 

#### **UX-09-Challenge Discoverability** 

Daily Challenges shall be easily discoverable without disrupting the core learning pathway. 

#### **UX-10-Beginner-Friendly Gamification** 

Gamification elements shall reinforce learning rather than distract from the learning objective. 

#### **UX-11-Achievement Feedback** 

Achievements shall clearly communicate what the learner has accomplished. 

#### **UX-12-AI Transparency** 

The AI Bot's role should be understandable to the learner, and AI-generated information should not be presented as unquestionable fact. 

## **8. Non-Functional Requirements** 

#### **NFR-01-Browser-Based** 

The platform shall operate as a browser-based web application. 

#### **NFR-02-Functional Reliability** 

The core learning flow shall operate consistently enough to support completion of the BB84 experience. 

#### **NFR-03-Qiskit Authenticity** 

The BB84 simulation shall use executable Qiskit circuits rather than a purely scripted or pre-recorded visual simulation. 

#### **NFR-04-Usability** 

The platform shall be evaluated with users representative of the beginner target audience. 

#### **NFR-05-Maintainability and Handover** 

The final implementation shall be supported by technical documentation and evaluation materials required for handover. 

#### **NFR-06-Security-Conscious Development** 

The platform shall operate in a safe environment and shall not require live attacks, sensitive information or real-world systems. 

#### **NFR-07-Authentication Security** 

Authentication shall use the approved authentication service rather than requiring the team to independently implement password storage and authentication security. 

#### **NFR-08-AI Reliability** 

Failure or unavailability of the AI service shall not prevent access to the core learning experience. 

#### **NFR-09-AI Safety** 

AI-generated code shall not be executed as unrestricted code within the platform. 

#### **NFR-10-Controlled Qiskit Execution** 

Where AI functionality interacts with Qiskit, execution shall occur through approved and controlled application tools/environment. 

#### **NFR-11-Data Persistence** 

Relevant learner progress, completed activities and achievements shall persist across sessions for authenticated users. 

#### **NFR-12-Maintainability of Learning Content** 

Learning content, challenge definitions and achievement criteria should be structured so they can be updated without major changes to the core BB84 simulation. 

## **9. User Stories** 

#### **Epic 1-Access & Orientation** 

#### **1. US-01-Access the Platform** 

As a beginner learner, 

**I want to** access the Crack the Channel platform 

**So that I** can begin the BB84 learning experience. 

#### **2. US-02-Understand the Learning Goal** 

As a beginner learner, 

I want to understand what I will learn and do 

So that I know what to expect before starting the learning experience. 

#### **Epic 2-BB84 Foundations** 

#### **1. US-03-Learn BB84 Basics** 

As a learner with no prior quantum knowledge **,** 

**I want** a simple introduction to BB84 

**So that** I understand its purpose before using it. 

#### **2. US-04-Understand Alice and Bob** 

As a beginner learner, 

**I want** to understand Alice's and Bob's roles 

**So that** I can follow the key-exchange process. 

#### **3. US-05-Understand Key Concepts Before Interaction** 

As a beginner learner, 

**I want** to understand unfamiliar BB84 concepts before I need to use them 

**So that** I am not required to guess what an action or result means. 

#### **Epic 3-Interactive BB84 Exchange** 

#### **US-06-Run BB84** 

As a learner, 

**I want to** run an interactive BB84 exchange 

**So that I** can learn the protocol by interacting with a Qiskit-based circuit. 

#### **1. 2US-07-Participate as Alice** 

#### **As a learner,** 

**I want** to experience the exchange from Alice's perspective 

**So that** I understand how the sender participates in BB84. 

#### **2. US-08-Participate as Bob** 

#### **As a learner,** 

**I want to** experience the exchange from Bob's perspective 

**So that** I understand how the receiver participates in BB84. 

#### **3. US-09-Understand the Exchange Outcome** 

#### **As a learner,** 

**I want to** see and understand the result of the exchange 

**So that** I can connect my actions with the resulting outcome. 

#### **Epic 4-Eve & Quantum Security** 

#### **1. US-10-Enter Eve Mode** 

As a learner, 

I want to act as an eavesdropper 

So that I can understand what happens when communication is intercepted. 

#### **2. US-11-Observe Eve's Impact** 

#### **As a learner,** 

I want to observe the effect of Eve's interference 

So that I can understand why eavesdropping affects the BB84 exchange. 

#### **3. US-12-Observe QBER** 

#### **As a learner,** 

I want to see the error rate/QBER change when Eve interferes 

**So that** I can understand how BB84 can reveal evidence of eavesdropping. 

#### **US-13-Understand the Security Meaning** 

#### **As a beginner learner,** 

I want to understand why the observed error-rate change matters 

**So that** I understand the security principle demonstrated by BB84. 

#### **Epic 5-Learning Feedback** 

#### **1. US-14-Receive Contextual Feedback** 

#### **As a learner,** 

I want to receive explanations and feedback at important points 

**So that** I understand what has happened rather than simply seeing technical output. 

#### **2. US-15-Understand Technical Terms** 

#### **As a beginner learner,** 

I want technical terms such as QBER explained in plain language 

**So that** I can understand the platform without prior quantum knowledge. 

#### **3. US-16-Understand the Final Outcome** 

#### **As a learner,** 

I want to receive a clear explanation of the final simulation outcome 

**So that** I can describe what happened during the BB84 exchange. 

#### **Epic 6-Learner Account & Progress** 

#### **1. US-17-Create/Access an Account** 

#### **As a beginner learner,** 

I want to create or access my own account 

**So that** my learning progress can be saved. 

#### **2. US-18-Track My Progress** 

#### **As a learner,** 

I want to see my learning progress 

**So that** I know what I have completed and what I should do next. 

#### **3. US-19-Resume Learning** 

#### **As a learner,** 

I want to return to my previous progress 

**So that** I do not have to repeat completed learning activities. 

#### **Epic 7-AI Learning Support** 

#### **1. US-20-Use the AI Bot** 

#### **As a beginner learner,** 

I want to ask the AI Bot questions about quantum computing and BB84 

**So that** I can receive support when I do not understand a concept. 

#### **2. US-21-Receive Guidance** 

#### **As a learner,** 

I want the AI Bot to provide explanations, hints or guidance when I am struggling 

**So that** I can continue learning without immediately being given the complete answer. 

#### **3. US-22-Receive Appropriate AI Support** 

#### **As a learner,** 

I want AI assistance to be relevant to the current learning activity 

**So that** the guidance helps me understand the concept I am currently learning. 

#### **Epic 8-Daily Quantum Challenges** 

#### **1. US-23-Complete a Daily Challenge** 

#### **As a learner,** 

**I want** to complete a Daily Quantum Challenge 

**So that** I can practise and apply what I have learned. 

#### **2. US-24-Progress Through Challenge Levels** 

#### **As a learner,** 

**I want** challenges to become progressively more difficult 

**So that** I can develop my quantum knowledge and skills over time. 

#### **3. US-25-Receive Challenge Feedback** 

#### **As a learner,** 

**I want** to receive an explanation after completing a challenge 

**So that** I understand why my answer or approach was correct or incorrect. 

#### **US-26-Receive Hints** 

#### **As a learner,** 

**I want** to request a hint when I am stuck 

**So that** I can continue attempting the challenge before receiving the complete solution. 

#### **Epic 9-Gamification & Continued Engagement** 

#### **1. US-27-Earn Points/XP** 

#### **As a learner,** 

**I want** to earn points or XP for meaningful learning activities 

**So that** I can see my progress as I complete the learning journey. 

#### **2. US-28-Earn Achievements** 

#### **As a learner,** 

**I want to** earn badges or achievements for meaningful milestones 

**So that** I can recognise and celebrate my learning progress. 

#### **3. US-29-See My Learning Level** 

#### **As a learner,** 

**I want to** see my current learning level and progression 

**So that** I know how far I have progressed. 

#### **4. US-30-Celebrate Milestones** 

#### **As a learner,** 

**I want to** receive celebratory feedback when I reach an important milestone 

**So that** my learning achievements feel recognised and motivating. 

#### **5. US-31-Return to Continue Learning** 

#### **As a learner,** 

**I want** new challenges, progression goals and learning milestones 

**So that** I have meaningful reasons to return to the platform. 

#### **10. User Story Traceability** 

|**Epic**|**User Stories**|**Supporting Requirements**|
|---|---|---|
|Access & Orientation|US-01–US-02|FR-01–FR-02, UX-01, UX-03|
|BB84 Foundations|US-03–US-05|FR-03,FR-14,LR-01–LR-04|
|Interactive Exchange|US-06–US-09|FR-04–FR-07,NFR-03|
|Eve & Security|US-10–US-13|FR-08–FR-09|
|LearningFeedback|US-14–US-16|FR-10–FR-11,LR-02,LR-06|
|Account &Progress|US-17–US-19|FR-12–FR-13,FR-22,LR-13|
|AI LearningSupport|US-20–US-22|FR-16, NFR-08–NFR-10, LR-11|
|Daily Challenges|US-23–US-26|FR-17–FR-18,LR-09–LR-10|
|Gamification&Engagement|US-27–US-31|FR-19–FR-23,LR-12,LR-14|
|UX|US-01–US-31|UX-01–UX-12|
|TechnicalQuality|Cross-cutting|NFR-01–NFR-12|



#### **11. Business Rules & Constraints** 

#### **BR-01-BB84 Scope** 

The educational simulation shall focus on BB84 and shall not expand into other QKD protocols during the current project. 

#### **BR-02-Educational Focus** 

The product shall prioritise quantum-learning outcomes over unrelated cybersecurity functionality. 

#### **BR-03-Real Qiskit Circuits** 

The core BB84 demonstration shall use executable Qiskit circuits rather than a scripted or prerecorded simulation. 

#### **BR-04-Simulator Flexibility** 

A Qiskit-compatible simulator may be used. Real IBM Quantum hardware is not a dependency. 

#### **BR-05-Beginner Audience** 

Requirements and UX decisions shall consider learners with little or no prior quantum-security knowledge. 

#### **BR-06-Safe Environment** 

The platform shall not require real attacks, sensitive information or live production systems. 

#### **BR-07-Gamification Supports Learning** 

Points, badges, levels and celebrations shall support meaningful learning progress rather than becoming the primary purpose of the platform. 

#### **BR-08-AI Supports Learning** 

The AI Bot shall support the learning experience and shall not replace the structured learning content. 

#### **BR-09-AI Failure** 

Failure of the AI service shall not prevent access to core learning activities. 

#### **BR-10-Controlled AI Execution** 

AI-generated code shall not be executed without an approved controlled execution pathway. 

#### **BR-11-Challenge Relevance** 

Challenges should relate to concepts introduced within the learning pathway. 

#### **BR-12-Progressive Difficulty** 

Challenge difficulty should increase in accordance with learner progression. 

#### **BR-13-Persistent Learning Journey** 

Relevant learner progress, completed challenges and achievements shall be retained for authenticated users. 

#### **BR-14-Safe Learner Data** 

The platform shall only collect and retain data required for the agreed learning functionality. 

#### **12. Learning Experience Observations** 

The following observations were developed from the team's beginner learning activities, review of IBM Quantum Learning material, Qiskit learning modules and existing learner research. 

The purpose is to explicitly demonstrate the evidence → learning implication → BA requirement process. 

## **12.1 IBM Quantum Business Foundations** 

#### **Observation 1-Learning is structured into manageable modules** 

The IBM Quantum Business Foundations course is divided into modules and lessons rather than presenting all quantum concepts simultaneously. 

#### **Learning implication:** 

Complex concepts can be approached in smaller stages. 

#### **BA implication:** 

Crack the Channel should use a structured learning pathway rather than presenting the complete BB84 protocol at once. 

#### **Requirements affected:** 

FR-14, FR-15, LR-03, LR-07. 

The course itself describes separate modules/lessons and recommends learners work through the material at their own pace. 

#### **Observation 2-Learners can control their learning pace** 

IBM explicitly supports learners leaving the course and returning later. 

#### **Learning implication:** 

Learners should not be forced to complete one long uninterrupted session. 

#### **BA implication:** 

Progress should persist across sessions. 

#### **Requirements affected:** 

FR-12, FR-13, FR-22, LR-13. 

The course specifically states that learners can pace their learning and return later. 

#### **Observation 3-Learning combines different forms of content** 

The IBM course combines text, media and optional resources. 

#### **Learning implication:** 

A learning platform does not need to rely on one content format. 

#### **BA implication:** 

Crack the Channel should combine concise explanations, visual diagrams, interactive simulation and practical Qiskit experiences rather than becoming another text-heavy resource. 

#### **Requirements affected:** 

FR-14, LR-05, LR-08, UX-04. 

#### **Observation 4-Learning outcomes are clearly communicated** 

IBM communicates what learners should be able to understand by the end of the course. 

#### **Learning implication:** 

Clear learning outcomes help learners understand the purpose of activities. 

#### **BA implication:** 

Each major Crack the Channel learning stage should communicate what the learner is expected to understand or accomplish. 

#### **Requirements affected:** 

LO-01–LO-12, FR-15, UX-03. 

#### **Observation 5-Optional resources should not interrupt the core pathway** 

IBM distinguishes core learning material from optional resources. 

#### **Learning implication:** 

Additional information can be useful but can also distract beginners. 

#### **BA implication:** 

Crack the Channel should keep the core BB84 pathway focused while allowing optional deeper learning. 

#### **Requirements affected:** 

FR-14, LR-07, UX-04. 

#### **Observation 6-Achievement can provide an additional learning goal** 

The IBM Quantum Business Foundations course provides a pathway towards a badge/exam. 

#### **Learning implication:** 

A visible achievement can provide an additional goal beyond simply consuming content. 

#### **BA implication:** 

Crack the Channel can use meaningful badges, milestones and achievements to recognise genuine learning progress. 

#### **Requirements affected:** 

FR-20–FR-21, LR-12. 

The IBM course explicitly describes a badge that can be earned after completing the course and passing its badging exam. 

#### **12.2 IBM Qiskit / Quantum Learning Modules** 

The IBM learning modules combine background information, Qiskit code, practice questions and optional video. The Qiskit primer introduces learners to running a quantum circuit. 

#### **Observation 7-Concepts are connected to practical activity** 

Learning can progress from background information into actually running a quantum circuit. 

#### **Learning implication:** 

Practical interaction can connect abstract concepts with observable results. 

#### **BA implication:** 

Crack the Channel should connect BB84 explanations directly to interactive Qiskit-based experiences. 

#### **Requirements affected:** 

FR-04, LR-05, LR-08. 

#### **Observation 8-Practice reinforces learning** 

Practice questions provide opportunities to apply concepts after learning them. 

#### **Learning implication:** 

Learners benefit from retrieving and applying knowledge rather than only consuming content. 

#### **BA implication:** 

Daily Quantum Challenges should provide similar opportunities to apply concepts after they have been introduced. 

#### **Requirements affected:** 

FR-17–FR-18, LR-09, US-23–US-26. 

#### **Observation 9-Qiskit introduces another layer of technical complexity** 

Qiskit provides valuable practical interaction but can introduce programming and implementation complexity for beginners. 

#### **Learning implication:** 

Beginners should not be required to understand advanced Python/Qiskit implementation details before understanding the quantum concept being demonstrated. 

#### **BA implication:** 

The platform should hide unnecessary implementation complexity while still providing genuine Qiskit-based interaction. 

#### **Requirements affected:** 

FR-04, FR-14, LR-01, LR-03, UX-04, NFR-03. 

#### **12.3 Personal Beginner Quantum/BB84 Learning Observations** 

#### **Observation 10-Quantum terminology creates an early barrier** 

Terms such as qubit, superposition, and measurement can be difficult when introduced together. 

#### **Learning implication:** 

Introducing too many unfamiliar concepts at once can increase cognitive load. 

#### **BA implication:** 

New terminology should be introduced progressively with simple explanations before learners are expected to use it. 

#### **Requirements affected:** 

FR-03, FR-14, LR-01–LR-04. 

#### **Observation 11-Superposition can easily be misunderstood** 

A simplified explanation such as a qubit being "0 and 1 at the same time" can create misconceptions. 

#### **Learning implication:** 

Beginner explanations need to balance simplicity with technical accuracy. 

#### **BA implication:** 

The platform should use beginner-friendly explanations without introducing misleading simplifications. 

#### **Requirements affected:** 

FR-14, LR-02, LR-04. 

#### **Observation 12-Measurement needs visualisation** 

Understanding the difference between a quantum state and the classical outcome after measurement is important. 

#### **Learning implication:** 

Measurement is difficult to understand through text alone. 

#### **BA implication:** 

Measurement should be represented visually and/or interactively within the learning experience. 

#### **Requirements affected:** 

FR-04, FR-07, UX-05. 

#### **Observation 13-Quantum computing should not be presented simply as faster classical computing** 

Quantum computing is a different computational approach rather than simply a faster version of classical computing. 

#### **Learning implication:** 

An inaccurate initial mental model can affect later learning. 

#### **BA implication:** 

Introductory content should avoid creating the misconception that quantum computers are simply faster classical computers. 

#### **Requirements affected:** 

FR-14, LR-01, LR-02. 

#### **Observation 14-BB84 needs cybersecurity context** 

BB84 is easier to understand when the learner understands the communication/security problem it addresses. 

#### **Learning implication:** 

Learners can connect the new quantum concept to cybersecurity knowledge they may already possess. 

#### **BA implication:** 

The learning pathway should introduce the communication/security problem before requiring learners to interact with Alice, Bob and Eve. 

#### **Requirements affected:** 

FR-03, LO-01, LO-06. 

#### **Observation 15-BB84 is easier to understand as a sequence** 

The BB84 process can be understood as a sequence of stages: 

#### **Preparation → Measurement → Basis reconciliation → Error estimation → Post-processing** 

#### **Learning implication:** 

Presenting the complete protocol at once increases cognitive load. 

#### **BA implication:** 

The platform should reveal the protocol progressively and connect each stage to the learner's actions and results. 

#### **Requirements affected:** 

FR-03–FR-10, LR-03, UX-03. 

### **12.4 Learner Research / UX Observations** 

Existing learner research provides additional support for the platform direction. 

#### **Observation 16-Visual learning is important** 

Learner research showed strong preference for diagrams and visual explanations, with hands-on interaction also being a commonly selected learning approach. 

#### **Learning implication:** 

Visual and interactive learning can make abstract quantum concepts easier to understand. 

#### **BA implication:** 

The platform should prioritise visualisations, diagrams and interaction rather than relying primarily on text. 

#### **Requirements affected:** 

FR-14, LR-05, UX-04. 

### **Observation 17-Learners need immediate feedback** 

Learner research identified uncertainty around whether an action was being performed correctly and supported the need for feedback during the experience. 

#### **Learning implication:** 

Learners may become confused if they perform an action without understanding its result. 

#### **BA implication:** 

The platform should provide contextual feedback after meaningful actions. 

#### **Requirements affected:** 

FR-10, LR-06, UX-05. 

### **Observation 18-Learners benefit from visible progress** 

Learner research indicated interest in progress indicators/checklists and understanding where they are within the learning experience. 

#### **Learning implication:** 

Learners benefit from knowing what they have completed and what remains. 

#### **BA implication:** 

The platform should provide visible progression through levels, completed activities and future learning goals. 

#### **Requirements affected:** 

FR-13, FR-15, FR-22, LR-13, UX-08. 

### **Observation 19-Existing cybersecurity knowledge can provide a bridge** 

Learners may already understand familiar cybersecurity concepts such as communication and eavesdropping even when quantum concepts are unfamiliar. 

#### **Learning implication:** 

Existing knowledge can be used to introduce unfamiliar concepts. 

#### **BA implication:** 

BB84 should be introduced through the cybersecurity problem it helps address before introducing the more difficult quantum concepts. 

#### **Requirements affected:** 

FR-03, LO-01, LO-06. 

