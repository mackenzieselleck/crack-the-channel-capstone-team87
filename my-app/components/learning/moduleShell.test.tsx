// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ hook: {} as Record<string, unknown> }));

vi.mock('@/lib/learning/useModule', () => ({ useModule: () => mocks.hook }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { ModuleShell } from './moduleShell';

const MOD = {
  id: 'm1',
  slug: 'quantum-basics',
  title: 'Quantum Computing Basics',
  summary: 'Learn the foundations.',
  passMark: 70,
  pages: [
    { id: 'p1', position: 0, title: 'From bits to qubits', body: 'Body one' },
    { id: 'p2', position: 1, title: 'Superposition', body: 'Body two' },
    { id: 'p3', position: 2, title: 'Measurement', body: 'Body three' },
  ],
  questions: [{ id: 'q1', position: 0, prompt: 'What is a qubit?', options: ['A bit', 'A quantum bit'] }],
};

function setHook(overrides: Record<string, unknown> = {}) {
  mocks.hook = {
    mod: MOD,
    progress: { pagesCompleted: 0, quizPassed: false, bestScore: null, completedAt: null },
    pos: { kind: 'reading', index: 0 },
    percent: 0,
    quizResult: null,
    loading: false,
    busy: false,
    error: null,
    next: vi.fn(),
    back: vi.fn(),
    submitQuiz: vi.fn(),
    retryQuiz: vi.fn(),
    ...overrides,
  };
  return mocks.hook as {
    next: ReturnType<typeof vi.fn>;
    back: ReturnType<typeof vi.fn>;
    submitQuiz: ReturnType<typeof vi.fn>;
  };
}

const pathway = () => screen.getByRole('heading', { name: 'Module pathway' }).closest('aside') as HTMLElement;
const lockIcons = () => pathway().querySelectorAll('.lucide-lock').length;

beforeEach(() => setHook());

// Remove the previous test's page so its elements can't match this test's queries
afterEach(() => {
  cleanup();
});

describe('ModuleShell: loading and errors', () => {
  it('shows a skeleton while loading', () => {
    setHook({ loading: true, mod: null });
    render(<ModuleShell slug="quantum-basics" />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('shows the load error with a way back to the module list', () => {
    setHook({ mod: null, error: 'Could not load this module.' });
    render(<ModuleShell slug="quantum-basics" />);

    expect(screen.getByText('Unable to load this module')).toBeInTheDocument();
    expect(screen.getByText('Could not load this module.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All modules' })).toHaveAttribute('href', '/learn');
  });

  it('falls back to a default message when there is no error text', () => {
    setHook({ mod: null, error: null });
    render(<ModuleShell slug="quantum-basics" />);
    expect(screen.getByText('This learning module could not be found.')).toBeInTheDocument();
  });

  it('shows a save error above the content without hiding the module', () => {
    setHook({ error: 'Could not save your progress. Please try again.' });
    render(<ModuleShell slug="quantum-basics" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Could not save your progress');
    expect(screen.getByRole('heading', { name: 'From bits to qubits' })).toBeInTheDocument();
  });
});

describe('ModuleShell: header', () => {
  it('shows the title, summary, pass mark and progress', () => {
    setHook({ percent: 25 });
    render(<ModuleShell slug="quantum-basics" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Quantum Computing Basics' })).toBeInTheDocument();
    expect(screen.getByText('Learn the foundations.')).toBeInTheDocument();
    expect(screen.getByText('70% to pass')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Module progress' })).toHaveAttribute('aria-valuenow', '25');
  });

  it('omits the summary when there is none', () => {
    setHook({ mod: { ...MOD, summary: null } });
    render(<ModuleShell slug="quantum-basics" />);
    expect(screen.queryByText('Learn the foundations.')).not.toBeInTheDocument();
  });
});

describe('ModuleShell: reading', () => {
  it('shows the current page with its position in the module', () => {
    setHook({ pos: { kind: 'reading', index: 1 }, progress: { pagesCompleted: 1, quizPassed: false } });
    render(<ModuleShell slug="quantum-basics" />);

    expect(screen.getByText('Part 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Superposition' })).toBeInTheDocument();
    expect(screen.getByText('Body two')).toBeInTheDocument();
  });

  it('disables Back on the first page', () => {
    render(<ModuleShell slug="quantum-basics" />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
  });

  it('enables Back on later pages and calls back()', async () => {
    const user = userEvent.setup();
    const hook = setHook({ pos: { kind: 'reading', index: 1 } });
    render(<ModuleShell slug="quantum-basics" />);

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(hook.back).toHaveBeenCalledTimes(1);
  });

  it('calls next() on Continue', async () => {
    const user = userEvent.setup();
    const hook = setHook();
    render(<ModuleShell slug="quantum-basics" />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(hook.next).toHaveBeenCalledTimes(1);
  });

  it('labels the last page’s button as going to the assessment', () => {
    setHook({ pos: { kind: 'reading', index: 2 } });
    render(<ModuleShell slug="quantum-basics" />);
    expect(screen.getByRole('button', { name: 'Continue to assessment' })).toBeInTheDocument();
  });

  it('disables Continue and shows Saving while progress is being saved', () => {
    setHook({ busy: true });
    render(<ModuleShell slug="quantum-basics" />);
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });
});

describe('ModuleShell: pathway sidebar', () => {
  it('locks every part ahead of the current one, and the assessment', () => {
    // part 1 read, on part 2; part 3 and the assessment still locked
    setHook({ pos: { kind: 'reading', index: 1 }, progress: { pagesCompleted: 1, quizPassed: false } });
    render(<ModuleShell slug="quantum-basics" />);

    expect(lockIcons()).toBe(2);
    expect(within(pathway()).getByText('Part 1')).toBeInTheDocument();
    expect(within(pathway()).getByText('Measurement')).toBeInTheDocument();
  });

  it('shows the current part’s number rather than a lock', () => {
    render(<ModuleShell slug="quantum-basics" />);
    expect(within(pathway()).getByText('1')).toBeInTheDocument();
  });

  it('unlocks the assessment once it is the current step', () => {
    setHook({ pos: { kind: 'quiz' }, progress: { pagesCompleted: 3, quizPassed: false } });
    render(<ModuleShell slug="quantum-basics" />);
    expect(lockIcons()).toBe(0);
    expect(pathway().querySelectorAll('.lucide-clipboard-check')).toHaveLength(1);
  });

  it('marks the assessment complete once passed', () => {
    setHook({ pos: { kind: 'reading', index: 0 }, progress: { pagesCompleted: 3, quizPassed: true } });
    render(<ModuleShell slug="quantum-basics" />);
    expect(lockIcons()).toBe(0);
    expect(within(pathway()).getByText('70% required')).toBeInTheDocument();
  });
});

describe('ModuleShell: assessment', () => {
  beforeEach(() => setHook({ pos: { kind: 'quiz' }, progress: { pagesCompleted: 3, quizPassed: false } }));

  it('shows the assessment instead of a reading page', () => {
    render(<ModuleShell slug="quantum-basics" />);
    expect(screen.getByRole('heading', { name: 'Check your understanding' })).toBeInTheDocument();
    expect(screen.getByText('What is a qubit?')).toBeInTheDocument();
    expect(screen.queryByText(/Part \d of 3/)).not.toBeInTheDocument();
  });

  it('hides Continue but keeps Back available', () => {
    render(<ModuleShell slug="quantum-basics" />);
    expect(screen.queryByRole('button', { name: /^Continue/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();
  });

  it('passes submitted answers through to submitQuiz', async () => {
    const user = userEvent.setup();
    const hook = mocks.hook as { submitQuiz: ReturnType<typeof vi.fn> };
    render(<ModuleShell slug="quantum-basics" />);

    await user.click(screen.getByRole('radio', { name: 'A quantum bit' }));
    await user.click(screen.getByRole('button', { name: 'Submit test' }));
    expect(hook.submitQuiz).toHaveBeenCalledWith({ q1: 1 });
  });
});