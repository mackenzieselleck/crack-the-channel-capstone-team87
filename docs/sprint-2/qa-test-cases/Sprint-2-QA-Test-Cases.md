# **Crack the channel - Sprint 2 QA Test Cases:** 

|**Team**|Team 87 - IBM Cyber Security: Quantum Risks|
|---|---|
|<br>**Client**|IBM via RMIT Capstone Consultancy|
|<br>**Project**|Crack the Channel - Interactive QKD (BB84) Learning Platform|
|<br>**Prepared by**|Byreddy Srilekha - Business Analyst|
|<br>**Document Status**|<sup>Sprint 2: QA Test cases</sup>|





## **1. Purpose** 

The purpose of this QA test specification is to define the test cases required to verify that the Sprint 2 implementation meets the approved functional, learning, UX, and non-functional requirements. 

The test cases are derived from the Sprint 2: Final Requirements & User Stories Baseline Revision: 3.1. They cover authentication, the interactive BB84 learning experience, learning content and feedback, learner progress, Daily Quantum Challenges, XP/badges, and AI learning support. 

The test cases are prepared in Sprint 2 Week 1 and are to be executed as the corresponding functionality becomes available. 

## **2. Testing Scope** 

**In scope:** 

The following areas are covered: 

- User registration and authentication 

- Session persistence and protected access 

- Supabase-backed learner profile 

- Beginner learning content 

- Interactive BB84 exchange 

- Alice, Bob and Eve interactions 

- QBER/error-rate feedback 

- Contextual learning feedback 

- Learner progress 

- Learning levels 

- Daily Quantum Challenges 

- Challenge difficulty and feedback 

- XP/points 

- Badges/achievements 

- Celebratory milestone feedback 

- AI learning Bot 

- Continued learning and return journey 

- Relevant error and edge-case handling 

These areas correspond to the final requirements FR-03 through FR-24, learning requirements LR-01 through LR-14, and related user stories. 

### **Out of scope:** 

The following are not tested as Sprint 2 product requirements: 

- QKD protocols other than BB84 

- Real-world cyber attacks 

- Production-grade enterprise authentication 

- Sensitive learner information 

- Unrestricted execution of AI-generated code 

- Dependence on real IBM Quantum hardware 

These are explicitly outside the current scope. 

## **3. Environment / Assumptions** 

**Test environment:** 

**Application:** Crack the Channel web application **Frontend:** Next.js application **Authentication:** Supabase Auth **Database:** Supabase **BB84 backend:** Qiskit-based service as implemented by the development team **Browser:** Chrome, with additional browser checks where practical **Local URL:** http://localhost:3000 

The project setup guide states that each team member runs the Next.js app locally from my-app, with the shared Supabase project used for authentication/database functionality. It also specifies Turnstile configuration for signup/login. 

**Assumptions:** 

1. Required environment variables are configured correctly. 

2. Test accounts can be created using valid email addresses. 

3. The shared Supabase environment is available. 

4. Turnstile is configured for the local environment. 

5. BB84/Qiskit functionality will be available for execution testing once development integration is complete. 

6. AI, Daily Challenges, and gamification may remain unavailable until their implementation tasks are completed. 

7. A test marked Blocked means the required feature is not yet available, not that the requirement has failed. 

## **4. Test Cases** 

## **4.1 Authentication Test Cases** 

FR-12 requires basic authentication and association of learner progress with an individual account. 

|**ID**|**Test Case**|**Steps **|**Expected Result**|**Status**|
|---|---|---|---|---|
|AUTH-01|Valid signup|Open signup → enter valid|Account is successfully|Not Run|
|||details → complete|created||
|||Turnstile → submit|||



