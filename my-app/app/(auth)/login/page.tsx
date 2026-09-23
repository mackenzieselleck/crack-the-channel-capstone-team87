'use client';

import { login } from './actions';
import { Turnstile } from '@marsidev/react-turnstile';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-[#06152B]">
      {/* Header */}
      <header className="border-b border-[#DDE3EA] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#06152B]"
          >
            Crack the Channel
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#52606D] sm:inline">
              New to the platform?
            </span>

            <Link
              href="/signup"
              className="rounded-md bg-[#0F62FE] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0353E9]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24">
        {/* Graphic / branding side */}
        <div className="hidden lg:block">
          <div className="flex min-h-[460px] items-center justify-center rounded-lg border border-[#B8C2CE] bg-white">
            <div className="flex h-[360px] w-[82%] items-center justify-center border border-[#B8C2CE] bg-[#F7F9FC]">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                <div className="absolute left-0 top-1/2 h-px w-full -rotate-[28deg] bg-[#B8C2CE]" />
                <div className="absolute left-0 top-1/2 h-px w-full rotate-[28deg] bg-[#B8C2CE]" />

                <span className="relative bg-[#F7F9FC] px-4 text-xs font-medium uppercase tracking-[0.25em] text-[#7A8694]">
                  Graphic
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0F62FE]">
              Welcome back
            </p>

            <p className="mt-3 max-w-lg text-lg leading-8 text-[#52606D]">
              Continue learning about quantum computing, BB84 and the future
              of secure communication.
            </p>
          </div>
        </div>

        {/* Login form */}
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-lg border border-[#DDE3EA] bg-white p-8 sm:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#0F62FE]">
              Continue learning
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-[#06152B]">
              Log in
            </h1>

            <p className="mt-4 leading-7 text-[#52606D]">
              Sign in to continue your Crack the Channel learning journey.
            </p>

            <form
              className="mt-8 space-y-6"
              action={async (formData) => {
                setError(null);

                formData.set('captchaToken', captchaToken);

                const result = await login(formData);

                if (result?.error) {
                  setError(result.error);
                }
              }}
            >
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
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-md border border-[#AAB4C0] bg-white px-4 py-3 text-[#06152B] outline-none transition placeholder:text-[#98A2AE] focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/10"
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

                  {/* Visual placeholder for future password reset */}
                  <button
                    type="button"
                    className="text-sm font-medium text-[#0F62FE] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-md border border-[#AAB4C0] bg-white px-4 py-3 text-[#06152B] outline-none transition placeholder:text-[#98A2AE] focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/10"
                />
              </div>

              {/* CAPTCHA */}
              <div>
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onSuccess={setCaptchaToken}
                  onExpire={() => setCaptchaToken('')}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-md bg-[#0F62FE] px-6 py-3.5 font-medium text-white transition hover:bg-[#0353E9]"
              >
                Log in
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#DDE3EA]" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#7A8694]">
                or
              </span>
              <div className="h-px flex-1 bg-[#DDE3EA]" />
            </div>

            <p className="text-center text-sm text-[#52606D]">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-[#0F62FE] hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-[#7A8694]">
            Your progress is securely linked to your account.
          </p>
        </div>
      </section>
    </main>
  );
}