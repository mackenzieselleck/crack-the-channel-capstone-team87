

<!-- Start of picture text -->
® RMIT | GNA<br><!-- End of picture text -->

Programming Project 1 **INNOVATION WITH IMPACT & PURPOSE** **_By students for students_** 



<!-- Start of picture text -->
ce 4 ® «4<br>Si eel<br><!-- End of picture text -->



<!-- Start of picture text -->
a<br><!-- End of picture text -->







**C O S C 2 4 0 8 — P R O G R A M M I N G P R O J E C T 1** 

# **FINAL PRESENTATION** 

Making Quantum Security Interactive IBM Cyber Security — Quantum Risks **Team 87** 

**Project:** Crack the channel – Interactive QKD Learning Platform 

1 

### **87 Our Team T E A M 8 7 · F I V E R O L E S** 







2 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **1 Project Overview P R O B L E M & S O L U T I O N** 

**Client:** IBM, preparing students for its January Quantum Boot Camp. 

**Users:** First-year RMIT cyber security students with no quantum background. 

**Problem:** Theory alone doesn't show how BB84 works or why an eavesdropper gets caught. 

**Solution:** Learn BB84 by playing Alice, Bob and Eve on real Qiskit circuits. 

**1.4 / 5** first-years' rated understanding of quantum computing 

**73%** 

of first-years didn't recognise BB84, qubit or QKD 

_Team survey of 25 RMIT students, Aug 2026_ 



<!-- Start of picture text -->
®RMIT<br>UNVERSYY<br><!-- End of picture text -->



<!-- Start of picture text -->
===<br>=== 7=<br><!-- End of picture text -->

3 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **2 Solution & Architecture P R O B L E M & S O L U T I O N** 

**Why these choices** 

- **Next.js + Supabase:** one TypeScript app with managed auth and database. 

- **Qiskit in Docker:** Python-only and heavy, so it runs isolated and sandboxed. 

- **Code computes every answer:** the open-source LLM only writes the wording. 

- **Answers stay on the server:** graded server-side, never sent to the browser. 







4 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **2b Solution & Architecture** 

**P R O B L E M & S O L U T I O N** 

**Every major decision was weighed and recorded in an ADR** 

- **ADR-001** Tech stack 

- **ADR-002** Database 

- **ADR-003** Authentication 

- **ADR-004** Qiskit service 

- **ADR-005** AI agent 

- **ADR-006** LLM choice 

- **ADR-007** Challenge generation 

- **ADR-008** Daily Challenge 

- **ADR-009** Microservice routing 

- **ADR-010** Challenge categories 

- **ADR-011** Answer confidentiality 

- **ADR-012** Challenge feedback 

- **ADR-013** Problem construction 

- **ADR-014** Challenge gamification 

**14** 

architecture decision records 

_docs/sprint-1/architecture_ 





5 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **3 Live Demo D E M O & A C H I E V E M E N T** 

**Driver:** Thomas Clowes **Narrator:** MacKenzie Selleck 

**3:00 M I N U T E S** 

**1** 

**2** 

**3** 

**Set the scene (15 sec)** Introduce our beginner learner and what they want from our site. **Drive the core journey** Demonstrate one complete learning journey our user could take **Explain the result (15 sec)** 

Show the outcome and explain the knowledge gained on quantum security. 





6 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **4a Outcomes vs Original Brief** 

**D E M O & A C H I E V E M E N T** 

**Success criterion** 

**Status** 

**_Done_ BB84 Simulator** _18/22 QA cases_ Alice, Bob and Eve on _passed, 0 failed;_ Qiskit, with live QBER. _53/53 service tests_ 

**Learning Platform** **_Done_** Sign-up, onboarding, _102/102 auth tests;_ modules, profiles and _55 database tests_ progress. 

###### **Evidence** 



<!-- Start of picture text -->
Oa<br>—a<br><!-- End of picture text -->



<!-- Start of picture text -->
®RMIT<br>UNVERSYY<br><!-- End of picture text -->



<!-- Start of picture text -->
===<br>=== 7=<br><!-- End of picture text -->

7 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **4b Outcomes vs Original Brief** 

**D E M O & A C H I E V E M E N T** 

###### **Success criterion** 

**Daily Challenges & Gamification** Daily challenges, XP, badges and streaks. 

**Learning & Assessment** Beginner modules, quizzes and feedback. 

**Status** 

###### **_Done_** 

- _8 badges live; 24/24 badge rule checks_ 

###### **_Done_** 

_5 modules live; 15/18 QA cases passed, 0 failed_ 

###### **Evidence** 







8 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

**5 Impact & Value** L E A R N · E X P E R I M E N T · U N D E R S T A N D 

**Accessible quantum education** 

Beginners grasp quantum security through guided, hands-on learning. 

**Learning by doing** 

Run BB84, let Eve intercept, and read the QBER for yourself. 

**Motivation & Engagement** 

Daily Challenges, XP, badges and streaks keep learners practising. 



<!-- Start of picture text -->
®RMIT<br>UNVERSYY<br><!-- End of picture text -->



<!-- Start of picture text -->
===<br>=== 7=<br><!-- End of picture text -->

9 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **5b Impact & Value** 

L E A R N · E X P E R I M E N T · U N D E R S T A N D 

#### **Cyber Security Relevance** 

- A foundation in quantum key distribution and how eavesdropping is detected. 

##### **For learners** 

Learn quantum security by doing it, not just reading about it. 

##### **For IBM** 

