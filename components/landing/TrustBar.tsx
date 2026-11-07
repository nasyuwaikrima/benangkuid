import { Smartphone, QrCode, ShieldCheck, LifeBuoy } from "lucide-react";

const ITEMS = [
  { icon: Smartphone, text: "Tanpa install, buka di browser" },
  { icon: QrCode, text: "Bayar QRIS, aktif otomatis" },
  { icon: ShieldCheck, text: "Data terenkripsi & privat" },
  { icon: LifeBuoy, text: "Dukungan via WhatsApp & email" },
];

export default function TrustBar() {
  return (
    <section aria-label="Keunggulan" className="px-4 sm:px-6 max-w-5xl mx-auto">
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        {ITEMS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5 text-[13px] text-slate-300">
            <Icon className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}
