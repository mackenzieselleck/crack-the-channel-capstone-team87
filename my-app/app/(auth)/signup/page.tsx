'use client';

import { signup } from './actions';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Image from 'next/image';

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [pending, setPending] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const router = useRouter();

  return (
    <main className="min-h-screen bg-surface text-text-primary">
      {/* Header */}
      <header className="border-b border-border bg-surface-raised">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-text-primary"
          >
            Crack the Channel
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-text-secondary sm:inline">
              Already have an account?
            </span>

            <Link
              href="/login"
              className="rounded-md border border-border-strong px-5 py-2.5 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24">
        {/* Graphic / branding side */}
        <div className="hidden lg:block">
          <Image
            src="/images/marketing/signup-learning-journey.png"
            alt=""
            width={1334}
            height={1179}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-auto max-h-[500px] w-full object-contain p-6"
          />

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Quantum ideas. Real security.
            </p>

            <p className="mt-3 max-w-lg text-lg leading-8 text-text-secondary">
              Start building your understanding of quantum computing,
              cybersecurity and secure communication.
            </p>
          </div>
        </div>

        {/* Signup form */}
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-lg border border-border bg-surface-raised p-8 sm:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Get started
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-text-primary">
              Create your account
            </h1>

            <p className="mt-4 leading-7 text-text-secondary">
              Join Crack the Channel and begin your quantum cybersecurity
              learning journey.
            </p>

            <form
              className="mt-8 space-y-6"
              action={async (formData) => {
                setError(null);

                // server checks again for password confirmation
                if (formData.get('password') !== formData.get('confirmPassword')) {
                  setError('Passwords do not match');
                  return;
                }

                setPending(true);
                formData.set('captchaToken', captchaToken);

                const result = await signup(formData);

                if (result?.error) {
                  setError(result.error);
                  // Turnstile tokens are single-use
                  turnstileRef.current?.reset();
                  setCaptchaToken('');
                  setPending(false);
                  return;
                }

                router.push('/email-confirmation');
              }}
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-md border border-border-strong bg-surface-raised px-4 py-3 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  required
                  className="w-full rounded-md border border-border-strong bg-surface-raised px-4 py-3 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/10"
                />

                <p className="mt-2 text-xs leading-5 text-text-secondary">
                  Choose a secure password for your account.
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Confirm password
                </label>

                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  maxLength={72}
                  required
                  className="w-full rounded-md border border-border-strong bg-surface-raised px-4 py-3 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/10"
                />

                <p className="mt-2 text-xs leading-5 text-text-secondary">
                  Re-enter your password to confirm it.
                </p>
              </div>

              {/* CAPTCHA */}
              <div>
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onSuccess={setCaptchaToken}
                  onExpire={() => setCaptchaToken('')}
                  onError={() => setCaptchaToken('')}
                  options={{ theme: 'auto', size: 'flexible' }}
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
                disabled={pending || !captchaToken}
                className="w-full rounded-md bg-accent px-6 py-3.5 font-medium text-accent-contrast transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-accent hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-text-secondary">
            Your account lets us securely save your learning progress.
          </p>
        </div>
      </section>
    </main>
  );
}