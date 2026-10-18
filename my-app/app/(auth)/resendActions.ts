'use server'

import { createClient } from '@/lib/supabase/server'
import { forgotPasswordSchema } from '@/lib/validation/passwordReset'

export type ResendState = {
  error?: string
  message?: string
  sentAt?: number
}

const GENERIC_MESSAGE =
  'If that email has an unconfirmed account, a new confirmation link is on its way.'

// resends confirmation email
export async function resendConfirmation(
  _prev: ResendState,
  formData: FormData,
): Promise<ResendState> {

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const captchaToken = formData.get('captchaToken')
  if (typeof captchaToken !== 'string' || !captchaToken) {
    return { error: 'Please complete the CAPTCHA' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      captchaToken,
    },
  })

  if (error) {
    console.error('[resend-confirmation] failed:', error.code ?? error.name)

    // reveals nothing about whether account exists
    if (error.message?.toLowerCase().includes('captcha')) {
      return { error: 'CAPTCHA verification failed. Please try again.' }
    }
    if (
      error.code === 'over_email_send_rate_limit' ||
      error.status === 429
    ) {
      return {
        error: 'Please wait a minute before requesting another email.',
      }
    }
  }

  return { message: GENERIC_MESSAGE, sentAt: Date.now() }
}
