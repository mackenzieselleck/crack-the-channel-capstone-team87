import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/auth/safeRedirect'
import type { EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

// only these link types are accepted
const ALLOWED_TYPES: readonly EmailOtpType[] = [
  'signup',
  'email',
  'recovery',

]

function isAllowedType(value: string | null): value is EmailOtpType {
  return value !== null && (ALLOWED_TYPES as readonly string[]).includes(value)
}

// verifies Supabase email links 
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const errorUrl = new URL('/auth/error', origin)

  if (!tokenHash || !isAllowedType(type)) {
    errorUrl.searchParams.set('reason', 'invalid-link')
    return NextResponse.redirect(errorUrl)
  }

  const next =
    type === 'recovery'
      ? '/reset-password'
      : safeNext(searchParams.get('next'), origin, '/confirmed')

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  })

  if (error) {
    console.error('[(/confirm] verify failed:', error.code ?? error.name)
    errorUrl.searchParams.set(
      'reason',
      type === 'recovery' ? 'expired-reset' : 'invalid-link',
    )
    return NextResponse.redirect(errorUrl)
  }

  const response = NextResponse.redirect(new URL(next, origin))
  // don't leak token-bearing URL to next page or cache
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('Cache-Control', 'no-store')
  return response
}