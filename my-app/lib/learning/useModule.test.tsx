// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

type Result = { data: unknown; error: unknown };

const mocks = vi.hoisted(() => {
  const state = {
    results: {} as Record<string, Result>,
    queries: [] as { table: string; calls: unknown[][] }[],
    rpc: vi.fn(),
  };
  const from = (table: string) => {
    const calls: unknown[][] = [];
    state.queries.push({ table, calls });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder: any = new Proxy(
      {},
      {
        get(_t, prop) {
          if (prop === 'then') {
            const result = state.results[table] ?? { data: null, error: null };
            return (resolve: (r: Result) => unknown, reject: (e: unknown) => unknown) =>
              Promise.resolve(result).then(resolve, reject);
          }
          return (...args: unknown[]) => {
            calls.push([String(prop), ...args]);
            return builder;
          };
        },
      },
    );
    return builder;
  };
  return { state, client: { from, rpc: (...args: unknown[]) => state.rpc(...args) } };
});

vi.mock('@/lib/supabase/client', () => ({ createClient: () => mocks.client }));

import { useModule } from '@/lib/learning/useModule';

const MODULE_ROW = {
  id: 'm1',
  slug: 'quantum-basics',
  title: 'Quantum Computing Basics',
  summary: 'Learn the foundations.',
  pass_mark: 70,
  module_pages: [
    { id: 'p1', position: 0, title: 'One', body: 'Body one' },
    { id: 'p2', position: 1, title: 'Two', body: 'Body two' },
  ],
  quiz_questions: [{ id: 'q1', position: 0, prompt: 'What is a qubit?', options: ['A bit', 'A quantum bit'] }],
};

const progressRow = (o: Record<string, unknown> = {}) => ({
  pages_completed: 0,
  quiz_passed: false,
  best_score: null,
  completed_at: null,
  ...o,
});

const quizResult = (o: Record<string, unknown> = {}) => ({
  score: 100,
  passed: true,
  correctCount: 1,
  total: 1,
  results: [{ questionId: 'q1', correct: true, explanation: null }],
  xpAwarded: 100,
  badgesAwarded: [],
  ...o,
});

function setup({ progress = null as unknown, moduleError = null as unknown } = {}) {
  mocks.state.results = {
    modules: moduleError ? { data: null, error: moduleError } : { data: MODULE_ROW, error: null },
    module_progress: { data: progress, error: null },
  };
}

async function load() {
  const view = renderHook(() => useModule('quantum-basics'));
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
}

let consoleError: MockInstance;

beforeEach(() => {
  mocks.state.queries = [];
  mocks.state.rpc.mockReset();
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
});

