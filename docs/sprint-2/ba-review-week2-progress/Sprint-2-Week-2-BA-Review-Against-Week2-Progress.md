# **Sprint 2 Week 2 BA Review Authentication & Onboarding Frontend** 

### **Crack the Channel — Team 87** 

Review of UX auth/onboarding frontend handover 

|**Review owner**|Srilekha Byreddy— BA<br>l|
|---|---|
|**Review scope**|US-01 landing page, authentication frontend, onboarding flow,<br>frontend route migration,andprotected access evidence|
|**Baseline**|Sprint 2 Final Requirements & User Stories Rev 3.1|
|**Review basis**|Current repository snapshot supplied for review + UX(Jerome<br>Altamia)handover note|
|**Overall outcome**|No changes to existing user stories/acceptance criteria<br>recommended from this review; runtime verification remains<br>required|



## **1. Handover Reviewed stories/acceptance** 

UX handover states that he implemented the US-01 landing page, translated authentication screens into working frontend pages while keeping the existing Supabase logic unchanged, completed frontend route migration, and pushed the auth/onboarding frontend branch for review. This review checks that work against the current Sprint 2 requirements and user stories rather than treating the handover statement itself as proof of satisfaction. 

## **2. Requirement and User Story Review** 

|**Requirement / Story**|**Evidence reviewed**|**Review status**|**Finding**|**Action**|
|---|---|---|---|---|
|FR-01 / US-01<br>Platform access|my-app/app/page.tsx:<br>browser landing page,<br>project name, purpose<br>text, Start Learning, Log<br>in and Sign uplinks.|Evidenced|The entry point and<br>starting actions are<br>clearly represented in the<br>implementation.|Runtime-check links and<br>navigation.|
|US-02<br>Understand the learning<br>goal|Landing page hero and<br>Learn / Simulate / Apply<br>sections explain what the<br>learner will do.|Evidenced; UX review<br>pending|The page communicates<br>the intended learning<br>purpose before sign-in.|Confirm clarity with the<br>UX/usability pass.|
|FR-12 / US-17<br>Account access|login/page.tsx and<br>signup/page.tsx provide<br>login/sign-up screens;<br>server actions call the<br>existing Supabase Auth<br>flow.|Evidenced; runtime<br>pending|Frontend access points<br>are implemented and<br>connected to existing<br>auth logic.|Run end-to-end sign-up,<br>confirmation, login and<br>error-path tests.|
|FR-13 / US-18 / US-19<br>Progress access|Auth/onboarding flow<br>preserves authenticated<br>user context; learning<br>persistence is<br>implemented elsewhere<br>in the learning-module<br>system.|Dependency / not fully<br>verified here|This handover enables<br>access to the learning<br>journey but does not by<br>itself prove saved<br>progress/resume<br>behaviour.|Validate together with the<br>learning-module<br>implementation.|
|UX-01<br>Beginner-friendly<br>navigation|Landing, login and sign-<br>up use clear CTA wording<br>and consistent primary<br>navigation.|Evidenced; usability<br>pending|Flow is understandable<br>from the code structure,<br>but first-time-user<br>behaviour still needs live<br>validation.|Include in usability<br>review.|
|NFR-07<br>Authentication security|Supabase Auth remains<br>the approved<br>authentication service;<br>frontend does not<br>implement password<br>storage.|Evidenced|The implementation<br>follows the approved<br>authentication approach.|Complete normal<br>security/auth regression<br>testing.|



|NFR-05<br>Maintainability/handover|Handover comment<br>includes scope, branch<br>target, and review<br>request.|Evidenced|The handover gives the<br>next role a clear review<br>target.|Record final review result<br>in the task handover.|
|---|---|---|---|---|



## **3. Specific Review Findings** 

**No user story / acceptance-criteria change required from this handover.** The reviewed implementation aligns with the existing FR-01 / US-01 and authentication-related stories. The review identifies verification and refinement work, not a need to rewrite the agreed behaviour. 

**Runtime testing is still required before marking implementation as fully satisfied.** Code inspection provides evidence of the intended flow, but this review is not treating static code alone as proof that sign-up, email confirmation, login, onboarding, protected routes, and return navigation all work end-to-end. 

**Onboarding presentation remains a UX refinement item.** The current onboarding page is structurally functional but visually much simpler than the landing/authentication screens. This does not require a user story or AC change. 

