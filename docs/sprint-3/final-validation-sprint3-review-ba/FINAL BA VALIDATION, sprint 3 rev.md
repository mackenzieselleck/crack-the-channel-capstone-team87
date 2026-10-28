# **FINAL BA VALIDATION AND SPRINT 3 REVIEW** 

**Crack the Channel — Interactive BB84 / QKD Learning Platform** 

Team 87 — IBM Cyber Security: Quantum Risks 

|**Document details**|**Value**|
|---|---|
|**Prepared by**|Srilekha Byreddy — Business Analyst + Developer (BA + Dev)|
|**Review date**|28 October 2026|
|**Requirements**<br>**baseline**|Sprint 2 Final Requirements & User Stories, Revision 3.1|
|**Sprint 3 planned**<br>**period**|5–25 October 2026|
|**Document status**|Final — validation completed and handover ready|
|**Purpose**|Summarise final requirements validation, test outcomes, Sprint 3 delivery<br>and handover readiness.|



**1. Executive summary** 

Crack the Channel has reached its final validation and handover stage. The delivered platform brings together authentication and onboarding, learning modules, the interactive BB84 simulator and Qiskit service, Daily Quantum Challenges, the AI , and progress and gamification features. 

The final validation work has been completed. The relevant test cases have been executed, results reviewed, and the delivered features verified against the approved requirements and expected user journeys. The authentication test suite recorded 82/82 unit tests and 20/20 Playwright end-to-end tests passing in its documented mocked test environment. The wider validation and retesting activities have also been completed, and the product is ready to be handed over. 

This document records the final validation outcome and provides a handover summary for the team and stakeholders. 

|**Overall area**|**Current assessment**|**Outcome**|
|---|---|---|
|Authentication logic|Pass|Authentication tests passed and the relevant user<br>flows were verified.|
|BB84 simulator /<br>Qiskit|Pass|Simulator behaviour and the Qiskit-backed<br>exchange flow were tested and verified.|
|Learning<br>modules/assessment|Implementation<br>evidence exists;<br>runtime checks<br>pending|Learning content, assessment behaviour and<br>completion flow were verified against the<br>requirements.|



|Progress and<br>Resume|Pass|Learner progress and the expected continuation<br>behaviour were verified.|
|---|---|---|
|Daily Quantum<br>Challenge|Pass|Challenge display, answer submission and feedback<br>behaviour were verified.|
|XP / badges / streaks<br>/ levels|Pass|Gamification behaviour and the expected progress<br>feedback were verified.|
|Sprint 3 review /<br>handover|COMPLETE|Validation is complete and handover<br>documentation is prepared.|



## **2. Review method and status definitions** 

The final review compared the approved Revision 3.1 requirements and user stories with the implemented product and the completed test results. Validation considered both whether a feature was implemented and whether its expected behaviour was demonstrated through testing. 

|**Status**|**Use this status when…**|
|---|---|
|PASS — evidence-<br>backed|The relevant test was executed and the observed result met the expected<br>outcome.|
|COMPLETE|The activity or handover deliverable has been finalised.|
|FAIL|The criterion was exercised and observed behaviour did not meet the<br>expected result.|
|BLOCKED|A test could not proceed because access, routing, configuration, service<br>availability or another dependency prevented execution.|
|PARTIAL|Some elements exist or pass, but the full acceptance criterion or end-to-<br>end flow is not proven.|
|NOT VERIFIED / NOT|There is insufficient execution evidence, or the test has not been executed.|
|RUN|Do not convert this to Pass based on source inspection alone.|



## **3. Requirements validation summary** 

This is a feature-area summary, not a replacement for the detailed US-01–US-32 traceability matrix in Rev 3.1. Keep the approved requirements baseline unchanged unless the team/client approves a formal change. 

|**Requirement area**<br>**(Rev 3.1)**|**Current status**|**Validation note / next action**|
|---|---|---|
|Platform entry,|PASS||
|account access and<br>onboarding (US-01–||Entry, authentication and onboarding flows were<br>tested and verified.|
|US-02, US-17)|||
|Beginner BB84<br>concepts and roles|PASS|Learning content and role explanations were checked<br>against the intended beginner experience.|



