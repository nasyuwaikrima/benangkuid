"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scissors,
  PlusCircle,
  Receipt,
  UserCircle,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import type { AccessGuard } from "@/lib/subscription";
import { waLink } from "@/config/site";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Antrean Jahitan", href: "/dashboard/antrean", icon: Scissors },
  { name: "Order Baru", href: "/dashboard/tambah", icon: PlusCircle },
  { name: "Tagihan & Langganan", href: "/dashboard/transaksi", icon: Receipt },
  { name: "Profil Toko", href: "/dashboard/profile", icon: UserCircle },
];

type Props = { access?: Pick<AccessGuard, "isExpired" | "isTrial" | "daysRemaining"> };

export default function Sidebar({ access }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-[#161F30] border-r border-slate-800 h-screen sticky top-0 justify-between p-4 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
            ✂️
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight leading-tight">
              benangku<span className="text-blue-500">.id</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Untuk Penjahit & Konveksi
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Status Langganan (data nyata dari akun) */}
      <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              access?.isExpired
                ? "text-red-400 bg-red-500/10 border-red-500/20"
                : access?.isTrial
                ? "text-amber-300 bg-amber-500/10 border-amber-500/20"
                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {access?.isExpired ? "Masa aktif habis" : access?.isTrial ? "Uji Coba" : "Paket Pro"}
          </span>
        </div>
        <p className="text-xs text-slate-300">
          {access?.isExpired
            ? "Upgrade untuk menambah pelanggan & pesanan baru."
            : `Sisa ${access?.daysRemaining ?? 0} hari.`}
        </p>
        {(access?.isExpired || access?.isTrial) && (
          <Link
            href="/dashboard/upgrade"
            className="block w-full text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 py-2 rounded-xl transition"
          >
            Upgrade ke Pro
          </Link>
        )}
        <a
          href={waLink("Halo benangku.id, saya butuh bantuan di dashboard.") ?? "/bantuan"}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 py-2 rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Bantuan
        </a>
      </div>
    </aside>
  );
}
