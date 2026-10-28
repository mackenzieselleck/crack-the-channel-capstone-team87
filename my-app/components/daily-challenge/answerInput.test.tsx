// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { PublicChallenge, Submission } from '@/lib/daily-challenge/types';
import { AnswerInput, isComplete } from './answerInput';

afterEach(cleanup);
const base: PublicChallenge = {
  id: 'challenge', date: '2026-10-28', type: 'gate_simplification', difficulty: 3, input_kind: 'circuit',
  title: 'Circuit practice', scenario: 'Compare circuits', task: 'Use the fewest gates',
  prompt_data: { num_qubits: 2, palette: ['h 0', 'x 0', 'z 0', 'cx 0 1'], original_gate_count: 6 },
  options: [{ id: 'a', display: 'Qubit' }, { id: 'b', display: 'Router' }],
};
function Harness({ kind = 'circuit', type = base.type, initial = null, disabled = false }: {
  kind?: PublicChallenge['input_kind']; type?: PublicChallenge['type']; initial?: Submission | null; disabled?: boolean;
}) {
  const [answer, setAnswer] = useState<Submission | null>(initial);
  return <><AnswerInput challenge={{ ...base, input_kind: kind, type }} value={answer} onChange={setAnswer} disabled={disabled} />
    <output data-testid="answer">{JSON.stringify(answer)}</output></>;
}
const answer = () => JSON.parse(screen.getByTestId('answer').textContent!);

describe('submission readiness boundaries', () => {
  const cases: { name: string; value: Submission | null; complete: boolean }[] = [
    { name: 'missing answer', value: null, complete: false },
    { name: 'missing choice', value: { option_id: '' }, complete: false },
    { name: 'selected choice', value: { option_id: 'b' }, complete: true },
    { name: 'empty bits', value: { bits: '' }, complete: false },
    { name: 'one bit', value: { bits: '0' }, complete: true },
    { name: '64 bits', value: { bits: '1'.repeat(64) }, complete: true },
    { name: '65 bits', value: { bits: '1'.repeat(65) }, complete: false },
    { name: 'nonbinary characters', value: { bits: '102' }, complete: false },
    { name: 'blank maths', value: { text: '  ' }, complete: false },
    { name: 'exact maths', value: { text: '1/sqrt(3)' }, complete: true },
    { name: 'three amplitudes', value: { amplitudes: ['0', '0', '1'] }, complete: false },
    { name: 'four amplitudes', value: { amplitudes: ['0', '0', '1', '0'] }, complete: true },
    { name: 'missing amplitude', value: { amplitudes: ['0', ' ', '1', '0'] }, complete: false },
    { name: 'identity circuit', value: { circuit: [] }, complete: true },
    { name: 'keep decision', value: { abort: false }, complete: true },
    { name: 'abort decision', value: { abort: true }, complete: true },
    { name: 'zero intercept', value: { rate_pct: 0 }, complete: true },
    { name: 'full intercept', value: { rate_pct: 100 }, complete: true },
    { name: 'nonfinite intercept', value: { rate_pct: NaN }, complete: false },
  ];
  it.each(cases)('$name has complete=$complete', ({ value, complete }) => expect(isComplete(value)).toBe(complete));
});

describe('actual answer controls', () => {
  it('selects one MCQ answer by its public option ID', () => {
    render(<Harness kind="multiple_choice" />);
    fireEvent.click(screen.getByRole('radio', { name: /Qubit/ }));
    expect(answer()).toEqual({ option_id: 'a' });
  });
  it('strips nonbinary text and caps a bit answer at 64 bits', () => {
    render(<Harness kind="bits" />);
    fireEvent.change(screen.getByLabelText('Your bits'), { target: { value: 'abc1012' + '1'.repeat(80) } });
    expect(answer()).toEqual({ bits: ('101' + '1'.repeat(80)).slice(0, 64) });
  });
  it('normalises a decoded word to three uppercase letters', () => {
    render(<Harness kind="text" type="sifting" />);
    fireEvent.change(screen.getByLabelText('Decoded word'), { target: { value: 'a1bcde' } });
    expect(answer()).toEqual({ text: 'ABC' });
  });
  it('retains an exact normalisation expression', () => {
    render(<Harness kind="text" type="normalisation" />);
    fireEvent.change(screen.getByLabelText('N ='), { target: { value: '1/sqrt(3)' } });
    expect(answer()).toEqual({ text: '1/sqrt(3)' });
  });
  it('adds, removes, undoes and clears circuit gates', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Add H on q0' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add X on q0' }));
    expect(answer()).toEqual({ circuit: ['h 0', 'x 0'] });
    fireEvent.click(screen.getByRole('button', { name: 'Remove H on q0 (gate 1)' }));
    expect(answer()).toEqual({ circuit: ['x 0'] });
    fireEvent.click(screen.getByRole('button', { name: /Undo/ }));
    expect(answer()).toEqual({ circuit: [] });
    fireEvent.click(screen.getByRole('button', { name: 'Add H on q0' }));
    fireEvent.click(screen.getByRole('button', { name: /Clear/ }));
    expect(answer()).toEqual({ circuit: [] });
  });
  it('disables additions at the 20-gate limit', () => {
    render(<Harness initial={{ circuit: Array(20).fill('h 0') }} />);
    expect(screen.getByRole('button', { name: 'Add H on q0' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Undo/ })).toBeEnabled();
  });
  it('keeps circuit controls disabled while grading', () => {
    render(<Harness disabled initial={{ circuit: ['h 0'] }} />);
    expect(screen.getByRole('button', { name: 'Add H on q0' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Undo/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Remove H/ })).not.toBeInTheDocument();
  });
  it('clamps an entered intercept percentage to 100', () => {
    render(<Harness kind="number" type="bb84_eve" />);
    fireEvent.change(screen.getByLabelText('Intercept rate in percent'), { target: { value: '150' } });
    expect(answer()).toEqual({ rate_pct: 100 });
  });
  it('collects all four exact state amplitudes', () => {
    render(<Harness kind="amplitudes" type="state_evolution" />);
    ['1/sqrt(2)', '0', '0', '1/sqrt(2)'].forEach((value, index) => {
      fireEvent.change(screen.getByRole('textbox', { name: `|${['00', '01', '10', '11'][index]}⟩` }), { target: { value } });
    });
    expect(answer()).toEqual({ amplitudes: ['1/sqrt(2)', '0', '0', '1/sqrt(2)'] });
    expect(isComplete(answer())).toBe(true);
  });
  it('submits a keep decision with the optional QBER', () => {
    render(<Harness kind="decision" type="bb84_eve" />);
    fireEvent.change(screen.getByLabelText('Your QBER (optional)'), { target: { value: '8.5' } });
    fireEvent.click(screen.getByRole('radio', { name: /Keep the key/ }));
    expect(answer()).toEqual({ abort: false, qber_pct: 8.5 });
  });
});
