'use client'

import Link from 'next/link'
import { useActionState, useRef, useState } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { login, type LoginState } from './actions'

const initialState: LoginState = {}

const inputClass =
  'w-full rounded-md border border-[#AAB4C0] bg-white px-4 py-3 text-[#06152B] outline-none transition placeholder:text-[#7A8694] focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20'

export function LoginForm({ next }: { next: string }) {
  const [captchaToken, setCaptchaToken] = useState('')
  const turnstileRef = useRef<TurnstileInstance>(null)

  const [state, formAction, pending] = useActionState(
    async (prev: LoginState, formData: FormData) => {
      const result = await login(prev, formData)
      // only reached on failure
      turnstileRef.current?.reset()
      setCaptchaToken('')
      return result
    },
    initialState,
  )

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="captchaToken" value={captchaToken} />

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-[#06152B]"
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className={inputClass}
        />
      </div>

      {/* Password */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-[#06152B]"
          >
            Password
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#0F62FE] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          maxLength={72}
          required
          className={inputClass}
        />
      </div>

      {/* CAPTCHA */}
      <Turnstile
        ref={turnstileRef}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setCaptchaToken}
        onExpire={() => setCaptchaToken('')}
        onError={() => setCaptchaToken('')}
        options={{ theme: 'light', size: 'flexible' }}
      />

      {/* Error */}
      {state.error && (
        <div
          role="alert"
          className="rounded-md border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]"
        >
          {state.error}
          {state.unconfirmed && (
            <>
              {' '}
              <Link
                href="/email-confirmation"
                className="font-medium underline underline-offset-2"
              >
                Resend confirmation email
              </Link>
            </>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending || !captchaToken}
        className="w-full rounded-md bg-[#0F62FE] px-6 py-3.5 font-medium text-white transition hover:bg-[#0353E9] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}
