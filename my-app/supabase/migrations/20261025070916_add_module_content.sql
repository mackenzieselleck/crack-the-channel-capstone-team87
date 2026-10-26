-- BB84 learning content pack (Modules 1-5): reading pages, quizzes and answer keys

begin;

-- 0. Remove placeholder module and any previous copy of modules

delete from modules
where slug in ('test-module', 'quantum-basics', 'bases-gates-circuits', 'bb84-alice-bob', 'eve-and-qber', 'qiskit-bb84-practice');

-- 1. Modules

insert into modules (slug, title, summary, position, pass_mark, is_published) values
  ('quantum-basics', 'Quantum Computing Basics',
   $s$Build the foundations of quantum computing by learning what qubits represent, how superposition and measurement work, and why quantum measurement behaviour matters for secure communication in BB84.$s$,
   1, 70, false),
  ('bases-gates-circuits', 'Bases, Normalisation and Quantum Circuits',
   $s$Learn the Z and X bases, how quantum-state amplitudes become measurement probabilities, and how gates and repeated circuit runs support the BB84 experience.$s$,
   2, 70, false),
  ('bb84-alice-bob', 'BB84: Alice, Bob and the Sifted Key',
   $s$Follow the BB84 exchange from Alice’s preparation to Bob’s measurement, basis reconciliation and the sifted key.$s$,
   3, 70, false),
  ('eve-and-qber', 'Eve, QBER and Post-processing',
   $s$Explore how an eavesdropper can disturb BB84, calculate QBER, interpret error evidence and understand the final post-processing stage.$s$,
   4, 70, false),
  ('qiskit-bb84-practice', 'Qiskit and the Practical BB84 Experience',
   $s$Connect quantum computing concepts to the practical BB84 experience by exploring Qiskit, circuit execution, measurement results and simulation. Complete the Alice, Bob and Eve learning journey and interpret the results.$s$,
   5, 70, false);


