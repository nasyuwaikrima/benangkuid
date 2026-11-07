import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle, ChevronDown } from "lucide-react";
import { FAQS } from "@/config/faq";
import { SITE, displayWa, hasWhatsApp, mailtoLink, waLink } from "@/config/site";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Pusat Bantuan",
  description: "Hubungi tim benangku.id lewat email atau WhatsApp, dan temukan jawaban pertanyaan yang sering diajukan.",
};

export default function HelpPage() {
  const wa = waLink("Halo benangku.id, saya butuh bantuan.");

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-[#161F30] border border-slate-800 px-3.5 py-2 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Pusat Bantuan</h1>
          <p className="mt-2 text-sm text-slate-400">
            Butuh bantuan mendaftar, membayar, atau memakai fitur? Kami balas secepatnya di jam kerja.
          </p>
        </header>

        <div className={`grid gap-4 ${hasWhatsApp ? "sm:grid-cols-2" : ""}`}>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-emerald-500/30 bg-emerald-600/10 p-5 hover:bg-emerald-600/15 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-emerald-400" />
              <p className="mt-3 font-semibold text-white">WhatsApp</p>
              <p className="text-sm text-emerald-300">{displayWa()}</p>
              <p className="mt-1 text-xs text-slate-400">Cara tercepat untuk bertanya</p>
            </a>
          )}
          <a
            href={mailtoLink()}
            className="group rounded-2xl border border-blue-500/30 bg-blue-600/10 p-5 hover:bg-blue-600/15 transition-colors"
          >
            <Mail className="w-6 h-6 text-blue-400" />
            <p className="mt-3 font-semibold text-white">Email</p>
            <p className="text-sm text-blue-300">{SITE.email}</p>
            <p className="mt-1 text-xs text-slate-400">Untuk kendala detail atau permintaan data</p>
          </a>
        </div>

        <section aria-labelledby="faq-title" className="space-y-3">
          <h2 id="faq-title" className="text-lg font-bold text-white">Pertanyaan yang sering diajukan</h2>
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-slate-800 bg-[#161F30] p-4 open:border-slate-700">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-white">
                {f.q}
                <ChevronDown className="w-4 h-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.a}</p>
            </details>
          ))}
        </section>
      </div>
      <SiteFooter className="mt-8" />
    </div>
  );
}
