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

export interface QuizResult {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  results: { questionId: string; correct: boolean; explanation: string | null }[];
}

export const EMPTY_PROGRESS: ModuleProgress = {
  pagesCompleted: 0,
  quizPassed: false,
  bestScore: null,
  completedAt: null,
};