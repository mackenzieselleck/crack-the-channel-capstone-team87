**Crack the Channel — Sprint 2 QA Validation** 

## **Test Scope, Evidence Requirements, Findings & Sprint 3 Handover** 

Team 87  •  Crack the Channel  •  Sprint 2  •  04 October 2026 

|**Prepared by**|Srilekha Byreddy (BA + DEV)|
|---|---|
|**Requirements Baseline**|Rev 3.1|
|**Validation Date**|04 October 2026|
|**OverallQA Status**|Not fullysigned off — execution evidence still required|



# **1. Purpose** 

This document records Sprint 2 QA validation against the approved Rev 3.1 requirements and the Sprint 2 QA test-case set. Runtime acceptance criteria require execution evidence; source-code inspection alone is not sufficient for a Pass. 

# **2. Test Scope** 

- Registration, authentication and onboarding 

- Session handling and protected access 

- Supabase learner profile 

- Beginner learning content 

- Interactive BB84 simulation 

- Alice, Bob and Eve controls 

- QBER and security feedback 

- Contextual learner feedback 

- Learner progress and resume behaviour 

- Levels 

- Daily Quantum Challenges 

- Challenge difficulty and feedback 

- XP and badges 

- Milestone feedback 

- AI Learning Bot 

- Continued learning 

- Error and edge cases 

Out of scope: other QKD protocols, real-world attacks, production enterprise authentication, sensitive learner information, unrestricted AI code generation, and dependence on real IBM quantum hardware. 

# **3. Test Environment** 

|**Component**|**Expected environment**|
|---|---|
|Frontend|Next.js application|
|Authentication / database|Supabase Auth and Supabase DB|
|Quantum backend|Qiskit-based BB84 service|
|Browser|Chrome / current supported desktopbrowser|
|Local URL|localhost:3000|
|Configuration|Required environment variables and service credentials|
|Test data|Dedicated test learner accounts and seeded learning/challenge data<br>where applicable|



# **4. Test Status Definitions** 

|**Status**|**Definition**|
|---|---|
|PASS|Acceptance criteria exercised and supported byevidence|
|FAIL|Acceptance criteria exercised but expected behaviour was not<br>satisfied|
|BLOCKED|Execution could not proceed because required functionality or<br>environment was unavailable|
|NOT INDEPENDENTLY VERIFIED|Implementation evidence exists, but sufficient runtime evidence is not<br>available|
|NOT RUN|Test has notyet been executed|



# **5. Sprint 2 QA Summary** 

|**Test area**|**Current status**|**Required closure**|
|---|---|---|
|Authentication/onboarding|Partial|Complete E2E first-time-user and verification<br>flows|
|Protected routes|Partial|Validate dynamic /learn/[slug] protection|
|BB84 /Qiskit|Not independentlyverified|Run full runtime scenarios|
|Learning modules|Partial|Publish final content and validate learner<br>journey|
|Module assessments|Partial|Validate questions, scoring, 70% threshold<br>and attempts|
|Progress|Partial|Validate cross-session persistence and<br>resume|
|XP / badges|Partial|Validate actual reward triggers|
|DailyChallenges|Blocked /partial|Complete learner UI and live E2E validation|
|AI LearningBot|Blocked / not independentlyverified|Validate end-to-end workflow|
|Levels/dashboard|Incomplete|Complete learner-facingimplementation|
|Edge cases|Not run / further validation|Execute and capture evidence|



# **6. Authentication & Onboarding — Findings** 

- Landing identity and CTA are clear. 

- Basic sign-up/login feedback is present. 

- Fresh account creation and email confirmation screens are present. 

- Invalid-login feedback is present. 

- Profile save and onboarding completion routing were manually retested. 

- /learn and /simulator protection were manually verified. 

- Confirm-password requires functional validation. 

- First-time users can bypass intended onboarding. 

- Verification does not reliably continue onboarding. 

- Signup redirect configuration requires validation. 

- Password complexity behaviour requires runtime re-testing. 

- Existing-email handling should be validated. 

- Resend-email behaviour needs clearer functional evidence. 

- Dynamic /learn/[slug] protection needs consistency. 

- Mobile layout and navbar remain deferred. 

# **7. BB84 / Qiskit Validation** 

The current implementation provides Qiskit/Aer-based BB84 processing with learner-controlled Alice/Bob inputs, Eve intervention, trace/sifted-key processing, QBER calculation, error correction and privacy amplification. 

