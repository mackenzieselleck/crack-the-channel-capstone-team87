import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] text-[#06152B]">
      {/* Navigation */}
      <header className="border-b border-[#DDE3EA] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#06152B]"
          >
            Crack the Channel
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6">
            <div className="hidden items-center gap-7 md:flex">
              <a
                href="#learn"
                className="text-sm font-medium text-[#52606D] transition hover:text-[#0F62FE]"
              >
                Learn
              </a>

              <a
                href="#simulate"
                className="text-sm font-medium text-[#52606D] transition hover:text-[#0F62FE]"
              >
                Simulate
              </a>

              <a
                href="#about"
                className="text-sm font-medium text-[#52606D] transition hover:text-[#0F62FE]"
              >
                About
              </a>
            </div>

            <Link
              href="/login"
              className="rounded-md border border-[#AAB4C0] px-5 py-2.5 text-sm font-medium text-[#06152B] transition hover:border-[#0F62FE] hover:text-[#0F62FE]"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-md bg-[#0F62FE] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0353E9]"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        id="about"
        className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-28"
      >
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#0F62FE]">
            Learn. Simulate. Defend.
          </p>

          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Learn quantum.
            <br />
            <span className="text-[#0F62FE]">Build your future.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-[#52606D]">
            Interactive lessons, hands-on simulations and real-world
            cybersecurity applications designed to make quantum security
            approachable.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 rounded-md bg-[#0F62FE] px-7 py-3.5 font-medium text-white transition hover:bg-[#0353E9]"
            >
              Start Learning
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="/login"
              className="rounded-md border border-[#AAB4C0] bg-white px-7 py-3.5 font-medium text-[#06152B] transition hover:border-[#0F62FE] hover:text-[#0F62FE]"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Graphic placeholder */}
        <div className="flex min-h-[380px] items-center justify-center rounded-lg border border-[#B8C2CE] bg-white">
          <div className="flex h-[300px] w-[85%] items-center justify-center border border-[#B8C2CE] bg-[#F7F9FC]">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <div className="absolute left-0 top-1/2 h-px w-full -rotate-[28deg] bg-[#B8C2CE]" />
              <div className="absolute left-0 top-1/2 h-px w-full rotate-[28deg] bg-[#B8C2CE]" />

              <span className="relative bg-[#F7F9FC] px-4 text-xs font-medium uppercase tracking-[0.25em] text-[#7A8694]">
                Graphic
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature section */}
      <section className="border-t border-[#DDE3EA] bg-white">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          <article
            id="learn"
            className="border-b border-[#DDE3EA] px-8 py-10 md:border-b-0 md:border-r"
          >
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md border border-[#0F62FE] text-[#0F62FE]">
              <BookIcon />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0F62FE]">
              01
            </p>

            <h2 className="text-xl font-semibold">Learn</h2>

            <p className="mt-3 max-w-xs leading-7 text-[#52606D]">
              Build your understanding of quantum computing and security
              concepts at your own pace.
            </p>
          </article>

          <article
            id="simulate"
            className="border-b border-[#DDE3EA] px-8 py-10 md:border-b-0 md:border-r"
          >
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md border border-[#0F62FE] text-[#0F62FE]">
              <SimulationIcon />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0F62FE]">
              02
            </p>

            <h2 className="text-xl font-semibold">Simulate</h2>

            <p className="mt-3 max-w-xs leading-7 text-[#52606D]">
              Explore BB84 and quantum key distribution through interactive
              simulations.
            </p>
          </article>

          <article className="px-8 py-10">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md border border-[#0F62FE] text-[#0F62FE]">
              <ShieldIcon />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0F62FE]">
              03
            </p>

            <h2 className="text-xl font-semibold">Apply</h2>

            <p className="mt-3 max-w-xs leading-7 text-[#52606D]">
              See how quantum concepts connect to real-world cybersecurity and
              secure communications.
            </p>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DDE3EA] bg-[#F7F9FC]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p className="text-sm font-medium text-[#06152B]">
            Crack the Channel
          </p>

          <p className="text-xs uppercase tracking-[0.2em] text-[#7A8694]">
            Quantum knowledge. A more secure tomorrow.
          </p>
        </div>
      </footer>
    </main>
  );
}

function BookIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23V5.5Z" />
      <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5A3.5 3.5 0 0 1 20 23V5.5Z" />
    </svg>
  );
}

function SimulationIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M9 3v6l-5 9a2 2 0 0 0 1.75 3h12.5A2 2 0 0 0 20 18l-5-9V3" />
      <path d="M7 14h10" />
      <path d="M8 3h8" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M12 3 20 6v5c0 5.25-3.5 8.75-8 10-4.5-1.25-8-4.75-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}