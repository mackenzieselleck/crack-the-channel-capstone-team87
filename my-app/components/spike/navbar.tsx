
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/theme/ThemeToggle';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/learn', label: 'Learning' },
  { href: '/simulator', label: 'Simulator' },
  { href: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout failed:', error.message);
      return;
    }

    router.replace('/login');
    router.refresh();
  };

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        {/* Logged-in navigation links */}
        {NAV_LINKS.map((link) => {
          const isActive =
            pathname === link.href ||
            pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'font-body text-sm font-medium transition',
                isActive
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {link.label}
            </Link>
          );
        })}

        {/* Theme toggle and Logout */}
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />

          <button
            type="button"
            onClick={handleLogout}
            className="font-body text-sm font-medium text-text-secondary transition hover:text-text-primary"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
