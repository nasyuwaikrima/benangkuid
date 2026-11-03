"use client";

import Link from "next/link";
import { Scissors, MessageSquare, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* UTAMA: GRID 4 KOLOM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* KOLOM 1: BRANDING & DESKRIPSI */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
                <Scissors className="w-5 h-5 -rotate-45" />
              </div>
              <span className="font-extrabold text-white text-xl tracking-tight">
                benangku<span className="text-blue-400">.id</span>
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              Aplikasi manajemen usaha jahit & konveksi digital. Simpan ukuran pelanggan, kelola antrean baju, dan kirim struk WA otomatis.
            </p>

            {/* Status Badge Live */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Sistem Aktif & Normal
            </div>
          </div>

          {/* KOLOM 2: NAVIGASI */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="#fitur" className="hover:text-blue-400 transition-colors">
                  Fitur Utama
                </Link>
              </li>
              <li>
                <Link href="#kalkulator" className="hover:text-blue-400 transition-colors">
                  Simulasi Omset & Waktu
                </Link>
              </li>
              <li>
                <Link href="#harga" className="hover:text-blue-400 transition-colors">
                  Paket Langganan
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-blue-400 transition-colors">
                  Tanya Jawab (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* KOLOM 3: FITUR & SOLUSI */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Solusi Digital
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">
                Database Ukuran Pelanggan
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Struk Nota WhatsApp
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Laporan Kas & Omset
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Multi-User Tim Konveksi
              </li>
            </ul>
          </div>

          {/* KOLOM 4: BANTUAN & KONTAK CS */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Bantuan & Layanan
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Punya pertanyaan atau butuh bantuan pendaftaran? Tim CS kami siap membantu.
            </p>
            <Link
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Benangku.id,%20saya%20butuh%20bantuan"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-all group"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Hubungi CS via WhatsApp</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

        </div>

        {/* BOTTOM: COPYRIGHT & LEGAL */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center md:text-left">
            <p>© 2025 Benangku.id. Hak Cipta Dilindungi.</p>
            <span className="hidden sm:inline text-slate-800">•</span>
            <p className="text-slate-600">Dioperasikan oleh PT Taraka Cipta Teknologi</p>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privasi" className="hover:text-slate-400 transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/syarat" className="hover:text-slate-400 transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
