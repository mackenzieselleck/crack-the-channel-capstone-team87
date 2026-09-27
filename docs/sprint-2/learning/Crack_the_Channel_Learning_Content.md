# **Crack the Channel — Learning Content Draft** 

#### **Database-ready content for the beginner BB84 learning pathway** 

|**Project**|Crack the Channel — Interactive QKD (BB84) Learning<br>Platform|
|---|---|
|**Team**|Team 87 — IBM Cyber Security:Quantum Risks|
|**Content Owner**|ByreddySrilekha — BA + Dev|
|**Status**|Draft for team review before database insertion|
|**Audience**|Beginner learners with little or no prior quantum knowledge|



## **1. How this document should be used** 

This document separates two things: the actual learner-facing content that can be inserted into the learning-module database, and the small amount of implementation guidance needed to map that content into the current data model. Text under “Learner-facing content” is written as content for the platform. “Platform activity” notes are implementation-facing links to the interactive experience and should not be copied into the learner page unless the team agrees that content displayed on learner page. 

The content is centred on the project’s beginner BB84 pathway: quantum foundations → bases and circuits → Alice/Bob and sifting → Eve and QBER → practical Qiskit-supported BB84 interaction. The learner is also expected to act as Alice, Bob, and Eve in the interactive exchange, rather than simply read about those roles. 

## **2. Current database input model** 

The current implementation is data-driven: module text and quiz questions are intended to be inserted into the database without requiring new learning-page code for each module. The current handover documentation defines N reading pages plus one final test, with progress increasing as the learner presses Next and the test remaining locked until the reading is complete. 

### **2.1 modules** 

|**Field**|**Required**|**Enter**|**Current use**|
|---|---|---|---|
|id|Auto|UUID|Databasegenerated|
|slug|Yes|Unique URL-safe value|Example:quantum-basics|
|title|Yes|Learner-facingmodule title|Short and clear|
|summary|No|1–2 sentence summary|What the learner will learn/do|
|position|Yes|Integer|Module order startingat 1|
|pass_mark|Yes|1–100|Use 70 for current project<br>baseline|
|is_published|Yes|Boolean|False during drafting; true only<br>after review|



### **2.2 module_pages** 

|**Field**|**Required**|**Enter**|**Contentguidance**|
|---|---|---|---|
|id|Auto|UUID|Do not manuallycreate|
|module_id|Yes|Parent module UUID|Filled after module row exists|
|position|Yes|0,1,2...|Readingorder|



Crack the Channel — Learning Content Draft 

|title|Yes|Segment title|One clear conceptperpage|
|---|---|---|---|
|body|Yes|Learner-facing text|Keep readable in the current|
||||plain-text frontend|



**Progress behaviour:** the learner cannot skip ahead. Pressing Next completes a page and advances the saved progress. The module reaches 100% only after the final test is passed. 

Crack the Channel — Learning Content Draft 

### **2.3 quiz_questions** 

|**Field**|**Required**|**What to enter**|**Guidance**|
|---|---|---|---|
|id|Auto|UUID|Databasegenerated|
|module_id|Yes|Parent module UUID|Same module as the assessment|
|position|Yes|Integer|0-basedquestion order|
|prompt|Yes|Question text|One clearlytestable concept|
|options|Yes|JSON array|Multiple-choice only in current<br>implementation|
|explanation|No|Learner feedback|Explain why the correct answer is<br>correct|



### **2.4 answer_keys** 

Create one matching answer-key row for every quiz question. correct_index is zero-based: 0 = first option, 1 = second option, etc. Keep answer keys separate from learner-facing question content. 

### **2.5 Daily Quantum Challenges** 

The current learning-module schema does not provide a dedicated challenge-content table. The challenge bank below is therefore content for the future challenge implementation and for the team’s AI challenge guidelines. It is not a direct insert list for the current learning-module tables. 

### **2.6 Additional/optional information** 

<mark>The current module_pages model has no</mark> **<mark>is_optional f</mark> i** **<mark>eld</mark>** <mark>and</mark> **<mark>pages are sequential</mark>** <mark>. Optional enrichment should therefore be placed inside a relevant page body and clearly labelled as optional reading, rather than creating a separate page that would become mandatory.</mark> 

## **Module 1 — Quantum Computing Basics [1], [2], [4]** 

**Database fields:** slug = quantum-basics; position = 1; pass_mark = 70; is_published = false until reviewed. 

**Module purpose:** Build the minimum quantum foundation needed before the learner encounters BB84. 

### **Segment 1 — From bits to qubits** 

**Learning objective:** Distinguish classical bits from qubits and understand what a qubit represents. 

A classical bit is the basic unit of classical information. It has a value of 0 or 1. A qubit is the basic unit of quantum information. A qubit can be prepared in a quantum state that contains amplitudes for different possible outcomes. When we measure a qubit, we obtain a classical result such as 0 or 1. 

**Platform activity: Quick check:** decide whether each example describes a classical bit or a qubit. 

**Key terms:** bit, qubit, quantum state, measurement 

**Additional/optional information:** A quantum computer is not simply a faster classical computer. It uses a different computational model and is useful for selected kinds of problems. 

### **Segment 2 — Superposition** 

**Learning objective:** Understand superposition without thinking that one measurement reveals every possible value at once. 

Superposition describes a quantum state that is a combination of basis states. The state contains amplitudes that determine the probabilities of different measurement outcomes. A single measurement does not show both 0 and 1 at the same time; it returns one classical outcome. 

Crack the Channel — Learning Content Draft 

