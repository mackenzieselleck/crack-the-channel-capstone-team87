# **Crack the Channel — Sprint 2 Final BA & QA Validation Review** 

#### **BA Review, Implementation Review & Sprint Handover** 

Team 87  •  Crack the Channel  •  Sprint 2  •  04 October 2026 

|**Reviewer**|Srilekha Byreddy (BA + DEV)|
|---|---|
|**Requirements Baseline**|Rev 3.1|
|**Review Basis**|Latest supplied Team 87 main repository and Sprint 2<br>documentation|
|**Overall Status**|Substantialprogress — not readyfor full BA/QA sign-off|



## **1. Review Purpose** 

This review evaluates Sprint 2 implementation against the approved Rev 3.1 requirements and user stories. It separates implementation evidence from runtime QA evidence so that a feature is not treated as complete simply because code exists. 

## **2. Executive Conclusion** 

The repository contains a substantial working foundation, including the BB84/Qiskit service, learner-controlled Alice/Bob/Eve inputs, QBER and post-processing, learning-module database/progress/assessment foundations, authentication/onboarding work, and backend foundations for XP, badges, streaks and Daily Challenges. 

##### **BA decision** 

Rev 3.1 should remain unchanged. The open items identified in Sprint 2 are implementation defects, incomplete integration, missing feature delivery, runtime validation gaps or UX issues—not evidence that the approved user stories or acceptance criteria need rewriting. 

## **3. Main Sprint 2 Findings** 

|**Area**|**Currentposition**|**BA/QA action**|
|---|---|---|
|Authentication & onboarding|Partially verified; routing/first-time flow issues<br>remain|Fix and re-test E2E|
|Protected learningroutes|Needs consistent dynamic-routeprotection|Fix /learn/[slug]and re-test|
|BB84/Qiskit|Substantial implementation; full runtime QA<br>not independentlyverified|Run QBER, Eve/no-Eve and result-explanation<br>tests|
|Learning modules|Framework present; final learner content still<br>needspublication/integration|Publish and validate content|
|Module assessments|Framework supports server-side grading, 70%<br>threshold and multiple attempts|Validate actual questions, scoring and<br>attempts|
|Progress / XP / badges|Foundations present; full learner journey not<br>closed|Validate cross-session behaviour and rewards|
|Daily Challenges|Backend/service foundations present; learner<br>UI/live E2E not sufficientlyevidenced|Complete UI and E2E validation|
|AI Learning Bot|Not sufficiently evidenced in supplied<br>implementation snapshot|Validate before sign-off|
|Levels / dashboard|Incomplete /placeholder areas remain|Complete in Sprint 3|
|QA evidence|Committed cases still require executed<br>outcomes/evidence|Execute and update test cases|



## **4. Dev 1 — BB84 / Qiskit Validation** 

|**Requirement / story area**|**Reviewposition**|
|---|---|
|FR-04 / US-06 — Interactive BB84|Implemented;runtimeQA verification outstanding|
|FR-05 / US-07 — Alice|Implemented|
|FR-06 / US-08 — Bob|Implemented|
|FR-07 / US-09 — Exchange outcome|Partially implemented; final learner-facing explanation requires<br>validation|
|FR-08 / US-10–11 — Eve|Implemented|
|FR-09 / US-12–13 — QBER / security|Partially implemented; QBER is calculated/returned but no-Eve<br>baselinepresentation needs validation|
|FR-10 / US-14–16 — Feedback|Implemented at service level;verifylearner-facingbehaviour|
|NFR-03 — AuthenticQiskit execution|Implemented|
|NFR-10 — Controlled execution|Input-level controls implemented;deployment hardeningremains|



- Compare no-Eve and Eve QBER behaviour using runtime tests. 

- Confirm the final BB84 result is explained clearly to a beginner. 

- Check duplicate 'Next step' UI behaviour. 

- 

- 

- Confirm authentication architecture for BB84 service calls. 

- Reproduce automated tests cleanly in the team environment. 

## **5. Dev 2 — Learning, Authentication, Progress & Gamification** 

|**Area**|**Reviewposition**|
|---|---|
|Learning content / FR-03|Partially implemented; supplied database still contains test-<br>module/placeholder content|
|Learning pathway / FR-14|Modules and sequential navigation exist; final content publication<br>remains|
|FR-24 / US-32 — Module assessment|Framework implemented with server-side grading, 70% threshold and<br>multiple attempts;final content/runtime testingremains|
|FR-13 / US-18–19 — Progress|Framework implemented; real learner-content cross-session<br>validation remains|
|FR-19 / FR-20 — XP and badges|Completion/reward foundations present; complete progression<br>integration remains|
|FR-15 — Levels|Not fullyimplemented in learner-facingflow|
|FR-22 — Dashboard|Placeholder / incomplete|
|FR-23 — Milestone feedback|Partiallyimplemented|
|NFR-11 — Usability|Partiallyvalidated|
|NFR-12 — Maintainability|Implemented at framework level|