-- 2. Reading pages
insert into module_pages (module_id, position, title, body)
select m.id, p.position, p.title, p.body
from (values

  -- ========================= Module 1: quantum-basics =========================
  ('quantum-basics', 0, 'From classical bits to qubits', $b$A classical computer represents information using bits. Each bit has one of two possible values: 0 or 1. Bits are used to represent everything from text and images to passwords and network messages.

Quantum computers use quantum bits, called qubits. Like classical bits, qubits can produce a measurement result of 0 or 1. However, before measurement, a qubit is described by a quantum state that can contain amplitudes for different possible outcomes.

A useful way to think about this is that a classical bit stores a definite binary value, while a qubit can be prepared in different quantum states that behave differently when measured. The state of a qubit determines the probabilities of the outcomes you may observe.

Quantum computers do not simply replace classical computers or make every calculation faster. They use a different computational approach that may be useful for particular problems.

Why does this matter for BB84?

BB84 uses quantum states to help Alice and Bob establish a shared secret key. To understand the protocol, you first need to recognise the difference between preparing a quantum state and observing a classical measurement result.

Key terms: Bit, qubit, quantum state, classical information, measurement.$b$),

  ('quantum-basics', 1, 'Superposition, amplitudes & probabilities', $b$Superposition describes a quantum state that combines possible basis states. For a single qubit, the state can be written as:

|ψ⟩ = α|0⟩ + β|1⟩

For a normalised qubit state, the squared magnitudes of the amplitudes must add up to 1:

|α|² + |β|² = 1

For example, consider the state:

|+⟩ = (|0⟩ + |1⟩) / √2

The two outcomes each have a probability of 50% when measured in the computational basis under ideal conditions.

Does superposition mean that one measurement shows both values?

No. A single measurement produces one classical result: either 0 or 1. If the same preparation is repeated many times, the observed results can reveal the probability distribution.

You will explore the mathematics of normalisation and probabilities more carefully in the next module.

Why does this matter for BB84?

BB84 uses different quantum states and measurement bases. Understanding superposition helps explain why the basis selected by Bob can affect his measurement outcome when it does not match Alice's preparation basis.

Key terms: Superposition, amplitude, probability, normalisation, quantum state.$b$),

  ('quantum-basics', 2, 'Measurement & disturbance', $b$Measurement is the process of obtaining a classical result from a quantum system. The result depends on the quantum state and the measurement basis being used.

Suppose a qubit has been prepared in the state |0⟩. An ideal measurement in the Z basis returns 0. A qubit prepared in the state |1⟩ returns 1 when measured in the same basis.

However, quantum measurement becomes more interesting when the measurement basis differs from the basis used to prepare the state.

For example, consider the state:

|+⟩ = (|0⟩ + |1⟩) / √2

When measured in the Z basis, this state produces 0 or 1 with equal probability under ideal conditions.

The measurement does not reveal the original state as a complete piece of information; it produces an outcome according to the measurement basis.

Measurement can also change the state. This is known as measurement disturbance. Once a measurement has taken place, the state may no longer behave as it did before the measurement.

Why does this matter for security?

Imagine that someone intercepts quantum information while it is travelling between two users. If that person measures the information without knowing the correct preparation basis, the measurement can disturb the state. This disturbance may create errors that the legitimate users can detect later.

Remember: Measurement is not simply reading a value stored inside a qubit. Its outcome depends on the quantum state and the basis used.

Key terms: Measurement, measurement basis, outcome, disturbance.$b$),

  ('quantum-basics', 3, 'Why quantum computing matters for secure communication', $b$Secure communication often relies on cryptographic keys. A key is information used by a cryptographic system to protect or recover a message. If an attacker obtains the key, the security of the communication may be weakened.

Quantum key distribution, or QKD, is a method for helping two parties establish shared secret key material while providing a way to detect interference with the quantum exchange.

BB84 is one of the best-known QKD protocols. It uses quantum states and different measurement bases to establish key material between two parties:

- Alice prepares and sends quantum states.
- Bob measures the states he receives.
- Eve represents a potential eavesdropper who tries to obtain information during the exchange.

Alice and Bob later compare their basis choices using a classical communication channel. They keep the positions where their bases match and discard positions where they differ. They can then compare a sample of the remaining bits to estimate the error rate.

If the observed error rate is too high under the protocol's agreed security conditions, they should not simply accept the resulting key. They need to treat the exchange as potentially compromised and follow the appropriate abort or post-processing rules.

Does BB84 encrypt the message itself?

BB84 is a key distribution protocol, not a complete message-encryption system. It helps establish shared key material, which can then be used by a suitable cryptographic system.

Your learning journey: In the next modules, you will learn about quantum bases and circuits, act as Alice and Bob, sift the key, and examine what changes when Eve interferes with the exchange.

Key terms: QKD, BB84, Alice, Bob, Eve, shared secret key, eavesdropping.$b$),

  -- ====================== Module 2: bases-gates-circuits ======================
  ('bases-gates-circuits', 0, 'The Z basis: the 0 and 1 view', $b$A measurement basis is the set of quantum states used to describe the possible outcomes of a measurement. BB84 uses two bases. The first is the Z basis, also called the computational or rectilinear basis. Its two basis states are |0⟩ and |1⟩.

In the Z basis, a qubit prepared in |0⟩ ideally gives measurement result 0, and a qubit prepared in |1⟩ ideally gives result 1. Alice can therefore encode bit 0 as |0⟩ and bit 1 as |1⟩ when she chooses the Z basis.

Keep these two ideas separate:

- The bit is the value Alice wants to encode: 0 or 1.
- The basis is the way the qubit is prepared and the question Bob chooses to measure.

Bob does not know Alice’s basis choice in advance. He chooses his measurement basis independently and the basis choices are compared later, after the quantum measurements have happened.

In the platform’s basis selector, the Z/rectilinear basis may be represented by a + icon. Treat this as the interface’s symbol for the Z basis; it is not the same thing as the X-basis state |+⟩.

Think about it: if Alice sends bit 1 using the Z basis and Bob also measures in the Z basis, which result should Bob obtain in an ideal, noiseless run?$b$),

  ('bases-gates-circuits', 1, 'The X basis: the diagonal view', $b$The second BB84 basis is the X basis, also called the diagonal basis. Its two states are |+⟩ and |−⟩. These states are superpositions of the Z-basis states:

|+⟩ = (|0⟩ + |1⟩) / √2
|−⟩ = (|0⟩ − |1⟩) / √2

For the BB84 bit encoding used in this learning pathway, Alice encodes bit 0 as |+⟩ and bit 1 as |−⟩ when she chooses the X basis. If Bob measures using the same X basis, he can recover the intended bit in an ideal, noiseless exchange.

The key idea is that Z and X are different, incompatible measurement bases. A qubit prepared in one basis cannot always be read reliably by measuring it in the other. For example, when an ideal qubit prepared in |0⟩ is measured in the X basis, either result is possible with equal probability. The result does not reliably tell Bob which Z-basis bit Alice prepared.

This is why Bob’s measurement result at a mismatched-basis position is not used to build the sifted key. The result might happen to match Alice’s bit by chance, but the users cannot rely on it.

The platform may display the X/diagonal basis using an × icon. The symbol is a basis label, not a multiplication operation.

Think about it: Alice chooses X and Bob chooses Z. Should they keep that position for the shared key?$b$),

  ('bases-gates-circuits', 2, 'Normalisation: amplitudes and probabilities', $b$A quantum state must be normalised so that its possible measurement probabilities add up to 1, or 100%. This is a rule about the state of the qubit. It is different from QBER, which is an error rate calculated by comparing bits.

For a qubit written as α|0⟩ + β|1⟩, the measurement probabilities are found from the squared magnitudes of the amplitudes:

Probability of 0 = |α|²
Probability of 1 = |β|²

A valid normalised qubit state satisfies |α|² + |β|² = 1. If the amplitudes are real numbers, square each amplitude and add the results. (For complex amplitudes, use the squared magnitude.) The amplitude itself is not the probability; its squared magnitude gives the probability.

Example 1: the state (1/√2)|0⟩ + (1/√2)|1⟩ has probability 1/2 for result 0 and 1/2 for result 1. The probabilities add to 1.

Example 2: consider the unnormalised state 3|0⟩ + 4|1⟩. Square the amplitudes and add them: 3² + 4² = 9 + 16 = 25. The length is √25 = 5, so the normalisation constant is N = 1/5. The normalised state is (3/5)|0⟩ + (4/5)|1⟩. Its probabilities are 9/25 for result 0 and 16/25 for result 1; these add to 25/25 = 1.

A useful method is: square the amplitude magnitudes, add them, take the square root, then use the reciprocal as the normalisation constant.

Think about it: in the second example, why is the probability of measuring 1 equal to 16/25 rather than 4/5?$b$),

  ('bases-gates-circuits', 3, 'The gates used in BB84: X and H', $b$Quantum gates change a quantum state. Two gates are especially useful for understanding the BB84 circuit: X and H.

The X gate swaps the computational-basis states: it maps |0⟩ to |1⟩ and |1⟩ to |0⟩. It is sometimes described as a bit-flip gate. In the BB84 circuit, it can be used to prepare the value Alice wants to encode.

The Hadamard gate, written H, connects the Z and X bases. It transforms |0⟩ into |+⟩ and |1⟩ into |−⟩. This means the same underlying circuit can prepare X-basis states by applying H after setting the bit. To measure in the X basis using a standard computational-basis measurement, a circuit applies H before the measurement.

The name “X gate” and the name “X basis” are related to different ideas: the X gate is an operation, while the X basis is a set of states used for preparation or measurement.

The CNOT (or CX) gate acts on two qubits and is important in many quantum circuits, including circuits that create entanglement. It is not needed to explain the basic single-qubit BB84 encoding described in this module, but you may see it in broader quantum-circuit examples.

Think about it: which gate is used to transform |0⟩ into |+⟩?$b$),

  ('bases-gates-circuits', 4, 'Quantum circuits, shots and histograms', $b$A quantum circuit is a sequence of operations applied to qubits. In the BB84 experience, gates prepare a qubit in the chosen state and a measurement produces a classical result, such as 0 or 1.

Quantum measurement can be probabilistic. One circuit run produces one sampled outcome, not a complete view of every possible outcome. To estimate how often different results occur, the same circuit can be run repeatedly. Each individual run is called a shot.

For example, imagine running a circuit 100 times and observing result 0 in 49 shots and result 1 in 51 shots. A histogram would show two bars, one for each result, with heights based on the counts. The counts estimate the outcome distribution; small differences from run to run are normal for probabilistic measurements.

A simulator performs a model of circuit behaviour on classical computing resources. It is useful for learning and testing. A physical quantum processor may introduce additional noise and measurement errors, so its results can differ from an ideal simulator.

In Crack the Channel, the important first step is to connect a circuit operation to the BB84 action and then interpret the result. You do not need to write Python or understand advanced circuit code before learning the protocol.

Think about it: why is one shot not enough to estimate the distribution of measurement outcomes?$b$),

  -- ========================= Module 3: bb84-alice-bob =========================
  ('bb84-alice-bob', 0, 'What BB84 is designed to do', $b$BB84 is a quantum key distribution (QKD) protocol. It helps two parties, conventionally called Alice and Bob, establish a shared secret key while giving them a way to detect disturbance during transmission. The key is not the quantum message itself: it is a string of classical bits that may later be used by a cryptographic system.

The quantum part of BB84 uses qubits prepared and measured in different bases. The classical part lets Alice and Bob compare basis choices, estimate errors and coordinate later processing. Their classical discussion is public but must be authenticated so an attacker cannot silently alter the messages.

The main learning flow in Crack the Channel has five stages:

1. Preparation — Alice chooses bits and bases, then prepares the qubits.
2. Measurement — Bob independently chooses bases and measures the received qubits.
3. Basis reconciliation — Alice and Bob compare basis choices.
4. Error estimation — they compare a sample and calculate QBER.
5. Post-processing — if the exchange is acceptable, they correct remaining errors and reduce information that an eavesdropper may have learned.

Not every transmitted position becomes part of the shared key. After measurement, positions where Alice and Bob used different bases are discarded. The positions that remain form the sifted key, which is checked before a final key is accepted.

Think about it: why does BB84 need both quantum transmission and classical communication?$b$),

  ('bb84-alice-bob', 1, 'You are Alice: choose, encode and send', $b$Alice is the sender. For each position, she randomly chooses a classical bit (0 or 1) and a preparation basis (Z or X). She then prepares a qubit that represents the selected bit in that basis and sends it to Bob.

Using the convention in this pathway:

- Z basis: bit 0 is prepared as |0⟩; bit 1 is prepared as |1⟩.
- X basis: bit 0 is prepared as |+⟩; bit 1 is prepared as |−⟩.

Alice’s basis choice matters just as much as her bit choice. The same bit value can be represented by different quantum states depending on the basis. For example, bit 0 in the Z basis is |0⟩, whereas bit 0 in the X basis is |+⟩.

Alice does not send Bob a readable label saying “this is a 0 in the X basis.” She sends a quantum state. Bob must choose how to measure it without knowing Alice’s basis in advance.

In the interactive experience, take the Alice role and watch how changing the bit or basis changes the prepared state. The key learning point is not to memorise a long list of circuit operations; it is to understand that Alice chooses both a value and the basis used to encode it.

Think about it: can the same classical bit be prepared differently when Alice chooses a different basis?$b$),

  ('bb84-alice-bob', 2, 'You are Bob: measure independently', $b$Bob is the receiver. For each qubit, he independently chooses whether to measure in the Z basis or the X basis. He does not first ask Alice which basis she used, because that choice is not revealed until after the measurements.

If Bob’s basis matches Alice’s preparation basis, then in an ideal, noiseless exchange he obtains the bit Alice encoded. For example, if Alice prepares bit 1 in the Z basis and Bob measures Z, the result is 1. If Alice prepares bit 0 in the X basis and Bob measures X, the result is 0.

If Bob’s basis differs from Alice’s, the result is not reliably linked to Alice’s original bit. In an ideal BB84 model, the result is random relative to the bit she encoded. It may accidentally be the same value, but that coincidence does not make the position reliable for the key.

Bob records the classical measurement outcome and the basis he used for every position. Only after the measurements are complete do Alice and Bob compare their basis choices and decide which positions to retain.

Think about it: if Bob’s basis differs from Alice’s, can he tell from his result alone whether his bit is correct?$b$),

  ('bb84-alice-bob', 3, 'Basis reconciliation: compare the bases, not the key', $b$After Bob has measured the qubits, Alice and Bob communicate over an authenticated classical channel to compare the basis used for each position. They reveal basis choices for this comparison, not the secret bit values themselves.

For every position:

- If Alice’s basis and Bob’s basis match, mark the position KEEP.
- If their bases differ, mark the position DISCARD.

This step is called basis reconciliation. It is also commonly called sifting when the keep/discard decision is applied to the exchange. Sifting removes positions where Bob’s measurement did not reliably recover Alice’s encoded bit.

Example of basis comparison:

Position:      1   2   3   4   5   6
Alice basis:   Z   X   Z   X   X   Z
Bob basis:     Z   Z   Z   X   Z   Z
Decision:      K   D   K   K   D   K

Positions 1, 3, 4 and 6 are kept because the bases match. Positions 2 and 5 are discarded because the bases differ. The decision is based on the basis labels, not on whether the measured bits happen to look equal.

Publicly comparing basis labels does not mean publishing the secret key. Alice and Bob still keep the retained bit values private while they move on to error estimation.

Think about it: why should a mismatched-basis position be discarded even if Bob’s bit happens to equal Alice’s bit?$b$),

  ('bb84-alice-bob', 4, 'Worked example: build the sifted key', $b$Let’s complete the example by including Alice’s bits and Bob’s measurements. Assume there is no Eve and no noise, so positions with matching bases agree.

Position:      1   2   3   4   5   6
Alice bit:     1   0   1   0   1   1
Alice basis:   Z   X   Z   X   X   Z
Bob basis:     Z   Z   Z   X   Z   Z
Bob result:    1   1   1   0   0   1
Decision:      K   D   K   K   D   K

Now keep only positions 1, 3, 4 and 6. Alice’s retained bits are 1, 1, 0, 1. Bob’s retained bits are also 1, 1, 0, 1. The sifted key in this example is 1101.

Notice that positions 2 and 5 are removed even though Bob has a definite measurement result. Those measurements used a different basis from Alice’s preparation basis, so the results are not dependable for the key.

When Alice and Bob choose Z and X randomly and independently with equal probability, their bases match at about half of the positions on average. Sifting therefore usually shortens the stream. Real implementations can lose additional positions or use different sample and processing rules.

The sifted key is not automatically the final secret key. Alice and Bob must estimate errors first. They compare an agreed sample of sifted bits, calculate QBER and then decide whether to continue to post-processing.

Think about it: if Alice and Bob transmit 100 positions and about half their bases match, should you expect 100 bits in the sifted key?$b$),

  -- ========================== Module 4: eve-and-qber ==========================
  ('eve-and-qber', 0, 'Who is Eve, and why can measurement disturb a qubit?', $b$Eve is the conventional name for an eavesdropper. In BB84, Eve tries to learn about the quantum information Alice sends to Bob without being detected. She does not know Alice’s basis choice in advance.

A quantum measurement is not simply a harmless read of a value already written on the qubit. The outcome depends on the measurement basis, and measuring in a different basis can change the state. Because Eve does not know which basis Alice used, she risks disturbing the state when she tries to measure it.

Alice and Bob cannot normally identify Eve just by looking at a single qubit. Instead, after sifting, they compare a sample of bits and estimate how often their values disagree. If the observed error rate is higher than the protocol’s accepted limit, they have evidence that the exchange may have been disturbed and should not continue as though the key were safe.

A higher error rate does not uniquely identify Eve. Noise and imperfect devices can also cause errors. The key lesson is that BB84 makes interference detectable through the statistical effect it can have on the shared data.

Think about it: why does Eve’s lack of knowledge about Alice’s basis make an interception risky?$b$),

  ('eve-and-qber', 1, 'Intercept-resend: how Eve can leave a trace', $b$In an intercept-resend attack, Eve intercepts a qubit, measures it using a basis she chooses, and sends a replacement state to Bob based on her measurement result. Eve hopes to learn the encoded bit, but she has to choose a basis without knowing Alice’s basis.

If Eve happens to choose the same basis as Alice, her measurement can preserve the encoded value in the ideal case. If she chooses the other basis, her measurement result is random relative to Alice’s bit, and the state she forwards may no longer carry Alice’s original value reliably. If Bob later measures in Alice’s basis, the result can disagree with Alice’s bit.

For a full intercept-resend attack with random basis choices in an idealised BB84 model, the expected error rate on the sifted positions is about 25%. A simple intuition is:

- Eve chooses the wrong basis about half the time.
- When that happens, Bob has about a half chance of obtaining a bit that disagrees with Alice at a position that Alice and Bob later keep.
- One half × one half gives about one quarter, or 25%.

This is an expected statistical result, not a promise that every finite run will show exactly 25%. Short runs can vary because the choices and measurements are probabilistic.

Think about it: if Eve intercepts only some of the qubits, should you automatically expect the same QBER as a full intercept-resend attack?$b$),

  ('eve-and-qber', 2, 'What QBER measures: count, divide, convert', $b$Quantum Bit Error Rate (QBER) is the fraction of compared sifted-key bits that disagree between Alice and Bob. It is an error-rate measure, not the percentage of qubits Eve intercepted and not the probability that any one particular bit is wrong.

The basic calculation is:

QBER = number of disagreeing bits ÷ number of bits compared
QBER percentage = QBER × 100%

Worked example: Alice and Bob compare 20 bits from their sifted key. Three positions disagree.

1. Count the disagreements: 3.
2. Count the bits compared: 20.
3. Divide: 3 ÷ 20 = 0.15.
4. Convert to a percentage: 0.15 × 100% = 15%.

The QBER for this sample is 15%.

In the standard learning flow, Alice and Bob reveal a selected sample of sifted-key bits to estimate the error rate. Because those sample values are made public during checking, they are not retained as secret key bits. The rest of the sifted key remains available for later processing if the exchange passes the security checks.

Use the correct denominator. Calculate QBER from the bits that were actually compared, not from every qubit initially transmitted and not from the number of bases that matched.

Think about it: if 4 of 25 compared bits disagree, what is the QBER percentage?$b$),

  ('eve-and-qber', 3, 'Interpret QBER: disturbance, noise and thresholds', $b$A higher QBER means that a larger fraction of the compared sifted-key bits disagree. In a BB84 learning activity, comparing an exchange without Eve against one with Eve can make the relationship between interception and additional errors easier to see.

However, a non-zero QBER does not automatically prove that Eve is present. Real quantum hardware can introduce noise and measurement errors, and finite samples can vary by chance. QBER is evidence about the exchange’s error level; it is not a label that identifies the cause of every error.

The project’s BB84 learning notes use approximately 25% as the idealised expected QBER for a full intercept-resend attack and approximately 11% as a teaching reference threshold for the post-processing discussion. These figures have different meanings: about 25% describes an expected attack outcome in a simplified model, while about 11% is the project’s illustrative threshold reference.

Do not treat 11% as a universal safety limit for every QKD implementation. Real security decisions depend on the protocol, assumptions, noise model, sample size and security analysis. In this platform, follow the threshold specified by the current learning activity and interpret the result within that teaching context.

If the observed QBER is above the agreed limit, Alice and Bob should not accept the key in the simplified learning flow. If it is below the limit, that is not the end of the protocol: error correction and privacy amplification are still important.

Think about it: why is “QBER is high” a safer conclusion than “QBER proves Eve was present”?$b$),

  ('eve-and-qber', 4, 'Post-processing: correct, shorten or abort', $b$After sifting and error estimation, Alice and Bob decide whether to continue. If the estimated error rate is too high for the agreed protocol, they abandon the exchange and do not use the resulting string as a secret key.

If the exchange passes the error-estimation step, they still need post-processing:

- Error correction helps Alice and Bob reconcile remaining differences so their final bit strings agree. Some information may be revealed while they check and correct errors.
- Privacy amplification shortens the reconciled string using a carefully chosen process. The goal is to reduce any partial information an eavesdropper may have learned, producing a shorter but more secure final key.
- Authentication protects the classical messages used during the protocol from being silently altered or impersonated.

The key stages therefore fit together: prepare quantum states, measure them, sift the matching-basis positions, estimate errors with QBER, then either abort or proceed with post-processing. Sifting removes unreliable positions; QBER checks a sample for disagreement; post-processing addresses remaining errors and information leakage.

The platform’s interactive result is a teaching model of these ideas. A successful simulation helps explain the protocol, but it should not be confused with a certification that a real-world QKD deployment is secure.

Think about it: what is the difference between sifting and error correction?$b$),

  -- ====================== Module 5: qiskit-bb84-practice ======================
  ('qiskit-bb84-practice', 0, 'What is Qiskit and what does it do here?', $b$Qiskit is an open-source software development kit (SDK) for quantum computing. It provides tools for creating, manipulating and working with quantum circuits.

A quantum circuit describes a sequence of operations performed on qubits. These operations can include quantum gates, which transform quantum states, and measurements, which produce classical results.

In Crack the Channel, Qiskit supports the quantum-circuit processing behind the BB84 learning experience. Instead of watching a prerecorded animation, you interact with the protocol and observe results produced by the underlying simulation.

You do not need to be an advanced programmer to complete the learning activities. The interface allows you to concentrate on the important concepts: how Alice prepares quantum information, how Bob measures it, and how Eve's interference can affect the exchange.

Understanding the relationship between the interface and the circuit is useful because the displayed outcome is connected to the operations performed during the simulation.

What should you focus on?

Pay attention to the choices made during each stage, the results produced by the circuit, and the explanations provided by the platform. These will help you connect the quantum concepts you have learned with their practical application.

Key terms: Qiskit, SDK, quantum circuit, quantum gate, simulation.$b$),

  ('qiskit-bb84-practice', 1, 'From circuit execution to measurement results', $b$A quantum circuit can produce different measurement outcomes depending on the state being measured, the measurement basis and the probabilistic behaviour of the quantum system.

One circuit execution produces a single sample of the measurement outcomes for that run. To understand the overall behaviour of a circuit, it is common to repeat the execution many times.

Each repetition is called a shot. When a circuit is executed over many shots, the results can be grouped into counts that show how frequently each outcome occurred.

For example, imagine repeatedly measuring a qubit prepared in an equal superposition of 0 and 1 using the Z basis. Under ideal conditions, the results should approach an approximately equal distribution as the number of repetitions increases. A small sample may be uneven, however, because each measurement produces a probabilistic outcome.

This distinction is important: a single result tells you what happened in one run, while repeated runs help you understand the distribution of possible outcomes.

How does this relate to BB84?

During a BB84 exchange, Alice's preparation choices, Bob's measurement choices and any interference from Eve affect the results. The simulation gathers those outcomes so you can examine the exchange and understand what happened.

When you inspect the results, look beyond an individual bit. Consider the pattern of outcomes and how it relates to the choices made during the protocol.

Key terms: Circuit execution, shot, measurement outcome, counts, probability.$b$),

  ('qiskit-bb84-practice', 2, 'Simulators and real quantum hardware', $b$Quantum circuits can be executed using a simulator or a physical quantum processor.

A quantum simulator uses classical computing resources to model quantum-circuit behaviour. Simulators are useful for learning, testing, and debugging because they allow quantum circuits to be explored without requiring access to a physical quantum device.

A quantum processing unit (QPU), on the other hand, is a physical device that processes quantum information. Real quantum hardware can introduce imperfections, including gate errors and measurement errors. These effects may cause observed results to differ from ideal predictions.

For example, a simple circuit may be expected to produce a particular result under ideal conditions. When noise is present, the measured result may occasionally differ from that expectation.

A difference in measurement results does not automatically mean that a circuit is incorrectly designed or that someone is eavesdropping. You need to consider the circuit, its measurement basis, the sample size and the possible sources of error.

What does this mean for Crack the Channel?

The project uses Qiskit-based circuit processing with a compatible simulator; access to physical IBM Quantum hardware is not required to complete the core learning experience.

The important learning objective is to understand how BB84 works and how interference can be detected, rather than to assume every observed result comes from a physical quantum processor.

Remember: A simulator models quantum behaviour, while a physical QPU can introduce additional hardware-related effects.

Key terms: Simulator, QPU, quantum hardware, noise, measurement error.$b$),

  ('qiskit-bb84-practice', 3, 'Complete the BB84 learning journey', $b$You have now explored the concepts needed to understand BB84. The next step is to connect them through a complete exchange.

The protocol can be understood as five stages.

1. Preparation — Alice randomly chooses bit values and preparation bases, prepares the corresponding quantum states, and sends them towards Bob.
2. Measurement — Bob independently chooses measurement bases and measures the states he receives.
3. Basis reconciliation — Alice and Bob compare their basis choices over a classical channel. They keep positions where the bases match and discard positions where they differ. The retained bits form the sifted key.
4. Error estimation — Alice and Bob compare a selected sample of their sifted bits and calculate the Quantum Bit Error Rate (QBER). This provides evidence about errors and possible disturbance during the exchange.
5. Post-processing — In a complete QKD workflow, the users apply appropriate security rules. Depending on the estimated error rate and the protocol conditions, they may abort or proceed with processes such as error correction and privacy amplification.

Your practical challenge:

First, complete an exchange without Eve. Observe the basis choices, retained positions, resulting sifted key and error-rate feedback.

Next, enable Eve and repeat the exchange. Compare the results with your first run. Look for changes in the measured bits and the estimated QBER.

Ask yourself:

- Which positions were retained during sifting, and why?
- How did the results change when Eve was enabled?
- What does the observed QBER tell you, and what can it not prove on its own?
- Why should Alice and Bob avoid accepting a key without considering the observed errors and the protocol's security rules?

Important: A learning simulation demonstrates the principles of BB84. Its displayed outcome should not be treated as a guarantee that a real-world communication session is secure.

Key terms: Preparation, measurement, basis reconciliation, sifted key, QBER, error correction, privacy amplification.$b$)

) as p(slug, position, title, body)
join modules m on m.slug = p.slug;