**Platform activity:** Prediction check: before measuring an equal superposition, predict which classical result a single measurement can return. 

**Key terms:** superposition, amplitude, probability 

**Additional/optional information:** For an equal superposition of 0 and 1 in the corresponding basis, the two outcomes occur with equal probability when measured ideally. 

### **Segment 3 — Measurement and disturbance** 

**Learning objective:** Understand the difference between a quantum state and the classical result produced by measurement. 

Measurement is the process of obtaining a classical result from a quantum state. The result is probabilistic according to the state and the chosen measurement basis. After measurement, the state changes to the observed result in the measurement basis. Measurement therefore does more than reveal information: it can disturb the quantum state. 

**Platform activity:** Compare a quantum state before measurement with the classical result produced after measurement. 

**Key terms:** measurement, outcome, collapse, disturbance 

**Additional/optional information:** Quantum gates and measurements have different roles: gates transform quantum states, while measurement produces a classical outcome and changes the state. 

### **Segment 4 — Why this matters for secure communication** 

**Learning objective:** Connect measurement disturbance to the security idea used by BB84. 

BB84 uses quantum states to help two users establish a shared secret key while making interference detectable. If an eavesdropper tries to measure unknown quantum information, that interaction can disturb the transmitted states. Alice and Bob can later use selected information from the exchange to estimate whether the communication contains too many errors. 

**Platform activity:** Security check: decide whether a change in the transmitted state could be evidence that someone interfered with the exchange. 

**Key terms:** QKD, shared secret key, eavesdropper, disturbance 

**Additional/optional information:** BB84 is a quantum key distribution protocol. The quantum part helps reveal disturbance; classical communication is still used for coordination and later processing. 

**Module 1 assessment — 10 questions** 

|**#**|**Prompt**|**Options**|**Correct index**|**Explanation**|
|---|---|---|---|---|
|1|What is the basic unit of<br>classical information?|A) Qubit; B) Bit; C) QPU; D)<br>Gate|1|A classical bit is the basic<br>unit of classical information<br>and has value 0 or 1.|
|2|What is a qubit?|A) The basic unit of<br>quantum information; B) A<br>password; C) A classical<br>packet;D)A database row<br>i|0|A qubit is the basic unit<br>used to represent quantum<br>information.|
|3|What does superposition<br>describe?|A) Only one fixed classical<br>value; B) A quantum state<br>containing a combination of<br>basis states; C) A faster<br>network; D) A database<br>state|1|Superposition describes the<br>quantum state before<br>measurement, not a list of<br>classical outputs seen at<br>once.|



Crack the Channel — Learning Content Draft 

|**#**|**Prompt**|**Options**|**Correct index**|**Explanation**|
|---|---|---|---|---|
|4|What does a single<br>measurement of a qubit<br>produce?|A) All possible results; B)<br>One classical outcome; C)<br>A new qubit; D) A second<br>copy|1|A measurement produces<br>one classical outcome for<br>the chosen basis.|
|5|Why is measurement<br>important to BB84<br>security?|A) It removes all noise; B) It<br>can disturb an unknown<br>state; C) It creates<br>passwords; D) It increases<br>qubit count|1|Measurement disturbance<br>can create detectable<br>differences when an<br>attacker interacts with the<br>exchange.|
|6|What does QKD stand for?|A) Quantum Key<br>Distribution; B) Quantum<br>Kernel Design; C) Quick Key<br>Database; D) Quantum<br>Knowledge Dashboard|0|QKD stands for Quantum<br>Key Distribution.|
|7|Which statement about<br>quantum computers is<br>most accurate?|A) They are universally<br>faster; B) They are a<br>different computational<br>approach useful for<br>selected problems; C) They<br>replace classical<br>computers; D) They only<br>work forgraphics|1|Quantum computing is not<br>universally better than<br>classical computing.|
|8|Before measurement, a<br>qubit is described by its:|A) Quantum state; B)<br>Username; C) Database ID;<br>D) Network address|0|The quantum state<br>describes the system<br>before the classical<br>measurement result is<br>obtained.|
|9|What is the main security<br>idea used by BB84?|A) Interference can be<br>detectable because<br>quantum measurements<br>can disturb states; B)<br>Passwords cannot be<br>guessed; C) All noise is<br>removed; D) No classical<br>communication is used|0|BB84 uses quantum<br>measurement behaviour to<br>make interference<br>detectable.|
|10|What should a beginner<br>remember about<br>superposition?|A) One measurement shows<br>every value; B) The state<br>contains possibilities, but<br>one measurement gives one<br>classical outcome; C)<br>Superposition is a<br>password; D) Superposition<br>onlyexists in databases|1|This wording avoids the<br>common misconception<br>that a single measurement<br>displays 0 and 1<br>simultaneously.|



## **Module 2 — Bases, Gates and Quantum Circuits [2], [3], [6]** 

**Database fields:** slug = bases-gates-circuits; position = 2; pass_mark = 70; is_published = false until reviewed. 

**Module purpose:** Teach only the circuit and measurement concepts needed to understand the BB84 experience. 

### **Segment 1 — The computational (Z) basis** 

**Learning objective:** Recognise the Z basis and its outcomes. 

The computational basis, also called the Z basis, uses |0> and |1> as its basis states. A measurement in the Z basis asks which of these two outcomes is observed. The Z basis is one of the two bases used in the BB84 protocol. 

**Platform activity:** Match the basis name to its possible measurement states. 

**Key terms:** basis, Z basis, |0>, |1> 

### **Segment 2 — The X basis** 

**Learning objective:** Recognise the X basis and understand why BB84 uses two different bases. 

