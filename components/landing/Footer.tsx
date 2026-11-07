import Link from "next/link";
import Image from "next/image";
import { SITE, displayWa, hasWhatsApp, mailtoLink, waLink } from "@/config/site";

const col = "text-sm space-y-2";
const a = "text-slate-400 hover:text-white transition-colors";

export default function Footer() {
  const wa = waLink();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 px-4 sm:px-6 pt-10 pb-6 text-slate-400">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/logo.svg" alt="" width={28} height={28} className="h-7 w-7" />
              <span className="font-extrabold text-white">
                benangku<span className="text-blue-400">.id</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed">
              Aplikasi catatan order untuk penjahit & konveksi: ukuran, antrean, DP, dan pelunasan dalam satu tempat.
            </p>
          </div>

          <nav aria-label="Produk">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white">Produk</h4>
            <ul className={col}>
              <li><Link href="/#fitur" className={a}>Fitur</Link></li>
              <li><Link href="/#cara-kerja" className={a}>Cara kerja</Link></li>
              <li><Link href="/#harga" className={a}>Harga</Link></li>
              <li><Link href="/#faq" className={a}>FAQ</Link></li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white">Legal</h4>
            <ul className={col}>
              <li><Link href="/terms" className={a}>Syarat & Ketentuan</Link></li>
              <li><Link href="/privasi" className={a}>Kebijakan Privasi</Link></li>
              <li><Link href="/bantuan" className={a}>Pusat Bantuan</Link></li>
            </ul>
          </nav>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white">Hubungi Kami</h4>
            <ul className={col}>
              <li><a href={mailtoLink()} className={a}>{SITE.email}</a></li>
              {hasWhatsApp && wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className={a}>
                    WhatsApp {displayWa()}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-800/60 pt-5 text-[11px] text-slate-500 sm:flex-row">
          <p>© {SITE.year} {SITE.name}. Hak cipta dilindungi.</p>
          <p>Dioperasikan oleh {SITE.operator}</p>
        </div>
      </div>
    </footer>
  );
}
