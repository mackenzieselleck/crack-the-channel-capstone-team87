import { createClient } from '@supabase/supabase-js'
//create admin client to bypass RLS when needed
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!
    )
}