Crack the Channel — Learning Content Draft 

The X basis uses |+> and |-> as its basis states. These states are superpositions of |0> and |1>. BB84 uses the Z and X bases so that a receiver cannot reliably recover the original information when the measurement basis does not match the preparation basis. 

**Platform activity:** Basis check: identify whether a pair of states belongs to the Z basis or the X basis. 

**Key terms:** X basis, |+>, |->, incompatible bases 

**Additional / optional information:** The Y basis is another valid quantum measurement basis, but it is not required for the core BB84 pathway in this project. 

### **Segment 3 — Hadamard and CNOT gates** 

**Learning objective:** Recognise what the Hadamard and CNOT gates do at a beginner level. 

Quantum gates transform quantum states. The Hadamard (H) gate can create an equal superposition from a computational-basis state and can be used to switch between Z- and X-basis measurement descriptions. The CNOT (or CX) gate is a two-qubit gate that can create entanglement when used with a suitable input state. 

**Platform activity:** Look at a simple circuit and identify the H and CNOT gates. 

**Key terms:** quantum gate, Hadamard, CNOT, entanglement 

**Additional/optional information:** You do not need matrix multiplication to use the gates in the platform. Focus on the role each gate plays in the circuit. 

### **Segment 4 — Circuits, shots and histograms** 

**Learning objective:** Understand why quantum circuits are repeated and how results are visualised. 

A quantum circuit is a sequence of operations performed on qubits. Measurement is probabilistic, so one circuit run gives one sampled result. To learn about the distribution of outcomes, the same circuit is run many times. Each run is called a shot. Counts from many shots can be displayed as a histogram. 

**Platform activity:** Read a simple measurement histogram and identify the most common outcome. 

**Key terms:** quantum circuit, shot, counts, histogram 

**Additional/optional information:** Repeated sampling is especially useful when you interpret the outputs from Qiskitbacked experiments. 

**Module 2 assessment — 10 questions** 

|**#**|**Prompt**<br>i|**Options**|**Correct index**|**Explanation**|
|---|---|---|---|---|
|1|Which states define the<br>computational(Z)basis?|A) |+>, |->; B) |0>, |1>; C) |i>,<br>|−i>; D) Bell states|1|The Z basis uses |0> and |<br>1>.|
|2|Which states define the X<br>basis?|A) |0>, |1>; B) |+>, |->; C) |<br>00>, |11>; D) |i>, |−i>|1|The X basis uses |+> and |->.|
|3|Which bases are used in<br>the core BB84pathway?|A) Z and X; B) X and Y; C) Y<br>and Z; D) H and CNOT|0|The project teaches BB84<br>using the Z and X bases.|
|4|Why are the Z and X bases<br>important in BB84?|A) They are different<br>measurement bases used<br>to reveal mismatches; B)<br>They are database tables;<br>C) They remove all noise; D)<br>They are classical<br>passwords|0|Different bases create the<br>preparation/measurement<br>behaviour used by BB84.|



Crack the Channel — Learning Content Draft 

|**#**|**Prompt**|**Options**|**Correct index**|**Explanation**|
|---|---|---|---|---|
|5|What can a Hadamard<br>gate do?|A) Delete a qubit; B) Create<br>superposition and change<br>basis descriptions; C) Store<br>a database record; D)<br>MeasureQBER directly|1|H can create superposition<br>and is used for basis<br>changes.|
|6|What type of gate is<br>CNOT?|A) Single-qubit; B) Multi-<br>qubit; C) Classical-only; D)<br>Measurement-only|1|CNOT acts on two qubits.|
|7|What is a shot?|A) One circuit run; B) A<br>password; C) A database<br>row;D)Aqubit|0|A shot is one repeated run<br>used to collect<br>measurement statistics.|
|8|Why run a circuit many<br>times?|A) To estimate the<br>distribution of outcomes; B)<br>To avoid measurement; C)<br>To create more qubits; D) To<br>remove all noise|0|Multiple shots reveal how<br>frequently different<br>outcomes occur.|
|9|What does a<br>measurement histogram<br>show?|A) Outcome counts or<br>frequencies; B) User login<br>details; C) Source code; D)<br>Network bandwidth|0|A histogram visualises how<br>often different<br>measurement outcomes<br>occurred.|
|10|What is the main role of a<br>quantum gate?|A) Transform a quantum<br>state; B) Create a database<br>row; C) Authenticate a user;<br>D)Send an email|0|Quantum gates implement<br>state transformations in the<br>circuit.|



## **Module 3 — BB84 — Alice, Bob and the Sifted Key [2], [13]** 

**Database fields:** slug = bb84-alice-bob; position = 3; pass_mark = 70; is_published = false until reviewed. 

**Module purpose:** Walk the learner through the core BB84 exchange in the same sequence used by the interactive experience. 

### **Segment 1 — What is BB84?** 

**Learning objective:** Explain the purpose of BB84 in simple terms. 

BB84 is a quantum key distribution protocol. Its goal is to allow two parties to establish a shared secret key while providing a way to detect interference. The process uses quantum states for transmission and classical communication for later comparison and error checking. 

**Platform activity:** Arrange the main BB84 stages in order before starting the full interaction. 

**Key terms:** BB84, QKD, shared secret key 

### **Segment 2 — You are Alice: prepare and send** 

**Learning objective:** Understand Alice’s role and the information she chooses. 

Alice is the sender. For each transmitted qubit, Alice randomly chooses a bit value and a basis. She encodes the 