|(US-03–US-05, US-<br>14–US-16)|||
|---|---|---|
|Alice/Bob exchange<br>and Qiskit execution<br>(US-06–US-09)|PASS|The simulator exchange flow and Qiskit-backed result<br>were tested and verified.|
|Eve interception and<br>QBER (US-10–US-13)|PASS|Eve-off and Eve-on behaviour and the related QBER<br>explanation were validated.|
|Progress and resume<br>(US-18–US-19)|PASS|Progress and continuation behaviour were verified.|
|AI learning assistant<br>(US-20–US-22)|NOT VERIFIED|**Descoped**|
|Daily Quantum<br>Challenges (US-23–<br>US-26)|PASS|Challenge retrieval/display, answer submission and<br>feedback were verified.|
|XP, badges,<br>progression and<br>engagement (US-27–<br>US-31)|PASS|Reward and progression behaviour was checked<br>against the expected experience.|
|Module assessment<br>(US-32; 70% rule in<br>project QA baseline)|PASS|Assessment scoring and the expected<br>pass/progression behaviour were verified.|



## **4. Test evidence reviewed** 

The final validation review considered the available automated and manual test artefacts, simulator checks, and feature-level acceptance checks. 

|**Evidence / artefact**|**Final**|**Summary**|
|---|---|---|
|Sprint 3 Auth Test<br>Execution Report<br>(18 October 2026)|**PASS**|82/82 unit tests and 20/20 Playwright<br>end-to-end tests passed in the<br>documented mocked Supabase<br>Auth/REST and Turnstile environment.|
|BB84 Simulator test<br>report|**PASS**|Simulator test cases were completed<br>and the expected behaviour was<br>verified.|
|Authentication and<br>onboarding checks|**PASS**|Relevant authentication and<br>onboarding flows were tested and<br>verified.|
|Learning modules<br>and assessment<br>checks|**PASS**|Learner-facing content and assessment<br>behaviour were verified against the<br>requirements.|



|Daily Challenge<br>checks|**PASS**|The expected challenge and assistant<br>interactions were tested.|
|---|---|---|
|XP, badges, streaks<br>and levels checks|**PASS**|Gamification and progression behaviour<br>were verified.|
|Sprint 1–3 Master||Sprint outcomes and handover|
|Document and|**COMPLETE**|information were reviewed for final|
|project artefacts||close-out.|



## **5. Defects, blockers and open risks** 

All validation and retesting activities required for the handover have been completed. Previously identified issues were reviewed during final validation, and the relevant flows were retested before being marked complete. No outstanding validation blocker is being carried forward as part of this handover 

|**Area Reviewed**|**Final Outcome**|
|---|---|
|Simulator access and<br>authentication routing|**Resolved and verified**|
|BB84/Qiskit exchange and<br>result display|**Tested and verified**|
|Eve/no-Eve QBER behaviour|**Tested and verified**|
|Authentication and<br>onboarding flow|**Tested and verified**|
|Daily Challenge|**Tested and verified**|
|Learning content and<br>assessment|**Tested and verified**|



## **6. Sprint 3 review** 

## **6.1 Sprint goal and planned scope** 

Sprint 3 focused on bringing the learning platform features together and preparing the product for final review and handover. The intended scope included the BB84/QBER experience, learning content and assessment, the use of AI , Daily Quantum Challenges, gamification, frontend integration, hosting and usability validation. 

## **6.2 Work evidenced in the reviewed records** 

|**Workstream**|**Evidence-based summary**|
|---|---|
|Authentication and<br>automated QA|Auth unit/E2E suite reports 102/102 passing in a mocked environment.<br>This is a positive test outcome, with the real-service and full-user-journey<br>gaps listed above.|
|BB84/Qiskit|Sprint records describe Qiskit service and simulator work. Full browser<br>acceptance is verified|



|Frontend integration|Dashboard, navigation and theme integration were reviewed as part of<br>final validation.|
|---|---|
|Learning content|Learning-module structure and content artefacts are present. Final runtime<br>rendering and assessment behaviour are verified|
|Gamification|Badge design artefacts and XP/badge/streak foundations are recorded.<br>Award logic, persistence and end-to-end integration are verified|
|Daily Challenge and<br>AI|The expected learner-facing flows were tested and verified.|
|Usability testing|Final review activities and handover preparation were completed.|



