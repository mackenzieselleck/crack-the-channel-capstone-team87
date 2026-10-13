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
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-6 text-[#06152B]">
      <div className="w-full max-w-md rounded-xl border border-[#DDE3EA] bg-white p-8">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-[#52606D]">
          Enter your account email and we&apos;ll send you a link to choose a
          new password.
        </p>

        {state.message ? (
          <div
            role="status"
            className="mt-6 rounded-lg border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3 text-sm text-[#027A48]"
          >
            {state.message}
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-[#06152B]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-md border border-[#AAB4C0] bg-white px-3 py-2 text-sm text-[#06152B] outline-none focus:border-[#0F62FE]"
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

            <button
              type="submit"
              disabled={pending || !captchaToken}
              className="w-full rounded-md bg-[#0F62FE] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0353E9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#52606D]">
          <Link href="/login" className="text-[#0F62FE] hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  )
}