bit using that basis and sends the resulting quantum state to Bob. Alice does not simply send a visible 0 or 1; she prepares quantum information according to a chosen basis. 

**Platform activity:** In the platform, act as Alice and choose the bit and basis for the transmitted qubits. Continue only after completing the preparation step. 

**Key terms:** Alice, sender, preparation, encoding, basis 

### **Segment 3 — You are Bob: measure** 

**Learning objective:** Understand Bob’s role and why his basis choice matters. 

Crack the Channel — Learning Content Draft 

Bob is the receiver. For each qubit he receives, Bob independently chooses a measurement basis and measures the incoming quantum information. When his basis matches Alice’s preparation basis, the protocol gives the intended bit value in the ideal case. When the bases differ, the result is not the information kept for the shared key. 

**Platform activity:** In the platform, act as Bob and measure the incoming qubits using your chosen bases. Observe the classical measurement results. 

**Key terms:** Bob, receiver, measurement basis, classical result 

### **Segment 4 — Basis reconciliation and the sifted key** 

**Learning objective:** Understand how Alice and Bob decide which positions to keep. 

After the quantum exchange, Bob announces which basis he used for each qubit. Alice identifies which positions matched her preparation bases. Positions with matching bases are kept; positions with different bases are discarded. The remaining string is called the sifted key. 

**Platform activity:** Use the exchange-outcome view to mark each position as keep or discard and observe the resulting sifted key. 

**Key terms:** basis reconciliation, matching bases, discarded positions, sifted key 

**Additional/optional information:** The public discussion reveals basis choices for comparison; it is not the same thing as publishing the secret key itself. 

**Module 3 assessment — 10 questions** 

|**#**|**Prompt**|**Options**|**Correct index**|**Explanation**|
|---|---|---|---|---|
|1|What is Alice’s role in<br>BB84?|A) Receiver; B) Sender; C)<br>Eavesdropper; D) QPU|1|Alice is the sender.|
|2|What is Bob’s role in<br>BB84?|A) Receiver; B)<br>Eavesdropper; C) Compiler;<br>D)Database administrator|0|Bob is the receiver.|
|3|What does Alice choose<br>for each transmitted<br>qubit?|A) A username; B) A bit and<br>a basis; C) QBER; D) A<br>password and server|1|Alice chooses a bit value<br>and a basis for preparation.|
|4|What does Bob choose for<br>each received qubit?|A) A measurement basis; B)<br>Alice’s original bit; C) The<br>final QBER; D) The database<br>ID|0|Bob independently chooses<br>a measurement basis.|
|5|When Alice and Bob use<br>the same basis, what<br>generally happens?|A) Bob gets the intended<br>encoded bit; B) The position<br>is discarded; C) The key<br>becomes public; D) Eve<br>disappears|0|Matching bases allow the<br>intended protocol bit to be<br>recovered in the ideal case.|
|6|What happens when the<br>bases differ?|A) The position is kept<br>automatically; B) The<br>position is discarded during<br>sifting; C) It is sent to Eve; D)<br>It becomes public key<br>material|1|Mismatched-basis<br>positions are discarded.|
|7|What is the sifted key?|A) Remaining positions after<br>mismatched bases are<br>discarded; B) All<br>transmitted bits; C) Bob’s<br>password; D) The public<br>basis list|0|The sifted key contains the<br>positions where the bases<br>matched.|
|8|Why does BB84 use basis<br>choices?|A) To create a way to detect<br>disturbance through<br>quantum measurement<br>behaviour; B) To speed up a<br>database; C) To avoid<br>measurement; D) To create<br>accounts|0|Basis choices are central to<br>the sifting and security<br>behaviour of BB84.|



Crack the Channel — Learning Content Draft 

|**#**|**Prompt**|**Options**|**Correct index**|**Explanation**|
|---|---|---|---|---|
|9|What kind of result does<br>Bob obtain from<br>measurement?|A) A classical result; B) A<br>new QPU; C) A basis list<br>only; D) A user profile|0|Measurement produces a<br>classical outcome.|
|10|What major step follows<br>basis reconciliation?|A) Error estimation/QBER;<br>B) User registration; C)<br>Password reset; D)<br>Hardwarepurchase|0|After sifting, Alice and Bob<br>estimate the error rate of<br>the remaining bits.|



## **Module 4 — Eve, Eavesdropping and QBER [13]** 

**Database fields:** slug = eve-and-qber; position = 4; pass_mark = 70; is_published = false until reviewed. 

**Module purpose:** Show why eavesdropping changes the exchange and how QBER helps the learner interpret the result. 

### **Segment 1 — Who is Eve?** 

**Learning objective:** Understand Eve’s role as the eavesdropper. 

Eve is the conventional name for an eavesdropper or adversary. In the BB84 exchange, Eve tries to learn about the transmitted quantum information without being detected. Eve does not know Alice’s basis choice in advance, so an attempt to measure the qubit can disturb the state before the information reaches Bob. 

**Platform activity:** In the platform, enable Eve and observe how the exchange changes. 

**Key terms:** Eve, eavesdropper, adversary, disturbance 

### **Segment 2 — Intercept-resend** 

**Learning objective:** Understand the basic idea of how Eve can disturb an exchange. 

In a simple intercept-resend attack, Eve intercepts a qubit, chooses a basis to measure it, and sends a new quantum state to Bob based on her result. Eve does not know which basis Alice used. If Eve chooses the wrong basis, the state she forwards can be inconsistent with Alice’s original preparation. 

**Platform activity:** Run one exchange without Eve and another with Eve enabled. Compare what happens before and after the interference. 

