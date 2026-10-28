// @vitest-environment jsdom
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { data: unknown; error: unknown };

const mocks = vi.hoisted(() => {
  const state = {
    results: {} as Record<string, Result>,
    queries: [] as { table: string; calls: unknown[][] }[],
  };
  const from = (table: string) => {
    const calls: unknown[][] = [];
    state.queries.push({ table, calls });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder: any = new Proxy(
      {},
      {
        get: (_t, prop) =>
          prop === 'then'
            ? (resolve: (r: Result) => unknown) => resolve(state.results[table] ?? { data: null, error: null })
            : (...args: unknown[]) => {
                calls.push([String(prop), ...args]);
                return builder;
              },
      },
    );
    return builder;
  };
  return { state, client: { from } };
});

vi.mock('@/lib/auth/guards', () => ({ requireOnboarding: async () => ({ user: { id: 'user-1' } }) }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => mocks.client }));
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

import LearnPage from './page';

const MODULES = [
  { id: 'm1', slug: 'quantum-basics', title: 'Quantum Basics', summary: null, position: 1, pass_mark: 70 },
  { id: 'm2', slug: 'bb84', title: 'BB84', summary: null, position: 2, pass_mark: 70 },
  { id: 'm3', slug: 'eve', title: 'Eve and QBER', summary: null, position: 3, pass_mark: 70 },
];
const pages = (id: string, n: number) => Array.from({ length: n }, () => ({ module_id: id }));

// renders the page and returns queries scoped to it, so leftovers from other tests can't interfere
async function renderPage() {
  const { container } = render(await LearnPage());
  const page = within(container);
  return {
    page,
    card: (title: string) => page.getByRole('link', { name: new RegExp(title) }),
  };
}

beforeEach(() => {
  mocks.state.queries = [];
  mocks.state.results = {
    modules: { data: MODULES, error: null },
    module_pages: { data: [...pages('m1', 4), ...pages('m2', 4), ...pages('m3', 4)], error: null },
    module_progress: {
      data: [
        { module_id: 'm1', pages_completed: 4, quiz_passed: true, best_score: 85 },
        { module_id: 'm2', pages_completed: 9, quiz_passed: false, best_score: null },
      ],
      error: null,
    },
  };
});

afterEach(() => {
  cleanup();
});

describe('LearnPage', () => {
  it('lists only published modules, in order, with this user’s progress', async () => {
    await renderPage();

    const modules = mocks.state.queries.find((q) => q.table === 'modules')!;
    expect(modules.calls).toContainEqual(['eq', 'is_published', true]);
    expect(modules.calls).toContainEqual(['order', 'position']);
    expect(mocks.state.queries.find((q) => q.table === 'module_progress')!.calls).toContainEqual([
      'eq',
      'user_id',
      'user-1',
    ]);
  });

  it('shows each module’s status and next action', async () => {
    const { page, card } = await renderPage();

    expect(card('Quantum Basics')).toHaveTextContent('Completed · 85%');
    expect(card('Quantum Basics')).toHaveTextContent('Review');
    expect(card('BB84')).toHaveTextContent('In progress');
    expect(card('BB84')).toHaveTextContent('Continue');
    expect(card('Eve and QBER')).toHaveTextContent('Not started');
    expect(card('Eve and QBER')).toHaveTextContent('Start');
    expect(page.getByText('1 of 3 modules')).toBeInTheDocument();
  });

  it('never shows more parts read than a module has', async () => {
    const { card } = await renderPage();
    expect(card('BB84')).toHaveTextContent('4 of 4 parts read');
  });

  it('links each module to its page', async () => {
    const { card } = await renderPage();
    expect(card('BB84')).toHaveAttribute('href', '/learn/bb84');
  });

  it('shows an empty state when there are no modules', async () => {
    mocks.state.results.modules = { data: [], error: null };
    const { page } = await renderPage();
    expect(page.getByText('No modules yet')).toBeInTheDocument();
  });
});