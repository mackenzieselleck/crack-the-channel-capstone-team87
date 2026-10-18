import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { completeOnboarding } from './actions';
import Link from 'next/link';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  // User has already completed onboarding
  if (profile?.first_name && profile?.last_name) {
    redirect('/dashboard');
  }

  const { error } = await searchParams;

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
              Account setup
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
              2
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24">
        {/* Left side */}
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Almost there
          </p>

          <h1 className="max-w-xl text-5xl font-bold leading-[1.08] tracking-tight">
            Set up your
            <br />
            <span className="text-accent">learning profile.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-text-secondary">
            Tell us a little about yourself before starting your Crack the
            Channel learning journey.
          </p>

          {/* Progress steps */}
          <div className="mt-10 max-w-lg rounded-lg border border-border bg-surface-raised">
            {/* Step 1 */}
            <div className="flex items-start gap-4 border-b border-border p-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <CheckIcon />
              </div>

              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Create your account
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  Your account has been created and verified.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 border-b border-border bg-accent/5 p-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-contrast">
                2
              </div>

              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Set up your profile
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  Add your name so we can personalise your experience.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-strong text-sm font-semibold text-text-secondary">
                3
              </div>

              <div>
                <p className="text-sm font-semibold text-text-secondary">
                  Start learning
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  Explore quantum security through lessons and simulations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-lg border border-border bg-surface-raised p-8 sm:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Your profile
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-text-primary">
              What should we call you?
            </h2>

            <p className="mt-4 leading-7 text-text-secondary">
              Add your name to complete your profile. You can update these
              details later.
            </p>

            {/* Account info */}
            {user.email && (
              <div className="mt-7 rounded-md border border-border bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">
                  Signed in as
                </p>

                <p className="mt-1 text-sm font-medium text-text-primary">
                  {user.email}
                </p>
              </div>
            )}

            <form action={completeOnboarding} className="mt-8 space-y-6">
              {/* First name */}
              <div>
                <label
                  htmlFor="first_name"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  First name
                </label>

                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Enter your first name"
                  required
                  className="w-full rounded-md border border-border-strong bg-surface-raised px-4 py-3 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>

              {/* Last name */}
              <div>
                <label
                  htmlFor="last_name"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Last name
                </label>

                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Enter your last name"
                  required
                  className="w-full rounded-md border border-border-strong bg-surface-raised px-4 py-3 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/10"
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
                className="flex w-full items-center justify-center gap-3 rounded-md bg-accent px-6 py-3.5 font-medium text-accent-contrast transition hover:bg-accent-strong"
              >
                Continue
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="mt-7 border-t border-border pt-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 text-accent">
                  <InfoIcon />
                </div>

                <p className="text-xs leading-5 text-text-secondary">
                  Your profile information is used to personalise your learning
                  experience and is linked securely to your account.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs uppercase tracking-[0.16em] text-text-secondary">
            Step 2 of 3 · Profile setup
          </p>
        </div>
      </section>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="18"
      height="18"
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