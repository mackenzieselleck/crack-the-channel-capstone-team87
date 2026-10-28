# **Badge System & Designs:** 

|**Project**|Crack the Channel — Interactive QKD (BB84) Learning Platform|
|---|---|
|**Team**|Team 87 — IBM Cyber Security: Quantum Risk|
|**Content Owner**|Byreddy Srilekha — BA + Dev|



## **1. Quantum Beginner** 

## **Core badge:** 

**Earn it when:** The learner passes Module 1, Quantum Basics, with at least 70%. 

**Why it matters:** They have demonstrated an understanding of bits, qubits, superposition and measurement. 



<!-- Start of picture text -->
| ![Quantum Beginner Badge](my-app/public/images/quantum-starter.png)
<!-- End of picture text -->

## **2. Basis Explorer** 

**Earn it when:** The learner passes Module 2 on bases, gates and circuits with at least 70%. 

**Why it matters:** They understand the foundations needed to follow how BB84 works. 



<!-- Start of picture text -->
![Basis Explorer Badge](my-app/public/images/basis-explorer.png)
<!-- End of picture text -->

## **3. Key Sifter** 

**Earn it when:** The learner passes Module 3 on Alice, Bob and basis reconciliation with at least 70%. **Why it matters:** They can explain why mismatched-basis measurements are discarded. 



<!-- Start of picture text -->
![Key Sifter Badge](my-app/public/images/key-sifter.png)
<!-- End of picture text -->

**4. Eavesdropper Detective** 

**Earn it when:** The learner passes Module 4 on Eve, QBER and post-processing with at least 70%. **Why it matters:** They understand how eavesdropping can introduce detectable errors and what QBER tells us. 



<!-- Start of picture text -->
![Eavesdropper Detective Badge](my-app/public/images/eavesdropper-detective.png)
<!-- End of picture text -->

## **5. Qiskit Practitioner** 

**Earn it when:** The learner passes Module 5, Qiskit BB84 Practice, with at least 70%. 

**Why it matters:** They have demonstrated understanding of how circuits, simulators and measurement results support the BB84 learning experience. 



<!-- Start of picture text -->
![Qiskit Practitioner Badge](my-app/public/images/qiskit-practitioner.png)
<!-- End of picture text -->

## **6. Daily Challenge** 

**Earn it when:** The learner successfully completes their first Daily Quantum Challenge. 

**Why it matters:** It encourages learners to apply their quantum knowledge through interactive activities and take their first step towards consistent practice. 



<!-- Start of picture text -->
![Daily Challenge Badge](my-app/public/images/daily-challenge.png)
<!-- End of picture text -->

**7. Consistency Master** 

**Earn it when:** The learner completes Daily Quantum Challenges for seven consecutive days. **Why it matters:** It recognises dedication, regular practice and continued engagement with the QKD learning platform. 


<!-- Start of picture text -->
![Consistency Master Badge](my-app/public/images/consistency-master.png)
<!-- End of picture text -->

## **8. Overall Champion** 

**Earn it when** : The learner successfully completes all five learning modules, achieving at least 70% in each module assessment. 

**Why it matters:** It celebrates the learner’s overall achievement and demonstrates their understanding of QKD concepts, BB84, quantum circuits, and the practical learning activities throughout the platform. 



<!-- Start of picture text -->
![Overall Champion Badge](my-app/public/images/overall-champion.png)
<!-- End of picture text -->

## **3. How does the badge awarding work?** 

Learner completes a module(Reading progress alone does not award the badge) ⬇︎ 

End-of-module assessment (Server calculates the score) ➡︎ 70% or higher (Award and save the badge; show a celebration) 

⬇︎ 

Below 70% (Give feedback and allow another attempt) 

Once earned, the badge remains in the learner’s profile, including after logging out and back in. Reattempting an assessment should not create duplicate copies. 

## **How it should work:** 

- Automatically award each achievement as soon as its conditions are met. 

- Display earned achievements normally and locked achievements with a short explanation, such as “Pass Module 3 with 70% or higher.” 

- Unlock the next module after the previous module is passed, provided the team confirms sequential unlocking. 

- Save earned achievements to the learner’s profile so they remain visible after logging out and back in. 

## **Scenario vs Expected behavior:** 

|**Scenario**|**Expected behavior**|
|---|---|
|Score is 70% or higher|Award the module badge automatically.|
|Score is below 70%|Do not award the badge; show feedback<br>and allow a retry.|
|Learner scores exactly 70%|Award the badge.|
|Learner passes the same module again|Keep one badge; update the latest score<br>separately.|
|Learner logs out and returns|Restore earned badges from persistent<br>storage.|
|Learner refreshes the page after passing|Badge remains earned without being<br>awarded again.|
|Assessment submission is repeated|Do not create duplicate badges.|



|accidentally||
|---|---|
|Two submissions are processed<br>simultaneously|Ensure the badge is awarded only once.|
|Learner opens a locked badge|Show the reason it is locked and how to<br>unlock it.|
|Assessment result cannot be saved|Show a clear error and avoid falsely<br>confirming the badge award.|



## **References:** 

1. Rive: Used to design and animate the achievement badges and prepare interactive animation assets. Rive. (n.d.). Rive Editor. https://rive.app/editor 

2. ChatGPT: Used to brainstorm badge concepts, develop achievement names and criteria, and assist with animation workflow and documentation. OpenAI. (n.d.). ChatGPT. https://chatgpt.com/ 

3. LottieFiles: Used to explore existing animation assets and visual inspiration. LottieFiles. (n.d.). Free animations. https://lottiefiles.com/ 

4. Photopea: Used for online image editing and graphic preparation. Photopea. (n.d.). Photopea: Free online photo editor. https://www.photopea.com/ 

5. Google: Used for web searching and accessing online resources. Google. (n.d.). Google Search. <u>https://www.google.com/</u> 