|AUTH-02|Invalid<br>signup|Submit signup with<br>invalid/incomplete details|Validation/error message is<br>displayed, and the account is<br>not created|Not Run|
|---|---|---|---|---|
|AUTH-03|Valid login|Enter valid account<br>credentials|User is authenticated and<br>enters the application|Not Run|
|AUTH-04|Invalid login|Enter an incorrect<br>password|Login fails, and an appropriate<br>error is displayed|Not Run|
|AUTH-05|Logout|Log in → select logout<br>And attempt to access a<br>protected page directly.|User is logged out, session<br>ends, and the user is<br>redirected to the<br>login/authentication page.<br>Lastly, Protected pages<br>cannot be accessed without<br>signing in again.|Not Run|
|AUTH-06|Session<br>Persistence|Log in → refresh page|User remains authenticated|Not Run|
|AUTH-07|Protected<br>Route|Log out → directly open<br>protected page|User is redirected to<br>login/authentication|Not Run|
|AUTH-08|Profile<br>Creation|Create a new account|Corresponding learner<br>profile is created/available|Not Run|
|AUTH-09|Onboarding|Create account →<br>complete onboarding|Required learner information<br>is saved and user continues to<br>application|Not Run|
|AUTH-10|Return Login|Complete<br>signup/onboarding → log<br>out → log in again|User can return to their<br>learning journey|Not Run|



### **4.2 BB84 Test Cases** 

The BB84 requirements specifically require an interactive Qiskit-based exchange, Alice/Bob participation, Eve mode, and visible QBER feedback. 

|**ID**|**Test Case**|**Steps**|**Expected Result**|**Status**|
|---|---|---|---|---|
|BB84-01|Launch BB84<br>simulation|Open simulator → start<br>exchange|BB84 simulation starts<br>successfully|Not Run|
|BB84-02|Alice interaction|Select Alice → perform<br>required sender actions|Alice's actions can be<br>completed and are<br>understandable|Not Run|
|BB84-03|Bob interaction|Select Bob → perform<br>receiver actions|Bob's actions can be<br>completed and are<br>understandable|Not Run|



|BB84-04|Complete<br>exchange|Perform required BB84<br>stages|Exchange completes and<br>produces an outcome|Not Run|
|---|---|---|---|---|
|BB84-05|Qiskit execution|Run exchange|Actual Qiskit-based processing<br>produces a result|Not Run|
|BB84-06|Exchange<br>outcome|Complete exchange →<br>view result|Result is clearly displayed with<br>appropriate explanation|Not Run|
|BB84-07|Eve mode|Enable Eve during<br>exchange|Eve scenario becomes active<br>and is understandable|Not Run|
|BB84-08|Eve effect|Run exchange with Eve<br>enabled|Learner can observe a<br>difference caused byEve|Not Run|
|BB84-09|QBER feedback|Complete exchange →<br>inspectQBER|QBER/error-rate is displayed|Not Run|
|BB84-10|QBER<br>interpretation|View QBER result|Beginner-friendly explanation<br>states why the error rate<br>matters|Not Run|
|BB84-11|No Eve<br>comparison|Run exchange without Eve|Learner can observe baseline<br>exchange behaviour|Not Run|
|BB84-12|Action/result<br>relationship|Perform a protocol action<br>→inspect feedback|Result explains what<br>happened and why|Not Run|



### **4.3 Learning Feature Test Cases** 

The learning requirements emphasise beginner-first content, progressive learning, plain language, contextual explanation, and practical interaction 

