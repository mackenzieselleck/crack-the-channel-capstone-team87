'use client';
//sets navbar
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/simulator', label: 'Simulator' },
  { href: '/learn', label: 'Learning' },
  { href: '/profile', label: 'Profile' },
  { href: '/daily-challenge', label: 'Daily Challenge' },
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
    <nav className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-6 px-6 py-3">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'font-body text-sm font-medium transition',
                isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {link.label}
            </Link>
          );
        })}

        <button type="button" onClick={handleLogout}
         className="ml-auto font-body text-sm font-medium text-text-secondary transition hover:text-text-primary">
          Logout
        </button>
      </div>
    </nav>
  );
}
