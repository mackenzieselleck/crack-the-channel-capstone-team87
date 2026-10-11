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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${ubuntu.variable} h-full antialiased`}
    >
      <body className="font-body">{children}</body>
    </html>
  );
}