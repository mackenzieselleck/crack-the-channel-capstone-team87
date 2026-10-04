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
              Account setup
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F0FF] text-sm font-semibold text-[#0F62FE]">
              2
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24">
        {/* Left side */}
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#0F62FE]">
            Almost there
          </p>

          <h1 className="max-w-xl text-5xl font-bold leading-[1.08] tracking-tight">
            Set up your
            <br />
            <span className="text-[#0F62FE]">learning profile.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-[#52606D]">
            Tell us a little about yourself before starting your Crack the
            Channel learning journey.
          </p>

          {/* Progress steps */}
          <div className="mt-10 max-w-lg rounded-lg border border-[#DDE3EA] bg-white">
            {/* Step 1 */}
            <div className="flex items-start gap-4 border-b border-[#DDE3EA] p-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF] text-[#0F62FE]">
                <CheckIcon />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#06152B]">
                  Create your account
                </p>

                <p className="mt-1 text-sm leading-6 text-[#52606D]">
                  Your account has been created and verified.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 border-b border-[#DDE3EA] bg-[#F7FAFF] p-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F62FE] text-sm font-semibold text-white">
                2
              </div>

              <div>
                <p className="text-sm font-semibold text-[#06152B]">
                  Set up your profile
                </p>

                <p className="mt-1 text-sm leading-6 text-[#52606D]">
                  Add your name so we can personalise your experience.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#B8C2CE] text-sm font-semibold text-[#7A8694]">
                3
              </div>

              <div>
                <p className="text-sm font-semibold text-[#52606D]">
                  Start learning
                </p>

                <p className="mt-1 text-sm leading-6 text-[#7A8694]">
                  Explore quantum security through lessons and simulations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-lg border border-[#DDE3EA] bg-white p-8 sm:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#0F62FE]">
              Your profile
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-[#06152B]">
              What should we call you?
            </h2>

            <p className="mt-4 leading-7 text-[#52606D]">
              Add your name to complete your profile. You can update these
              details later.
            </p>

            {/* Account info */}
            {user.email && (
              <div className="mt-7 rounded-md border border-[#DDE3EA] bg-[#F7F9FC] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7A8694]">
                  Signed in as
                </p>

                <p className="mt-1 text-sm font-medium text-[#06152B]">
                  {user.email}
                </p>
              </div>
            )}

            <form action={completeOnboarding} className="mt-8 space-y-6">
              {/* First name */}
              <div>
                <label
                  htmlFor="first_name"
                  className="mb-2 block text-sm font-medium text-[#06152B]"
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
                  className="w-full rounded-md border border-[#AAB4C0] bg-white px-4 py-3 text-[#06152B] outline-none transition placeholder:text-[#98A2AE] focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/10"
                />
              </div>

              {/* Last name */}
              <div>
                <label
                  htmlFor="last_name"
                  className="mb-2 block text-sm font-medium text-[#06152B]"
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
                  className="w-full rounded-md border border-[#AAB4C0] bg-white px-4 py-3 text-[#06152B] outline-none transition placeholder:text-[#98A2AE] focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/10"
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
                className="flex w-full items-center justify-center gap-3 rounded-md bg-[#0F62FE] px-6 py-3.5 font-medium text-white transition hover:bg-[#0353E9]"
              >
                Continue
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="mt-7 border-t border-[#DDE3EA] pt-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 text-[#0F62FE]">
                  <InfoIcon />
                </div>

                <p className="text-xs leading-5 text-[#7A8694]">
                  Your profile information is used to personalise your learning
                  experience and is linked securely to your account.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs uppercase tracking-[0.16em] text-[#7A8694]">
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