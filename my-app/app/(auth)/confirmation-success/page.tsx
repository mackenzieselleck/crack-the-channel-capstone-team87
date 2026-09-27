import Link from 'next/link';

export default function ConfirmationSuccessPage() {
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

          <Link
            href="/login"
            className="rounded-md border border-[#AAB4C0] px-5 py-2.5 text-sm font-medium text-[#06152B] transition hover:border-[#0F62FE] hover:text-[#0F62FE]"
          >
            Log in
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
              Your email has been successfully confirmed. Your Crack the
              Channel account is now ready to continue.
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
                    You can now continue setting up your learner profile and
                    begin exploring the platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary action */}
            <Link
              href="/onboarding"
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-md bg-[#0F62FE] px-6 py-3.5 font-medium text-white transition hover:bg-[#0353E9]"
            >
              Continue to onboarding
              <span aria-hidden="true">→</span>
            </Link>

            <p className="mt-5 text-sm text-[#52606D]">
              Already completed onboarding?{' '}
              <Link
                href="/login"
                className="font-medium text-[#0F62FE] hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-[#7A8694]">
            Your learning progress will be securely linked to your account.
          </p>
        </div>
      </section>
    </main>
  );
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