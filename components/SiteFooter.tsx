import Link from "next/link";
import { SITE, mailtoLink, waLink } from "@/config/site";

/**
 * Footer kecil satu baris untuk semua halaman (login, legal, dashboard, error).
 * Sengaja tipis & redup supaya tidak mengganggu konten.
 */
export default function SiteFooter({ className = "" }: { className?: string }) {
  const wa = waLink();
  const link = "hover:text-slate-300 transition-colors";

  return (
    <footer
      className={`w-full px-4 py-4 text-center text-[11px] leading-relaxed text-slate-500 ${className}`}
    >
      <nav
        aria-label="Footer"
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
      >
        <span>© {SITE.year} {SITE.name}</span>
        <span aria-hidden className="text-slate-700">·</span>
        <Link href="/terms" className={link}>Syarat</Link>
        <Link href="/privasi" className={link}>Privasi</Link>
        <Link href="/bantuan" className={link}>Bantuan</Link>
        <span aria-hidden className="text-slate-700">·</span>
        <a href={mailtoLink()} className={link}>{SITE.email}</a>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className={link}>
            WhatsApp
          </a>
        )}
      </nav>
    </footer>
  );
}
