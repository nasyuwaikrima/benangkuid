import { LogIn, UserPlus, ListChecks } from "lucide-react";

const STEPS = [
  {
    icon: LogIn,
    title: "Masuk dengan Google",
    desc: "Tidak perlu buat password. Isi nama toko dan nomor WhatsApp, selesai kurang dari satu menit.",
  },
  {
    icon: UserPlus,
    title: "Catat pelanggan & pesanan",
    desc: "Simpan ukuran badan, jenis jahitan, biaya, DP, dan deadline dalam satu formulir sederhana.",
  },
  {
    icon: ListChecks,
    title: "Pantau sampai lunas",
    desc: "Ubah status dari antrean sampai diambil, lihat ringkasan omzet, dan hubungi pelanggan lewat WhatsApp.",
  },
];

export default function HowItWorks() {
  return (
    <section id="cara-kerja" className="px-4 sm:px-6 py-12 md:py-20 max-w-5xl mx-auto">
      <div className="text-center mb-10 md:mb-14">
        <h2 className="text-[26px] sm:text-4xl font-extrabold text-white tracking-tight">
          Mulai dalam 3 Langkah
        </h2>
        <p className="mt-3 text-slate-400 text-base max-w-xl mx-auto">
          Tanpa pelatihan, tanpa instalasi. Langsung pakai dari HP.
        </p>
      </div>

      <ol className="grid md:grid-cols-3 gap-4 sm:gap-6">
        {STEPS.map(({ icon: Icon, title, desc }, i) => (
          <li key={title} className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-400">{desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
