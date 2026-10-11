import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// dependent on user's session
export const dynamic = 'force-dynamic'

export default async function ConfirmationSuccessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // reachable after /auth/confirm has verified link and set session
  if (!user || !user.email_confirmed_at) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .maybeSingle()

  const onboarded = Boolean(
    profile?.first_name?.trim() && profile?.last_name?.trim(),
  )

  const cta = onboarded
    ? { href: '/learn/test-module', label: 'Continue learning' }
    : { href: '/onboarding', label: 'Continue to onboarding' }

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
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-20 lg:px-10 lg:py-28">
        <div className="w-full max-w-xl">
          <div className="rounded-lg border border-[#DDE3EA] bg-white px-8 py-12 text-center sm:px-12">
            {/* Success icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F0FF] text-[#0F62FE]">
              <CheckIcon />
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-[#0F62FE]">
              Account verified
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#06152B]">
              You&apos;re verified
            </h1>

            <p className="mx-auto mt-5 max-w-md leading-7 text-[#52606D]">
              Your email has been confirmed and you&apos;re now signed in to
              Crack the Channel.
            </p>

            {/* Status box */}
            <div className="mt-8 rounded-md border border-[#DDE3EA] bg-[#F7F9FC] p-5 text-left">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF] text-[#0F62FE]">
                  <SmallCheckIcon />
                </div>

                <div>
                  <p className="font-medium text-[#06152B]">
                    Email verification complete
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#52606D]">
                    {onboarded
                      ? 'Your learner profile is already set up. Pick up where you left off.'
                      : 'Next, set up your learner profile and start your quantum journey.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary action */}
            <Link
              href={cta.href}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-md bg-[#0F62FE] px-6 py-3.5 font-medium text-white transition hover:bg-[#0353E9]"
            >
              {cta.label}
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-[#7A8694]">
            Your learning progress will be securely linked to your account.
          </p>
        </div>
      </section>
    </main>
  )
}

function CheckIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function SmallCheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m6 12 4 4 8-8" />
    </svg>
  );
}