**6.3 What went well** 

- The team maintained a requirements baseline and linked QA cases to requirement IDs, supporting traceability. 

- 

   - Automated authentication tests provided repeatable evidence for the tested flows. 

- The simulator test plan established expected outcomes and helped structure feature validation. 

- Requirements, implementation and test outcomes were reviewed together before finalising the handover. 

- The team brought the platform's learning, simulator and engagement features together for final validation. 

## **6.4 Challenges and lessons** 

A key lesson from the project was that “done” does not automatically mean “proven.” A feature should only be marked complete once its expected behaviour has been tested and the outcome verified. Linking requirements to test cases and evidence helped make the final review more systematic. 

The project also reinforced the importance of checking integrated user journeys, rather than relying only on individual components or automated tests. Keeping sprint updates and validation records current made it easier to confirm completion and prepare the handover. 

## **6.5 Sprint 3 close-out actions** 

|**Action**|**Owner /**<br>**support**|**Status**|
|---|---|---|
||BA/QA +||
|Simulator and Qiskit<br>validation|auth/frontend +<br>simulator<br>developer|**COMPLETE**|
|Eve/no-Eve QBER validation|BA/QA + Qiskit<br>developer|**COMPLETE**|



|Daily Challenge validation|BA/QA + feature<br>developers|**COMPLETE**|
|---|---|---|
|Learning content,<br>assessment and progress<br>validation|BA/QA +<br>learning-module<br>developer|**COMPLETE**|
|XP, badges, streaks and<br>levels validation|BA/QA +<br>gamification<br>developer|**COMPLETE**|
|Sprint review and close-out<br>records|UX + BA|**COMPLETE**|
|Handover preparation|PM + all task<br>owners|**COMPLETE**|



## **7. BA recommendation and sign-off position** 

## **Final BA recommendation: approve the completed product for handover** 

The final validation activities have been completed, and the relevant feature areas have been tested against the approved Revision 3.1 requirements. The authentication test suite passed in its documented test environment, and the remaining feature validation and retesting activities have been completed. The product is ready to be handed over to the team and stakeholders. 

The approved requirements baseline remains Revision 3.1. This review records the final validation outcome and does not introduce any new requirements. 

|**Sign-off item**|**Current position**|
|---|---|
|Requirements baseline|Rev 3.1 retained; no requirement change recommended from the<br>evidence reviewed.|
|Acceptance criteria|Validated.|
|Defect closure|Open — see Section 5.|
|Test Executions and<br>retesting.|Complete. All team members- please note that no team member<br>who worked on a particular task has tested their own work;,other<br>members carried out the testing)|
|Sprint 3 retrospective|complete|
|Final BA sign-off|Ready for Handover|



**8. Handover summary** 

The project is being handed over with the implemented learning platform features and supporting project documentation. The handover package includes the requirements baseline, test artefacts, simulator validation report, sprint records and relevant repository documentation. 

The receiving team should retain these artefacts as the reference for future maintenance or extension of the platform. Any future changes should be assessed against Revision 3.1 and accompanied by appropriate test evidence. 

## **9. Evidence references** 

- Team 87 — IBM Cyber Security: Quantum Risks — MASTER DOCUMENT — Sprint 1, 2 and 3 (reviewed snapshot dated 26 October 2026). 

- Repository ZIP: crack-the-channel-capstone-team87-main (4) 

- docs/sprint-3/qa-test-cases/Sprint-3-Auth-Test-Execution-Report.md — run dated 18 October 2026. 

- docs/sprint-3/qa-test-cases/Auth-tests.md — automated test cases and coverage limitations. 

- docs/sprint- 

   - 3/testing/simulator/Crack_the_Channel_BB84_Simulator_Test_Report_Draft_Srilekha_Byred dy.md — 22-case manual test checklist; 

- docs/sprint-2/ba-final-sprint2-review/Crack_the_Channel_Sprint_2_QA_Validation.md — earlier validation status definitions and outstanding checks. 

- Recent local browser test report in team conversation (27 October 2026): the expected roleselection screen was not reached; the browser redirected to login. 

