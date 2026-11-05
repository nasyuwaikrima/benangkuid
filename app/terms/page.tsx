import Link from "next/link";
import { ArrowLeft, FileText, ShieldAlert, Scissors, Mail } from "lucide-react";
import { TERMS_AND_CONDITIONS } from "@/lib/constants/terms";

export const metadata = {
  title: "Syarat & Ketentuan Layanan - benangku.id",
  description: "Syarat dan ketentuan penggunaan platform pencatatan pesanan jahit benangku.id",
};

export default function TermsPage() {
  const lastUpdated = "1 November 2026";

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white py-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* NAVIGATION BACK */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-[#161F30] border border-slate-800 px-3.5 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* HEADER SECTION */}
        <div className="bg-[#161F30] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden shadow-xl">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                Dokumen Legal & Ketentuan
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Syarat & Ketentuan Layanan
              </h1>
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-2xl">
            Harap baca syarat dan ketentuan ini dengan saksama sebelum menggunakan platform <strong className="text-slate-200">benangku.id</strong>. Ketentuan ini melindungi hak Pengguna serta membatasi tanggung jawab penyedia platform.
          </p>

          <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-800/80">
            <span>Terakhir Diperbarui: <strong className="text-slate-400 font-medium">{lastUpdated}</strong></span>
            <span>•</span>
            <span>Berlaku untuk seluruh mitra penjahit & UMKM konveksi</span>
          </div>
        </div>

        {/* HIGHLIGHT WARNING (DISCLAIMER PENTING) */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3 text-amber-300">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wide">Ringkasan Batasan Tanggung Jawab</h3>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              benangku.id adalah perangkat lunak pencatatan operasional. Kami tidak bertanggung jawab atas sengketa fisik/keuangan antara penjahit dan pelanggan (seperti kesalahan potong, ukuran tidak muat, atau gagal bayar dari pelanggan).
            </p>
          </div>
        </div>

        {/* CONTENT DOKUMEN TOS (LOOP DARI TERMS_AND_CONDITIONS) */}
        <div className="bg-[#161F30] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl">
          {TERMS_AND_CONDITIONS.map((section) => (
            <div key={section.id} className="space-y-3 border-b border-slate-800/80 pb-6 last:border-b-0 last:pb-0">
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                {section.title}
              </h2>
              <div className="space-y-2 pl-1">
                {section.content.map((paragraph, idx) => (
                  <p key={idx} className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER & SUPPORT CONTACT */}
        <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-blue-400" />
            <span>&copy; 2026 benangku.id — Mitra Penjahit UMKM</span>
          </div>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20benangku.id,%20saya%20ingin%20bertanya%20mengenai%20Syarat%20dan%20Ketentuan"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold"
          >
            <Mail className="w-4 h-4" />
            <span>Pertanyaan Pertanyaan seputar ToS? Hubungi CS</span>
          </a>
        </div>

      </div>
    </div>
  );
}