**The “Forgot password?” control is currently a placeholder.** Password reset is not specified in the current Sprint 2 requirements reviewed here, so it is not treated as a requirement failure. It can remain a future enhancement unless scope changes. 

**Learning-module progress should be reviewed as a separate dependency.** The learning-module system contains the progress and assessment logic, but this cannot be claimed as satisfied solely from the auth/onboarding handover. 

## **4. BA Conclusion on User Stories / Acceptance Criteria** 

**Current conclusion:** No change to the existing user stories or acceptance criteria is recommended at this stage based on the authentication/onboarding frontend review. 

**Reason:** The implementation provides evidence for the agreed access, account and onboarding flow. The remaining items are validation, integration and UX-polish activities rather than newly discovered behaviour that requires the stories or acceptance criteria to be rewritten. 

## **5. Recommended Review / Testing Actions** 

- Open the landing page and verify Start Learning, Log in and Sign up navigation. 

- Create a test account and verify the email-confirmation flow. 

- Log in with valid and invalid credentials and verify error handling. 

- Complete onboarding and confirm the expected application route is reached. 

- Log out and directly access a protected route; confirm redirection to authentication. 

- Log back in and confirm the learner can return to the learning journey. 

- Validate saved progress/resume behaviour with the learning-module implementation. 

- Record usability findings from the beginner-user review without changing requirements unless a genuine requirement gap is identified. 

## **6. Review Status for Handover** 

**BA review status:** Reviewed — no current US/AC changes required. Pending runtime/integration verification. 

## **7. Source / Evidence Locations** 

- docs/sprint-2/refined-user-stories/Crack_the_Channel_Requirements_User_Stories_Sprint2_Rev3.1.md 

- my-app/app/page.tsx 

- my-app/app/(auth)/login/page.tsx 

- my-app/app/(auth)/signup/page.tsx 

- my-app/app/(auth)/login/actions.ts 

- my-app/app/(auth)/signup/actions.ts 

- my-app/app/onboarding/page.tsx 

- my-app/app/onboarding/actions.ts 

- my-app/lib/auth/require-user.ts 

- my-app/app/spike/layout.tsx 

- my-app/app/(protected)/layout.tsx 

- docs/sprint-2/learning-module-documentation.md 

- Jerome Altamia — authentication/onboarding frontend handover comment 

# **Sprint 2 Week 2 BA Review Qiskit/BB84 Implementation – Dev1, Learning Module, Authentication & Frontend – Dev2** 

**Crack the Channel — Team 87** 

_Dev 1 + Dev 2 work reviewed against Sprint 2 Final Requirements & User Stories Rev 3.1_ 

## **1. Review basis and method** 

This review compares Sprint 2, Week 2 progress with the approved Sprint 2 Final Requirements & User Stories baseline, Revision 3.1. The review focuses on implementation evidence for the work attributed to Dev 1 (Qiskit service / BB84 integration) and Dev 2 (learning-module and authentication/frontend work). 

Status labels: Implemented = implementation evidence is present in the repository; Partially implemented = some 

acceptance criteria/elements are present, but integration or required behaviour remains incomplete; Not implemented = implementation still in progress. Not evidenced = implementation still in progress; therefore, not enough evidence to provide. 

## **2. Executive BA findings** 

|**Area**|**BA finding**|
|---|---|
|Core BB84/Qiskit integration|Substantial implementation is present. The service constructs<br>executable Qiskit circuits, supports learner-controlled<br>Alice/Bob/Eve parameters, returns trace/QBER data, and is called<br>through the Next.js API route.|
|Learning-module foundation|The database-backed module framework is implemented:<br>modules, pages, questions, answer keys, progress and server-side<br>grading are present. Real learner content has not yet replaced the<br>publishedplaceholder module.|
|Authentication/frontend|Login, signup, onboarding, logout, and protected route logic are<br>present. There are still two issues to resolve before calling the<br>journey fully aligned: the signup confirmation redirect is written as<br>a literal template string, and the dynamic `/learn/[slug]` route is<br>outside theprotected layout.|



|**Area**|**BA finding**|
|---|---|
|Progress/assessment<br>i|Persistent page progress, resume behaviour, 70% pass mark, and<br>multiple quiz attempts are implemented at the database/function<br>level. The current dashboard/level/gamification layers are still<br>placeholders as work inprogress.|
|AI / Daily Challenges / Gamification|The team repository contains architecture decisions for these<br>features, but the corresponding product implementation is not yet<br>present as the work is in progress. These are therefore<br>implementation gaps, not reasons to rewrite the approved user<br>stories.|
|Requirements change recommendation|No user-story or acceptance-criteria rewrite is required based on<br>these findings. The existing requirements remain suitable. The next<br>action is to update implementation status, close the concrete<br>gaps, and refine AC only where the team needs implementation<br>clarification (for example, the exact visible QBER comparison<br>behaviour and the final learningentryroute).|