**Key terms:** intercept-resend, wrong basis, forwarded state 

**Additional/optional information:** The security intuition also relates to the no-cloning idea: unknown quantum states cannot simply be copied perfectly and examined later without affecting the protocol. 

### **Segment 3 — What is QBER?** 

**Learning objective:** Calculate and interpret Quantum Bit Error Rate. 

Quantum Bit Error Rate, or QBER, is the fraction of compared sifted-key bits that disagree. The basic calculation is: QBER = number of disagreeing bits/number of bits compared. For example, if 3 out of 20 compared bits disagree, the QBER is 15%. 

**Platform activity:** Use the QBER panel to calculate the error rate for a sample exchange and compare it with the displayed result. 

**Key terms:** QBER, error rate, sifted key, mismatch 

Crack the Channel — Learning Content Draft 

### **Segment 4 — Interpreting a higher QBER** 

**Learning objective:** Connect changes in QBER with disturbance and noise. 

A higher QBER means that more of the compared bits disagree. In an idealised full intercept-resend scenario, the project learning notes describe an error rate of about 25%. Real quantum hardware can also introduce noise and measurement errors, so a non-zero QBER does not automatically prove that Eve is present. The learner should use QBER as evidence that the exchange contains errors and may have been disturbed. 

**Platform activity:** Compare the QBER result with and without Eve and explain the difference in plain language. 

**Key terms:** noise, threshold, security interpretation 

**Additional/optional information:** The project learning notes use an approximately 11% security threshold as a teaching reference for the post-processing stage. Treat this as a project teaching reference, not a universal rule for every deployment. 

**Module 4 assessment — 10 questions** 

|**#**|**Prompt**|**Options**|**Correct index**|**Explanation**|
|---|---|---|---|---|
|1|Who is Eve?|A) Sender; B) Receiver; C)<br>Eavesdropper;D)Database|2|Eve is the conventional<br>name for the eavesdropper.|
|2|What is the basic idea of<br>intercept-resend?|A) Eve intercepts a qubit,<br>measures it, then sends a<br>replacement state to Bob;<br>B) Eve deletes the network;<br>C) Bob sends it back; D)<br>Alicepublishes the key|0|Intercept-resend describes<br>Eve measuring intercepted<br>information and forwarding<br>a replacement state.|
|3|Why can Eve cause<br>errors?|A) Eve always knows Alice’s<br>basis; B) Eve may choose<br>the wrong basis and disturb<br>the state; C) Eve changes<br>the database; D) Bob<br>refuses to measure|1|An incorrect basis choice<br>can disturb the transmitted<br>state.|
|4|What does QBER<br>measure?|A) Number of users; B)<br>Fraction of compared<br>sifted-key bits that disagree;<br>C) Number of processor<br>qubits; D) Network<br>bandwidth|1|QBER is the fraction of<br>mismatching compared<br>bits.|
|5|If 3 out of 20 compared<br>bits disagree, what is the<br>QBER?|A) 3%; B) 10%; C) 15%; D)<br>20%|2|3 divided by 20 is 0.15, or<br>15%.|
|6|What does a higher QBER<br>tell the learner?|A) The exchange contains<br>more errors and may have<br>been disturbed; B) The key<br>is automatically public; C)<br>The computer has more<br>qubits; D) The user logged<br>out|0|A higher QBER indicates<br>more disagreement and<br>possible disturbance or<br>noise.|
|7|Does a non-zero QBER<br>automatically prove Eve is<br>present?|A) Yes, always; B) No, noise<br>can also cause errors; C)<br>Only on a simulator; D) Only<br>whenQBER is 0%|1|Noise and measurement<br>errors can also contribute<br>to QBER.|
|8|What approximate QBER<br>is described for a full<br>idealised intercept-resend<br>attack in the project<br>notes?|A) 1%; B) 11%; C) 25%; D)<br>50%|2|The supplied project<br>learning notes describe<br>about 25% for a full<br>intercept-resend attack.|
|9|Why compare QBER with<br>and without Eve?|A) To observe the effect of<br>interference; B) To create<br>accounts; C) To avoid<br>measurement; D) To skip<br>sifting|0|A controlled comparison<br>makes the effect of Eve<br>visible.|



Crack the Channel — Learning Content Draft 

|**#**|**Prompt**|**Options**|**Correct index**|**Explanation**|
|---|---|---|---|---|
|10|What is the most useful<br>beginner interpretation of<br>QBER?|A) A raw number only; B) An<br>error-rate signal that helps<br>explain whether the<br>exchange was disturbed; C)<br>A user score; D) Network<br>speed|1|The platform should<br>connect QBER to the<br>learner’s exchange and<br>interpretation.|



## **Module 5 — Qiskit and the Practical BB84 Experience [1], [5], [6]** 

**Database fields:** slug = qiskit-bb84-practice; position = 5; pass_mark = 70; is_published = false until reviewed. 

**Module purpose:** Connect the concepts to the executable Qiskit-backed BB84 interaction used by the platform. 

### **Segment 1 — What is Qiskit?** 

**Learning objective:** Recognise Qiskit and understand its role without requiring the learner to become a programmer. 

Qiskit is an open-source software development kit for working with quantum computers. It allows quantum circuits and related workflows to be described and executed in software. In Crack the Channel, Qiskit is used underneath the learning experience, so the BB84 interaction is based on executable quantum-circuit processing. 

**Platform activity:** In the platform, focus on the BB84 interaction and the result it produces. The code implementation does not need to be understood before completing the activity. 

**Key terms:** Qiskit, SDK, quantum circuit, executable circuit 

