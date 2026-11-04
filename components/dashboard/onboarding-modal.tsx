'use client';

import { useState } from 'react';
import { submitOnboarding } from '@/app/dashboard/actions';
import { logout } from '@/app/auth/actions';

export function OnboardingModal({ defaultOwnerName }: { defaultOwnerName: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await submitOnboarding(formData);

    if (!res.success) {
      setError(res.error || 'Terjadi kesalahan');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-100">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
          Langkah Terakhir
        </span>
        <h2 className="text-2xl font-bold text-slate-900">Lengkapi Profil Toko</h2>
        <p className="text-sm text-slate-500">
          Halo <span className="font-semibold text-slate-700">{defaultOwnerName}</span>, isi data toko untuk mengaktifkan dashboard benangku.id
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nama Toko / Penjahit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="shop_name"
            required
            placeholder="Contoh: Penjahit Modiste Berkah"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition text-slate-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nomor WhatsApp <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="whatsapp_number"
            required
            placeholder="Contoh: 081234567890"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition text-slate-900 text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">
            Digunakan untuk konfirmasi pesanan & rincian biaya ke pelanggan.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white font-medium py-3 rounded-lg hover:bg-slate-800 transition disabled:opacity-50 text-sm"
        >
          {loading ? 'Menyimpan & Membuka Dashboard...' : 'Simpan & Masuk Dashboard'}
        </button>
      </form>

      <div className="pt-2 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={() => logout()}
          className="text-xs text-slate-400 hover:text-slate-600 transition"
        >
          Keluar / Ganti Akun Google
        </button>
      </div>
    </div>
  );
}
