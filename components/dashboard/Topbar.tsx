"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Bell, Calendar, Plus, User } from "lucide-react";

interface TopbarProps {
  ownerName?: string;
  shopName?: string;
}

export default function Topbar({
  ownerName = "Penjahit",
  shopName = "Toko Saya",
}: TopbarProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  // Format tanggal dinamis secara aman untuk menghindari hydration mismatch
  useEffect(() => {
    const today = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());
    setFormattedDate(today);
  }, []);

  const initials = ownerName.substring(0, 2).toUpperCase();

  return (
    <>
      {/* ==========================================
          1. TOPBAR DESKTOP (Tampil di md:flex)
         ========================================== */}
      <header className="hidden md:flex h-16 items-center justify-between px-6 bg-[#161F30]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 select-none">
        {/* Global Search Bar */}
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari pelanggan, nota, antrean..."
            className="w-full bg-[#0F172A] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/80 transition"
          />
        </div>

        {/* Control Kanan */}
        <div className="flex items-center gap-3.5">
          {/* Tombol Pesanan Baru */}
          <Link
            href="/dashboard/tambah"
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Pesanan Baru</span>
          </Link>

          {/* Tanggal Otomatis */}
          <div className="flex items-center gap-2 bg-[#0F172A] border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{formattedDate || "Memuat..."}</span>
          </div>

          {/* Notifikasi Lonceng */}
          <button className="relative p-2 rounded-xl bg-[#0F172A] border border-slate-800/80 text-slate-400 hover:text-white transition">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#161F30]" />
          </button>

          {/* Profil Toko / Penjahit (Link ke /dashboard/profile) */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 pl-3 border-l border-slate-800 hover:opacity-90 transition group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-400/30 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div className="text-left max-w-[130px]">
              <h4 className="text-xs font-semibold text-white leading-tight truncate">
                {ownerName}
              </h4>
              <span className="text-[10px] text-slate-400 truncate block">
                {shopName}
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* ==========================================
          2. TOPBAR MOBILE (Tampil di md:hidden)
         ========================================== */}
      <header className="flex md:hidden h-14 items-center justify-between px-4 bg-[#161F30]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 select-none">
        {/* Identitas Toko Mobile */}
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <Image
            src="/logo.svg"
            alt="benangku.id logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain shrink-0"
            priority
          />
          <div className="overflow-hidden">
            <h1 className="text-xs font-bold text-white leading-tight truncate">
              {shopName}
            </h1>
            <p className="text-[9px] text-slate-400 font-medium tracking-wider uppercase">
              benangku<span className="text-blue-500">.id</span>
            </p>
          </div>
        </Link>

        {/* Akses Cepat Kanan Mobile */}
        <div className="flex items-center gap-2">
          {/* Lonceng Notifikasi */}
          <button className="relative p-2 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-white transition">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#161F30]" />
          </button>

          {/* Profil Avatar (Direct link ke /dashboard/profile) */}
          <Link
            href="/dashboard/profile"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-400/30 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition"
          >
            {initials}
          </Link>
        </div>
      </header>
    </>
  );
}
