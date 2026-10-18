'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import {
  resendConfirmation,
  type ResendState,
} from '@/app/(auth)/resendActions'

// match Supabase's default cooldown
const COOLDOWN_SECONDS = 60
const initialState: ResendState = {}

export function ResendConfirmationForm() {
  const [captchaToken, setCaptchaToken] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const turnstileRef = useRef<TurnstileInstance>(null)

  const [state, formAction, pending] = useActionState(
  async (prev: ResendState, formData: FormData) => {
    const result = await resendConfirmation(prev, formData)

    // Turnstile tokens are single-use
    turnstileRef.current?.reset()
    setCaptchaToken('')

    // Start the cooldown only after a successful send.
    if (result.sentAt) {
      setSecondsLeft(COOLDOWN_SECONDS)
    }

    return result
  },
  initialState,
)

  // start cooldown after each successful send
  useEffect(() => {
  if (!state.sentAt) return

    const timer = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil(
          (state.sentAt! + COOLDOWN_SECONDS * 1000 - Date.now()) / 1000
        )
      )

      setSecondsLeft(remaining)

      if (remaining === 0) {
        window.clearInterval(timer)
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [state.sentAt])

  const disabled = pending || !captchaToken || secondsLeft > 0

  return (
    <form action={formAction} className="mt-7 space-y-4 text-left">
      <div>
        <label
          htmlFor="resend-email"
          className="text-sm font-medium text-text-primary"
        >
          Email address
        </label>
        <input
          id="resend-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-md border border-border-strong bg-surface-raised px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent"
        />
      </div>

      <Turnstile
        ref={turnstileRef}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setCaptchaToken}
        onExpire={() => setCaptchaToken('')}
        onError={() => setCaptchaToken('')}
        options={{ theme: 'auto', size: 'flexible' }}
      />
      <input type="hidden" name="captchaToken" value={captchaToken} />

      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      {state.message && !state.error && (
        <p role="status" className="text-sm text-success">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-md border border-border-strong bg-surface-raised px-6 py-3.5 font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:text-text-primary"
      >
        {pending
          ? 'Sending...'
          : secondsLeft > 0
            ? `Resend available in ${secondsLeft}s`
            : 'Resend email'}
      </button>
    </form>
  )
}