describe('useModule: loading', () => {
  it('starts in the loading state', () => {
    setup();
    const { result } = renderHook(() => useModule('quantum-basics'));
    expect(result.current.loading).toBe(true);
    expect(result.current.mod).toBeNull();
  });

  it('loads the module by slug and maps it to the app’s shape', async () => {
    setup();
    const { result } = await load();

    expect(result.current.mod).toEqual({
      id: 'm1',
      slug: 'quantum-basics',
      title: 'Quantum Computing Basics',
      summary: 'Learn the foundations.',
      passMark: 70,
      pages: MODULE_ROW.module_pages,
      questions: MODULE_ROW.quiz_questions,
    });
    expect(result.current.error).toBeNull();

    const modules = mocks.state.queries.find((q) => q.table === 'modules')!;
    expect(modules.calls).toContainEqual(['eq', 'slug', 'quantum-basics']);
  });

  it('asks for pages and questions in position order', async () => {
    setup();
    await load();
    const modules = mocks.state.queries.find((q) => q.table === 'modules')!;
    expect(modules.calls).toContainEqual(['order', 'position', { referencedTable: 'module_pages' }]);
    expect(modules.calls).toContainEqual(['order', 'position', { referencedTable: 'quiz_questions' }]);
  });

  it('starts on the first page for a learner with no progress', async () => {
    setup();
    const { result } = await load();
    expect(result.current.pos).toEqual({ kind: 'reading', index: 0 });
    expect(result.current.percent).toBe(0);
  });

  it('resumes at the first unread page', async () => {
    setup({ progress: progressRow({ pages_completed: 1 }) });
    const { result } = await load();
    expect(result.current.pos).toEqual({ kind: 'reading', index: 1 });
    expect(result.current.percent).toBe(33); // 1 of 3 units
  });

  it('resumes at the test once all pages are read', async () => {
    setup({ progress: progressRow({ pages_completed: 2 }) });
    const { result } = await load();
    expect(result.current.pos).toEqual({ kind: 'quiz' });
  });

  it('maps saved progress, including a previous pass', async () => {
    setup({ progress: progressRow({ pages_completed: 2, quiz_passed: true, best_score: 90, completed_at: '2026-10-01' }) });
    const { result } = await load();
    expect(result.current.progress).toEqual({
      pagesCompleted: 2,
      quizPassed: true,
      bestScore: 90,
      completedAt: '2026-10-01',
    });
    expect(result.current.percent).toBe(100);
  });

  it('shows an error when the module cannot be loaded', async () => {
    setup({ moduleError: { code: 'PGRST116', message: 'no rows' } });
    const { result } = await load();

    expect(result.current.mod).toBeNull();
    expect(result.current.error).toBe('Could not load this module.');
    expect(mocks.state.queries.some((q) => q.table === 'module_progress')).toBe(false);
  });
});

