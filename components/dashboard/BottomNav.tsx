"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Scissors, Plus, History, User } from "lucide-react";

const mobileItems = [
  { name: "Beranda", href: "/dashboard", icon: Home },
  { name: "Antrean", href: "/dashboard/antrean", icon: Scissors },
  { name: "Tambah", href: "/dashboard/tambah", icon: Plus, isAction: true },
  { name: "Riwayat", href: "/dashboard/riwayat", icon: History },
  { name: "Profil", href: "/dashboard/profile", icon: User },
];


export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161F30] border-t border-slate-800 px-3 py-2 z-50 shadow-2xl">
      <div className="flex items-center justify-around relative">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative -top-5 flex flex-col items-center group"
              >
                <div className="w-13 h-13 p-3.5 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/50 border-4 border-[#0B0F17] flex items-center justify-center active:scale-95 transition-all duration-200">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold text-blue-400 mt-1">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-1 transition-all duration-200 ${
                isActive ? "text-blue-500 font-semibold" : "text-slate-400"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? "bg-blue-600/15 text-blue-400" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