|**ID**|**Test Case**|**Steps **|**Expected Result**|**Status**|
|---|---|---|---|---|
|LEARN-<br>01|BB84<br>introduction|Open learning content|Purpose of BB84 is<br>introduced before simulation|Not Run|
|LEARN-<br>02|Beginner<br>terminology|Open introductory<br>content|Quantum/BB84 terminology<br>is explained inplain language|Not Run|
|LEARN-<br>03|Progressive<br>learning|Move through learning<br>stages|Concepts are introduced<br>progressively|Not Run|
|LEARN-<br>04|Learning<br>structure|Open the learning<br>pathway and navigate<br>through a major module.|Learning content is organised<br>into major modules, each<br>divided into manageable<br>segments, and learners can<br>navigate through segments in<br>the intended sequence.|Not Run|
|LEARN-<br>05|Visual support|Review learning content|Relevant<br>diagrams/visualisations<br>appear where expected|Not Run|
|LEARN-<br>06|Contextual<br>explanation|Perform major<br>learning/simulation<br>action|Appropriate<br>explanation/feedback is<br>presented|Not Run|
|LEARN-<br>07|Final outcome<br>explanation|Complete BB84 exchange|Final result is explained in<br>beginner-friendlyterms|Not Run|
|LEARN-<br>08|Learning/activity<br>connection|Complete learning<br>content → enter activity|Learning content connects<br>appropriately to interactive<br>activity|Not Run|



|LEARN-|Learning|Complete early activity →|Later activity builds on|Not Run|
|---|---|---|---|---|
|09|progression|access later activity|previous concepts where<br>applicable||



### **4.4 Module Assessment Test cases:** 

|**ID**|**Test Case**|**Steps**|**Expected Result**|**Status**|
|---|---|---|---|---|
|ASSESS-01|Assessment<br>availability|Complete the required<br>content/stage of a major<br>module → check for<br>assessment|Assessment becomes<br>available only after the<br>required module stage is<br>reached|Not Run|
|ASSESS-02|Module<br>assessment<br>content|Open a module<br>assessment → review<br>questions|Questions assess concepts<br>introduced within that<br>module|Not Run|
|ASSESS-03|Submit<br>assessment|Answer questions →<br>submit assessment|Assessment is submitted and<br>a result is displayed|Not Run|
|ASSESS-04|Below 70%|Submit an assessment<br>with a score below 70%|Module completion criterion<br>is not satisfied and the<br>learner can attempt the<br>assessment again|Not Run|
|ASSESS-05|Exactly 70%|Submit an assessment<br>with exactly 70% correct|The learner satisfies the<br>assessment requirement for<br>module completion|Not Run|
|ASSESS-06|Above 70%|Submit an assessment<br>with more than 70%<br>correct|The learner satisfies the<br>assessment requirement for<br>module completion|Not Run|
|ASSESS-07|Retry after<br>unsuccessful<br>attempt|Fail assessment → select<br>retry → submit another<br>attempt|Learner can attempt the<br>assessment again|Not Run|
|ASSESS-08|Successful<br>module<br>completion|Achieve at least 70% →<br>return to<br>module/progress view|Successful completion<br>contributes to learner<br>progression and associated<br>achievement where<br>applicable|Not Run|
|ASSESS-09|Multiple<br>attempts|Take the assessment<br>more than once|Multiple attempts are<br>supported|Not Run|



### **4.5 AI Assistant Test cases:** 

|**ID**|**Test Case**|**Steps**|**Expected Result**|**Status**|
|---|---|---|---|---|
|AI-01|Open AI Bot|Open AI assistant|AI Bot is accessible|Not Run|
|AI-02|Quantum question|Ask a relevant<br>quantumquestion|Relevant response is<br>returned|Not Run|
|AI-03|BB84 question|Ask a BB84-related<br>question|Response is relevant to<br>BB84|Not Run|



|AI-04|Beginner<br>explanation|Ask for a simple<br>explanation|Response uses beginner-<br>appropriate language|Not Run|
|---|---|---|---|---|
|AI-05|Hint/guidance|Ask for help with an<br>activity|AI provides guidance/hint<br>rather than simply doing<br>the task|Not Run|
|AI-06|Context relevance|Ask question about<br>current learning<br>activity|Response is relevant to<br>the current learning<br>context|Not Run|
|AI-07|AI unavailable|Simulate AI/service<br>failure|Core learning content and<br>BB84 functionality remain<br>accessible|Not Run|
|AI-08|AI transparency|Review AI interaction|AI content is not<br>presented as<br>unquestionable fact|Not Run|