Required runtime scenarios: 

1. Run a valid no-Eve scenario and record the resulting QBER. 

2. Run a comparable Eve-enabled scenario and compare the QBER/result. 

3. Confirm the learner-facing exchange/result explanation is understandable to a beginner. 

4. Verify contextual feedback and progression behaviour after the simulation. 

5. Check for duplicate Next step UI behaviour. 

6. Confirm the deployed/service authentication model does not expose unsafe execution. 

### **<mark>Current QA position</mark>** 

BB84 is not independently verified for full acceptance until these runtime scenarios have been executed and evidence captured. 

# **8. Learning Modules & Assessments** 

The repository contains the learning-module structure, sequential navigation, progress handling and assessment framework. The assessment framework supports server-side grading, a 70% threshold and multiple attempts. 

- Publish the final reviewed module and segment content. 

- Validate every learner-facing segment renders correctly. 

- Validate assessment questions, answer mapping and scoring. 

- • Confirm 70% completion threshold. • Confirm multiple attempts behave correctly. 

- Confirm progress persists across sessions. 

- • Confirm XP and badge rewards trigger at the intended points. 

- Confirm the learner can return to the learning pathway after assessment completion. 

# **9. Daily Quantum Challenges** 

Backend/service foundations are present, but learner-facing UI and live end-to-end evidence are insufficient for a Pass. 

7. Retrieve the current challenge. 

8. Confirm category/difficulty is correct. 

9. Display the challenge to the learner. 

10. Submit an answer. 

11. Validate answer feedback. 

12. Validate reward/progression behaviour. 

13. Validate persistence and repeat/next-day behaviour where applicable. 

14. Capture browser evidence. 

# **10. AI Learning Bot** 

The supplied snapshot does not provide sufficient evidence to sign off the AI learning workflow. Before Pass, validate opening the assistant, submitting a learner question, receiving a suitable beginner-level response, handling errors, and ensuring the workflow does not provide unrestricted unsafe code generation. 

# **11. Evidence Requirements** 

|**Evidence field**|**Record**|
|---|---|
|Test ID|e.g. AUTH-01 / BB84-01|
|Date & time|Execution timestamp|
|Environment|Browser,URL,build/branch|
|Preconditions|Account,data,and setup|
|Steps|Actual executed steps|
|Expected result|Acceptance-criteria outcome|
|Actual result|Observed behaviour|
|Status|Pass / Fail / Blocked / Not Run|
|Evidence|Screenshot,video or relevant log|
|Defect / task reference|Issue or follow-upreference|
|Tester|Thomas Clowes|



### **<mark>Important</mark>** 

Do not mark a runtime acceptance criterion as Pass from source inspection alone. Capture evidence from the running application. 

# **12. Final QA Closure Checklist** 

- ☐ Execute all relevant authentication and onboarding cases. 

- ☐ Verify protected dynamic learning routes. 

- ☐ Execute BB84 no-Eve and Eve scenarios and capture QBER evidence. 

- ☐ Validate final learner-facing BB84 result explanation. 

- ☐ Publish and validate final learning content. 

- ☐ Execute module assessment scoring, threshold and multiple-attempt cases. 

- ☐ Validate cross-session progress. 

- ☐ Validate XP, badges and milestone behaviour. 

- ☐ Execute Daily Challenge UI and live-service cases. 

- ☐ Execute AI assistant end-to-end cases. 

- ☐ Complete levels/dashboard checks. 

- ☐ Execute relevant security and edge cases. 

- ☐ Update every test case from Not Run to an evidence-based status. 

- ☐ Log defects and retest fixes. 

- ☐ Complete Sprint 2 review and Sprint 3 handover. 

# **13. Requirements Decision** 

### **Decision** 

Keep Requirements & User Stories Rev 3.1 unchanged. Sprint 2 findings are primarily implementation, integration, runtime validation or UX issues rather than requirement-definition gaps. 

# **14. Sprint 3 Handover** 

### **QA flow** 

Rev 3.1 → Acceptance Criteria → Test Case → Browser Execution → Evidence → Pass / Fail / Blocked → Defect Closure → Final Signoff 

QA principle: Code implemented does not equal requirement validated. A requirement is complete only when its acceptance criteria are satisfied and supported by evidence. 

