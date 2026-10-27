import type { ModuleProgress, ModuleStatus, Position } from './types';

// a module is N reading steps + 1 test = N + 1 units
// user pressing next on a reading page completes the unit
// passing the test completes the module

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

// where to drop the user on return to module
export function resumePosition(p: ModuleProgress, readingPages: number): Position {
  if (p.pagesCompleted >= readingPages) return { kind: 'quiz' };
  return { kind: 'reading', index: p.pagesCompleted };
}

// overall course progress across modules
export function coursePercent(
  modules: { progress: ModuleProgress; readingPages: number }[],
): number {
  const total = modules.reduce((sum, m) => sum + totalUnits(m.readingPages), 0);
  if (total === 0) return 0;
  const done = modules.reduce((sum, m) => sum + completedUnits(m.progress, m.readingPages), 0);
  return Math.round((100 * done) / total);
}