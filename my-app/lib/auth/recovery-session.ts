import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

// reset link timer for updating password
export const RECOVERY_WINDOW_SECONDS = 15 * 60

type AmrEntry = { method: string; timestamp: number }


export async function hasValidRecoverySession(
  supabase: SupabaseClient,
): Promise<boolean> {
  // getClaims() verifies the JSON Web Token
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) return false

  const amr = (data.claims.amr ?? []) as AmrEntry[]
  const recovery = amr.find(
    (m) => m.method === 'recovery' || m.method === 'otp',
  )
  if (!recovery) return false

  const ageSeconds = Date.now() / 1000 - recovery.timestamp
  return ageSeconds >= 0 && ageSeconds <= RECOVERY_WINDOW_SECONDS
}
