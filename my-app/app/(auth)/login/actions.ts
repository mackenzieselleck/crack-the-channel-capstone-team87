'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validation/auth'
import { safeNext } from '@/lib/auth/safe-redirect'

export type LoginState = {
  error?: string
  unconfirmed?: boolean
}

const DEFAULT_AFTER_LOGIN = '/dashboard'

// pages login should never redirect to
const BLOCKED_NEXT_PREFIXES = [
  '/auth/', '/login', '/signup', '/forgot-password',
  '/reset-password', '/email-confirmation', '/confirmation-success',
]

// login user
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // validates user input
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // validates captcha token
  const captchaToken = formData.get('captchaToken')
  if (typeof captchaToken !== 'string' || !captchaToken) {
    return { error: 'Please complete the CAPTCHA' }
  }

  // logs user in with supabase
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { captchaToken },
  })

  if (error) {
    // log the error code only, never the email or password
    console.error('[login] failed:', error.code ?? error.name)

    // returns when password is correct
    if (error.code === 'email_not_confirmed') {
      return {
        error: 'Please confirm your email before logging in.',
        unconfirmed: true,
      }
    }
    if (error.message?.toLowerCase().includes('captcha')) {
      return { error: 'CAPTCHA verification failed. Please try again.' }
    }
    if (error.status === 429) {
      return { error: 'Too many attempts. Please wait a moment and try again.' }
    }
    // message for an unknown email or password
    return { error: 'Invalid email or password.' }
  }

  // sends users who haven't finished onboarding there first
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!profile?.first_name?.trim() || !profile?.last_name?.trim()) {
    redirect('/onboarding')
  }

  // returns users to the page they were trying to reach, if it's on the site
  const rawNext = formData.get('next')
  let next = safeNext(
    typeof rawNext === 'string' ? rawNext : null,
    process.env.NEXT_PUBLIC_SITE_URL!,
    DEFAULT_AFTER_LOGIN,
  )
  if (BLOCKED_NEXT_PREFIXES.some((p) => next === p || next.startsWith(p))) {
    next = DEFAULT_AFTER_LOGIN
  }

  redirect(next)
}

