'use client';
//sets navbar
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/simulator', label: 'Simulator' },
  { href: '/learn', label: 'Learning' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-[#233049] bg-[#0B1220]/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-6 px-6 py-3">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'font-body text-sm font-medium transition',
                isActive ? 'text-[#E7ECF5]' : 'text-[#8B95AC] hover:text-[#E7ECF5]',
              ].join(' ')}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}