import Link from "next/link";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { SITE, mailtoLink, waLink } from "@/config/site";
import { getPlan } from "@/config/pricing";

export default function FinalCta() {
  const trialDays = getPlan("trial")?.durationDays ?? 14;
  const wa = waLink("Halo benangku.id, saya mau tanya sebelum mendaftar.");

  return (
    <section id="kontak" className="px-4 sm:px-6 pb-16 md:pb-24 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-900 p-8 sm:p-12 text-center">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
        <h2 className="relative text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Siap merapikan usaha jahitmu?
        </h2>
        <p className="relative mt-3 text-slate-300 max-w-md mx-auto">
          Coba gratis {trialDays} hari. Tanpa kartu kredit, tanpa install, bisa berhenti kapan saja.
        </p>

        <div className="relative mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 active:scale-95"
          >
            Mulai Gratis Sekarang
            <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <p className="relative mt-6 text-sm text-slate-400">
          Masih ragu? Tanya kami lewat{" "}
          {wa && (
            <>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-emerald-400 hover:underline">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>{" "}
              atau{" "}
            </>
          )}
          <a href={mailtoLink("Tanya sebelum mendaftar")} className="inline-flex items-center gap-1 font-medium text-blue-400 hover:underline">
            <Mail className="h-3.5 w-3.5" /> {SITE.email}
          </a>
        </p>
      </div>
    </section>
  );
}
