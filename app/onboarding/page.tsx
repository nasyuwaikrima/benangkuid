'use client'

import { useActionState } from 'react'
import { completeOnboarding, type OnboardingState } from './actions'

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    null
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
        
        {/* Header Logo & Judul */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-2 font-bold text-xl">
            🧵
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Lengkapi Profil Toko
          </h1>
          <p className="text-sm text-slate-500">
            Satu langkah lagi untuk mulai mengelola antrean & catatan ukuran pelanggan.
          </p>
        </div>

        {/* Alert Error Global jika DB bermasalah */}
        {state?.errors?.global && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 fill-current text-red-500" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            <span>{state.errors.global[0]}</span>
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="space-y-5">
          {/* Input Nama Toko */}
          <div>
            <label htmlFor="shop_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Usaha / Toko Penjahit
            </label>
            <input
              id="shop_name"
              type="text"
              name="shop_name"
              placeholder="Contoh: Penjahit Berkah Utama"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                state?.errors?.shop_name
                  ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 bg-slate-50/50 focus:bg-white'
              }`}
              required
            />
            {state?.errors?.shop_name && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">
                {state.errors.shop_name[0]}
              </p>
            )}
          </div>

          {/* Input Nomor WA */}
          <div>
            <label htmlFor="whatsapp_number" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Nomor WhatsApp Toko
            </label>
            <input
              id="whatsapp_number"
              type="text"
              name="whatsapp_number"
              placeholder="Contoh: 081234567890"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                state?.errors?.whatsapp_number
                  ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 bg-slate-50/50 focus:bg-white'
              }`}
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Digunakan untuk pengiriman nota & status antrean ke pelanggan.
            </p>
            {state?.errors?.whatsapp_number && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {state.errors.whatsapp_number[0]}
              </p>
            )}
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Menyimpan...</span>
              </>
            ) : (
              'Simpan & Masuk Dashboard →'
            )}
          </button>
        </form>

      </div>
    </div>
  )
}
