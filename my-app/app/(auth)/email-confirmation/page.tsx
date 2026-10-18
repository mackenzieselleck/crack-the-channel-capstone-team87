import Link from 'next/link';
import { ResendConfirmationForm } from './resend-confirmation-form';

export default function CheckEmailPage() {
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
              Already verified?
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

      {/* Content */}
      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24">
        {/* Left content */}
        <div className="mx-auto w-full max-w-lg lg:mx-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Account verification
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Check your email
          </h1>

          <p className="mt-5 max-w-md text-lg leading-8 text-text-secondary">
            We&apos;ve sent you a confirmation link. Open the email and verify
            your account to continue your Crack the Channel journey.
          </p>

          {/* Steps */}
          <div className="mt-10 space-y-5">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                1
              </div>

              <div>
                <p className="font-medium text-text-primary">
                  Open your email inbox
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  Look for an email from Crack the Channel.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                2
              </div>

              <div>
                <p className="font-medium text-text-primary">
                  Confirm your account
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  Select the confirmation link included in the email.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                3
              </div>

              <div>
                <p className="font-medium text-text-primary">
                  Continue learning
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                   The link signs you in and takes you straight to setting up your profile.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation card */}
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-lg border border-border bg-surface-raised p-8 text-center sm:p-10">
            {/* Mail icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent">
              <MailIcon />
            </div>

            <h2 className="mt-7 text-2xl font-bold tracking-tight text-text-primary">
              Confirmation link sent
            </h2>

            <p className="mx-auto mt-3 max-w-sm leading-7 text-text-secondary">
              Follow the link in your email to verify your account.
            </p>

            {/* Help box */}
            <div className="mt-7 rounded-md border border-border bg-surface p-4 text-left">
              <div className="flex gap-3">
                <div className="mt-0.5 shrink-0 text-accent">
                  <InfoIcon />
                </div>

                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Didn&apos;t receive the email?
                  </p>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    Check your spam or junk folder and make sure you entered
                    the correct email address. Still nothing? Enter your
                    email below and we&apos;ll send a new link. Links expire,
                    so use the most recent one.
                  </p>
                </div>
              </div>
            </div>

            {/* Resend confirmation */}
            <ResendConfirmationForm />

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Link
              href="/login"
              className="block w-full rounded-md bg-accent px-6 py-3.5 font-medium text-accent-contrast transition hover:bg-accent-strong"
            >
              Go to login
            </Link>
          </div>

          <Link
            href="/"
            className="mt-6 block text-center text-sm font-medium text-text-secondary transition hover:text-accent"
          >
            ← Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}

function MailIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}