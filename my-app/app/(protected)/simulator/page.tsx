'use client';

import BB84Simulator from '@/components/simulator/BB84Simulator';

export default function SimulatorPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 pb-40 pt-12">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent-simulator)]">
          Quantum Key Distribution
        </p>

        <h1 className="font-body text-2xl font-semibold text-[var(--text-primary)]">
          BB84 Simulator
        </h1>

        <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">
          Take part in a BB84 key exchange and see how Alice, Bob and Eve affect
          the security of a quantum channel.
        </p>
      </div>

      <BB84Simulator />
    </main>
  );
}