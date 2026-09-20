import type { ModuleProgress, ModuleStatus, Position } from './types';

/**
 * Progress model
 * --------------
 * A module is N reading steps + 1 final test = N + 1 "units".
 * Pressing Next on a reading step completes that unit; passing the test completes the last one.
 * So the bar reaches N/(N+1) when the reading is done and 100% only after the test is passed.
 *
 * These are pure functions so they're trivial to unit test and reuse on a dashboard
 * (e.g. a per-module bar on the module list, or an overall course bar).
 */

export function totalUnits(readingPages: number): number {
  return readingPages + 1;
}

export function completedUnits(p: ModuleProgress, readingPages: number): number {
  return Math.min(p.pagesCompleted, readingPages) + (p.quizPassed ? 1 : 0);
}

export function percentComplete(p: ModuleProgress, readingPages: number): number {
  return Math.round((100 * completedUnits(p, readingPages)) / totalUnits(readingPages));
}

export function moduleStatus(p: ModuleProgress): ModuleStatus {
  if (p.quizPassed) return 'completed';
  return p.pagesCompleted > 0 ? 'in_progress' : 'not_started';
}

/** Where to drop the user when they open (or return to) a module: the first unfinished unit. */
export function resumePosition(p: ModuleProgress, readingPages: number): Position {
  if (p.pagesCompleted >= readingPages) return { kind: 'quiz' };
  return { kind: 'reading', index: p.pagesCompleted };
}

/** Overall course progress across several modules. */
export function coursePercent(
  modules: { progress: ModuleProgress; readingPages: number }[],
): number {
  const total = modules.reduce((sum, m) => sum + totalUnits(m.readingPages), 0);
  if (total === 0) return 0;
  const done = modules.reduce((sum, m) => sum + completedUnits(m.progress, m.readingPages), 0);
  return Math.round((100 * done) / total);
}