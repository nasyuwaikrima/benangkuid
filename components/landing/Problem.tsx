import { X, Check } from "lucide-react";

const BEFORE = [
  "Ukuran pelanggan ditulis di kertas yang mudah hilang atau basah",
  "Lupa mana pesanan yang deadline-nya besok",
  "DP dan sisa bayar tercatat di banyak tempat",
  "Pelanggan terus bertanya “bajuku sudah jadi belum?”",
];
const AFTER = [
  "Semua ukuran tersimpan rapi dan bisa dicari dalam hitungan detik",
  "Antrean urut berdasarkan deadline dan status pengerjaan",
  "DP, sisa pembayaran, dan lunas tercatat per pesanan",
  "Cukup satu klik untuk chat pelanggan lewat WhatsApp",
];

export default function Problem() {
  return (
    <section id="masalah" className="px-4 sm:px-6 py-16 md:py-24 max-w-5xl mx-auto">
      <div className="text-center mb-10 md:mb-14">
        <h2 className="text-[26px] sm:text-4xl font-extrabold text-white tracking-tight">
          Berhenti Repot dengan Buku Catatan
        </h2>
        <p className="mt-3 text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
          Penjahit seharusnya fokus menjahit, bukan mencari catatan.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-red-300">Sebelumnya</h3>
          <ul className="mt-4 space-y-3">
            {BEFORE.map((t) => (
              <li key={t} className="flex gap-3 text-[15px] text-slate-300">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300">Dengan benangku.id</h3>
          <ul className="mt-4 space-y-3">
            {AFTER.map((t) => (
              <li key={t} className="flex gap-3 text-[15px] text-slate-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