### **4.6 Progress/XP/Badges Test cases** 

|**ID**|**Test Case**|**Steps**|**Expected Result**|**Status**|
|---|---|---|---|---|
|PROG-01|Record learning<br>stage/segment<br>completion|Complete a defined<br>learning stage/segment<br>and select Next|Learner progress is updated<br>and associated with the<br>learner's account.|Not Run|
|PROG-02|View progress|Complete activity → open<br>progress/dashboard|Completed and incomplete<br>activities are distinguishable|Not Run|
|PROG-03|Resume<br>progress|Complete activity → log<br>out→login again|Previous progress is retained|Not Run|
|PROG-04|Level display|Complete required<br>progression activity|Current level is displayed<br>correctly|Not Run|
|PROG-05|Level<br>progression|Complete defined<br>activities|Learner progresses when<br>criteria are met|Not Run|
|PROG-06|Module<br>completion XP|Complete the applicable<br>module assessment with<br>at least 70% and satisfy<br>module completion<br>criteria.|Defined module-completion<br>XP is awarded where<br>applicable and recorded<br>against the learner's progress.|Not Run|
|PROG-07|XP persistence|Earn XP → log out → log<br>in|XP remains associated with<br>learner|Not Run|
|PROG-08|Repeat<br>interaction|Repeat non-meaningful<br>action|System does not incorrectly<br>award unlimited XP where<br>prevention is implemented|Not Run|
|PROG-09|Module<br>achievement<br>threshold|Complete the applicable<br>module assessment. Test<br>scores below 70%, exactly<br>70%, and above 70%.|A module achievement/badge<br>is awarded only when the<br>learner achieves at least 70%<br>and satisfies the defined<br>achievement criteria.|Not Run|
|PROG-10|Badge<br>confirmation|Earn Badge|Visible confirmation is<br>provided|Not Run|
|PROG-11|Badge<br>persistence|Earn badge → log out →<br>login|Earned badge remains visible<br>in learnerprofile|Not Run|



|PROG-12|Dashboard<br>progression|Open learner dashboard|Level, completed activity,<br>challenge progress and<br>achievements are visible|Not Run|
|---|---|---|---|---|
|PROG-13|Next activity|Review dashboard after<br>progress|Appropriate next activity/goal<br>can be identified|Not Run|



### **4.7 Daily Quantum Challenge Test Cases:** 

|**ID**|**Test Case**|**Steps**|**Expected Result**|**Status**|
|---|---|---|---|---|
|CHA-01|Challenge<br>Availability|Complete a defined<br>learning stage/segment<br>and select Next|An available challenge is<br>presented|Not Run|
|CHA-02|Challenge<br>relevance|Open Challenge after<br>learning relevant<br>concept|Challenge relates to<br>previously introduced<br>content|Not Run|
|CHA-03|Complete<br>Challenge|Answer and submit<br>challenge|Challenge is recorded as<br>completed and feedback<br>is displayed|Not Run|
|CHA-04|Challenge<br>Feedback|Submit<br>correct/incorrect<br>response|Feedback explains the<br>reasoning behind the<br>result|Not Run|
|CHA-05|Challenge<br>Progression|Complete relevant<br>challenge|Completion contributes<br>to progression where<br>applicable|Not Run|
|CHA-06|Challenge<br>difficulty|Progress through<br>challenge levels|Challenge difficulty<br>increases in accordance<br>with learnerprogression|Not Run|



### **4.8 Technical QA Check:** 

Assessment answer keys will be stored separately from learner-facing assessment content to reduce the risk of exposing correct answers 

|**ID**|**Test case**|**Expected Result**|**Status**|
|---|---|---|---|
|SEC-01|Assessment answer-<br>key exposure|Inspect learner-facing<br>assessment data/API<br>response|Correct answers/answer-key data<br>are not exposed to the learner-<br>facingapplication|



### **4.9 Edge Cases** 