## **3. Dev 1 — Qiskit / BB84 implementation review** 

|**Requirement**|**Status**|**Repository evidence /**<br>**finding**|**Action**|
|---|---|---|---|
|FR-04 Interactive BB84<br>Simulation|Implemented / runtime pending|**i**<br>FastAPI `POST /bb84/run`<br>builds and executes Qiskit/Aer<br>circuits. Next.js<br>`/api/simulator` proxies the<br>request server-side.|Run end-to-end browser test<br>and record Pass/Fail in QA.|
|FR-05 Alice Learning<br>Experience|Implemented / runtime pending|Frontend lets learner select<br>Alice and submit bit+basis<br>arrays; service validates and<br>uses learner inputs.|Validate role explanation and<br>full flow in browser.|
|FR-06 Bob Learning Experience|Implemented / runtime pending|Frontend lets learner select Bob<br>and basis arrays; service uses<br>learner bases while other role<br>data isgenerated.|Validate measurement flow and<br>outcome in browser.|
|FR-07 Key Exchange Outcome|Partially implemented|Trace shows kept/discarded<br>positions and measured<br>results. Final UI mainly exposes<br>sifted-key length and QBER<br>rather than a richer plain-<br>language final outcome.|Add/confirm explicit beginner-<br>friendly final outcome<br>explanation and verify it in QA.|
|FR-08 Eve Mode|Implemented / runtime pending|Learner can choose Eve; Eve<br>becomes active and the service<br>performs intercept-resend<br>behaviour using learner-<br>selected bases.|Run with Eve on and confirm<br>effect is observable.|
|FR-09 QBER Feedback|Partially implemented|API returns QBER; UI only<br>displays the error-rate panel<br>when Eve is active. A no-Eve<br>baseline QBER is not visibly<br>shown for comparison.|Display QBER consistently and<br>make no-Eve vs Eve<br>comparison explicit.|
|FR-10 Contextual Feedback|Partially implemented|Mascot narration provides step-<br>based explanations. Some<br>wording is simplified and final<br>explanatorycontext is limited.|Review wording with BA/UX<br>against beginner criteria and<br>test after each major stage.|
|FR-11 Simulation Results|Partially implemented|Trace and summary values are<br>visible, but the current result<br>view is minimal.|Confirm final result,<br>relationship to learner action,<br>and explanation are sufficient.|
|NFR-03 Qiskit Authenticity|Implemented in code/runtime<br>pending|`bb84.py` uses Qiskit<br>`QuantumCircuit` and<br>`AerSimulator`; compile check<br>passed.|f<br>Execute service end-to-end and<br>retain evidence.|
|NFR-09 AI Safety|Implemented in service design|Service receives validated<br>parameters, not arbitrary<br>learner/AI code, and builds<br>circuits itself.|Keep this constraint when<br>challenge/tutor endpoints are<br>added.|
|NFR-10 ControlledQiskit|Partiallyimplemented|Frontend calls Next.js API,but|Confirm deployment topology;|



|**Requirement**|**Status**|**Repository evidence /**<br>**finding**|**Action**|
|---|---|---|---|
|Execution||the service itself has no `x-api-<br>key` enforcement in the<br>snapshot and CORS is open.<br>This differs from the pending<br>ADR-009 direction.|add service-to-service<br>authentication before public<br>Vercel/Render deployment if<br>required by the approved<br>architecture.|
|NFR-02 Reliability/performance|Not evidenced – still in progress|No `qiskit-service/tests`<br>directory is present; README<br>states automated tests are still<br>inprogress.|Create/run unit/API tests and<br>capture results.|



## **4. Dev 2 — Learning module, authentication and frontend review** 

|**Requirement**|**Status**|**Repository evidence /**<br>**finding**|**Action**|
|---|---|---|---|
|FR-01 Platform Access|Implemented|**i**<br>Landing page identifies Crack<br>the Channel and provides Log in<br>/ Sign up / Start Learning entry<br>points.|Keep; verify navigation in<br>browser.|
|FR-02 Team Page|Not evidenced in Dev 2 work –<br>in progress|Team-page implementation is<br>not present in this reviewed<br>workyet|Track separately; do not change<br>story yet.|
|FR-03 BB84 Learning<br>Introduction|Partially implemented|Learning-module framework<br>exists, but the database seed<br>still contains a published<br>placeholder module. Real BB84<br>content is not inserted in this<br>snapshot.|Replace placeholder with<br>reviewed learner content.|
|FR-12 User Authentication|Partially implemented|Supabase login/signup, email<br>confirmation, onboarding,<br>logout, and protected layouts<br>are present. The signup<br>`emailRedirectTo` value is a<br>literal quoted template string,<br>and the dynamic module route<br>is not inside the protected route<br>group.|Fix redirect string; protect<br>`/learn/[slug]`; retest complete<br>auth journey.|
|FR-13 Learner Progress|Implemented at data/logic level|`module_progress`,<br>`increment_progress`, resume<br>logic and progress bar are<br>implemented.|Validate with real content and<br>cross-session browser testing.|
|FR-14 Structured Learning<br>Content|Partially implemented|`modules` + `module_pages`<br>+ sequential navigation are<br>implemented. Only placeholder<br>content is currentlyseeded.|Insert approved real<br>modules/pages.|
|FR-15 Learning Levels|Not implemented – in progress|No level progression logic or<br>learner-facing level model was<br>found in the reviewed<br>implementation.|Implement later; no US/AC<br>change required now.|
|FR-16 AI Learning Bot|Not implemented - in progress|`/api/agent` remains a<br>placeholder. Architecture ADRs<br>exist, but product functionality<br>is absent.|Implement according to<br>approved AI architecture.|
|FR-17 Daily Challenges|Not implemented - in progress|No Daily Challenge product<br>implementation/content store<br>is present in the current app<br>snapshot. ADR work exists only.|Implement workflow and<br>storage/API before marking<br>requirement satisfied.|
|FR-18 Progressive Challenge<br>Difficulty|Not implemented - in progress|No challenge progression<br>implementation found in the<br>app.|Implement with approved<br>challenge tiers.|
|FR-19 XP|Not implemented - in progress|`profiles.xp` exists, but no<br>award workflow is implemented<br>in this snapshot.|Implement server-side award<br>logic.|
|FR-20 Badges/Achievements|Partially implemented<br>foundation only|Badge and user_badges tables<br>exist,but badge award logic is|Implement<br>criteria/award/persistence and|



|**Requirement**|**Status**|**Repository evidence /**<br>**finding**|**Action**|
|---|---|---|---|
|||still listed as not built.|confirmation.|
|FR-21 Celebratory Feedback|Not implemented as milestone<br>feature|Mascot feedback exists, but<br>milestone celebration logic is<br>not implemented as an<br>achievement flow.|Implement once<br>progression/achievement rules<br>are integrated.|
|FR-22 Learner Progress<br>Dashboard|Not implemented - in progress|Dashboard is a placeholder<br>welcome page; it does not<br>show level, completed activity,<br>challenge progress,<br>achievements,or next activity.|Build dashboard against<br>existing progress data.|
|FR-23 Continued Learning /<br>Return|Partially implemented|Persistent module progress<br>provides a return journey<br>foundation, but levels,<br>challenges and achievements<br>are absent.|Complete the return-<br>engagement features; no story<br>rewrite required.<br>i|
|FR-24 Module Assessment|Implemented at framework<br>level/content pending|Server-side grading, result<br>display, 70% pass mark and<br>retry are implemented. Real<br>assessment questions are not<br>yet inserted.|Insert final questions and run<br>QA threshold/retry tests.|
|NFR-05 Maintainability /<br>Handover|Implemented|Learning-module<br>documentation and database<br>structure are documented.|Keep documentation updated<br>as implementation changes.|
|NFR-07 Authentication Security|Implemented in design/runtime<br>pending|Supabase is used for<br>authentication and password<br>handling.|Complete end-to-end auth test<br>evidence.|
|NFR-11 Data Persistence|Partially implemented|Module progress and quiz<br>attempts persist;<br>achievements/challenge<br>progress are not yet<br>implemented.|Retest after<br>gamification/challenge<br>implementation.|
|NFR-12 Learning Content<br>Maintainability|Implemented in architecture|Content is data-driven through<br>module/page/question tables,<br>so content can be updated<br>without rewriting the BB84<br>simulator.|Use this model for final content<br>insertion.|



## **5. Learning experience / UX checks affected by the implementation** 

|**Requirement**|**Finding**|**Action**|
|---|---|---|
|LR-01 / LR-02 Beginner-first + plain<br>language|Framework supports learner content, but<br>placeholder content means final beginner<br>qualitycannotyet be verified.|Review actual inserted content against the<br>IBM-informed content draft and QA cases.<br>i    i|
|LR-03 / LR-07 Progressive pathway|Sequential module pages and no-skip<br>progress are implemented. Cross-module<br>unlockingis not implemented.|Use the defined module sequence for final<br>content; implement module-level<br>progression if required.|
|LR-05 / LR-08 Interaction + practical Qiskit|Strong implementation evidence through<br>the BB84 walkthrough andQiskit service.|Validate actual behaviour and explanations<br>with users.|
|LR-06 / UX-05 Feedback|Mascot narration and result highlighting<br>exist, but QBER baseline/result<br>interpretation needs a more explicit end-to-<br>end check.|Run QA BB84-09/10/12 and usability<br>review.|
|UX-01 / UX-03 Navigation + clarity|Auth and simulator navigation exist;<br>dynamic learning route protection/entry<br>flow still needs alignment.|Protect dynamic learning route and make<br>`/learn` the correct module entry point.|
|UX-08 Visible progress|Per-module progress bar exists, but<br>dashboard-level progress/level/next<br>activityis not implemented.|Complete dashboard before marking FR-22<br>satisfied.|



## **6. Concrete implementation findings to record in the sprint review** 

1. Qiskit integration is materially implemented, and the browser can pass validated learner role/basis/bit parameters to the service through the Next.js API. 

2. Eve and QBER logic is present, but the learner-facing QBER comparison should show a clear baseline and Eve-enabled result so the security lesson is directly observable. 

3. The learning-module database/functions are ready for real content. The current published `test-module` placeholder should be replaced with the reviewed learning modules and assessments once the content is finalized by team. 

4. Authentication is substantially implemented, including logout and route protection for protected layouts. Fix the signup redirect template string and explicitly protect the dynamic learning route. 

5. The current `/learn` page is still a hard-coded quick-check page while the new `/learn/[slug]` module framework exists. These need to be integrated into one learner journey before final validation. 

6. AI, Daily Challenges, levels, XP, achievement awards, and the progress dashboard remain implementation work rather than requirements-definition problems. 

7. Qiskit service automated tests are not present in the repository as work is still in progress. Python compilation passed, but this does not replace functional/API testing. 

## **7. BA decision on requirements/user stories** 

**Current decision:** No user-story or acceptance-criteria rewrite is required solely from this implementation review. 

The Rev 3.1 requirements already describe the required learner behaviour at an appropriate level. The main work is to close implementation gaps, verify runtime behaviour, and keep the task/QA status aligned with what is actually implemented. 

Small implementation clarifications can be recorded in task comments or technical notes rather than creating a new requirements revision. Examples include: the exact QBER display/comparison behaviour, the final `/learn` entry route, and the service-to-service authentication mechanism required by the approved deployment architecture. 

## **8. Recommended QA follow-up** 

|**Priority**|**Test/check**|**Reason**|
|---|---|---|
|High|BB84-01 to BB84-12|Validate actual Qiskit execution,<br>Alice/Bob/Eve behaviour, QBER, trace, and<br>final interpretation.|
|High|AUTH-01 to AUTH-10|Verify signup confirmation, login,<br>onboarding, logout, session persistence,<br>andprotected access.|
|High|LEARN-01 to LEARN-09|Execute against the real module content<br>afterplaceholder replacement.|
|High|ASSESS-01 to ASSESS-09|Verify assessment gating, 70% threshold,<br>and multiple attempts.|
|Medium|PROG-01 to PROG-05|Verify persistent progress and resume<br>behaviour with real content.|
|Later|AI / Challenge / XP / Badge tests|Run as those features become available;<br>use the existing QA baseline and record<br>Blocked until then.|



## **9. Source documents reviewed** 

- Sprint 2 Final Requirements & User Stories Baseline, Revision 3.1. 

- `docs/sprint-2/learning-module-documentation.md` from the supplied repository snapshot. 

- Qiskit BB84 Sprint 2 handover and technical architecture documentation in `docs/sprint-1/bb84-poc/`. 

- Daily Challenge / AI architecture ADRs in `docs/sprint-1/architecture/`. 

- Supplied repository snapshot for Dev 1 + Dev 2 implementation review. 

