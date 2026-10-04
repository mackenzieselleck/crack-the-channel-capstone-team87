import Link from 'next/link';

export default function CheckEmailPage() {
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
              Already verified?
            </span>

            <Link
              href="/login"
              className="rounded-md border border-[#AAB4C0] px-5 py-2.5 text-sm font-medium text-[#06152B] transition hover:border-[#0F62FE] hover:text-[#0F62FE]"
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#0F62FE]">
            Account verification
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-[#06152B] sm:text-5xl">
            Check your email
          </h1>

          <p className="mt-5 max-w-md text-lg leading-8 text-[#52606D]">
            We&apos;ve sent you a confirmation link. Open the email and verify
            your account to continue your Crack the Channel journey.
          </p>

          {/* Steps */}
          <div className="mt-10 space-y-5">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF] text-sm font-semibold text-[#0F62FE]">
                1
              </div>

              <div>
                <p className="font-medium text-[#06152B]">
                  Open your email inbox
                </p>

                <p className="mt-1 text-sm leading-6 text-[#52606D]">
                  Look for an email from Crack the Channel.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF] text-sm font-semibold text-[#0F62FE]">
                2
              </div>

              <div>
                <p className="font-medium text-[#06152B]">
                  Confirm your account
                </p>

                <p className="mt-1 text-sm leading-6 text-[#52606D]">
                  Select the confirmation link included in the email.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF] text-sm font-semibold text-[#0F62FE]">
                3
              </div>

              <div>
                <p className="font-medium text-[#06152B]">
                  Continue learning
                </p>

                <p className="mt-1 text-sm leading-6 text-[#52606D]">
                  Once verified, log in and continue to the platform.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation card */}
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-lg border border-[#DDE3EA] bg-white p-8 text-center sm:p-10">
            {/* Mail icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F0FF] text-[#0F62FE]">
              <MailIcon />
            </div>

            <h2 className="mt-7 text-2xl font-bold tracking-tight text-[#06152B]">
              Confirmation link sent
            </h2>

            <p className="mx-auto mt-3 max-w-sm leading-7 text-[#52606D]">
              Follow the link in your email to verify your account.
            </p>

            {/* Help box */}
            <div className="mt-7 rounded-md border border-[#DDE3EA] bg-[#F7F9FC] p-4 text-left">
              <div className="flex gap-3">
                <div className="mt-0.5 shrink-0 text-[#0F62FE]">
                  <InfoIcon />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#06152B]">
                    Didn&apos;t receive the email?
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#52606D]">
                    Check your spam or junk folder and make sure you entered
                    the correct email address.
                  </p>
                </div>
              </div>
            </div>

            {/* Nonfunctional visual control */}
            <button
              type="button"
              className="mt-7 w-full rounded-md border border-[#AAB4C0] bg-white px-6 py-3.5 font-medium text-[#06152B] transition hover:border-[#0F62FE] hover:text-[#0F62FE]"
            >
              Resend email
            </button>

            <p className="mt-3 text-xs text-[#7A8694]">
              Resend functionality to be connected still.
            </p>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#DDE3EA]" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#7A8694]">
                or
              </span>
              <div className="h-px flex-1 bg-[#DDE3EA]" />
            </div>

            <Link
              href="/login"
              className="block w-full rounded-md bg-[#0F62FE] px-6 py-3.5 font-medium text-white transition hover:bg-[#0353E9]"
            >
              Go to login
            </Link>
          </div>

          <Link
            href="/"
            className="mt-6 block text-center text-sm font-medium text-[#52606D] transition hover:text-[#0F62FE]"
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