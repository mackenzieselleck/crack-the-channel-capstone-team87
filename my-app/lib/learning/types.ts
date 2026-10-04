export interface ModulePage {
  id: string;
  position: number;
  title: string;
  body: string; // markdown content
}

export interface QuizQuestion {
  id: string;
  position: number;
  prompt: string;
  options: string[];
}

export interface LearningModule {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  passMark: number;
  pages: ModulePage[];
  questions: QuizQuestion[];
}

export interface ModuleProgress {
  pagesCompleted: number;
  quizPassed: boolean;
  bestScore: number | null;
  completedAt: string | null;
}

export type Position =
  | { kind: 'reading'; index: number }
  | { kind: 'quiz' };

export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface AwardedBadge {
  id: string;
  title: string;
  description: string | null;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  results: { questionId: string; correct: boolean; explanation: string | null }[];
  // 0 and [] when the module was already passed before (xp/badges are only awarded once)
  xpAwarded: number;
  badgesAwarded: AwardedBadge[];
}

export const EMPTY_PROGRESS: ModuleProgress = {
  pagesCompleted: 0,
  quizPassed: false,
  bestScore: null,
  completedAt: null,
};