|**ID**|**Test Case**|**Expected Result**|**Status**|
|---|---|---|---|
|EDGE-01|User submits empty signup|Validation prevents submission|Not Run|
||fields|and explains required input||



|EDGE-02|User enters invalid login<br>credentials|Authentication fails safely with<br>clear feedback|Not Run|
|---|---|---|---|
|EDGE-03|User accesses protected page<br>while logged out|User is redirected to<br>authentication|Not Run|
|EDGE-04|User refreshes during<br>authenticated session|Session remains valid where<br>expected|Not Run|
|EDGE-05|Qiskit service unavailable|User receives clear<br>error/feedback rather than<br>brokenpage|Not Run|
|EDGE-06|AI service unavailable|User can still access core<br>learningand BB84|Not Run|
|EDGE-07|Learner repeats same non-<br>learning action|System does not incorrectly<br>award repeated rewards where<br>prevention is implemented|Not Run|
|EDGE-08|Incomplete BB84 interaction|User receives appropriate<br>guidance and cannot proceed<br>incorrectlywhere required|Not Run|
|EDGE-09|Unexpected/invalid input in<br>learningactivity|Application handles input<br>without crashing|Not Run|
|EDGE-10|Learner returns after previous<br>session|Saved progress remains available|<sup>Not Run</sup>|
|EDGE-11|Learner reaches milestone|Celebration does not block<br>further learning|Not Run|
|EDGE-12|Challenge accessed before<br>relevant progression|Challenge availability/behaviour<br>follows the agreed progression<br>rules|Not Run|
|EDGE-13|Assessment attempted before<br>required module stage|Assessment is not available<br>before the required stage|Not Run|
|EDGE-14|Assessment score below 70%|Module completion requirement<br>is not satisfied and learner can<br>retry|Not Run|
|EDGE-15|Assessment score exactly 70%|Module completion requirement<br>is satisfied|Not Run|
|EDGE-16|Learner retries assessment|Previous failure does not<br>prevent another permitted<br>attempt|Not Run|
|EDGE-17|Learner returns after module<br>completion|Module completion/progress<br>remains recorded across<br>sessions|Not Run|
|EDGE-18|Unpublished module|Module/content marked<br>unpublished is not exposed to<br>learners|Not Run|



### **4.10 Traceability to Requirements** 

|**Test Group**|**Test IDs**|**Requirements**|
|---|---|---|
|Authentication|AUTH-01–AUTH-10|FR-12, FR-13, LR-13, US-17–US-19|
|BB84 core|BB84-01–BB84-06|FR-04–FR-07, NFR-03, US-06–US-09|
|Eve/QBER|BB84-07–BB84-12|FR-08–FR-10, US-10–US-16|
|Learning|LEARN-01–LEARN-09|FR-03, FR-10, FR-14, LR-01–LR-08, US-<br>03–US-05,US-14–US-16|
|Progress|PROG-01–PROG-05|FR-13, FR-15, FR-22, LR-13, US-18–US-<br>19,US-29|
|XP/badges|PROG-06–PROG-13|FR-19–FR-23, LR-12, LR-14, US-27–US-<br>31|
|AI|AI-01–AI-08|FR-16, NFR-08–NFR-10, LR-11, US-20–<br>US-22|
|Edge cases|EDGE-01–EDGE-12|FR-10, FR-12–FR-23, UX-06, NFR-02,<br>NFR-08,NFR-11|
|Daily Challenges|CHAL-01–CHAL-06|FR-17, FR-18, LR-09, LR-10, US-23–US-<br>26|
|Module Assessment|ASSESS-01–ASSESS-09|FR-24, BR-15, BR-16, US-32|
|Module progression|PROG-01, PROG-06, PROG-<br>09|FR-13, FR-19, FR-20, LR-13, US-18, US-<br>28|
|Publication/assessment<br>security|EDGE-18, SEC-01|TD-01, TD-02, NFR-05/NFR-11 where<br>applicable|



