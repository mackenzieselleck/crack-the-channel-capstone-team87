// Rate limiting for the Daily Challenge routes and for LLM prompting (ADR 018).
// Counters live in Postgres (rate_limits table + rate_limit_hit function), so limits hold
// across every Vercel function instance without adding Redis or another service.
// Server-only: uses the service-role client.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server"

type Rule = { limit: number; windowSec: number };

/** Count one hit against `key`. Returns whether it is within `limit` for the current window. */
async function hit(key: string, { limit, windowSec }: Rule): Promise<{ allowed: boolean; retryAfter: number }> {
  const { data, error } = await createAdminClient().rpc("rate_limit_hit", {
    p_key: key, p_limit: limit, p_window_seconds: windowSec,
  });
  if (error || !data?.[0]) {
    // Fail open: a missing migration or a database hiccup must not lock everyone out.
    // The limits are a cost and abuse control, not a security boundary.
    console.warn("[rate-limit] check failed, allowing request:", error?.message);
    return { allowed: true, retryAfter: 0 };
  }
  return { allowed: data[0].allowed, retryAfter: data[0].retry_after };
}

// ---------------------------------------------------------------------------
// 1. Per-user route limits. Generous for real use; they stop scripted hammering.
// ---------------------------------------------------------------------------
const ROUTE_RULES = {
  today:  [{ limit: 30, windowSec: 60 }],                                  // opening / refreshing a tier
  status: [{ limit: 60, windowSec: 60 }],                                  // hub + corner pop-up
  hint:   [{ limit: 12, windowSec: 60 }],                                  // hint reveals
  submit: [{ limit: 6,  windowSec: 60 }, { limit: 40, windowSec: 3600 }],  // answers (each may call the LLM)
} satisfies Record<string, Rule[]>;
export type RouteName = keyof typeof ROUTE_RULES;

/**
 * Apply the route's limits for this user. Returns a 429 response to send back,
 * or null if the request may continue.
 */
export async function limitRoute(userId: string, route: RouteName): Promise<NextResponse | null> {
  for (const rule of ROUTE_RULES[route]) {
    const r = await hit(`route:${route}:${userId}:${rule.windowSec}`, rule);
    if (!r.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Take a breather and try again shortly.", retryAfter: r.retryAfter },
        { status: 429, headers: { "Retry-After": String(r.retryAfter) } },
      );
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 2. LLM prompting budget. Defaults sit under Groq's free tier for gpt-oss-20b
// (30 requests/min, 1,000/day). When a limit is reached the feature does NOT fail:
// callers use the deterministic fallback text instead (ADR 006 / D11).
// ---------------------------------------------------------------------------
const num = (v: string | undefined, d: number) => (v && Number.isFinite(Number(v)) ? Number(v) : d);
const LLM_RULES = {
  perUserHour: { limit: num(process.env.LLM_USER_PER_HOUR, 20),  windowSec: 3600 },
  globalMin:   { limit: num(process.env.LLM_GLOBAL_PER_MIN, 25), windowSec: 60 },
  globalDay:   { limit: num(process.env.LLM_GLOBAL_PER_DAY, 900), windowSec: 86_400 },
};

/**
 * Reserve one LLM job for this user. Call once before each LLM job (a job may make up to
 * two provider calls with its retry, which the headroom under the provider limits allows for).
 * Returns false if any budget is used up; the caller should use its fallback.
 */
export async function llmAllowed(userId: string): Promise<boolean> {
  const user = await hit(`llm:user:${userId}`, LLM_RULES.perUserHour);
  if (!user.allowed) return false;
  const minute = await hit("llm:global:min", LLM_RULES.globalMin);
  if (!minute.allowed) return false;
  const day = await hit("llm:global:day", LLM_RULES.globalDay);
  return day.allowed;
}