### **Segment 2 — Sampler, shots and measurement results** 

**Learning objective:** Understand at a high level how repeated circuit execution produces observable results. 

A Sampler is a Qiskit primitive used to run a circuit and collect sampled measurement outcomes. Running the circuit many times produces counts that can be displayed as a histogram. This is the same repeated-shot idea introduced earlier: one run gives one sample, while many runs show the distribution of observed outcomes. 

**Platform activity:** Inspect a simple Qiskit-backed result and identify the most common observed outcome or measurement pattern. 

**Key terms:** Sampler, shots, counts, histogram 

**Additional/optional information:** Qiskit also provides an Estimator primitive for estimating observables such as energy. That is useful background but is not needed to complete the BB84 activity. 

### **Segment 3 — Simulator and real quantum hardware** 

**Learning objective:** Distinguish a simulator from a physical quantum processor. 

A simulator models quantum-circuit behaviour using classical computing resources. It is useful for testing, debugging, and learning. A real quantum processor is physical hardware and can introduce gate imperfections, measurement errors, and other noise. Jobs on real hardware can also involve practical constraints such as queueing and calibration changes. 

**Platform activity:** Compare an idealised result with a noisy result and identify which differences could come from physical hardware effects. 

**Key terms:** simulator, QPU, noise, hardware 

Crack the Channel — Learning Content Draft 

**Additional/optional information:** The current project does not depend on real IBM Quantum hardware; the core learning experience is designed around the agreed Qiskit environment. 

### **Segment 4 — Complete the BB84 learning journey** 

**Learning objective:** Connect the learning concepts, Alice/Bob/Eve interaction, QBER feedback and the final interpretation. 

The complete Crack the Channel experience follows a simple rhythm: learn a concept, perform an action, receive feedback, continue to the next stage, and interpret the result. The BB84 exchange is separated into five stages so the learner does not need to hold the entire protocol in mind at once. Preparation is led by Alice, measurement by Bob, basis reconciliation shows what is kept and discarded, error estimation produces QBER, and postprocessing helps the learner understand what the completed exchange means. 

**Platform activity:** Complete the full BB84 simulation, first without Eve and then with Eve, and explain what changed in the result. 

**Key terms:** workflow, feedback, Alice, Bob, Eve, QBER 

**Additional/optional information:** IBM also describes a broader Qiskit patterns workflow of Map → Optimize → Execute → Post-process. This is useful extension material but is not required for the core BB84 learning pathway. 

**Module 5 assessment — 10 questions** 

|**#**|**Prompt**|**Options**|**Correct index**|**Explanation**|
|---|---|---|---|---|
|1|What is Qiskit?|A) An open-source SDK for<br>quantum computing; B) A<br>password manager; C) A<br>database engine only; D) A<br>networking protocol|0|Qiskit is an open-source<br>SDK used to work with<br>quantum circuits and<br>quantum computing<br>workflows.|
|2|Why is Qiskit used in<br>Crack the Channel?|A) To support executable<br>quantum-circuit<br>processing; B) To store<br>passwords; C) To create<br>badges; D) To replace the<br>frontend|0|The project requires the<br>BB84 experience to use<br>executable Qiskit-based<br>circuit processing.|
|3|What does a Sampler help<br>provide?|A) Measurement outcome<br>samples/counts; B) User<br>account creation; C)<br>Network routes; D) Badge<br>images|0|Sampler is used to collect<br>sampled measurement<br>outcomes from circuit<br>execution.|
|4|Why are multiple shots<br>useful?|A) They provide statistics<br>about measurement<br>outcomes; B) They create<br>new qubits; C) They remove<br>every source of noise; D)<br>Theyavoid measurement|0|Repeated shots let us<br>observe an outcome<br>distribution.|
|5|What is a simulator?|A) A classical system that<br>models a quantum circuit;<br>B) A physical QPU; C) A<br>database table; D) A login<br>service|0|A simulator models<br>quantum-circuit behaviour<br>using classical resources.|
|6|What can make a real<br>QPU result differ from an<br>ideal simulator?|A) Physical noise and<br>measurement errors; B) A<br>QPU never measures; C)<br>Simulators do not use<br>mathematics; D) Hardware<br>removes all errors|0|Real hardware can<br>introduce physical<br>imperfections and noise.|
|7|What comes after basis<br>reconciliation in the<br>project learning flow?|A) Error estimation/QBER;<br>B) Login; C) Account<br>deletion; D) Hardware<br>purchase|0|The documented project<br>flow moves from<br>reconciliation to error<br>estimation.|



Crack the Channel — Learning Content Draft 

|**#**|**Prompt**|**Options**|**Correct index**|**Explanation**|
|---|---|---|---|---|
|8|Why should unnecessary<br>Qiskit details be hidden<br>from beginners?|A) To reduce cognitive load<br>while preserving meaningful<br>interaction; B) To hide all<br>results; C) To prevent<br>learning; D) To remove<br>Qiskit|0|The learning requirements<br>focus on beginner<br>understanding rather than<br>implementation detail.|
|9|Which is the project’s five-<br>stage BB84 learning flow?|A) Preparation →<br>Measurement → Basis<br>reconciliation → Error<br>estimation → Post-<br>processing; B) Login →<br>Logout → Install → Delete →<br>Repeat; C) Encode → Email<br>→ Print → Store → Delete; D)<br>Measure → Login → QBER →<br>Install → Exit|0|This sequence matches the<br>project learning flow.|
|10|What is the main learning<br>goal of the platform?|A) Help beginners<br>understand BB84 by<br>interacting with and<br>interpreting the protocol; B)<br>Teach advanced quantum<br>hardware first; C) Replace<br>classical computers; D)<br>Teach all quantum<br>algorithms immediately|0|The platform is beginner-<br>focused and centres on<br>understanding BB84<br>through practical<br>interaction.|



