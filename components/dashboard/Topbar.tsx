"use client";

import { Search, Bell, Calendar, Plus } from "lucide-react";

export default function Topbar() {
  return (
    <header className="hidden md:flex h-16 items-center justify-between px-6 bg-[#161F30]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      {/* Global Search Bar */}
      <div className="relative w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari pelanggan, nota, antrean... (Ctrl+K)"
          className="w-full bg-[#0F172A] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Quick Add Order Button */}
        <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition">
          <Plus className="w-4 h-4" /> Pesanan Baru
        </button>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#0F172A] border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>21 Mei 2026</span>
        </div>

        {/* Notification */}
        <button className="relative p-2 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-300 hover:text-white transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#161F30]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-semibold text-xs">
            PS
          </div>
          <div className="text-left">
            <h4 className="text-xs font-semibold text-white leading-none">Pak Slamet</h4>
            <span className="text-[10px] text-slate-400">Penjahit Solo</span>
          </div>
        </div>
      </div>
    </header>
  );
}
