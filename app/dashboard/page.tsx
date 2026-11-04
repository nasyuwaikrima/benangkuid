import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './logout-button'

// 1. Komponen Async khusus untuk membaca Cookie & Data Supabase
async function DashboardContent() {
  const supabase = await createClient()

  // Ambil data user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil data toko dari tabel shops
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('id', user.id)
    .single()

  // Hitung sisa hari trial
  const trialEnds = shop?.trial_ends_at ? new Date(shop.trial_ends_at) : null
  const now = new Date()
  const diffTime = trialEnds ? trialEnds.getTime() - now.getTime() : 0
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-6">
      <div className="border-b pb-4">
        <span className="inline-block text-[11px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full mb-2">
          SESI AKTIF (LOGGED IN) ✅
        </span>
        <h1 className="text-xl font-bold text-slate-800">
          {shop?.shop_name || 'Nama Toko Belum Diisi'}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
      </div>

      <div className="space-y-3 text-sm text-slate-600">
        <div className="flex justify-between py-1.5 border-b border-slate-50">
          <span>Nomor WhatsApp:</span>
          <span className="font-semibold text-slate-800">{shop?.whatsapp_number || '-'}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-slate-50">
          <span>Status Onboarding:</span>
          <span className="font-semibold text-emerald-600">
            {shop?.is_onboarded ? 'Selesai (TRUE)' : 'Belum (FALSE)'}
          </span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-slate-50">
          <span>Status Langganan:</span>
          <span className="font-semibold uppercase text-blue-600">
            {shop?.subscription_status}
          </span>
        </div>
        <div className="flex justify-between py-1.5">
          <span>Sisa Masa Trial:</span>
          <span className="font-bold text-amber-600">
            {remainingDays > 0 ? `${remainingDays} Hari Lagi` : 'Habis'}
          </span>
        </div>
      </div>

      <LogoutButton />
    </div>
  )
}

// 2. Fungsi Utama (Synchronous Shell) yang Dibungkus Suspense Boundary
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center text-sm text-slate-400 animate-pulse">
            Memuat data toko...
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  )
}
