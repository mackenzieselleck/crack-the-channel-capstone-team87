'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validation/passwordReset'
import { hasValidRecoverySession } from '@/lib/auth/recoverySession'

export type ActionState = {
  error?: string
  message?: string
}

const GENERIC_RESET_MESSAGE =
  'If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.'

const EXPIRED_MESSAGE =
  'Your reset link has expired or is invalid. Please request a new one.'

// send the reset email
export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const captchaToken = formData.get('captchaToken')
  if (typeof captchaToken !== 'string' || !captchaToken) {
    return { error: 'Please complete the CAPTCHA' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
      captchaToken,
    },
  )

  if (error) {
    // log error only
    console.error('[password-reset] request failed:', error.code ?? error.name)

    // failed CAPTCHA is safe to surface
    if (error.message?.toLowerCase().includes('captcha')) {
      return { error: 'CAPTCHA verification failed. Please try again.' }
    }
  }

  return { message: GENERIC_RESET_MESSAGE }
}

// set new password

export async function updatePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()

  if (!(await hasValidRecoverySession(supabase))) {
    return { error: EXPIRED_MESSAGE }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    console.error('[password-reset] update failed:', error.code ?? error.name)

    if (error.code === 'same_password') {
      return { error: 'Choose a password you have not used before.' }
    }
    if (error.code === 'weak_password') {
      return { error: 'That password is too weak. Try a longer one.' }
    }
    return { error: 'Unable to update password. Please try again.' }
  }

  // revoke session
  await supabase.auth.signOut({ scope: 'global' })

  redirect('/login?reset=success')
}
