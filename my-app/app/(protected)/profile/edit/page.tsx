import Link from 'next/link'
import { requireOnboarding } from '@/lib/auth/guards'
import { updateProfile } from '../actions'

//form for editing an existing profile
export default async function EditProfilePage({ searchParams }: {
    searchParams: Promise<{ error?: string }>
}) {
    const { profile } = await requireOnboarding()   //chcek if user is logged in
    const { error } = await searchParams            //show error when actions.ts reports a failure back to this pg

    return (
        <div className="min-h-screen bg-surface">
   

            <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 pb-40 pt-12 lg:px-10">
                <div>
                    <Link
                        href="/profile"
                        className="text-sm font-medium text-text-secondary transition hover:text-text-primary"
                    >
                        &larr; Back to profile
                    </Link>
                    <h1 className="mt-3 font-body text-2xl font-semibold text-text-primary">Edit your profile</h1>
                    <p className="mt-2 text-sm text-text-secondary">
                        Update the name shown on your profile and leaderboard.
                    </p>
                </div>

                <form
                    action={updateProfile}
                    className="flex flex-col gap-5 rounded-xl border border-border bg-surface-raised p-6"
                >
                    <div>
                        <label
                            htmlFor="first_name"
                            className="mb-2 block text-sm font-medium text-text-primary"
                        >
                            First name
                        </label>
                        <input
                            id="first_name"
                            name="first_name"
                            placeholder="First name"
                            defaultValue={profile.first_name ?? ''} //prefills first/last name from database that were returned by requireOnboarding()
                            required
                            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/10"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="last_name"
                            className="mb-2 block text-sm font-medium text-text-primary"
                        >
                            Last name
                        </label>
                        <input
                            id="last_name"
                            name="last_name"
                            placeholder="Last name"
                            defaultValue={profile.last_name ?? ''}
                            required
                            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/10"
                        />
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="rounded-md bg-accent px-6 py-3 font-body text-sm font-medium text-accent-contrast transition hover:bg-accent-strong"
                    >
                        Save changes
                    </button>
                </form>
            </main>
        </div>
    )
}