Boot Camp students arrive with basic quantum literacy, on a platform IBM can run and extend. 



<!-- Start of picture text -->
®RMIT<br>UNVERSYY<br><!-- End of picture text -->



<!-- Start of picture text -->
===<br>=== 7=<br><!-- End of picture text -->

10 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **6 Limitations, Risks & Next Steps** 

**I M P A C T & C A N D O U R** 

##### **Known limitations & risks** 

##### **Recommended next steps** 

- Error correction runs one pass; two errors in a block can slip through. 

- QBER varies between runs because bases are random. 

   - **Transfer:** hosting, accounts and keys to IBM. 

   - **Pilot:** test with first-year students before January. 

   - **Fix:** LLM answer leaks and open QA defects. 

- The simulator depends on the Qiskit service being up. 

   - **Expand:** more topics, challenges and badges. 

   - **Full detail:** see our Handover Document. 

- LLM answer-leak checks and real-student testing still to do. 





11 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **7 Team, Process & Hours** 

###### **T R A N S P A R E N C Y & D I R E C T I O N** 

|**Team member**|**Presenting**|**Key contribution**|**Hours**|**Total Hours**|
|---|---|---|---|---|
|**Thomas Clowes**<br>Project Manager|_1_|Planning, Planner and CRM, risk log, client updates, database<br>tests, handover|_34 h_|_50 h_|
|**MacKenzie Selleck**<br>Developer 1|_2, 2b, 3_|Architecture and 14 ADRs, Supabase, Daily Challenges and LLM,<br>badges, deployment, CI/CD|_47 h_|_63 h_|
|**Sarah Salman**<br>Developer 2|_6_|BB84 proof of concept, Qiskit service, key post-processing,<br>simulator, profile page|_34.5 h_|_50.5 h_|
|**Jerome Altamia**<br>UX / Research|_5_|Learner research, wireframes, front end and theme, QA reports<br>and fixes|_35 h_|_51 h_|
|**Srilekha Byreddy**<br>Business / QA|_4, 4b_|Requirements and user stories, learning content, QA test cases,<br>simulator QA, badge designs|_34.5 h_|_50.5 h_|







12 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **R Personal Reflections – Sarah P E R S O N A L R E F L E C T I O N · O N E M I N U T E** 

##### **What I learned** 

- **Quantum computing:** building the BB84 simulator took a lot of research. 

- **Full-stack development:** my first project applying everything from my assignments. 

- **Teamwork and collaboration.** 



<!-- Start of picture text -->
Quantum fea Quantum Computing in Practice<br>Computing in sued<br>Practice by IM<br>Leupebanered ‘This badge earner can describe the key components of Qiskit, and recognizewhere to apply<br><!-- End of picture text -->



<!-- Start of picture text -->
UNIVERSITY<br><!-- End of picture text -->



<!-- Start of picture text -->
== =F =<br><!-- End of picture text -->

13 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **R Personal Reflections – Thomas** 

**P E R S O N A L R E F L E C T I O N · O N E M I N U T E** 

##### **What I learned** 

- **Chasing dependencies:** our hosting server stayed "pending" from Sprint 1 until we moved to Vercel and Render. 

- **Controlling scope:** Sprint 2 grew too big, so badges and testing slipped and the AI tutor was descoped late. 

## **3 sprints** 

   - 9 weeks · 5 roles · 50 PRs merged 

   - _An unresolved dependency is a risk, not a to-do._ 

- **Keeping the plan honest:** in Sprint 3 I gave every risk an owner and a date, and checked Planner against GitHub weekly. 



<!-- Start of picture text -->
®RMIT<br>UNVERSYY<br><!-- End of picture text -->



<!-- Start of picture text -->
===<br>=== 7=<br><!-- End of picture text -->

14 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **R Personal Reflections – Srilekha P E R S O N A L R E F L E C T I O N · O N E M I N U T E** 

**What I learned:** 

### **Done ≠ Proven** 

- Defining a requirement and proving it works are two different things. 

- Requirement → Test case → Evidence 

- Meeting deadlines 

- Managing my schedule 

- Prioritising work 











15 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **R Personal Reflections – Jerome P E R S O N A L R E F L E C T I O N · O N E M I N U T E** 

##### **What I learned** 

- Turned learner research into clearer instructions and feedback. 

- How unit, database and browser tests verify different behaviours. 

- To treat errors, saved progress and returning users as part of UX. 



<!-- Start of picture text -->
+><br>s<br>Y RAL<br><!-- End of picture text -->



<!-- Start of picture text -->
oei3 aeABwry —<<br>y<br><!-- End of picture text -->



<!-- Start of picture text -->
®RMIT<br>UNIVERSITY<br><!-- End of picture text -->



<!-- Start of picture text -->
===<br>=== F=.<br><!-- End of picture text -->

16 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

### **R Personal Reflections – MacKenzie P E R S O N A L R E F L E C T I O N · O N E M I N U T E** 

##### **What I learned** 

- How to safely prompt and integrate an open AI model 

- Learned how to navigate a team dynamic 



<!-- Start of picture text -->
Today's challenges<br><!-- End of picture text -->

- How to effectively push through  or work around blockers to ensure work still gets done 



<!-- Start of picture text -->
SA<br>———s<br><!-- End of picture text -->



<!-- Start of picture text -->
UNIVERSITY<br><!-- End of picture text -->



<!-- Start of picture text -->
= S272<br><!-- End of picture text -->

17 

COSC2408 — Programming Project 1  |  Team 87 · Crack the Channel  |  Final Presentation 

