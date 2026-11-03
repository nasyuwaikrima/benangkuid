import {
  MessageSquare,
  ArrowRight,
  Check,
  Ruler,
  ListChecks,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const WA =
  "https://wa.me/6281234567890?text=Halo%20Admin%20Benangku.id,%20saya%20mau%20coba%20demo";

const FITUR = [
  { icon: Ruler, text: "Ukuran pelanggan tersimpan aman" },
  { icon: ListChecks, text: "Pantau antrean dan status jahitan" },
  { icon: Wallet, text: "Catat deadline, DP, dan pelunasan" },
];

const TAHAP = ["Order masuk", "Potong", "Jahit", "Siap ambil"];
const TAHAP_AKTIF = 2; // index "Jahit"

const ANTREAN = [
  { nama: "Kemeja Pak Dedi", status: "Potong", bayar: "Lunas", lunas: true },
  { nama: "Seragam TK Pelangi", status: "Order masuk", bayar: "DP 50%", lunas: false },
];

export default function Hero() {
  return (
    <section className="pt-38 md:pt-32 pb-12 px-4 sm:px-6 max-w-5xl mx-auto relative">
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-[110px] pointer-events-none" />

      <div className="relative grid md:grid-cols-[1.05fr_0.95fr] gap-10 md:gap-12 items-center">
        {/* Teks */}
        <div className="text-center md:text-left">
          <div className="fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[15px] font-medium mb-5 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-slate-300">Aplikasi untuk Penjahit & Konveksi</span>
          </div>

          <h1
            className="fade-up text-[30px] sm:text-[40px] md:text-[46px] font-extrabold text-white tracking-tight leading-[1.15]"
            style={{ animationDelay: "0.1s" }}
          >
            Dari ukuran sampai lunas,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
              semua jahitan tercatat rapi
            </span>
          </h1>

          <p
            className="fade-up mt-4 text-lg text-slate-400 max-w-md mx-auto md:mx-0 leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            Tidak ada lagi buku kertas yang hilang atau pesanan yang terlewat.
            Kelola pelanggan, antrean, dan pembayaran dari satu aplikasi.
          </p>

          <ul
            className="fade-up mt-5 space-y-2.5 text-left max-w-md mx-auto md:mx-0"
            style={{ animationDelay: "0.25s" }}
          >
            {FITUR.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-slate-300 text-[16px]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400">
                  <Icon className="w-4 h-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div
            className="fade-up mt-7 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href={WA}
              target="_blank"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <MessageSquare className="w-[18px] h-[18px]" />
              <span>Coba Gratis Sekarang</span>
              <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#simulasi"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-base transition-all text-center"
            >
              Lihat Demo
            </a>
          </div>

          <p
            className="fade-up mt-4 text-[15px] text-slate-500"
            style={{ animationDelay: "0.4s" }}
          >
            Mulai <span className="text-slate-300 font-medium">Rp 20rb/bulan</span> •
            Tanpa perlu install aplikasi
          </p>
        </div>

        {/* Pratinjau papan antrean */}
        <div
          className="fade-up w-full max-w-sm mx-auto md:max-w-none"
          style={{ animationDelay: "0.35s" }}
        >
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 backdrop-blur-md shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-white font-semibold text-lg leading-tight">
                  Kebaya Bu Ratna
                </p>
                <p className="text-sm text-slate-500 mt-0.5">Deadline 12 Nov</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/15 px-2.5 py-1 text-xs font-medium text-blue-300">
                <Ruler className="w-3.5 h-3.5" />
                Ukuran tersimpan
              </span>
            </div>

            {/* Tahap pengerjaan: garis putus-putus seperti jahitan */}
            <div className="relative mt-6">
              <div className="absolute top-3 left-[12.5%] right-[12.5%] border-t-2 border-dashed border-slate-700" />
              <div
                className="absolute top-3 left-[12.5%] border-t-2 border-dashed border-blue-500"
                style={{ width: `${(TAHAP_AKTIF / (TAHAP.length - 1)) * 75}%` }}
              />
              <ol className="relative grid grid-cols-4">
                {TAHAP.map((nama, i) => {
                  const selesai = i < TAHAP_AKTIF;
                  const aktif = i === TAHAP_AKTIF;
                  return (
                    <li key={nama} className="flex flex-col items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          selesai
                            ? "bg-blue-600 border-blue-600 text-white"
                            : aktif
                            ? "bg-slate-900 border-blue-500"
                            : "bg-slate-900 border-slate-700"
                        }`}
                      >
                        {selesai && <Check className="w-3.5 h-3.5" />}
                        {aktif && (
                          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        )}
                      </span>
                      <span
                        className={`text-[12px] leading-tight text-center ${
                          aktif ? "text-white font-semibold" : "text-slate-500"
                        }`}
                      >
                        {nama}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Pembayaran */}
            <div className="mt-5 rounded-xl bg-slate-950/70 border border-slate-800 p-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">DP diterima</span>
                <span className="text-white font-semibold tabular-nums">
                  Rp 150.000
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-[43%] rounded-full bg-blue-500" />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">Sisa pelunasan</span>
                <span className="text-slate-200 font-medium tabular-nums">
                  Rp 200.000
                </span>
              </div>
            </div>

            {/* Antrean lain */}
            <div className="mt-3 divide-y divide-slate-800">
              {ANTREAN.map((o) => (
                <div key={o.nama} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[15px] text-slate-200 truncate">{o.nama}</p>
                    <p className="text-[13px] text-slate-500">{o.status}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      o.lunas
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {o.bayar}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
