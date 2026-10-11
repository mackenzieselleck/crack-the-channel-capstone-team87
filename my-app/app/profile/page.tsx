//renders user profile page

import Link from 'next/link'
import Navbar from '@/components/spike/navbar'
import { requireOnboarding } from '@/lib/auth/require-user'
import { createClient } from '@/lib/supabase/server'

type EarnedBadge = {
    earned_at: string
    badges: {
        id: string
        title: string
        description: string | null
        icon_url: string | null
    } | null
}

//shows the logged in user's profile, stats and earned badges
export default async function ProfilePage() {
    const { user } = await requireOnboarding()  //check if user is logged in
    const supabase = await createClient()

    //supabase query for fuller profile row (name, avatar, XP, streak, join date) (since requireOnboarding() only fetches name fields)
    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, xp, challenge_streak, created_at')
        .eq('id', user.id)
        .single()

    //supabase query to get the actual badge titles/descriptions the user has earned
    //used to render the stats and badge grid
    const { data: userBadges } = await supabase
        .from('user_badges')
        .select('earned_at, badges ( id, title, description, icon_url )')
        .eq('user_id', user.id)
        .returns<EarnedBadge[]>()

    if (!profile) {
        return (
            <div className="min-h-screen bg-surface">
                <Navbar />
                <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 pt-12 lg:px-10">
                    <p className="text-text-secondary">Couldn&apos;t load your profile. Try refreshing the page.</p>
                </main>
            </div>
        )
    }

    const earnedBadges = (userBadges ?? []).filter((ub) => ub.badges)

    return (
        <div className="min-h-screen bg-surface">
            <Navbar />

            <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 pb-40 pt-12 lg:px-10">
                {/* Header: identity + primary action, same row pattern as the rest of the app's page headers */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        {profile.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profile.avatar_url}
                                alt=""
                                width={80}
                                height={80}
                                className="h-20 w-20 rounded-full border border-border object-cover"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface-raised font-body text-2xl text-text-secondary">
                                {profile.first_name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                        )}

                        <div>
                            <h1 className="font-body text-2xl font-semibold text-text-primary">
                                {profile.first_name} {profile.last_name}
                            </h1>
                            {profile.created_at && (
                                <p className="mt-1 text-sm text-text-secondary">
                                    Member since{' '}
                                    {new Date(profile.created_at).toLocaleDateString(undefined, {
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            )}
                        </div>
                    </div>

                    <Link
                        href="/profile/edit"
                        className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 font-body text-sm font-medium text-text-primary transition hover:border-border-strong sm:self-start"
                    >
                        Edit profile
                    </Link>
                </div>

                {/* Stats */}
                <section className="flex flex-col gap-3">
                    <h2 className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                        Progress
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-border bg-surface-raised px-5 py-4">
                            <p className="text-sm text-text-secondary">XP</p>
                            <p className="mt-1 font-body text-2xl font-semibold text-text-primary">
                                {profile.xp ?? 0}
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-surface-raised px-5 py-4">
                            <p className="text-sm text-text-secondary">Challenge streak</p>
                            <p className="mt-1 font-body text-2xl font-semibold text-text-primary">
                                {profile.challenge_streak ?? 0}
                                <span className="ml-1 text-base font-normal text-text-secondary">
                                    {profile.challenge_streak === 1 ? 'day' : 'days'}
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Badges */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-baseline justify-between">
                        <h2 className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                            Badges
                        </h2>
                        <span className="text-sm text-text-secondary">{earnedBadges.length} earned</span>
                    </div>

                    {earnedBadges.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {earnedBadges.map((ub) => (
                                <div
                                    key={ub.badges!.id}
                                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-raised px-3 py-5 text-center transition hover:border-border-strong"
                                >
                                    {ub.badges!.icon_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={ub.badges!.icon_url} alt="" width={40} height={40} />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                                            ★
                                        </div>
                                    )}
                                    <p className="font-body text-sm font-medium text-text-primary">
                                        {ub.badges!.title}
                                    </p>
                                    {ub.badges!.description && (
                                        <p className="text-xs leading-5 text-text-secondary">
                                            {ub.badges!.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-border px-5 py-6 text-center">
                            <p className="text-text-secondary">No badges earned yet. Keep learning to unlock some!</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}