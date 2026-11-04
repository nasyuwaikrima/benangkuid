import { createClient } from '@/lib/supabase/server';

// Beritahu Next.js 16 PPR bahwa halaman dashboard utama bersifat dynamic
export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Antrean Pesanan</h2>
          <p className="text-slate-500 text-sm mt-1">Pantau jahitan dan permak pelanggan yang sedang berjalan.</p>
        </div>
        
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition flex items-center gap-2">
          <span>+</span> Pesanan Baru
        </button>
      </div>

      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">✂️</div>
        <h3 className="text-lg font-semibold text-slate-800">Belum ada pesanan</h3>
        <p className="text-slate-500 text-sm mt-1 mb-6 max-w-sm">
          Antrean jahitan Anda masih kosong. Tambahkan pesanan baru untuk mulai mencatat.
        </p>
        <button className="bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
          Buat Pesanan Pertama
        </button>
      </div>
    </div>
  );
}
