'use client'

import Link from 'next/link'
import { useActionState, useRef, useState } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import {
  requestPasswordReset,
  type ActionState,
} from '@/app/(auth)/password-reset-actions'

const initialState: ActionState = {}

export default function ForgotPasswordPage() {
  const [captchaToken, setCaptchaToken] = useState('')
  const turnstileRef = useRef<TurnstileInstance>(null)

  const [state, formAction, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await requestPasswordReset(prev, formData)
      // Turnstile tokens are single-use
      turnstileRef.current?.reset()
      setCaptchaToken('')
      return result
    },
    initialState,
  )

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 text-text-primary">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Enter your account email and we&apos;ll send you a link to choose a
          new password.
        </p>

        {state.message ? (
          <div
            role="status"
            className="mt-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          >
            {state.message}
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-md border border-border-strong bg-surface-raised px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              />
            </div>

            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={setCaptchaToken}
              onExpire={() => setCaptchaToken('')}
              onError={() => setCaptchaToken('')}
              options={{ theme: 'auto' }}
            />
            <input type="hidden" name="captchaToken" value={captchaToken} />

            {state.error && (
              <p role="alert" className="text-sm text-danger">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending || !captchaToken}
              className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-contrast transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link href="/login" className="text-accent hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  )
}
