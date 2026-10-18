// POST /api/challenge/hint   { challengeId, index }
// Reveals hint `index` (0-based) for one of the user's challenges and records the reveal,
// so the XP penalty (−10 per hint) is enforced on the server rather than reported by the
// browser (ADR 018). Hints must be revealed in order; repeating a request is harmless.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { limitRoute } from "@/lib/daily-challenge/rateLimit";
import type { HintResponse } from "@/lib/daily-challenge//types";

const Body = z.object({
  challengeId: z.string().uuid(),
  index: z.number().int().min(0).max(2),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "sign in required" }, { status: 401 });
  const limited = await limitRoute(user.id, "hint");
  if (limited) return limited;
  const admin = createAdminClient();

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid request" }, { status: 400 });
  const { challengeId, index } = parsed.data;

  const { data: ch } = await admin.from("daily_challenges")
    .select("hints,hints_revealed").eq("id", challengeId).eq("user_id", user.id).maybeSingle();
  if (!ch) return NextResponse.json({ error: "not found" }, { status: 404 });

  const hints: string[] = ch.hints ?? [];
  let revealed: number = ch.hints_revealed ?? 0;
  if (index >= hints.length) return NextResponse.json({ error: "no such hint" }, { status: 400 });
  if (index > revealed) return NextResponse.json({ error: "Reveal the earlier hints first." }, { status: 400 });

  if (index === revealed) {
    // Conditional update: only succeeds if nobody revealed this hint in the meantime,
    // so double-clicks and parallel requests count once.
    const { data: updated } = await admin.from("daily_challenges")
      .update({ hints_revealed: revealed + 1 })
      .eq("id", challengeId).eq("user_id", user.id).eq("hints_revealed", revealed)
      .select("hints_revealed").maybeSingle();
    revealed = updated?.hints_revealed ?? revealed + 1;
  }

  return NextResponse.json({ hints: hints.slice(0, revealed), hintsTotal: hints.length } satisfies HintResponse);
}