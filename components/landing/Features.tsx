import {
  Ruler,
  ListChecks,
  Wallet,
  Send,
  Smartphone,
  BarChart3,
  BellRing,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  span: string; // lebar kolom di grid 6 kolom (desktop)
  chips?: { label: string; active?: boolean }[];
};

const features: Feature[] = [
  {
    icon: Ruler,
    title: "Database Ukuran Rapi",
    desc: "Simpan lingkar dada, panjang baju, celana, sampai catatan khusus pelanggan. Tidak ada lagi kertas yang robek atau hilang.",
    span: "lg:col-span-3",
    chips: [
      { label: "Lingkar dada 96" },
      { label: "Panjang baju 70" },
      { label: "Panjang lengan 60" },
      { label: "Bahu kiri lebih rendah" },
    ],
  },
  {
    icon: ListChecks,
    title: "Pantau Antrean & Status",
    desc: "Lihat setiap pesanan dari order masuk sampai siap diambil, dan tahu mana yang harus selesai besok.",
    span: "lg:col-span-3",
    chips: [
      { label: "Order masuk" },
      { label: "Potong bahan" },
      { label: "Jahit", active: true },
      { label: "Siap diambil" },
    ],
  },
  {
    icon: Wallet,
    title: "DP & Pelunasan Tercatat",
    desc: "Catat uang muka, sisa pembayaran, dan deadline tiap pelanggan supaya tidak ada tagihan yang terlupa.",
    span: "lg:col-span-2",
  },
  {
    icon: Send,
    title: "Nota WhatsApp Sekali Klik",
    desc: "Kirim bukti terima pesanan dan rincian harga langsung ke WhatsApp pelanggan.",
    span: "lg:col-span-2",
  },
  {
    icon: Smartphone,
    title: "Buka dari Mana Saja",
    desc: "Pakai lewat HP Android, iPhone, laptop, atau tablet. Tidak perlu unduh dari Play Store.",
    span: "lg:col-span-2",
  },
  {
    icon: BarChart3,
    title: "Ringkasan Omzet & Deadline",
    desc: "Dashboard menampilkan pesanan masuk, pemasukan, dan jahitan yang mendekati deadline dalam satu layar.",
    span: "lg:col-span-2",
  },
  {
    icon: BellRing,
    title: "Pengingat & Pemberitahuan",
    desc: "Dapat pengingat masa aktif langganan dan kabar penting dari kami langsung di dalam aplikasi.",
    span: "lg:col-span-2",
  },
  {
    icon: ShieldCheck,
    title: "Data Privat & Aman",
    desc: "Data pelangganmu hanya bisa dibuka oleh akun tokomu dan tidak pernah kami jual ke pihak lain.",
    span: "lg:col-span-2",
  },
];

export default function Features() {
  return (
    <section id="fitur" className="px-4 sm:px-6 py-16 md:py-24 max-w-5xl mx-auto">
      <div className="text-center mb-10 md:mb-14">
        <h2 className="text-[26px] sm:text-4xl font-extrabold text-white tracking-tight">
          Dibuat Khusus untuk Kebutuhan Penjahit
        </h2>
        <p className="mt-3 text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
          Fitur praktis tanpa kerumitan software kantoran. Langsung pakai,
          langsung paham.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-5">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className={`fade-up ${item.span} rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors p-5 sm:p-6 flex flex-col`}
              style={{ animationDelay: `${(idx % 3) * 0.1}s` }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>

              <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-[15px] text-slate-400 leading-relaxed">
                {item.desc}
              </p>

              {item.chips && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {item.chips.map((chip) => (
                    <li
                      key={chip.label}
                      className={`rounded-full border px-3 py-1 text-[13px] ${
                        chip.active
                          ? "border-blue-500/50 bg-blue-600/15 text-blue-300 font-medium"
                          : "border-slate-800 bg-slate-950/60 text-slate-400"
                      }`}
                    >
                      {chip.label}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
