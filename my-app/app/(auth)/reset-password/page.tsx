import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { hasValidRecoverySession } from '@/lib/auth/recoverySession'
import { ResetPasswordForm } from './resetPasswordForm'

// dependent on user's session
export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const allowed = await hasValidRecoverySession(supabase)

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 text-text-primary">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8">
        {allowed ? (
          <>
            <h1 className="text-2xl font-semibold">Choose a new password</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              After updating, you&apos;ll be signed out everywhere and you will be asked to
              log in with your new password.
            </p>
            <ResetPasswordForm />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Link expired</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              This reset link is invalid or has expired. 
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-block rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-contrast hover:bg-accent-strong"
            >
              Request a new link
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
