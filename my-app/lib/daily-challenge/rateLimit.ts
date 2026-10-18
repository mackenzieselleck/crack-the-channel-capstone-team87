// rate limiting for Daily Challenge routes and LLM prompting
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server"

type Rule = { limit: number; windowSec: number };

// count one hit against `key`. Returns whether it is within `limit` for the current window
async function hit(key: string, { limit, windowSec }: Rule): Promise<{ allowed: boolean; retryAfter: number }> {
  const { data, error } = await createAdminClient().rpc("rate_limit_hit", {
    p_key: key, p_limit: limit, p_window_seconds: windowSec,
  });
  if (error || !data?.[0]) {
    // fail open: a missing migration or database hiccup must not lock everyone out
    // limits are a cost and abuse control
    console.warn("[rate-limit] check failed, allowing request:", error?.message);
    return { allowed: true, retryAfter: 0 };
  }
  return { allowed: data[0].allowed, retryAfter: data[0].retry_after };
}


// per-user route limits
const ROUTE_RULES = {
  today:  [{ limit: 30, windowSec: 60 }],                                  // opening / refreshing a tier
  status: [{ limit: 60, windowSec: 60 }],                                  // hub + corner pop-up
  hint:   [{ limit: 12, windowSec: 60 }],                                  // hint reveals
  submit: [{ limit: 6,  windowSec: 60 }, { limit: 40, windowSec: 3600 }],  // answers 
} satisfies Record<string, Rule[]>;
export type RouteName = keyof typeof ROUTE_RULES;

 // apply route's limits for user. Returns a 429 response to send back
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


// LLM prompting budget
const num = (v: string | undefined, d: number) => (v && Number.isFinite(Number(v)) ? Number(v) : d);
const LLM_RULES = {
  perUserHour: { limit: num(process.env.LLM_USER_PER_HOUR, 20),  windowSec: 3600 },
  globalMin:   { limit: num(process.env.LLM_GLOBAL_PER_MIN, 25), windowSec: 60 },
  globalDay:   { limit: num(process.env.LLM_GLOBAL_PER_DAY, 900), windowSec: 86_400 },
};


 // Reserve one LLM job for user. Call once before each LLM job
export async function llmAllowed(userId: string): Promise<boolean> {
  const user = await hit(`llm:user:${userId}`, LLM_RULES.perUserHour);
  if (!user.allowed) return false;
  const minute = await hit("llm:global:min", LLM_RULES.globalMin);
  if (!minute.allowed) return false;
  const day = await hit("llm:global:day", LLM_RULES.globalDay);
  return day.allowed;
}