## **3. Daily Quantum Challenge bank** 

These are learner-facing challenge questions for the future challenge feature. They are intentionally short and reinforce concepts already introduced in the core pathway. The categories can also be used as inputs to the team’s future AI challenge-generation guidelines. 

|**ID**|**Category**|**Difficulty**|**Question**|**Correct option**|**Feedback**|
|---|---|---|---|---|---|
|CH-01|Concept Check|**f**<br>Beginner|Which statement best<br>describes a qubit?|B|A qubit is the basic<br>unit of quantum<br>information.|
|CH-02|Term Match|Beginner|What does QBER<br>stand for?|A|QBER means<br>Quantum Bit Error<br>Rate.|
|CH-03|Sequence|Beginner|Which sequence<br>matches the BB84<br>learning flow?|A|Preparation →<br>Measurement → Basis<br>reconciliation → Error<br>estimation → Post-<br>processing.|
|CH-04|Basis Choice|Beginner|Alice uses Z and Bob<br>measures using Z.<br>Should that position<br>normally be kept after<br>sifting?|A|Matching bases are<br>retained.<br>f|
|CH-05|Basis Choice|Beginner|Alice uses X and Bob<br>measures using Z.<br>Should that position<br>normally be kept after<br>sifting?|B|Different bases are<br>discarded during<br>sifting.|
|CH-06|Measurement<br>Prediction|Intermediate|If a qubit is measured<br>once, will you see both<br>0 and 1 at the same<br>time?|B|One classical<br>outcome is observed<br>in a single<br>measurement.|
|CH-07|Alice/Bob Scenario|Intermediate|Alice and Bob used the<br>same basis for a<br>position. Why is that<br>position normally<br>kept?|A|Matching bases give<br>the intended protocol<br>bit in the ideal case.|
|CH-08|Sifting|Intermediate|Alice’s bases are Z X Z<br>X Z and Bob’s are Z Z Z<br>X X. Which positions<br>are kept?|A|Positions 1, 3 and 4<br>have matching bases.|



Crack the Channel — Learning Content Draft 

|**ID**|**Category**|**Difficulty**|**Question**|**Correct option**|**Feedback**|
|---|---|---|---|---|---|
|CH-09|QBER Calculation|Intermediate|Alice and Bob<br>compare 20 sifted-key<br>bits and 3 disagree.<br>What is theQBER?|C|3/20 = 0.15, so the<br>QBER is 15%.|
|CH-10|QBER Interpretation|Intermediate|Eve is enabled and<br>QBER rises compared<br>with the no-Eve<br>exchange. What does<br>this most directly<br>demonstrate?|A|The exchange has<br>more errors after<br>interference.|
|CH-11|Eve Detection|Intermediate|Why can an intercept-<br>resend attack leave a<br>detectable trace?|B|Eve may measure<br>using the wrong basis<br>and disturb the state.|
|CH-12|Compare<br>With/Without Eve|Intermediate|Why should a learner<br>run one exchange<br>without Eve and<br>another with Eve?|A|The learner can<br>observe the baseline<br>and compare the<br>effect of interference.|
|CH-13|Qiskit Interpretation|Intermediate|Why might a quantum<br>circuit be run many<br>times inQiskit?|A|f<br>Repeated shots<br>collect measurement<br>statistics.|
|CH-14|Troubleshooting|Intermediate|A learner sees a QBER<br>result but does not<br>understand it. Which<br>explanation is most<br>useful?|A|QBER is an error-rate<br>signal showing how<br>many compared bits<br>disagree.|
|CH-15|Security Scenario|Intermediate|A full intercept-resend<br>attack is simulated<br>and the error rate rises<br>substantially. What<br>should the learner<br>conclude?|A|The exchange shows<br>evidence of<br>disturbance and<br>should be treated<br>according to the<br>agreed security<br>interpretation.|
|CH-16|Qiskit Interpretation|Intermediate|Which Qiskit primitive<br>is mainly used for<br>collecting sampled<br>measurement<br>outcomes?|A|Sampler is used for<br>sampled circuit<br>measurement<br>outcomes.|
|CH-17|Optional Quantum<br>Context|Intermediate|Which is the best<br>description of a QPU?|A|A QPU performs the<br>quantum portion of a<br>hybrid workflow and<br>returns measurement<br>results.|
|CH-18|Optional Hardware<br>Context|Intermediate|Why can real quantum<br>hardware show<br>different results from<br>an ideal simulator?|A|Physical hardware can<br>introduce noise and<br>measurement errors.|



## **4. Additional/optional information bank[4]- [12]** 

### **Why quantum computers are not universal replacements** 

Quantum computers are not universally better than classical computers. They use a different computational model and are being explored for selected problem types. 

### **Quantum utility and quantum advantage** 

Quantum utility refers to useful quantum computation for selected tasks; quantum advantage is the stronger claim that quantum performance exceeds the best classical approach for a meaningful task. 

### **QPU and hybrid computing** 

A quantum workflow normally combines classical and quantum resources. Classical systems can prepare and process workloads while the QPU performs the quantum part. 

### **Sampler versus Estimator** 

Sampler is used for sampled measurement outcomes. Estimator is used to estimate observables such as energy. 

Crack the Channel — Learning Content Draft 

