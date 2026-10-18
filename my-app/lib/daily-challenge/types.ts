// Daily Challenge types shared by the API routes and the frontend.
// Client-safe: no server imports, no secrets. Answers never appear in any of these types.

export type Difficulty = 1 | 2 | 3;

export type InputKind =
  | "multiple_choice" | "bits" | "text" | "amplitudes" | "circuit" | "decision" | "number";

export type ChallengeType =
  | "bb84_eve" | "sifting" | "state_evolution" | "normalisation" | "gate_simplification" | "module_mcq";

export const MAX_ATTEMPTS = 3;
export const HINT_COUNT = 3;
export const HINT_XP_PENALTY = 10;

/** XP for a correct answer (mirrors record_daily_solve in the database; display only). */
export function xpFor(difficulty: number, hints: number, attempt: number) {
  return Math.max(10, difficulty * 50 - hints * HINT_XP_PENALTY - (attempt - 1) * 15);
}

export const TIER_LABEL: Record<Difficulty, string> = { 1: "Warm-up", 2: "Core", 3: "Expert" };

export const TYPE_LABEL: Record<string, string> = {
  bb84_eve: "Eavesdropper detection",
  sifting: "Key sifting",
  state_evolution: "State evolution",
  normalisation: "Normalisation",
  gate_simplification: "Gate simplification",
  module_mcq: "Module check-in",
};

/** The public part of a challenge, as the browser receives it. Hints are served separately. */
export type PublicChallenge = {
  id: string;
  date: string;
  type: ChallengeType;
  difficulty: Difficulty;
  input_kind: InputKind;
  prompt_data: Record<string, unknown>;
  options: { id: string; display: string }[];
  title: string;
  scenario: string;
  task: string;
};

export type AttemptSummary = {
  attemptNo: number;
  correct: boolean;
  feedback: string | null;
  xpAwarded: number | null;
  createdAt: string;
};

export type ChallengeProgress = {
  attemptsUsed: number;
  attemptsLeft: number;
  maxAttempts: number;
  solved: boolean;
  /** Hints the user has revealed so far (server-tracked; affects XP). */
  hints: string[];
  hintsTotal: number;
  lastAttempt: AttemptSummary | null;
  /** Only present once solved or out of attempts. */
  workedSolution: string | null;
};

export type TodayResponse = { challenge: PublicChallenge; progress: ChallengeProgress };

export type HintResponse = { hints: string[]; hintsTotal: number };

/** One shape per input_kind. Must match the Zod union in /api/challenge/submit. */
export type Submission =
  | { option_id: string }
  | { bits: string }
  | { text: string }
  | { amplitudes: string[] }
  | { circuit: string[] }
  | { abort: boolean; qber_pct?: number }
  | { rate_pct: number };

/** From the team's profiles table: xp, challenge_streak, best_streak, last_challenge. */
export type StreakSummary = { current: number; best: number; xp: number; lastSolved: string | null };

export type SubmitResponse = {
  correct: boolean;
  feedback: string;
  attemptsUsed: number;
  attemptsLeft: number;
  workedSolution: string | null;
  xpAwarded: number | null;
  streak: StreakSummary | null;
};

export type TierStatus = {
  difficulty: Difficulty;
  started: boolean;
  solved: boolean;
  attemptsUsed: number;
  attemptsLeft: number;
  title: string | null;
  type: ChallengeType | null;
};

export type StatusResponse = {
  date: string;
  /** True once the user has solved at least one tier today (the streak counts). */
  completedToday: boolean;
  tiers: TierStatus[];
  streak: StreakSummary;
};

/** Error body every Daily Challenge route uses. retryAfter is set on 429s. */
export type ApiError = { error: string; retryAfter?: number };
