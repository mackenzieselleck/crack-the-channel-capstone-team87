import { requireOnboarding } from '@/lib/auth/require-user'
//placeholder dashboard while waiting on UI finalisation, enforces auth and onboarding
export default async function Dashboard() {
    const { profile } = await requireOnboarding()
    return <div> Welcome {profile.first_name}. Let's start learning!</div>
}