import Link from 'next/link'
import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>
}) {
  const { next, reset } = await searchParams

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
              New to the platform?
            </span>

            <Link
              href="/signup"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-contrast transition hover:bg-accent-strong"
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
          <div className="flex min-h-[460px] items-center justify-center rounded-lg border border-border-strong bg-surface-raised">
            <div className="flex h-[360px] w-[82%] items-center justify-center border border-border-strong bg-surface">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                <div className="absolute left-0 top-1/2 h-px w-full -rotate-[28deg] bg-border-strong" />
                <div className="absolute left-0 top-1/2 h-px w-full rotate-[28deg] bg-border-strong" />

                <span className="relative bg-surface px-4 text-xs font-medium uppercase tracking-[0.25em] text-text-secondary">
                  Graphic
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Welcome back
            </p>

            <p className="mt-3 max-w-lg text-lg leading-8 text-text-secondary">
              Continue learning about quantum computing, BB84 and the future
              of secure communication.
            </p>
          </div>
        </div>

        {/* Login form */}
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-lg border border-border bg-surface-raised p-8 sm:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Continue learning
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-text-primary">
              Log in
            </h1>

            <p className="mt-4 leading-7 text-text-secondary">
              Sign in to continue your Crack the Channel learning journey.
            </p>

            {reset === 'success' && (
              <div
                role="status"
                className="mt-6 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
              >
                Password updated. Log in with your new password.
              </div>
            )}

            {/* `next` is validated server-side by safeNext() in the login action */}
            <LoginForm next={typeof next === 'string' ? next : ''} />

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-center text-sm text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-accent hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-text-secondary">
            Your progress is securely linked to your account.
          </p>
        </div>
      </section>
    </main>
  )
}
