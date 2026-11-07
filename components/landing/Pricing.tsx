"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { PRICING_PLANS, formatRupiah } from "@/config/pricing";

export default function Pricing() {
  return (
    <section id="harga" className="px-4 sm:px-6 py-16 md:py-24 max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Harga Terjangkau Untuk Hasil Maksimal
        </h2>
        <p className="mt-2 text-slate-400 text-sm">
          Coba gratis dulu, atau langsung berlangganan. Bayar lewat QRIS tanpa biaya tersembunyi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch justify-center max-w-4xl mx-auto">
        {PRICING_PLANS.map((plan) => {
          const isPopular = plan.isPopular;
          const targetHref = plan.id === "trial" ? "/login" : "/login?next=/dashboard/upgrade";

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
                <div
                  className={`absolute -top-3.5 right-6 px-3 py-1 rounded-full text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md ${
                    isPopular ? "bg-blue-600" : "bg-emerald-600"
                  }`}
                >
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
                  {plan.originalAmount !== undefined && (
                    <span className="text-sm text-slate-500 line-through font-semibold">
                      {formatRupiah(plan.originalAmount)}
                    </span>
                  )}
                  <span className="text-4xl font-extrabold text-white">
                    {formatRupiah(plan.priceAmount)}
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
                href={targetHref}
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
