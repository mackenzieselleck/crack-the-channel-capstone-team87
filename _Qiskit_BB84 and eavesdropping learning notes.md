

<!-- Start of picture text -->
Orthogonal Non-orthogonal<br>at right angles at a shallow angle<br>Perfectly distinguishable Overlap — cannot be told apart with certainty<br><!-- End of picture text -->

## <u>BB84 vs classical key distribution:</u> 

BB84 utilises quantum mechanics allowing detection of eavesdropping by physics of quantum measurement and disturbance rather than trust / computational difficulty. Classical key exchange leverages difficulty to do significantly large computations while BB84 relies on physics, i.e. eavesdropping is detected via quantum measurement and disturbance. 

## <u>How BB84 works:</u> 

BB84 is a method of creating a shared secret key between two users. The key is a random string of bits called qubits. The protocol’s goal is to prevent eavesdropping during key sharing. It relies on the fact that certain quantum states cannot be perfectly distinguished so an eavesdropper cannot intercept without leaving a trace. 

- A qubit is a single quantum particle, e.g. a photon whose state carries one bit of information. The qubit is essentially a carrier and the bit is the value it encodes. 

- A basis is the encoding scheme used to represent the qubit. 

   - BB84 uses two incompatible bases, Z and X: a qubit prepared in one scheme cannot be reliably read using the other. 

   - Measuring in the wrong basis produces a random result, which is how the eavesdropper is trapped. 

1. Preparation - Alice generates two random strings: one of bits (0s and 1s) and one of bases (Z or X). For each bit, she encodes it using the corresponding basis and sends the resulting qubit to Bob. 

2. Measurement - For each qubit he receives, Bob randomly picks a basis (Z or X) to measure it. When his choice happens to match Alice's, he reads the correct bit; when it doesn't, his result is effectively random. 

3. Basis reconciliation - Over a public authenticated channel, Bob announces which basis he used for each qubit, and Alice replies which of those matched hers. They discard every position where the bases differed and keep the rest. This surviving string is the _sifted key_ . 

4. Error estimation - They publicly compare a small sample of their sifted-key bits to measure the Quantum Bit Error Rate (QBER) - the fraction that disagree. A high error rate signals eavesdropping (or excessive noise), so if it exceeds a safe threshold, they abandon the key and start over. 

5. Post processing - For a key that passes, remaining mismatches are corrected using standard error-correcting codes. Universal hashing then shortens the key to 

squeeze out any partial information an eavesdropper might have gathered, and all public messages are authenticated to ensure no one tampered with them. 

## <u>Error rate/QBER:</u> 

QBER = (number of disagreeing bits) / (number of bits compared) in the sifted key. QBER is a measure of security, as any eavesdropping attempt would disturb the correlation between Alice’s and Bob’s strings. 

A QBER of ~25% - produced by a full intercept-resend attack 

- Eve is unaware of Alice’s basis so she picks wrong half the time 

- When Eve picks incorrectly, Bob only has a 50% chance of recovering the original bit 

- The double mismatch yields a ~25% error rate on the sifted positions, this acts as Eve’s fingerprint 

A QBER of ~11% - the security threshold 

- Maximum QBER at which Alice and Bob can create a secure key after post-processing. 

A partial or subtle attack may push the QBER above 11% without reaching 25%, it is best to estimate QBER in both bases 

## <u>Why it’s secure:</u> 

BB84’s security comes from quantum mechanics- eavesdropping produces detectable errors due to measurement disturbance. 

- <mark>No-cloning theorem:</mark> Unknown quantum states are unable to be copied, preventing bypassing of disturbance. 

- <mark>Measurement disturbance:</mark> any incorrect measurement changes the state, creating errors detectable by the two users in communication (Alice and Bob) via QBER. Non orthogonal states cannot be perfectly distinguished, since Eve cannot perfectly distinguish BB84’s states apart, any attempt to read them risks guessing wrong and disturbing them. 

# <mark>Qiskit fundamentals</mark> 

Qiskit is an open-source SDK for working with quantum computers at the level of extended quantum circuits, operators, and primitives. 

Each step of BB84 is a simple circuit operation and can be simulated on Qiskit. 

References: 

Bennett, C. H., & Brassard, G. (2014). Quantum cryptography: Public key distribution and coin tossing. _Theoretical Computer Science, 560_ , 7–11. <u>https://doi.org/10.1016/j.tcs.2014.05.025</u> 

IBM Quantum. (n.d.). _Introduction to Qiskit_ . IBM Quantum Documentation. Retrieved August 23, 2026, from <u>https://quantum.cloud.ibm.com/docs/en/guides/tools-intro</u> 

QETEL Lab. (n.d.). _The BB84 protocol_ . Quantum Economics & Technology Experience - Lab. Retrieved August 23, 2026, from https://qetel.usal.es/blog/bb84 <u>protocol</u> 

Rath, J., Panth, P., & Bhaskar, P. S. N. (2026). _Quantum bit error rate analysis in BB84 quantum key distribution: Measurement, statistical estimation, and eavesdropping detection_ . arXiv. <u>https://arxiv.org/abs/2603.27278</u> 

Servifyspheresolutions. (2025, September 18). _BB84 protocol explained: Theory, math, security & practical QKD_ . SSS Quantum. 

<u>https://medium.com/sss-quantum/bb84-protocol-explained-theory-math-security-practical</u> -qkd-d3d6bb4efa6e 

