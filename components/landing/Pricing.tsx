"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  originalPrice?: string;
  isPopular?: boolean;
  badge?: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "penjahit-lokal",
    name: "Penjahit Lokal",
    subtitle: "Penjahit Rumahan / Perorangan",
    price: "Rp 19.000",
    period: "/ bulan",
    originalPrice: "Rp 29.000",
    isPopular: true,
    badge: "Promo Peluncuran",
    features: [
      "Simpan Ukuran Pelanggan Tanpa Batas",
      "Kirim Struk WA Otomatis",
      "Manajemen Antrean Sederhana",
      "Akses 1 Perangkat HP / Laptop",
    ],
    ctaText: "Mulai Sekarang",
    ctaHref: "/dashboard", // Langsung mengarah ke internal dashboard / register
  },
];

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch justify-center max-w-2xl mx-auto md:max-w-none">
        {PRICING_PLANS.map((plan) => {
          const isPopular = plan.isPopular;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -5 }}
              className={`p-8 rounded-3xl flex flex-col justify-between relative transition-all ${
                isPopular
                  ? "bg-gradient-to-b from-blue-950/60 to-slate-900/90 border-2 border-blue-500/50 shadow-2xl shadow-blue-950/40"
                  : "bg-slate-900/80 border border-slate-800"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-2">
                  {plan.subtitle}
                </span>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-2 mb-6">
                  {plan.originalPrice && (
                    <span className="text-sm text-slate-500 line-through font-semibold">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-4xl font-extrabold text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-400">{plan.period}</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-300 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.ctaHref}
                className={`w-full py-3.5 rounded-xl text-xs font-semibold text-center transition-all ${
                  isPopular
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
              >
                {plan.ctaText}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
