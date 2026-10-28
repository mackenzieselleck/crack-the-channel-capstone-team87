// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { QuizResult } from '@/lib/learning/types';
import { Quiz } from './quiz';

const QUESTIONS = [
  { id: 'q1', position: 0, prompt: 'What is a qubit?', options: ['A bit', 'A quantum bit'] },
  { id: 'q2', position: 1, prompt: 'Who is Eve?', options: ['Sender', 'Eavesdropper'] },
];

const result = (o: Partial<QuizResult> = {}): QuizResult => ({
  score: 100,
  passed: true,
  correctCount: 2,
  total: 2,
  results: [
    { questionId: 'q1', correct: true, explanation: 'Qubits are quantum bits.' },
    { questionId: 'q2', correct: true, explanation: null },
  ],
  xpAwarded: 100,
  badgesAwarded: [],
  ...o,
});

function renderQuiz(props: Partial<React.ComponentProps<typeof Quiz>> = {}) {
  const onSubmit = vi.fn();
  const onRetry = vi.fn();
  const view = render(
    <Quiz questions={QUESTIONS} passMark={70} result={null} busy={false} onSubmit={onSubmit} onRetry={onRetry} {...props} />,
  );
  return { ...view, onSubmit, onRetry };
}

describe('Quiz', () => {
  it('shows a placeholder when the module has no questions', () => {
    renderQuiz({ questions: [] });
    expect(screen.getByText('Test coming soon')).toBeInTheDocument();
  });

  it('only allows submitting once every question is answered', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderQuiz();
    const submit = screen.getByRole('button', { name: 'Submit test' });

    await user.click(screen.getByRole('radio', { name: 'A quantum bit' }));
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Eavesdropper' }));
    await user.click(submit);
    expect(onSubmit).toHaveBeenCalledWith({ q1: 1, q2: 1 });
  });

  it('shows a pass with its score and XP, and no retry', () => {
    renderQuiz({ result: result() });

    expect(screen.getByText('Module complete')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('+100 XP')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('hides the reward on a retake that awards no XP', () => {
    renderQuiz({ result: result({ xpAwarded: 0 }) });
    expect(screen.queryByText('Reward earned')).not.toBeInTheDocument();
  });

  it('lets the learner retry after failing, with answers cleared', async () => {
    const user = userEvent.setup();
    const failed = result({
      score: 50,
      passed: false,
      correctCount: 1,
      results: [
        { questionId: 'q1', correct: true, explanation: null },
        { questionId: 'q2', correct: false, explanation: 'Eve listens in.' },
      ],
    });
    const { rerender, onRetry, onSubmit } = renderQuiz();
    await user.click(screen.getByRole('radio', { name: 'A quantum bit' }));

    rerender(<Quiz questions={QUESTIONS} passMark={70} result={failed} busy={false} onSubmit={onSubmit} onRetry={onRetry} />);
    expect(screen.getByText('Keep learning')).toBeInTheDocument();
    expect(screen.getByText('Eve listens in.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();

    rerender(<Quiz questions={QUESTIONS} passMark={70} result={null} busy={false} onSubmit={onSubmit} onRetry={onRetry} />);
    expect(screen.getByText('0 of 2 answered')).toBeInTheDocument();
  });
});