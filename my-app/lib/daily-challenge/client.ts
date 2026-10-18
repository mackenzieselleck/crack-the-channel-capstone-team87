// Browser-side helpers for the Daily Challenge API. Client-safe.
import type {
  ApiError, Difficulty, HintResponse, StatusResponse, Submission, SubmitResponse, TodayResponse,
} from "./types";

export class ApiFailure extends Error {
  constructor(message: string, public status: number, public retryAfter?: number) {
    super(message);
  }
}

/** Normalise any thrown value into an ApiFailure. */
export function toFailure(e: unknown): ApiFailure {
  return e instanceof ApiFailure ? e : new ApiFailure('Something went wrong. Please try again.', 500);
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", ...init });
  } catch {
    throw new ApiFailure("You seem to be offline. Check your connection and try again.", 0);
  }
  if (res.ok) return (await res.json()) as T;
  const body = (await res.json().catch(() => ({}))) as Partial<ApiError>;
  const fallback =
    res.status === 401 ? "Your session has ended."
    : res.status === 429 ? "Too many requests. Take a breather and try again shortly."
    : "Something went wrong. Please try again.";
  throw new ApiFailure(body.error ?? fallback, res.status, body.retryAfter);
}

const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const dailyApi = {
  status: () => api<StatusResponse>("/api/challenge/status"),
  today: (difficulty: Difficulty) => api<TodayResponse>(`/api/challenge/today?difficulty=${difficulty}`),
  hint: (challengeId: string, index: number) => api<HintResponse>("/api/challenge/hint", post({ challengeId, index })),
  submit: (challengeId: string, submission: Submission) =>
    api<SubmitResponse>("/api/challenge/submit", post({ challengeId, submission })),
};

/** Parse the [tier] route segment. */
export function parseTier(raw: string | string[] | undefined): Difficulty | null {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return n === 1 || n === 2 || n === 3 ? n : null;
}

// The user's last answer per challenge, so "Try again" starts from what they submitted.
const draftKey = (challengeId: string) => `dc-draft:${challengeId}`;
export function saveDraft(challengeId: string, submission: Submission) {
  try { sessionStorage.setItem(draftKey(challengeId), JSON.stringify(submission)); } catch { /* storage unavailable */ }
}
export function loadDraft(challengeId: string): Submission | null {
  try {
    const raw = sessionStorage.getItem(draftKey(challengeId));
    return raw ? (JSON.parse(raw) as Submission) : null;
  } catch {
    return null;
  }
}
