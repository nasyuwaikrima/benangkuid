import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import { PRIVACY_POLICY } from "@/config/privacy";
import { SITE, mailtoLink } from "@/config/site";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Kebijakan Privasi",
  description: "Bagaimana benangku.id mengumpulkan, memakai, dan melindungi data pribadi penggunanya.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-[#161F30] border border-slate-800 px-3.5 py-2 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <header className="bg-[#161F30] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Kebijakan Privasi</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-2xl">
            Data pelanggan dan ukuran jahitanmu adalah milikmu. Berikut cara kami menjaganya.
          </p>
          <p className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
            Terakhir diperbarui: <strong className="text-slate-400 font-medium">{SITE.legalUpdated}</strong>
          </p>
        </header>

        <div className="bg-[#161F30] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl">
          {PRIVACY_POLICY.map((section) => (
            <section key={section.id} className="space-y-3 border-b border-slate-800/80 pb-6 last:border-b-0 last:pb-0">
              <h2 className="text-base md:text-lg font-bold text-white">{section.title}</h2>
              <div className="space-y-2 pl-1">
                {section.content.map((p, i) => (
                  <p key={i} className="text-xs md:text-sm text-slate-300 leading-relaxed">{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>Permintaan akses atau penghapusan data?</span>
          <a href={mailtoLink("Permintaan data pribadi")} className="flex items-center gap-1.5 font-semibold text-blue-400 hover:text-blue-300">
            <Mail className="w-4 h-4" /> {SITE.email}
          </a>
        </div>
      </div>
      <SiteFooter className="mt-6" />
    </div>
  );
}