describe('useModule: reading navigation', () => {
  it('saves progress and moves to the next page', async () => {
    setup();
    mocks.state.rpc.mockResolvedValue({ data: progressRow({ pages_completed: 1 }), error: null });
    const { result } = await load();

    await act(async () => {
      await result.current.next();
    });

    expect(mocks.state.rpc).toHaveBeenCalledWith('increment_progress', { p_module_id: 'm1', p_page_index: 0 });
    expect(result.current.pos).toEqual({ kind: 'reading', index: 1 });
    expect(result.current.progress.pagesCompleted).toBe(1);
    expect(result.current.busy).toBe(false);
  });

  it('moves to the test after the last page', async () => {
    setup({ progress: progressRow({ pages_completed: 1 }) });
    mocks.state.rpc.mockResolvedValue({ data: progressRow({ pages_completed: 2 }), error: null });
    const { result } = await load();

    await act(async () => {
      await result.current.next();
    });
    expect(result.current.pos).toEqual({ kind: 'quiz' });
  });

  it('does not save again when moving through pages already read', async () => {
    setup({ progress: progressRow({ pages_completed: 2 }) });
    const { result } = await load();

    act(() => result.current.back()); // quiz -> last page
    expect(result.current.pos).toEqual({ kind: 'reading', index: 1 });

    await act(async () => {
      await result.current.next();
    });
    expect(mocks.state.rpc).not.toHaveBeenCalled();
    expect(result.current.pos).toEqual({ kind: 'quiz' });
  });

  it('stays on the page and shows an error when saving fails', async () => {
    setup();
    mocks.state.rpc.mockResolvedValue({ data: null, error: { message: 'network' } });
    const { result } = await load();

    await act(async () => {
      await result.current.next();
    });
    expect(result.current.pos).toEqual({ kind: 'reading', index: 0 });
    expect(result.current.error).toBe('Could not save your progress. Please try again.');
    expect(result.current.busy).toBe(false);
  });

  it('clears a previous save error once a save succeeds', async () => {
    setup();
    mocks.state.rpc
      .mockResolvedValueOnce({ data: null, error: { message: 'network' } })
      .mockResolvedValueOnce({ data: progressRow({ pages_completed: 1 }), error: null });
    const { result } = await load();

    await act(async () => {
      await result.current.next();
    });
    await act(async () => {
      await result.current.next();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.pos).toEqual({ kind: 'reading', index: 1 });
  });

  it('ignores Next while on the test', async () => {
    setup({ progress: progressRow({ pages_completed: 2 }) });
    const { result } = await load();

    await act(async () => {
      await result.current.next();
    });
    expect(mocks.state.rpc).not.toHaveBeenCalled();
    expect(result.current.pos).toEqual({ kind: 'quiz' });
  });

  it('does nothing when going back from the first page', async () => {
    setup();
    const { result } = await load();
    act(() => result.current.back());
    expect(result.current.pos).toEqual({ kind: 'reading', index: 0 });
  });

  it('goes back one page at a time', async () => {
    setup({ progress: progressRow({ pages_completed: 2 }) });
    const { result } = await load();
    act(() => result.current.back());
    act(() => result.current.back());
    expect(result.current.pos).toEqual({ kind: 'reading', index: 0 });
  });
});

describe('useModule: the test', () => {
  it('submits answers and records a pass', async () => {
    setup({ progress: progressRow({ pages_completed: 2 }) });
    mocks.state.rpc.mockResolvedValue({ data: quizResult(), error: null });
    const { result } = await load();

    await act(async () => {
      await result.current.submitQuiz({ q1: 1 });
    });

    expect(mocks.state.rpc).toHaveBeenCalledWith('submit_quiz', { p_module_id: 'm1', p_answers: { q1: 1 } });
    expect(result.current.quizResult).toMatchObject({ passed: true, score: 100 });
    expect(result.current.progress).toMatchObject({ quizPassed: true, bestScore: 100 });
    expect(result.current.progress.completedAt).not.toBeNull();
    expect(result.current.percent).toBe(100);
  });

  it('records a failed attempt without marking the module passed', async () => {
    setup({ progress: progressRow({ pages_completed: 2 }) });
    mocks.state.rpc.mockResolvedValue({ data: quizResult({ passed: false, score: 0 }), error: null });
    const { result } = await load();

    await act(async () => {
      await result.current.submitQuiz({ q1: 0 });
    });
    expect(result.current.progress).toMatchObject({ quizPassed: false, bestScore: 0, completedAt: null });
  });

  it('keeps an earlier pass and best score after a worse retake', async () => {
    setup({ progress: progressRow({ pages_completed: 2, quiz_passed: true, best_score: 90, completed_at: '2026-10-01' }) });
    mocks.state.rpc.mockResolvedValue({ data: quizResult({ passed: false, score: 40 }), error: null });
    const { result } = await load();

    await act(async () => {
      await result.current.submitQuiz({ q1: 0 });
    });
    expect(result.current.progress).toEqual({
      pagesCompleted: 2,
      quizPassed: true,
      bestScore: 90,
      completedAt: '2026-10-01',
    });
  });

  it('shows an error and no result when submitting fails', async () => {
    setup({ progress: progressRow({ pages_completed: 2 }) });
    mocks.state.rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const { result } = await load();

    await act(async () => {
      await result.current.submitQuiz({ q1: 1 });
    });
    expect(result.current.quizResult).toBeNull();
    expect(result.current.error).toBe('Could not submit the test. Please try again.');
    expect(result.current.busy).toBe(false);
  });

  it('clears the result on retry', async () => {
    setup({ progress: progressRow({ pages_completed: 2 }) });
    mocks.state.rpc.mockResolvedValue({ data: quizResult({ passed: false, score: 0 }), error: null });
    const { result } = await load();

    await act(async () => {
      await result.current.submitQuiz({ q1: 0 });
    });
    act(() => result.current.retryQuiz());
    expect(result.current.quizResult).toBeNull();
  });

  it('clears the result when going back to the reading', async () => {
    setup({ progress: progressRow({ pages_completed: 2 }) });
    mocks.state.rpc.mockResolvedValue({ data: quizResult(), error: null });
    const { result } = await load();

    await act(async () => {
      await result.current.submitQuiz({ q1: 1 });
    });
    act(() => result.current.back());
    expect(result.current.quizResult).toBeNull();
    expect(result.current.pos).toEqual({ kind: 'reading', index: 1 });
  });
});