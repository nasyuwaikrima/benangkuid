'use client';

import { useState } from 'react';
import { submitOnboarding } from '@/app/dashboard/actions';
import { logout } from '@/app/auth/actions';
import { TERMS_AND_CONDITIONS } from '@/config/terms';
import { 
  Scissors, 
  Store, 
  Phone, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowDown, 
  LogOut 
} from 'lucide-react';

export function OnboardingModal({ defaultOwnerName }: { defaultOwnerName: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State Penguncian Syarat & Ketentuan (Scroll & Checkbox)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Deteksi Scroll Paling Bawah
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Toleransi margin of error 10px
    if (Math.ceil(scrollTop + clientHeight) >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('Anda wajib menyetujui Syarat & Ketentuan Layanan.');
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await submitOnboarding(formData);

    if (!res.success) {
      setError(res.error || 'Terjadi kesalahan saat menyimpan data.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-[#161F30] border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-slate-100 select-none">
      
      {/* Header Modal */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full">
          <Scissors className="w-3.5 h-3.5" />
          <span>Langkah Terakhir Onboarding</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Lengkapi Profil Toko</h2>
        <p className="text-xs md:text-sm text-slate-400">
          Halo <span className="font-semibold text-slate-200">{defaultOwnerName}</span>, isi data usaha untuk mengaktifkan sistem benangku.id.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Nama Toko */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-slate-400" /> Nama Toko / Penjahit <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="shop_name"
            required
            placeholder="Contoh: Penjahit Modiste Berkah"
            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 focus:border-blue-500 outline-none transition text-slate-100 text-xs md:text-sm placeholder-slate-500"
          />
        </div>

        {/* Input Nomor WA */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> Nomor WhatsApp Bisnis <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            name="whatsapp_number"
            required
            placeholder="Contoh: 081234567890"
            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 focus:border-blue-500 outline-none transition text-slate-100 text-xs md:text-sm placeholder-slate-500"
          />
          <p className="text-[11px] text-slate-500">
            Digunakan untuk konfirmasi pesanan & rincian biaya ke pelanggan.
          </p>
        </div>

        {/* SECTION TERMS OF SERVICE (TERMS CONTAINER) */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" /> Syarat & Ketentuan Layanan (ToS)
            </label>
            {!hasScrolledToBottom && (
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                <ArrowDown className="w-3 h-3 animate-bounce" /> Scroll ke bawah
              </span>
            )}
          </div>

          {/* Container Scroll Text Legal */}
          <div
            onScroll={handleScroll}
            className="h-40 overflow-y-auto bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-3.5 text-xs text-slate-300 scrollbar-thin scrollbar-thumb-slate-700"
          >
            {TERMS_AND_CONDITIONS.map((section) => (
              <div key={section.id} className="space-y-1">
                <h4 className="font-bold text-white text-[11px]">{section.title}</h4>
                {section.content.map((p, idx) => (
                  <p key={idx} className="text-[11px] text-slate-400 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Checkbox Persetujuan */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms_agree"
              disabled={!hasScrolledToBottom}
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded bg-[#0F172A] border-slate-700 text-blue-600 focus:ring-blue-500 disabled:opacity-30 cursor-pointer"
            />
            <label
              htmlFor="terms_agree"
              className={`text-xs leading-tight cursor-pointer ${
                hasScrolledToBottom ? 'text-slate-300 font-medium' : 'text-slate-500'
              }`}
            >
              Saya telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan Layanan benangku.id di atas.
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !agreedToTerms}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/25 disabled:opacity-40 disabled:cursor-not-allowed text-xs md:text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Menyimpan & Membuka Dashboard...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Masuk Dashboard</span>
            </>
          )}
        </button>
      </form>

      {/* Logout Action */}
      <div className="pt-2 border-t border-slate-800 text-center">
        <button
          type="button"
          onClick={() => logout()}
          className="text-xs text-slate-400 hover:text-red-400 transition flex items-center justify-center gap-1.5 mx-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar / Ganti Akun Google</span>
        </button>
      </div>
    </div>
  );
}
