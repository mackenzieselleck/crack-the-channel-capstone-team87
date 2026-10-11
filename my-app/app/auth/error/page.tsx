import Link from 'next/link'

const MESSAGES: Record<string, { title: string; body: string; href: string; cta: string }> = {
  'expired-reset': {
    title: 'Reset link expired',
    body: 'This password reset link has already been used or has expired. Request a new one to continue.',
    href: '/forgot-password',
    cta: 'Request a new link',
  },
  'invalid-link': {
    title: 'Link not valid',
    body: 'This link is invalid or has expired. Try again, or log in if you have already confirmed your account.',
    href: '/login',
    cta: 'Go to log in',
  },
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams
 
  const msg = MESSAGES[reason ?? ''] ?? MESSAGES['invalid-link']

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-6 text-[#06152B]">
      <div className="w-full max-w-md rounded-xl border border-[#DDE3EA] bg-white p-8">
        <h1 className="text-2xl font-semibold">{msg.title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#52606D]">{msg.body}</p>
        <Link
          href={msg.href}
          className="mt-6 inline-block rounded-md bg-[#0F62FE] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0353E9]"
        >
          {msg.cta}
        </Link>
      </div>
    </main>
  )
}
