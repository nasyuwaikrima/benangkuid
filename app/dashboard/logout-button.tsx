'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-semibold rounded-xl text-sm transition"
    >
      Keluar / Logout
    </button>
  )
}
