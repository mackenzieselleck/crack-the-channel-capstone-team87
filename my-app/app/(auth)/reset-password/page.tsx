import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { hasValidRecoverySession } from '@/lib/auth/recovery-session'
import { ResetPasswordForm } from './reset-password-form'

// dependent on user's session
export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const allowed = await hasValidRecoverySession(supabase)

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-6 text-[#06152B]">
      <div className="w-full max-w-md rounded-xl border border-[#DDE3EA] bg-white p-8">
        {allowed ? (
          <>
            <h1 className="text-2xl font-semibold">Choose a new password</h1>
            <p className="mt-2 text-sm leading-6 text-[#52606D]">
              After updating, you&apos;ll be signed out everywhere and you will be asked to
              log in with your new password.
            </p>
            <ResetPasswordForm />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Link expired</h1>
            <p className="mt-2 text-sm leading-6 text-[#52606D]">
              This reset link is invalid or has expired. 
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-block rounded-md bg-[#0F62FE] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0353E9]"
            >
              Request a new link
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