### **Qiskit patterns** 

A broader Qiskit workflow can be described as Map → Optimize → Execute → Post-process. This is extension material for learners curious about how quantum workloads are run. 

### **Simulator versus real hardware** 

Simulators support testing and learning. Real hardware can introduce physical noise, measurement errors, queueing and calibration changes. 

### **Explore more: advanced quantum topics** 

Learners who want to continue can explore topics such as QAOA, quantum chemistry, quantum machine learning, quantum diagonalisation, high-performance computing and quantum error correction. These should remain optional links rather than core BB84 pages. 

## **5. Content-to-database insertion checklist** 

☐Create one modules row per approved module with a unique slug, title, summary, position and pass_mark = 70. 

☐Keep is_published = false during drafting/review. 

☐Insert each reading segment into module_pages with positions starting at 0 and increasing by 1. 

☐Use the learner-facing segment text as the module_pages body. Keep implementation notes outside the body unless the team explicitly wants them displayed to learners. 

☐Insert every assessment question into quiz_questions with its prompt, options and learner-facing explanation. 

☐Create exactly one answer_keys row for every assessment question and use the zero-based correct_index. 

☐Keep the current first version at 10 questions per module so the 70% pass mark maps cleanly to 7/10. 

☐Keep Daily Quantum Challenges as a separate content bank until the team agrees the challenge database model. 

☐Keep optional enrichment inside a relevant page body until an optional-content field or separate mechanism is added. 

☐Only publish after BA/content review and developer/QA checks. 

## **6. Source alignment** 

This content draft is based on the project’s Sprint 2 Rev 3.1 requirements, the team’s BB84/Qiskit learning notes, the documented five-stage BB84 interaction flow, and the supplied IBM Quantum Learning material covering quantum foundations, Qiskit, quantum circuits, measurement and bases, practical quantum computing, application context, QAOA, mapping, simulating nature, quantum business foundations and related learning modules. 

The core pathway deliberately keeps advanced topics out of the required beginner sequence. Optional material is retained as enrichment so learners can explore further without interrupting the BB84 learning journey. 

Crack the Channel — Learning Content Draft 

#### **References :** 

**[1]** IBM Quantum, “Build and run your first quantum program,” _IBM Quantum Learning: Use a quantum computer today_ . [Online]. Available: https://quantum.cloud.ibm.com/learning/en/courses/use-a-qc-today/build-and-run-your- <u>first-quantum-program</u> 

**[2]** IBM Quantum, “Quantum mechanics basics,” _IBM Quantum Learning: Use a quantum computer today_ . [Online]. Available: https://quantum.cloud.ibm.com/learning/en/courses/use-a-qc-today/quantum-mechanics-basics 

**[3]** IBM Quantum, “Your first quantum experiment,” _IBM Quantum Learning: Use a quantum computer today_ . [Online]. Available: https://quantum.cloud.ibm.com/learning/en/courses/use-a-qc-today/your-first-quantum-experiment 

**[4]** IBM Quantum, “Quantum computing context,” _IBM Quantum Learning: Use a quantum computer today_ . [Online]. Available: https://quantum.cloud.ibm.com/learning/en/courses/use-a-qc-today/quantum-computing-context 

**[5]** IBM Quantum, “Course introduction,” _IBM Quantum Learning: Quantum Computing in Practice_ . [Online]. Available: <u>https://quantum.cloud.ibm.com/learning/en/courses/quantum-computing-in-practice/introduction</u> 

**[6]** IBM Quantum, “Running quantum circuits,” _IBM Quantum Learning: Quantum Computing in Practice_ . [Online]. Available: https://quantum.cloud.ibm.com/learning/en/courses/quantum-computing-in-practice/running-quantum- <u>circuits</u> 

**[7]** IBM Quantum, “Which problems are quantum computers good for?,” _IBM Quantum Learning: Quantum Computing in Practice_ . [Online]. Available: https://quantum.cloud.ibm.com/learning/en/courses/quantum-computing-in- <u>practice/applications-of-qc</u> 

**[8]** IBM Quantum, “Mapping,” _IBM Quantum Learning: Quantum Computing in Practice_ . [Online]. Available: <u>https://quantum.cloud.ibm.com/learning/en/courses/quantum-computing-in-practice/mapping</u> 

**[9]** IBM Quantum, “Utility-scale QAOA,” _IBM Quantum Learning: Quantum Computing in Practice_ . [Online]. Available: <u>https://quantum.cloud.ibm.com/learning/en/courses/quantum-computing-in-practice/utility-scale-qaoa</u> 

**[10]** IBM Quantum, “Simulating nature,” _IBM Quantum Learning: Quantum Computing in Practice_ . [Online]. Available: <u>https://quantum.cloud.ibm.com/learning/en/courses/quantum-computing-in-practice/simulating-nature</u> 

**[11]** IBM Quantum, “Introduction to quantum computing,” _IBM Quantum Learning: Quantum Business Foundations_ . [Online]. Available: https://quantum.cloud.ibm.com/learning/en/courses/quantum-business-foundations/ <u>introduction-to-quantum-computing</u> 

**[12]** IBM Quantum, “IBM Quantum technology,” _IBM Quantum Learning: Quantum Business Foundations_ . [Online]. Available: https://quantum.cloud.ibm.com/learning/en/courses/quantum-business-foundations/quantum-technology 

#### **Project-specific source** 

**[13]** Crack the Channel Team 87, “Qiskit BB84 and eavesdropping learning notes,” internal project learning notes, 2026. 

Crack the Channel — Learning Content Draft 