## **6. Authentication & Onboarding Findings** 

- Landing page identity and primary CTA are clear. 

- Sign-up/login flows provide clear basic feedback. 

- Fresh account creation and email-confirmation screens are present. 

- Invalid-login feedback is present. 

- Profile save and onboarding completion redirect were manually retested. 

- Protected /learn and /simulator routes were manually verified. 

- Confirm-password behaviour requires functional validation rather than visual inspection only. 

- First-time users can bypass the intended onboarding flow in the current implementation. 

- Email-verification flow does not reliably continue into onboarding. 

- Signup redirect configuration and password-complexity behaviour require runtime re-testing. 

- Dynamic /learn/[slug] route protection needs to be made consistent. 

- Mobile layout and navbar polish remain deferred items. 

## **7. Daily Challenges & AI** 

Daily Challenge backend/service foundations are present, but the learner-facing UI and live end-to-end behaviour are not sufficiently evidenced in the supplied snapshot. The AI Learning Bot is also not sufficiently evidenced for sign-off. 

##### **QA position** 

Do not mark Daily Challenges or AI as Pass solely from source inspection. They require browser/runtime evidence against their acceptance criteria. 

## **8. QA Validation Position** 

The supplied documentation contains a comprehensive QA test-case structure. However, the committed test-case snapshot still contains Not Run statuses for many cases. Therefore, full QA sign-off cannot be claimed until actual execution results and evidence are recorded. 

|**Evidence type**|**Position**|
|---|---|
|Manual authentication/onboardingchecks|Successful results documented for selected flows|
|Protected /learn and /simulator checks|Manuallyverified|
|Python source compilation|Succeeded|
|Automated Qiskit / Challenge suites|Test suites exist; clean end-to-end execution still needs team-<br>environment evidence|
|BB84-01–12|Runtime outcomes/evidence still required|
|LEARN-01–09|Runtime outcomes/evidence still required|
|ASSESS-01–09|Runtime outcomes/evidence still required|
|PROG-01–13|Runtime outcomes/evidence still required|
|CHA-01–06|Runtime outcomes/evidence still required|
|AI-01–08|Runtime outcomes/evidence still required|
|SEC-01 / EDGE-01–18|Runtime outcomes/evidence still required|



## **9. Priority Closure Items** 

### **P0 — Before Sprint 2 full sign-off** 

1. Fix first-time authentication/onboarding routing. 

2. Protect /learn/[slug] consistently. 

3. Fix signup confirmation redirect and confirm-password behaviour. 

4. Re-test password complexity and existing-email handling. 

5. Integrate /learn with the database learning pathway rather than relying on hard-coded quick-check behaviour. 

6. Execute BB84/Qiskit runtime QA, including QBER, Eve/no-Eve comparison and final learner explanation. 

7. Replace Not Run statuses with evidence-based Pass, Fail or Blocked outcomes. 

### **P1 — Sprint 3 handover** 

8. Publish reviewed learning modules and assessment questions. 

9. Complete learner levels and dashboard. 

10. Complete Daily Challenge frontend and E2E validation. 

11. Complete and validate the AI learning workflow. 

12. Finish milestone/achievement presentation and gamification integration. 

13. Complete mobile/navbar refinement. 

14. Strengthen BB84 service authentication and deployment hardening. 

15. Clean up automated test/import issues and rerun tests in the team environment. 

## **10. Acceptance Criteria & Requirements Decision** 

##### **Decision** 

Keep Requirements & User Stories Rev 3.1 unchanged. The identified issues do not justify rewriting the approved user stories or acceptance criteria. They should be managed through implementation fixes, integration work, QA execution and Sprint 3 refinement where required. 

## **11. BA Sign-off Position** 

Sprint 2 BA review is completed at the review level. The implementation shows substantial progress, but full BA/QA sign-off is not yet complete because several integration defects remain and the committed QA test-case document still requires executed statuses and evidence. 

## **12. Sprint 3 Handover** 

##### **Validation chain** 

Rev 3.1 Requirements → User Stories + Acceptance Criteria → QA Test Cases → Browser / Runtime Execution → Evidence → Pass / Fail / Blocked → Defect Closure → Final Sign-off 

Core principle: Code implemented does not equal requirement validated. A requirement is complete only when its acceptance criteria are satisfied and supported by evidence. 

