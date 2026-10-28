// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ApiFailure, dailyApi } from '@/lib/daily-challenge/client';
import { HintPanel } from './hintPanel';
const hint = vi.spyOn(dailyApi, 'hint');
beforeEach(() => { hint.mockReset(); });
afterEach(cleanup);
const onHints = vi.fn();
function panel(hints: string[] = [], locked = false) {
  onHints.mockReset();
  return render(<HintPanel challengeId="challenge" hints={hints} hintsTotal={3} locked={locked} onHints={onHints} />);
}
it('does not render unrevealed hint text and requests the next index', async () => {
  hint.mockResolvedValue({ hints: ['Compare bases'], hintsTotal: 3 }); panel();
  expect(screen.queryByText('Compare bases')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Reveal hint 1/ }));
  await screen.findByRole('button', { name: /Reveal hint 1/ });
  expect(hint).toHaveBeenCalledWith('challenge', 0);
  expect(onHints).toHaveBeenCalledWith(['Compare bases']);
});
it('keeps a failed hint reveal retryable without reporting a successful reveal', async () => {
  hint.mockRejectedValueOnce(new ApiFailure('Hint could not be saved', 503)).mockResolvedValueOnce({ hints: ['Saved hint'], hintsTotal: 3 });
  panel(); fireEvent.click(screen.getByRole('button', { name: /Reveal hint 1/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Hint could not be saved');
  expect(onHints).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /Reveal hint 1/ }));
  await act(async () => {});
  expect(onHints).toHaveBeenCalledWith(['Saved hint']);
});
it('disables the reveal button while a save is pending', async () => {
  let finish!: (value: { hints: string[]; hintsTotal: number }) => void;
  hint.mockImplementation(() => new Promise(resolve => { finish = resolve; })); panel();
  fireEvent.click(screen.getByRole('button', { name: /Reveal hint 1/ }));
  expect(screen.getByRole('button', { name: /Revealing/ })).toBeDisabled();
  await act(async () => finish({ hints: ['Saved hint'], hintsTotal: 3 }));
});
it('retains revealed hints but hides the reveal action when locked', () => {
  panel(['Existing hint'], true);
  expect(screen.getByText('Existing hint')).toBeVisible();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
it('offers no additional reveal after all three hints', () => {
  panel(['First', 'Second', 'Third']);
  expect(screen.getByText('3 of 3 used')).toBeVisible();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
