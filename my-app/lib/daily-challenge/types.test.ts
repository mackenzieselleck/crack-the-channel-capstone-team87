import { describe, expect, it } from 'vitest';
import {
  HINT_COUNT,
  HINT_XP_PENALTY,
  MAX_ATTEMPTS,
  TIER_LABEL,
  TYPE_LABEL,
  xpFor,
  type ChallengeType,
  type Difficulty,
} from './types';

// Expected rewards are fixed acceptance examples from ADR-014 and the QA
// report. Do not calculate them from the implementation's formula here.
const rewardCases: { name: string; tier: Difficulty; hints: number; attempt: number; expected: number }[] = [
  { name: 'tier 1 first attempt without hints', tier: 1, hints: 0, attempt: 1, expected: 50 },
  { name: 'tier 2 first attempt without hints', tier: 2, hints: 0, attempt: 1, expected: 100 },
  { name: 'tier 3 first attempt without hints', tier: 3, hints: 0, attempt: 1, expected: 150 },
  { name: 'one hint before a tier 1 success', tier: 1, hints: 1, attempt: 1, expected: 40 },
  { name: 'two hints before a tier 1 success', tier: 1, hints: 2, attempt: 1, expected: 30 },
  { name: 'all three hints before a tier 1 success', tier: 1, hints: 3, attempt: 1, expected: 20 },
  { name: 'tier 2 success on the second attempt', tier: 2, hints: 0, attempt: 2, expected: 85 },
  { name: 'tier 2 success on the third attempt', tier: 2, hints: 0, attempt: 3, expected: 70 },
  { name: 'tier 2 with two hints on the second attempt', tier: 2, hints: 2, attempt: 2, expected: 65 },
  { name: 'tier 3 with one hint on the second attempt', tier: 3, hints: 1, attempt: 2, expected: 125 },
  { name: 'tier 3 with two hints on the third attempt', tier: 3, hints: 2, attempt: 3, expected: 100 },
  { name: 'tier 3 with all hints on the final attempt', tier: 3, hints: 3, attempt: 3, expected: 90 },
  { name: 'tier 1 exactly at the 10 XP floor', tier: 1, hints: 1, attempt: 3, expected: 10 },
  { name: 'tier 1 deductions that would otherwise give zero XP', tier: 1, hints: 2, attempt: 3, expected: 10 },
  { name: 'tier 1 deductions that would otherwise give negative XP', tier: 1, hints: 3, attempt: 3, expected: 10 },
];

describe('Daily Challenge reward helper', () => {
  it.each(rewardCases)('$name gives $expected XP', ({ tier, hints, attempt, expected }) => {
    expect(xpFor(tier, hints, attempt)).toBe(expected);
  });
});

describe('shared Daily Challenge contracts', () => {
  it('exposes the agreed attempt limit, hint count and hint penalty', () => {
    expect({ maxAttempts: MAX_ATTEMPTS, hintCount: HINT_COUNT, hintPenalty: HINT_XP_PENALTY })
      .toEqual({ maxAttempts: 3, hintCount: 3, hintPenalty: 10 });
  });

  it.each([1, 2, 3] satisfies Difficulty[])('has a display label for supported tier %i', (tier) => {
    expect(TIER_LABEL[tier]).toEqual(expect.any(String));
    expect(TIER_LABEL[tier].trim()).not.toBe('');
  });

  it.each([
    'bb84_eve', 'sifting', 'state_evolution', 'normalisation', 'gate_simplification', 'module_mcq',
  ] satisfies ChallengeType[])('has a display label for supported category %s', (category) => {
    expect(TYPE_LABEL[category]).toEqual(expect.any(String));
    expect(TYPE_LABEL[category].trim()).not.toBe('');
  });
});

// Interfaces and unions in types.ts are erased at runtime. Their consumers
// are checked by `tsc --noEmit`; these tests cover exported runtime behaviour.
