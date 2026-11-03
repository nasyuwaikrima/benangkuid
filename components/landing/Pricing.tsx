"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  return (
    <section id="harga" className="px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Harga Terjangkau Untuk Hasil Maksimal
        </h2>
        <p className="mt-2 text-slate-400 text-xs sm:text-sm">
          Pilih paket sesuai skala usaha jahit kamu. Tanpa biaya tersembunyi!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* PAKET PENJAHIT LOKAL */}
        <motion.div
          whileHover={{ y: -5 }}
          className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between relative"
        >
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-2">
              Penjahit Rumahan / Perorangan
            </span>
            <h3 className="text-2xl font-bold text-white mb-4">Penjahit Lokal</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-white">Rp 20.000</span>
              <span className="text-xs text-slate-400">/ bulan</span>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300 mb-8">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Simpan Ukuran Pelanggan Tanpa Batas</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Kirim Struk WA Otomatis</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Manajemen Antrean Sederhana</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Akses 1 Perangkat HP / Laptop</span>
              </li>
            </ul>
          </div>

          <Link
            href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20mau%20daftar%20Paket%20Penjahit%20Lokal"
            target="_blank"
            className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold text-center transition-all"
          >
            Pilih Paket Penjahit Lokal
          </Link>
        </motion.div>

        {/* PAKET KONVEKSI & TAILOR */}
        <motion.div
          whileHover={{ y: -5 }}
          className="p-8 rounded-3xl bg-gradient-to-b from-blue-950/60 to-slate-900/90 border-2 border-blue-500/50 flex flex-col justify-between relative shadow-2xl shadow-blue-950/40"
        >
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md">
            Paling Populer
          </div>

          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-2">
              Konveksi & Tailor Tim
            </span>
            <h3 className="text-2xl font-bold text-white mb-4">Konveksi UMKM</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-white">Rp 45.000</span>
              <span className="text-xs text-slate-400">/ bulan</span>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300 mb-8">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Semua Fitur Paket Penjahit Lokal</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Multi-User (Tim Pemotong & Penjahit)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Laporan Omset & Kas Harian</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Prioritas Layanan Bantuan WA</span>
              </li>
            </ul>
          </div>

          <Link
            href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20mau%20daftar%20Paket%20Konveksi"
            target="_blank"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold text-center transition-all shadow-lg shadow-blue-600/30"
          >
            Pilih Paket Konveksi
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
