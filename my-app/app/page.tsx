import Image from "next/image";
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getSession()
  console.log(data, error)
  return <div>Check your terminal for Supabase connection output</div>
}


