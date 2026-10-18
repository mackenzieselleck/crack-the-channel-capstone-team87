import Link from 'next/link';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function Home() {
  return (
    <main className="min-h-screen bg-surface text-text-primary">
      {/* Navigation */}
      <header className="border-b border-border bg-surface-raised">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-text-primary"
          >
            Crack the Channel
          </Link>

          <nav className="flex flex-wrap items-center gap-3 sm:gap-6">
            <div className="hidden items-center gap-7 md:flex">
              <a
                href="#learn"
                className="text-sm font-medium text-text-secondary transition hover:text-accent"
              >
                Learn
              </a>

              <a
                href="#simulate"
                className="text-sm font-medium text-text-secondary transition hover:text-accent"
              >
                Simulate
              </a>
            </div>

            {/* Light/Dark theme toggle */}
            <ThemeToggle />

            <Link
              href="/login"
              className="rounded-md border border-border-strong px-5 py-2.5 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-contrast transition hover:bg-accent-strong"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-28">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Learn. Simulate. Defend.
          </p>

          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Learn quantum.
            <br />
            <span className="text-accent">
              Build your future.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-text-secondary">
            Interactive lessons, hands-on simulations and real-world
            cybersecurity applications designed to make quantum security
            approachable.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 rounded-md bg-accent px-7 py-3.5 font-medium text-accent-contrast transition hover:bg-accent-strong"
            >
              Start Learning
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="/login"
              className="rounded-md border border-border-strong bg-surface-raised px-7 py-3.5 font-medium text-text-primary transition hover:border-accent hover:text-accent"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Graphic placeholder */}
        <div className="flex min-h-[380px] items-center justify-center rounded-lg border border-border-strong bg-surface-raised">
          <div className="flex h-[300px] w-[85%] items-center justify-center border border-border-strong bg-surface">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <div className="absolute left-0 top-1/2 h-px w-full -rotate-[28deg] bg-border-strong" />

              <div className="absolute left-0 top-1/2 h-px w-full rotate-[28deg] bg-border-strong" />

              <span className="relative bg-surface px-4 text-xs font-medium uppercase tracking-[0.25em] text-text-secondary">
                Graphic
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature section */}
      <section className="border-t border-border bg-surface-raised">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {/* Learn */}
          <article
            id="learn"
            className="border-b border-border px-8 py-10 md:border-b-0 md:border-r"
          >
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md border border-accent text-accent">
              <BookIcon />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              01
            </p>

            <h2 className="text-xl font-semibold text-text-primary">
              Learn
            </h2>

            <p className="mt-3 max-w-xs leading-7 text-text-secondary">
              Build your understanding of quantum computing and security
              concepts at your own pace.
            </p>
          </article>

          {/* Simulate */}
          <article
            id="simulate"
            className="border-b border-border px-8 py-10 md:border-b-0 md:border-r"
          >
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md border border-accent text-accent">
              <SimulationIcon />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              02
            </p>

            <h2 className="text-xl font-semibold text-text-primary">
              Simulate
            </h2>

            <p className="mt-3 max-w-xs leading-7 text-text-secondary">
              Explore BB84 and quantum key distribution through interactive
              simulations.
            </p>
          </article>

          {/* Apply */}
          <article className="px-8 py-10">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md border border-accent text-accent">
              <ShieldIcon />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              03
            </p>

            <h2 className="text-xl font-semibold text-text-primary">
              Apply
            </h2>

            <p className="mt-3 max-w-xs leading-7 text-text-secondary">
              See how quantum concepts connect to real-world cybersecurity
              and secure communications.
            </p>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p className="text-sm font-medium text-text-primary">
            Crack the Channel
          </p>

          <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
            Quantum knowledge. A more secure tomorrow.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* Learning icon */
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

/* Simulation icon */
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

/* Security icon */
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