-- 3. Quiz questions + answer keys
with v(slug, position, prompt, options, explanation, correct_index) as (values

  -- ========================= Module 1: quantum-basics =========================
  ('quantum-basics', 0, $q$What is the basic unit of classical information?$q$,
   $j$["Qubit", "Bit", "Quantum gate", "Measurement"]$j$,
   $e$A classical bit is the basic unit of classical information and represents 0 or 1.$e$, 1),
  ('quantum-basics', 1, $q$What is a qubit?$q$,
   $j$["A network packet", "A password", "The basic unit of quantum information", "A physical processor"]$j$,
   $e$A qubit is the basic unit used to represent quantum information.$e$, 2),
  ('quantum-basics', 2, $q$Which statement best describes superposition?$q$,
   $j$["A quantum state combining basis states", "One measurement showing every possible result", "A database state", "A type of network noise"]$j$,
   $e$Superposition describes a quantum state, not a display of all possible outcomes in a single measurement.$e$, 0),
  ('quantum-basics', 3, $q$What does a single measurement of a qubit produce?$q$,
   $j$["Every possible result", "A new copy of the qubit", "A list of basis choices", "One classical outcome"]$j$,
   $e$One measurement produces a classical result for the chosen measurement basis.$e$, 3),
  ('quantum-basics', 4, $q$An ideal qubit in the state |+⟩ is measured in the Z basis. What are the outcome probabilities?$q$,
   $j$["Always 0", "50% for 0 and 50% for 1", "Both outcomes simultaneously", "Always 1"]$j$,
   $e$The state |+⟩ produces either outcome with equal probability when measured in the Z basis under ideal conditions.$e$, 1),
  ('quantum-basics', 5, $q$What is measurement disturbance?$q$,
   $j$["A circuit running faster", "The removal of all errors", "Measurement changing a quantum state", "Basis choices becoming secret"]$j$,
   $e$Measuring a quantum state can change its subsequent behaviour.$e$, 2),
  ('quantum-basics', 6, $q$Which statement about quantum computers is most accurate?$q$,
   $j$["They are faster for every task", "They replace classical computers", "They are used only for encryption", "They use a different computational approach that may help with selected problems"]$j$,
   $e$Quantum computers use a different computational approach and may be useful for particular problem types; they are not universally superior to classical computers.$e$, 3),
  ('quantum-basics', 7, $q$What does QKD stand for?$q$,
   $j$["Quantum Key Distribution", "Quantum Kernel Design", "Quick Key Database", "Quantum Knowledge Dashboard"]$j$,
   $e$QKD stands for Quantum Key Distribution, a method for helping parties establish shared secret key material.$e$, 0),
  ('quantum-basics', 8, $q$In BB84, who represents the potential eavesdropper?$q$,
   $j$["Alice", "Bob", "Eve", "The quantum gate"]$j$,
   $e$Eve is the conventional name used for the eavesdropper in cryptography and quantum key distribution.$e$, 2),
  ('quantum-basics', 9, $q$Why can quantum measurement behaviour help BB84 detect interference?$q$,
   $j$["Every transmitted bit is public", "An attempt to measure an unknown state can disturb it and contribute to detectable errors", "Encryption prevents every attack", "Quantum hardware has no noise"]$j$,
   $e$An eavesdropper who measures a quantum state using an incompatible basis can disturb the exchange, potentially introducing detectable errors.$e$, 1),

  -- ====================== Module 2: bases-gates-circuits ======================
  ('bases-gates-circuits', 0, $q$Which two states define the Z basis?$q$,
   $j$["|+⟩ and |−⟩", "|0⟩ and |1⟩", "|00⟩ and |11⟩", "|i⟩ and |−i⟩"]$j$,
   $e$The Z or computational basis uses |0⟩ and |1⟩.$e$, 1),
  ('bases-gates-circuits', 1, $q$Which two states define the X basis?$q$,
   $j$["|0⟩ and |1⟩", "|00⟩ and |11⟩", "|+⟩ and |−⟩", "The H and X gates"]$j$,
   $e$The X or diagonal basis uses |+⟩ and |−⟩.$e$, 2),
  ('bases-gates-circuits', 2, $q$In the encoding convention used here, which state represents bit 1 prepared in the X basis?$q$,
   $j$["|+⟩", "|1⟩ only", "|−⟩", "|0⟩"]$j$,
   $e$For this BB84 encoding, bit 0 maps to |+⟩ and bit 1 maps to |−⟩ in the X basis.$e$, 2),
  ('bases-gates-circuits', 3, $q$What does normalisation ensure?$q$,
   $j$["There is only one possible state", "The qubit always measures 0", "The squared magnitudes of the amplitudes add up to 1", "Every amplitude equals 1"]$j$,
   $e$A valid state has total measurement probability 1.$e$, 2),
  ('bases-gates-circuits', 4, $q$For the unnormalised state 3|0⟩ + 4|1⟩, what is the normalisation constant?$q$,
   $j$["1/25", "1/5", "5", "1/7"]$j$,
   $e$The squared amplitudes sum to 9 + 16 = 25; the norm is 5, so the reciprocal is 1/5.$e$, 1),
  ('bases-gates-circuits', 5, $q$After normalising 3|0⟩ + 4|1⟩ to (3/5)|0⟩ + (4/5)|1⟩, what is the probability of measuring 1?$q$,
   $j$["4/5", "9/25", "16/25", "1/5"]$j$,
   $e$Probability is the squared magnitude of the amplitude: (4/5)² = 16/25.$e$, 2),
  ('bases-gates-circuits', 6, $q$What does the Hadamard (H) gate do in the basic BB84 circuit?$q$,
   $j$["It connects the Z and X bases", "It stores a learner profile", "It measures QBER directly", "It removes all noise"]$j$,
   $e$H maps Z-basis states to the corresponding X-basis states and is also used before X-basis measurement.$e$, 0),
  ('bases-gates-circuits', 7, $q$What does the X gate do to |0⟩?$q$,
   $j$["Leaves it unchanged in every case", "Changes it to |1⟩", "Measures it", "Turns it into a database record"]$j$,
   $e$The X gate swaps |0⟩ and |1⟩.$e$, 1),
  ('bases-gates-circuits', 8, $q$What is one shot?$q$,
   $j$["One run of a circuit", "A complete learning module", "A type of basis", "A QBER threshold"]$j$,
   $e$A shot is one individual circuit execution that produces a measurement sample.$e$, 0),
  ('bases-gates-circuits', 9, $q$If Alice and Bob use different BB84 bases, what should they expect in the ideal model?$q$,
   $j$["Bob always recovers Alice’s bit", "The bases automatically become equal", "Bob’s result does not reliably reveal Alice’s bit", "The bit is publicly announced"]$j$,
   $e$A mismatched measurement basis produces an outcome that is random relative to the bit Alice encoded; the position is discarded during sifting.$e$, 2),

  -- ========================= Module 3: bb84-alice-bob =========================
  ('bb84-alice-bob', 0, $q$What is the main purpose of BB84?$q$,
   $j$["To make every message public", "To help establish a shared secret key while allowing disturbance to be detected", "To replace all classical computers", "To create user accounts"]$j$,
   $e$BB84 is a quantum key distribution protocol that supports shared-key establishment and disturbance detection.$e$, 1),
  ('bb84-alice-bob', 1, $q$What does Alice choose for each position?$q$,
   $j$["Only Bob’s measurement result", "A password and a server", "A bit and a preparation basis", "The final QBER"]$j$,
   $e$Alice chooses the bit to encode and the basis used to prepare the qubit.$e$, 2),
  ('bb84-alice-bob', 2, $q$In the convention used here, how is bit 0 encoded in the X basis?$q$,
   $j$["As |−⟩", "As |+⟩", "As |1⟩ only", "As a public message"]$j$,
   $e$The X-basis mapping is bit 0 → |+⟩ and bit 1 → |−⟩.$e$, 1),
  ('bb84-alice-bob', 3, $q$When does Bob measure each qubit?$q$,
   $j$["Before Alice prepares it", "Only after Alice reveals the correct basis", "After choosing his own basis independently", "Only when Eve is enabled"]$j$,
   $e$Bob independently chooses a basis before Alice and Bob reconcile the basis choices.$e$, 2),
  ('bb84-alice-bob', 4, $q$What should happen in an ideal exchange when Alice and Bob use the same basis?$q$,
   $j$["Their bit values agree at that position", "The position must be discarded", "The bit becomes public", "QBER must be 50%"]$j$,
   $e$Matching bases recover the encoded bit in the ideal, noiseless protocol.$e$, 0),
  ('bb84-alice-bob', 5, $q$During basis reconciliation, what do Alice and Bob compare publicly?$q$,
   $j$["Their full secret bit strings", "Their passwords", "Their basis choices", "Their database records"]$j$,
   $e$They compare basis choices to identify matches without revealing the key bits.$e$, 2),
  ('bb84-alice-bob', 6, $q$Which positions are kept during sifting?$q$,
   $j$["Every position", "Only positions where Alice’s and Bob’s bases match", "Only positions where the bits differ", "Only positions measured by Eve"]$j$,
   $e$Sifting keeps matching-basis positions and discards mismatched-basis positions.$e$, 1),
  ('bb84-alice-bob', 7, $q$Alice bases are Z X Z X X Z and Bob bases are Z Z Z X Z Z. Which positions are kept?$q$,
   $j$["2 and 5", "1, 2, 3 and 4", "1, 3, 4 and 6", "All six positions"]$j$,
   $e$The bases match at positions 1, 3, 4 and 6.$e$, 2),
  ('bb84-alice-bob', 8, $q$Why discard a mismatched-basis position even if Bob’s measured bit happens to equal Alice’s bit?$q$,
   $j$["Because Bob’s result is not reliably linked to Alice’s bit", "Because all matching values are public", "Because a mismatch proves the account is invalid", "Because sifting requires exactly two bits"]$j$,
   $e$With different bases, the measurement result may match by chance but is not dependable for the key.$e$, 0),
  ('bb84-alice-bob', 9, $q$Is the sifted key automatically the final secret key?$q$,
   $j$["Yes, no checks are needed", "No; Alice and Bob estimate errors and apply post-processing before accepting a key", "Yes, if the key has an even number of bits", "No; they must publish it"]$j$,
   $e$Error estimation and post-processing follow sifting before a final key is accepted.$e$, 1),

  -- ========================== Module 4: eve-and-qber ==========================
  ('eve-and-qber', 0, $q$Who is Eve in BB84?$q$,
   $j$["The sender", "The receiver", "The eavesdropper", "The quantum processor"]$j$,
   $e$Eve is the conventional name for the eavesdropper.$e$, 2),
  ('eve-and-qber', 1, $q$Why can Eve’s measurement disturb the exchange?$q$,
   $j$["Eve always knows Alice’s basis", "Eve may measure in a basis different from Alice’s", "Bob does not measure qubits", "QBER is a user score"]$j$,
   $e$Eve does not know Alice’s basis in advance; a mismatched measurement can disturb the state.$e$, 1),
  ('eve-and-qber', 2, $q$What happens in an intercept-resend attack?$q$,
   $j$["Eve intercepts, measures and sends a replacement state to Bob", "Bob sends his password to Eve", "Alice publishes her bit string", "Eve only reads the public basis list"]$j$,
   $e$Eve measures the intercepted qubit and forwards a replacement state based on her result.$e$, 0),
  ('eve-and-qber', 3, $q$What does QBER measure?$q$,
   $j$["The number of users online", "The fraction of compared sifted-key bits that disagree", "The number of qubits in a processor", "The fraction of bases that match"]$j$,
   $e$QBER is computed from mismatches among the bits actually compared.$e$, 1),
  ('eve-and-qber', 4, $q$Three out of 20 compared bits disagree. What is the QBER?$q$,
   $j$["3%", "10%", "15%", "20%"]$j$,
   $e$3 ÷ 20 = 0.15; multiplying by 100 gives 15%.$e$, 2),
  ('eve-and-qber', 5, $q$Does a non-zero QBER prove that Eve was present?$q$,
   $j$["Yes, always", "No; noise and measurement errors can also contribute", "Only if the user selected X", "Only when the QBER is exactly 25%"]$j$,
   $e$QBER indicates disagreement, but it does not uniquely identify its cause.$e$, 1),
  ('eve-and-qber', 6, $q$What QBER is expected in the project’s idealised full intercept-resend teaching example?$q$,
   $j$["About 0%", "About 11%", "About 25%", "About 100%"]$j$,
   $e$The supplied project notes describe an expected QBER of about 25% for a full intercept-resend attack in the idealised model.$e$, 2),
  ('eve-and-qber', 7, $q$How should the project’s approximately 11% threshold be described?$q$,
   $j$["A universal limit for every QKD system", "A teaching reference used in the project, not a universal rule", "The percentage of qubits Alice sends", "The number of mismatched bases"]$j$,
   $e$The project notes use about 11% as an illustrative threshold reference; real security limits depend on the protocol and assumptions.$e$, 1),
  ('eve-and-qber', 8, $q$Why are the sample bits revealed during QBER estimation not kept secret?$q$,
   $j$["Their values have been made public during checking", "They have no measurement result", "They are all mismatched-basis positions", "They are automatically encrypted by Eve"]$j$,
   $e$Once sample values are disclosed, those positions are not retained as secret key material.$e$, 0),
  ('eve-and-qber', 9, $q$What does post-processing include when the error estimate is acceptable?$q$,
   $j$["Only basis reconciliation", "Publishing the full key", "Error correction and privacy amplification", "Repeating measurements until no errors appear"]$j$,
   $e$Error correction reconciles bit differences; privacy amplification reduces any partial information an eavesdropper may have.$e$, 2),

  -- ====================== Module 5: qiskit-bb84-practice ======================
  ('qiskit-bb84-practice', 0, $q$What is Qiskit?$q$,
   $j$["A QKD protocol", "An open-source software development kit for quantum computing", "A database engine", "A physical quantum processor"]$j$,
   $e$Qiskit provides open-source software tools for creating and working with quantum circuits and quantum computing workflows.$e$, 1),
  ('qiskit-bb84-practice', 1, $q$What does a quantum circuit describe?$q$,
   $j$["User progress", "Password storage", "A QBER threshold", "A sequence of operations performed on qubits"]$j$,
   $e$A quantum circuit describes operations performed on qubits, including quantum gates and measurements.$e$, 3),
  ('qiskit-bb84-practice', 2, $q$In repeated quantum-circuit execution, what is a shot?$q$,
   $j$["A completed learning module", "A measurement basis", "One execution of a circuit", "A quantum gate"]$j$,
   $e$A shot is one execution used to obtain a sample of measurement outcomes.$e$, 2),
  ('qiskit-bb84-practice', 3, $q$Why might a quantum circuit be executed many times?$q$,
   $j$["To eliminate every error", "To estimate the distribution of measurement outcomes", "To create additional physical qubits", "To avoid measurement"]$j$,
   $e$Repeated executions help reveal the frequency and distribution of measurement outcomes.$e$, 1),
  ('qiskit-bb84-practice', 4, $q$What is a quantum simulator?$q$,
   $j$["Physical quantum hardware", "A classical computing system that models quantum-circuit behaviour", "A secure database", "A guarantee of error-free results"]$j$,
   $e$A quantum simulator models quantum-circuit behaviour using classical computing resources.$e$, 1),
  ('qiskit-bb84-practice', 5, $q$Why might results from a real quantum processing unit (QPU) differ from an ideal simulation?$q$,
   $j$["Gate imperfections, measurement errors and hardware noise", "User account settings", "Sifting always fails on hardware", "Qiskit cannot execute circuits"]$j$,
   $e$Physical quantum hardware can introduce imperfections and noise that affect the observed measurement outcomes.$e$, 0),
  ('qiskit-bb84-practice', 6, $q$Which sequence matches the five-stage BB84 learning flow?$q$,
   $j$["Login → Logout → Install → Delete → Repeat", "Measurement → Login → Sifting → Exit → Install", "Preparation → Measurement → Basis reconciliation → Error estimation → Post-processing", "Eve → Registration → QBER → Logout → Completion"]$j$,
   $e$The five stages follow the BB84 exchange from Alice's preparation through measurement, sifting, error estimation and post-processing.$e$, 2),
  ('qiskit-bb84-practice', 7, $q$What happens during basis sifting?$q$,
   $j$["Alice and Bob publish their secret key", "All bits are discarded", "All transmitted bits are automatically kept", "Matching-basis positions are kept and mismatched-basis positions are discarded"]$j$,
   $e$During sifting, Alice and Bob retain positions where their basis choices match and discard positions where their choices differ.$e$, 3),
  ('qiskit-bb84-practice', 8, $q$Why should a learner compare a BB84 exchange with and without Eve?$q$,
   $j$["To compare baseline behaviour with the effect of possible interference", "To prove every QBER increase means Eve is present", "To create more qubits", "To avoid basis reconciliation"]$j$,
   $e$Comparing both scenarios helps learners observe how interference may affect the measurement results and QBER.$e$, 0),
  ('qiskit-bb84-practice', 9, $q$What does QBER tell the learner?$q$,
   $j$["The exact identity of an attacker", "The fraction of compared bits that disagree, providing evidence of errors but not proving Eve's presence on its own", "A guaranteed security result", "The total number of circuit shots"]$j$,
   $e$QBER measures the fraction of compared bits that disagree. Errors can result from eavesdropping or other sources, such as noise, so QBER alone does not establish the cause.$e$, 1)

),
inserted as (
  insert into quiz_questions (module_id, position, prompt, options, explanation)
  select m.id, v.position, v.prompt, v.options::jsonb, v.explanation
  from v
  join modules m on m.slug = v.slug
  returning id, module_id, position
)
insert into answer_keys (question_id, correct_index)
select i.id, v.correct_index
from inserted i
join modules m on m.id = i.module_id
join v on v.slug = m.slug and v.position = i.position;

commit;
