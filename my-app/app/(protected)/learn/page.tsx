// every published learning modulewith user's progress
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Check, ChevronRight, Lock } from 'lucide-react';
import { requireOnboarding } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { percentComplete } from '@/lib/learning/progress';

export const metadata: Metadata = { title: 'Learning | Crack the Channel' };

type ModuleRow = { id: string; slug: string; title: string; summary: string | null; position: number; pass_mark: number };
type ProgressRow = { module_id: string; pages_completed: number; quiz_passed: boolean; best_score: number | null };

export default async function LearnPage() {
  const { user } = await requireOnboarding();
  const supabase = await createClient();

  const [{ data: modules }, { data: pages }, { data: progress }] = await Promise.all([
    supabase.from('modules').select('id,slug,title,summary,position,pass_mark').eq('is_published', true).order('position'),
    supabase.from('module_pages').select('module_id'),
    supabase.from('module_progress').select('module_id,pages_completed,quiz_passed,best_score').eq('user_id', user.id),
  ]);

  const pageCounts = new Map<string, number>();
  for (const p of pages ?? []) pageCounts.set(p.module_id, (pageCounts.get(p.module_id) ?? 0) + 1);
  const progressById = new Map((progress as ProgressRow[] | null ?? []).map((p) => [p.module_id, p]));
  const list = (modules as ModuleRow[] | null) ?? [];
  const passedCount = list.filter((m) => progressById.get(m.id)?.quiz_passed).length;

  return (
    <main className="min-h-screen bg-surface px-6 pb-24 pt-10 text-text-primary">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Learning</p>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Learning modules</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
                Work through each module at your own pace, then pass its assessment to complete it.
              </p>
            </div>
            {list.length > 0 && (
              <div className="rounded-lg border border-border bg-surface-raised px-4 py-3">
                <p className="text-xs uppercase tracking-[0.15em] text-text-secondary">Completed</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {passedCount} of {list.length} modules
                </p>
              </div>
            )}
          </div>
        </header>

        {list.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-surface-raised p-8 text-center">
            <BookOpen size={28} className="mx-auto text-accent" aria-hidden="true" />
            <p className="mt-4 font-semibold">No modules yet</p>
            <p className="mt-2 text-sm text-text-secondary">New learning modules will appear here when they&apos;re published.</p>
          </div>
        ) : (
          <ul className="grid gap-5 py-8 md:grid-cols-2 lg:grid-cols-3">
            {list.map((m, i) => {
              const p = progressById.get(m.id);
              const total = pageCounts.get(m.id) ?? 0;
              const read = Math.min(p?.pages_completed ?? 0, total);
              const passed = !!p?.quiz_passed;
              // Reading is most of the work; the assessment is the last step.
              const percent = percentComplete(
                { pagesCompleted: read, quizPassed: passed, bestScore: null, completedAt: null },
                total,
              );
              const started = !!p && (read > 0 || p.best_score !== null);
              const cta = passed ? 'Review' : started ? 'Continue' : 'Start';
              return (
                <li key={m.id}>
                  <Link
                    href={`/learn/${m.slug}`}
                    className={[
                      'group flex h-full flex-col rounded-xl border bg-surface-raised p-6 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
                      passed ? 'border-success/30' : 'border-border hover:border-accent/60',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Module {i + 1}</p>
                      {passed ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                          <Check size={12} aria-hidden="true" /> Completed{p?.best_score != null ? ` · ${p.best_score}%` : ''}
                        </span>
                      ) : started ? (
                        <span className="rounded-full border border-border-strong px-2.5 py-1 text-xs font-medium text-text-secondary">In progress</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-border-strong px-2.5 py-1 text-xs font-medium text-text-secondary">
                          <Lock size={11} aria-hidden="true" /> Not started
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-xl font-semibold tracking-tight">{m.title}</h2>
                    {m.summary && <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">{m.summary}</p>}

                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{total ? `${read} of ${total} parts read` : 'No parts yet'}</span>
                        <span>{m.pass_mark}% to pass</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${m.title} progress`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percent}
                        className="mt-2 h-2 overflow-hidden rounded-full bg-border"
                      >
                        <div
                          className={['h-full rounded-full transition-all', passed ? 'bg-success' : 'bg-accent'].join(' ')}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span
                        className={[
                          'mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition',
                          passed
                            ? 'border border-border-strong text-text-secondary group-hover:border-border-strong group-hover:text-text-primary'
                            : 'bg-accent text-accent-contrast group-hover:bg-accent-strong',
                        ].join(' ')}
                      >
                        {cta}
                        <ChevronRight size={16} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}