"use client";

import { useState } from "react";
import { Calculator as CalcIcon, Clock, TrendingUp, Shirt, Sparkles } from "lucide-react";

export default function Calculator() {
  const [ordersPerMonth, setOrdersPerMonth] = useState(25);

  // Perhitungan estimasi hemat waktu & cuan
  const hoursSavedPerOrder = 0.5; // 30 menit per pesanan untuk administrasi & cari nota
  const totalHoursSaved = Math.round(ordersPerMonth * hoursSavedPerOrder);
  const potentialExtraEarnings = (totalHoursSaved * 35000).toLocaleString("id-ID");
  
  // Estimasi baju tambahan yang bisa dijahit dari waktu yang terhemat (asumsi 4 jam/baju)
  const extraClothesCapacity = Math.floor(totalHoursSaved / 4);

  // Quick preset buttons
  const presets = [15, 30, 60, 100];

  // Kalkulasi persentase slider untuk efek gradient CSS pada track slider
  const sliderPercentage = ((ordersPerMonth - 5) / (150 - 5)) * 100;

  return (
    <section id="kalkulator" className="px-4 sm:px-6 max-w-4xl mx-auto py-6">
      {/* Container Card Utama dengan CSS Hover Effects */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-700">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
              <CalcIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Simulasi Hemat Waktu & Omset Penjahit
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Geser slider atau pilih preset untuk melihat efisiensi usahamu
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5" /> Direct Estimator
          </span>
        </div>

        {/* INPUT SLIDER & PRESETS */}
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/60">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs sm:text-sm font-semibold text-slate-300">
              Jumlah Pesanan Jahitan per Bulan:
            </label>
            <div className="flex items-baseline gap-1 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
              <span className="text-xl sm:text-2xl font-extrabold text-blue-400">{ordersPerMonth}</span>
              <span className="text-xs font-semibold text-blue-300">Baju</span>
            </div>
          </div>

          {/* Slider dengan custom dynamic gradient track via CSS */}
          <div className="relative py-2">
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={ordersPerMonth}
              onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #3b82f6 ${sliderPercentage}%, #1e293b ${sliderPercentage}%)`
              }}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none transition-all duration-150"
            />
          </div>

          {/* Quick Select Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/40">
            <span className="text-xs text-slate-400 font-medium">Pilihan Cepat:</span>
            <div className="flex gap-2">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setOrdersPerMonth(val)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
                    ordersPerMonth === val
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {val} Baju
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* METRICS RESULT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Waktu Hemat */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-4 transition-all duration-300 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 group">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Waktu Hemat per Bulan</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tracking-tight">{totalHoursSaved}</span>
                <span className="text-sm font-semibold text-slate-400">Jam</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                ~{(totalHoursSaved / 30).toFixed(1)} jam terhemat/hari
              </span>
            </div>
          </div>

          {/* Card 2: Potensi Cuan */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-4 transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 group">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Potensi Tambahan Cuan</span>
              <span className="text-2xl font-bold text-emerald-400 tracking-tight block">
                Rp {potentialExtraEarnings}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Dari efisiensi waktu kerja
              </span>
            </div>
          </div>

          {/* Card 3: Tambahan Kapasitas Produksi */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-4 transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 group">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Kapasitas Jahit Ekstra</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-400 tracking-tight">+{extraClothesCapacity}</span>
                <span className="text-sm font-semibold text-slate-400">Baju/bln</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Hasil pengalihan waktu luang
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
