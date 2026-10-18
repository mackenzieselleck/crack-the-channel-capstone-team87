import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  LockKeyhole,
  RadioTower,
  Sparkles,
  UserRound,
} from 'lucide-react';

import Navbar from '@/components/spike/navbar';
import { requireOnboarding } from '@/lib/auth/guards';

// Dashboard portal for authenticated and onboarded users.
export default async function Dashboard() {
  const { profile } = await requireOnboarding();

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-10">
        {/* Welcome and featured activity */}
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="flex flex-col justify-center py-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Your learning portal
            </p>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome back, {profile.first_name}!
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary">
              Ready to explore the world of quantum security?
              Learn the concepts, experiment with quantum key
              distribution, and put your knowledge into practice.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-medium text-accent-contrast transition hover:bg-accent-strong"
              >
                Start learning
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <Link
                href="/simulator"
                className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-6 py-3 font-medium text-text-primary transition hover:border-accent"
              >
                Open simulator
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* BB84 concept illustration, not live simulator data */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Quantum security
              </span>

              <RadioTower
                size={22}
                className="text-accent"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Explore secure communication
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Discover how Alice and Bob exchange information using
              quantum principles.
            </p>

            {/* Alice - Quantum channel - Bob */}
            <div className="mt-9 rounded-xl border border-border bg-surface p-5 sm:p-6">
              <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-semibold text-accent">
                    A
                  </div>
                  <span className="text-xs font-medium">
                    Alice
                  </span>
                </div>

                <div
                  className="text-accent"
                  aria-hidden="true"
                >
                  <ArrowRight size={20} />
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border-strong bg-surface-raised text-accent">
                    <RadioTower size={22} />
                  </div>
                  <span className="text-xs font-medium">
                    Channel
                  </span>
                </div>

                <div
                  className="text-accent"
                  aria-hidden="true"
                >
                  <ArrowRight size={20} />
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-semibold text-accent">
                    B
                  </div>
                  <span className="text-xs font-medium">
                    Bob
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-4 text-xs text-text-secondary">
                <LockKeyhole size={15} aria-hidden="true" />
                BB84 key distribution concept
              </div>
            </div>

            <Link
              href="/simulator"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
            >
              Explore the BB84 simulator
              <ChevronRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Main activities */}
        <section className="mt-16">
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Get started
            </p>

            <h2 className="text-2xl font-bold tracking-tight">
              Explore your activities
            </h2>

            <p className="mt-2 text-text-secondary">
              Choose how you want to continue your quantum security journey.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Learning */}
            <Link
              href="/learn"
              className="group flex flex-col rounded-xl border border-border bg-surface-raised p-7 transition hover:border-accent"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <BookOpen size={27} aria-hidden="true" />
              </div>

              <h3 className="text-xl font-semibold">
                Learning
              </h3>

              <p className="mt-3 flex-1 leading-7 text-text-secondary">
                Build your understanding of quantum computing,
                cryptography, and cybersecurity through interactive
                learning activities.
              </p>

              <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
                <span className="text-sm font-semibold text-accent">
                  Explore learning
                </span>

                <ArrowUpRight
                  size={20}
                  className="text-accent transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </div>
            </Link>

            {/* Simulator */}
            <Link
              href="/simulator"
              className="group flex flex-col rounded-xl border border-border bg-surface-raised p-7 transition hover:border-accent"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <RadioTower size={27} aria-hidden="true" />
              </div>

              <h3 className="text-xl font-semibold">
                BB84 Simulator
              </h3>

              <p className="mt-3 flex-1 leading-7 text-text-secondary">
                Experiment with quantum key distribution and
                investigate how Alice, Bob, and Eve affect the
                security of communication.
              </p>

              <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
                <span className="text-sm font-semibold text-accent">
                  Launch simulator
                </span>

                <ArrowUpRight
                  size={20}
                  className="text-accent transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </div>
            </Link>
          </div>
        </section>

        {/* Daily Challenge placeholder */}
        <section className="mt-12">
          <div className="rounded-xl border border-border bg-surface-raised p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Sparkles size={24} aria-hidden="true" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold">
                      Daily Challenge
                    </h2>

                    <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
                      Coming soon
                    </span>
                  </div>

                  <p className="mt-3 max-w-2xl leading-7 text-text-secondary">
                    Put your knowledge to the test with daily
                    challenges, difficulty tiers, and hints.
                    Challenge yourself and develop your skills.
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-text-secondary">
                <CheckCircle2 size={25} aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* Profile shortcut */}
        <section className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                Looking for your achievements?
              </h2>

              <p className="mt-2 text-sm text-text-secondary">
                Your XP, challenge streak, and badges are available
                on your profile.
              </p>
            </div>

            <Link
              href="/profile"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-accent hover:underline"
            >
              <UserRound size={17} aria-hidden="true" />
              View profile
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
