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
            <>
                <Navbar />
                <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 pt-12">
                    <p className="text-[#8B95AC]">Couldn&apos;t load your profile. Try refreshing the page.</p>
                </main>
            </>
        )
    }

    return (
        <>
            <Navbar />
            <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 pb-40 pt-12">
                <div className="flex items-center gap-4">
                    {profile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={profile.avatar_url}
                            alt=""
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-full border border-[#233049] object-cover"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#233049] bg-[#0B1220] font-body text-xl text-[#8B95AC]">
                            {profile.first_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                    )}

                    <div>
                        <h1 className="font-body text-2xl font-semibold text-[#E7ECF5]">
                            {profile.first_name} {profile.last_name}
                        </h1>
                        {profile.created_at && (
                            <p className="text-sm text-[#8B95AC]">
                                Member since {new Date(profile.created_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1 rounded-xl border border-[#233049] px-4 py-3">
                        <p className="text-sm text-[#8B95AC]">XP</p>
                        <p className="font-body text-xl font-semibold text-[#E7ECF5]">{profile.xp ?? 0}</p>
                    </div>
                    <div className="flex-1 rounded-xl border border-[#233049] px-4 py-3">
                        <p className="text-sm text-[#8B95AC]">Challenge streak</p>
                        <p className="font-body text-xl font-semibold text-[#E7ECF5]">
                            {profile.challenge_streak ?? 0}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="font-body text-lg font-semibold text-[#E7ECF5]">Badges</h2>

                    {userBadges && userBadges.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {userBadges
                                .filter((ub) => ub.badges)
                                .map((ub) => (
                                    <div
                                        key={ub.badges!.id}
                                        className="flex flex-col items-center gap-2 rounded-xl border border-[#233049] px-3 py-4 text-center"
                                    >
                                        {ub.badges!.icon_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={ub.badges!.icon_url} alt="" width={40} height={40} />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-[#233049]" />
                                        )}
                                        <p className="font-body text-sm font-medium text-[#E7ECF5]">
                                            {ub.badges!.title}
                                        </p>
                                        {ub.badges!.description && (
                                            <p className="text-xs text-[#8B95AC]">{ub.badges!.description}</p>
                                        )}
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-[#8B95AC]">No badges earned yet. Keep learning to unlock some!</p>
                    )}
                </div>

                <Link
                    href="/profile/edit"       
                    className="font-body text-sm font-medium text-[#8B95AC] underline-offset-4 transition hover:text-[#E7ECF5] hover:underline"
                >
                    Edit profile
                </Link>
            </main>
        </>
    )
}