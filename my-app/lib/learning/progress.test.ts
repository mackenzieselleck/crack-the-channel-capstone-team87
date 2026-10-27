import { describe, expect, it } from 'vitest';
import {
  completedUnits,
  coursePercent,
  moduleStatus,
  percentComplete,
  resumePosition,
  totalUnits,
} from '@/lib/learning/progress';
import { EMPTY_PROGRESS, type ModuleProgress } from '@/lib/learning/types';


const p = (overrides: Partial<ModuleProgress> = {}): ModuleProgress => ({ ...EMPTY_PROGRESS, ...overrides });

describe('totalUnits', () => {
  it('counts each reading page plus the final test', () => {
    expect(totalUnits(4)).toBe(5);
  });

  it('counts the test for a module with no pages', () => {
    expect(totalUnits(0)).toBe(1);
  });
});

describe('completedUnits', () => {
  it('is zero with no progress', () => {
    expect(completedUnits(EMPTY_PROGRESS, 4)).toBe(0);
  });

  it('counts pages read, plus one for a passed test', () => {
    expect(completedUnits(p({ pagesCompleted: 2 }), 4)).toBe(2);
    expect(completedUnits(p({ pagesCompleted: 4, quizPassed: true }), 4)).toBe(5);
  });

  it('never counts more pages than the module has', () => {
    expect(completedUnits(p({ pagesCompleted: 9 }), 4)).toBe(4);
  });
});

describe('percentComplete', () => {
  it.each([
    [0, false, 4, 0],
    [1, false, 4, 20],
    [4, false, 4, 80],
    [4, true, 4, 100],
    [1, false, 2, 33],
    [2, false, 2, 60],
  ])('%i pages read, passed=%s, %i pages -> %i%%', (read, passed, pages, expected) => {
    expect(percentComplete(p({ pagesCompleted: read, quizPassed: passed }), pages)).toBe(expected);
  });

  it('only reaches 100% once the test is passed', () => {
    expect(percentComplete(p({ pagesCompleted: 4 }), 4)).toBeLessThan(100);
  });

  it('caps at 100% when progress exceeds the page count', () => {
    expect(percentComplete(p({ pagesCompleted: 9, quizPassed: true }), 4)).toBe(100);
  });

  it('handles a module with no pages', () => {
    expect(percentComplete(EMPTY_PROGRESS, 0)).toBe(0);
    expect(percentComplete(p({ quizPassed: true }), 0)).toBe(100);
  });
});

describe('moduleStatus', () => {
  it('is not started with no reading and no pass', () => {
    expect(moduleStatus(EMPTY_PROGRESS)).toBe('not_started');
  });

  it('is in progress once any page is read', () => {
    expect(moduleStatus(p({ pagesCompleted: 1 }))).toBe('in_progress');
  });

  it('is completed once the test is passed, whatever the reading count', () => {
    expect(moduleStatus(p({ pagesCompleted: 0, quizPassed: true }))).toBe('completed');
  });
});

describe('resumePosition', () => {
  it('starts at the first page with no progress', () => {
    expect(resumePosition(EMPTY_PROGRESS, 4)).toEqual({ kind: 'reading', index: 0 });
  });

  it('resumes at the first unread page', () => {
    expect(resumePosition(p({ pagesCompleted: 2 }), 4)).toEqual({ kind: 'reading', index: 2 });
  });

  it('goes to the test once every page is read', () => {
    expect(resumePosition(p({ pagesCompleted: 4 }), 4)).toEqual({ kind: 'quiz' });
  });

  it('goes to the test when progress exceeds the page count', () => {
    expect(resumePosition(p({ pagesCompleted: 9 }), 4)).toEqual({ kind: 'quiz' });
  });

  it('goes to the test for a module with no pages', () => {
    expect(resumePosition(EMPTY_PROGRESS, 0)).toEqual({ kind: 'quiz' });
  });
});

describe('coursePercent', () => {
  it('is zero for an empty course', () => {
    expect(coursePercent([])).toBe(0);
  });

  it('weights modules by their number of units, not equally', () => {
    // eg: 5 of 5 units done, plus 0 of 3: 5 / 8 = 62.5%
    expect(
      coursePercent([
        { progress: p({ pagesCompleted: 4, quizPassed: true }), readingPages: 4 },
        { progress: EMPTY_PROGRESS, readingPages: 2 },
      ]),
    ).toBe(63);
  });

  it('is 100% when every module is passed', () => {
    expect(
      coursePercent([
        { progress: p({ pagesCompleted: 4, quizPassed: true }), readingPages: 4 },
        { progress: p({ pagesCompleted: 2, quizPassed: true }), readingPages: 2 },
      ]),
    ).toBe(100);
  });
});