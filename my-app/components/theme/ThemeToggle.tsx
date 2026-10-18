
'use client';

import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const toggleTheme = () => {
    const current =
      document.documentElement.dataset.theme === 'dark'
        ? 'dark'
        : 'light';

    const nextTheme = current === 'dark' ? 'light' : 'dark';

    // Apply the selected theme immediately.
    document.documentElement.dataset.theme = nextTheme;

    // Remember the preference for future visits.
    try {
      localStorage.setItem('ctc-theme', nextTheme);
    } catch {
      // The current page can still switch themes if storage is unavailable.
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
      className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm font-medium text-text-primary transition hover:border-border-strong"
    >
      {/* Light mode: show option to switch to dark */}
      <span className="theme-visible-light inline-flex items-center gap-2">
        <Moon size={17} aria-hidden="true" />
        <span className="hidden sm:inline">Dark mode</span>
      </span>

      {/* Dark mode: show option to switch to light */}
      <span className="theme-visible-dark items-center gap-2">
        <Sun size={17} aria-hidden="true" />
        <span className="hidden sm:inline">Light mode</span>
      </span>
    </button>
  );
}
