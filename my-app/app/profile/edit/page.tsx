import Navbar from '@/components/spike/navbar'
import { requireOnboarding } from '@/lib/auth/require-user'
import { updateProfile } from '../actions'

//form for editing an existing profile
export default async function EditProfilePage({ searchParams }: {
    searchParams: Promise<{ error?: string }>
}) {
    const { profile } = await requireOnboarding()   //chcek if user is logged in 
    const { error } = await searchParams            //show error when actions.ts reports a failure back to this pg 

    return (
        <>
            <Navbar />
            <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 pb-40 pt-12">
                <h1 className="font-body text-2xl font-semibold text-[#E7ECF5]">Edit your profile</h1>

                <form action={updateProfile} className="flex flex-col gap-4">
                    <input
                        name="first_name"
                        placeholder="First Name"
                        defaultValue={profile.first_name ?? ''} //prefills first/last name from database that were returned by requireOnboarding()
                        required
                        className="rounded-xl border border-[#233049] bg-transparent px-4 py-3 text-[#E7ECF5] placeholder:text-[#8B95AC] focus:border-[#8B95AC] focus:outline-none"
                    />
                    <input
                        name="last_name"
                        placeholder="Last Name"
                        defaultValue={profile.last_name ?? ''}
                        required
                        className="rounded-xl border border-[#233049] bg-transparent px-4 py-3 text-[#E7ECF5] placeholder:text-[#8B95AC] focus:border-[#8B95AC] focus:outline-none"
                    />

                    {error && <p className="text-sm text-[#F87171]">{error}</p>}

                    <button
                        type="submit"
                        className="rounded-xl border border-[#233049] px-4 py-3 font-body text-sm font-medium text-[#E7ECF5] transition hover:border-[#8B95AC]"
                    >
                        Save
                    </button>
                </form>
            </main>
        </>
    )
}