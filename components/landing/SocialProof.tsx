"use client";

import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

const notifications = [
  { name: "Pak Slamet (Penjahit Solo)", text: "baru saja berlangganan Paket Rp 20rb" },
  { name: "Konveksi Berkah Bandung", text: "berhasil mengirim 15 Struk WA" },
  { name: "Mbak Rita (Tailor Jogja)", text: "menyimpan 8 data ukuran baru" },
];

export default function SocialProof() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Trigger animasi fade-out
      setIsVisible(false);

      // 2. Tunggu 300ms (sesuai duration-300), lalu ganti data dan fade-in
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % notifications.length);
        setIsVisible(true);
      }, 300);
    }, 4500); // Berganti setiap 4.5 detik

    return () => clearInterval(timer);
  }, []);

  const current = notifications[index];

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-5 sm:bottom-5 z-50 pointer-events-none">
      <div
        className={`p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-full sm:max-w-xs transition-all duration-300 ease-out ${
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-3 scale-95"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-[11px] leading-tight">
          <span className="font-bold text-white block">{current.name}</span>
          <span className="text-slate-400">{current.text}</span>
        </div>
      </div>
    </div>
  );
}
