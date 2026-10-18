
import type { Metadata } from 'next';
import { Parkinsans } from 'next/font/google';
import './globals.css';

const ubuntu = Parkinsans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Crack the Channel',
};

// Restore the saved theme before the page becomes visible.
const themeScript = `
  (function () {
    try {
      const savedTheme = localStorage.getItem('ctc-theme');
      document.documentElement.dataset.theme =
        savedTheme === 'dark' ? 'dark' : 'light';
    } catch {
      document.documentElement.dataset.theme = 'light';
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${ubuntu.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body className="font-body">{children}</body>
    </html>
  );
}
