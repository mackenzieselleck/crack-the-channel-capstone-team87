# 013 Problem Construction
**Date:** 27.09.26
**Status:** Pending - on Team and Client approval

## Context
Crack the Channel will be used to teach beginners complicated content across multiple disciplines (eg: computer science, mathematics, physics) using . Therefore, plain language and step by step methods will be needed to ensure user understanding. Randomly generated circuits can produce messy amplitudes that cannot reasonably be worked out by hand, and their simplest equivalent circuit is not always known. Learning modules will also use particular notation (eg: 1/√2 and Qiskit's qubit ordering), and therefore challenges should match it for consistency.

## Options Considered
- Option A: Generate random circuits and states. Use Qiskit's transpiler to find simplified forms
- Option B: Build problems backwards from known results and restrict inputs to values beginners would be able to compute by hand

## Decision
Option B:
- Gate simplification problems should be built by chaining together known identities (eg: HH = I, HXH = Z, SS = Z, CNOT·CNOT = I, and the H-sandwich that reverses a CNOT). A small search can then confirm the shortest reference answer.
- State evolution uses only H, X, Z and CNOT, keeping amplitudes within {0, ±1, ±1/√2, ±1/2}range.
- Normalisation problems use amplitude sets that give tidy answers (eg: 1/5, 1/3, 1/√2, 1/2).
- Generators retry with a new sub seed if an instance lacks enough distinct distractors.
- Output uses the modules' mathematical notation, round bracket matrices, and Qiskit ordering (qubit 0 is the rightmost bit).

## Rationale
Option A could end up producing problems that would be unsuitable for beginners or that have no guaranteed answer. Option B guarantees that every problem is solvable by hand and has a known answer. This will ensure that notation stays consistent with what users have previously learnt.

## Consequences
Every problem is fair and consistent with modules content, but the variety of problems will be smaller. The shortest answer search only covers short circuits, so a user who finds a shorter circuit than the reference will still be marked as correct. 
