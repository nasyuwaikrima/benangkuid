"use client";

import Link from "next/link";
import { 
  TrendingUp, 
  Scissors, 
  Wallet, 
  Clock, 
  Plus, 
  ArrowRight, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  Users,
  Sparkles
} from "lucide-react";

interface OrderItem {
  id: string;
  item_name: string;
  service_type: string;
  detail_instruksi: string;
  total_biaya: number;
  dp_dibayar: number;
  status_pengerjaan: string;
  tgl_deadline: string | null;
  created_at: string;
  customers: {
    name: string;
    phone_number: string;
  } | null;
}

interface DashboardOverviewProps {
  stats: {
    omzetBulanIni: number;
    dpDiterimaBulanIni: number;
    totalJahitanBulanIni: number;
    antreanAktifCount: number;
    sisaPiutang: number;
    urgentDeadlineCount: number;
    ownerName: string;
    shopName: string;
  };
  recentOrders: OrderItem[];
  urgentOrders: OrderItem[];
}

export default function DashboardOverview({
  stats,
  recentOrders,
  urgentOrders,
}: DashboardOverviewProps) {
  const currentMonthName = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const formatRupiah = (val: number) =>
    "Rp " + val.toLocaleString("id-ID");

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* WELCOME BANNER & QUICK ACTION */}
      <div className="bg-[#161F30] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Ringkasan {currentMonthName}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1">
              Selamat Datang, {stats.ownerName}! 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Berikut adalah performa usaha jahit <strong className="text-slate-200">{stats.shopName}</strong> hari ini.
            </p>
          </div>

          <Link
            href="/dashboard/tambah"
            className="self-start md:self-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pesanan Baru</span>
          </Link>
        </div>
      </div>


      {/* GRID STATISTIK ANALITIK UTAMA (4 METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Omzet Bulan Ini */}
        <div className="bg-[#161F30] border border-slate-800/90 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Omzet Jahit Bulan Ini</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {formatRupiah(stats.omzetBulanIni)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              DP Terkumpul: <span className="text-emerald-400 font-semibold">{formatRupiah(stats.dpDiterimaBulanIni)}</span>
            </p>
          </div>
        </div>

        {/* 2. Total Pesanan Jahit */}
        <div className="bg-[#161F30] border border-slate-800/90 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Order Masuk Bulan Ini</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {stats.totalJahitanBulanIni} <span className="text-xs font-normal text-slate-400">pesanan</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Total pengerjaan dalam 30 hari
            </p>
          </div>
        </div>

        {/* 3. Antrean Aktif */}
        <div className="bg-[#161F30] border border-slate-800/90 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Antrean Perlu Dikerjakan</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {stats.antreanAktifCount} <span className="text-xs font-normal text-slate-400">antrean</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {stats.urgentDeadlineCount > 0 ? (
                <span className="text-amber-400 font-semibold">{stats.urgentDeadlineCount} pesanan mendesak</span>
              ) : (
                "Semua tenggat waktu aman"
              )}
            </p>
          </div>
        </div>

        {/* 4. Total Sisa Tagihan (Piutang) */}
        <div className="bg-[#161F30] border border-slate-800/90 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Belum Dilunasi Pelanggan</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">
              {formatRupiah(stats.sisaPiutang)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Estimasi sisa pembayaran DP
            </p>
          </div>
        </div>

      </div>


      {/* SECTION DUO: URGENT DEADLINES & RECENT ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* URGENT DEADLINES (1 COL) */}
        <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Mendekati Deadline</h2>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                7 Hari Ke Depan
              </span>
            </div>

            {urgentOrders.length > 0 ? (
              <div className="space-y-2.5">
                {urgentOrders.slice(0, 4).map((order) => (
                  <div
                    key={order.id}
                    className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate max-w-[150px]">
                        {order.customers?.name || "Pelanggan"}
                      </h4>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        {formatDate(order.tgl_deadline)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">
                      {order.item_name} ({order.service_type})
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">Tidak Ada Deadline Mendesak</p>
                <p className="text-[11px] text-slate-500">Semua pengerjaan tepat waktu.</p>
              </div>
            )}
          </div>

          <Link
            href="/dashboard/antrean"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 transition mt-2"
          >
            <span>Buka Antrean Jahit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>


        {/* TABEL / LIST PESANAN TERBARU (2 COLS) */}
        <div className="lg:col-span-2 bg-[#161F30] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Pesanan Terbaru Masuk</h2>
              <p className="text-[11px] text-slate-400">Aktivitas order pelanggan terakhir</p>
            </div>

            <Link
              href="/dashboard/antrean"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const sisa = order.total_biaya - order.dp_dibayar;
                return (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">
                          {order.customers?.name || "Pelanggan"}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            order.status_pengerjaan === "antrean"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : order.status_pengerjaan === "proses"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : order.status_pengerjaan === "selesai"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {order.status_pengerjaan}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {order.item_name} — <span className="text-slate-400">{order.service_type}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                      <div className="text-left sm:text-right">
                        <span className="font-bold text-white block">
                          Rp {order.total_biaya.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {sisa <= 0 ? (
                            <span className="text-emerald-400 font-semibold">Lunas</span>
                          ) : (
                            `Sisa: Rp ${sisa.toLocaleString("id-ID")}`
                          )}
                        </span>
                      </div>

                      <Link
                        href="/dashboard/antrean"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500 text-xs">
              Belum ada pesanan yang dicatat.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
