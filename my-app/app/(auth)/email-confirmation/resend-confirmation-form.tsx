'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import {
  resendConfirmation,
  type ResendState,
} from '@/app/(auth)/resend-actions'

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
      // Turnstile tokens are single-usse
      turnstileRef.current?.reset()
      setCaptchaToken('')
      return result
    },
    initialState,
  )

  // start cooldown after each successful send
  useEffect(() => {
    if (!state.sentAt) return
    setSecondsLeft(COOLDOWN_SECONDS)
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [state.sentAt])

  const disabled = pending || !captchaToken || secondsLeft > 0

  return (
    <form action={formAction} className="mt-7 space-y-4 text-left">
      <div>
        <label
          htmlFor="resend-email"
          className="text-sm font-medium text-[#06152B]"
        >
          Email address
        </label>
        <input
          id="resend-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-md border border-[#AAB4C0] bg-white px-3 py-2.5 text-sm text-[#06152B] outline-none transition focus:border-[#0F62FE]"
        />
      </div>

      <Turnstile
        ref={turnstileRef}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setCaptchaToken}
        onExpire={() => setCaptchaToken('')}
        onError={() => setCaptchaToken('')}
        options={{ theme: 'light', size: 'flexible' }}
      />
      <input type="hidden" name="captchaToken" value={captchaToken} />

      {state.error && (
        <p role="alert" className="text-sm text-[#B42318]">
          {state.error}
        </p>
      )}

      {state.message && !state.error && (
        <p role="status" className="text-sm text-[#027A48]">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-md border border-[#AAB4C0] bg-white px-6 py-3.5 font-medium text-[#06152B] transition hover:border-[#0F62FE] hover:text-[#0F62FE] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[#AAB4C0] disabled:hover:text-[#06152B]"
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
