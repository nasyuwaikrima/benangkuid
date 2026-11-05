"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Scissors, 
  Search, 
  Phone, 
  Calendar, 
  AlertCircle, 
  ExternalLink,
  Ban,
  Check,
  Flame,
  AlertTriangle,
  Coins,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface OrderItem {
  id: string;
  item_name: string;
  service_type: string;
  detail_instruksi: string;
  photo_before_url: string | null;
  total_biaya: number;
  dp_dibayar: number;
  status_pengerjaan: string;
  tgl_deadline: string | null;
  created_at: string;
  customer_id: string;
  customers: {
    name: string;
    phone_number: string;
  } | null;
}

interface OrderQueueProps {
  initialOrders: OrderItem[];
  initialOption?: string;
  initialStatus?: string;
}

export default function OrderQueue({
  initialOrders,
  initialOption = "semua",
  initialStatus = "antrean",
}: OrderQueueProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<string>(initialStatus);
  const [activeOption, setActiveOption] = useState<string>(initialOption);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Sync state lokal ketika parameter URL berubah
  useEffect(() => {
    const opt = searchParams.get("option");
    const st = searchParams.get("status");
    if (opt) setActiveOption(opt);
    if (st) setActiveTab(st);
  }, [searchParams]);

  // Fungsi mengubah URL query param tanpa reload halaman
  const updateQueryParam = (newStatus: string, newOption: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newStatus && newStatus !== "semua") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }

    if (newOption && newOption !== "semua") {
      params.set("option", newOption);
    } else {
      params.delete("option");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    updateQueryParam(tabId, activeOption);
  };

  const handleOptionChange = (optionId: string) => {
    setActiveOption(optionId);
    // Jika memilih filter 'mepet' atau 'terlambat', otomatis ubah tab status ke 'semua' agar pesanan terlihat
    const targetStatus = optionId === "mepet" || optionId === "terlambat" ? "semua" : activeTab;
    if (targetStatus !== activeTab) setActiveTab(targetStatus);
    updateQueryParam(targetStatus, optionId);
  };

  // Update Status Pesanan di Supabase Real-time
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status_pengerjaan: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status_pengerjaan: newStatus } : o))
      );
      router.refresh();
    } catch (err: any) {
      alert("Gagal memperbarui status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper Kalkulasi Deadline & Urgensi
  const getDeadlineStatus = (deadlineStr: string | null, status: string) => {
    if (!deadlineStr || status === "selesai" || status === "batal") return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { type: "overdue", label: `Terlambat ${Math.abs(diffDays)} Hari!`, days: diffDays };
    }
    if (diffDays === 0) {
      return { type: "today", label: "DEADLINE HARI INI!", days: 0 };
    }
    if (diffDays <= 3) {
      return { type: "mepet", label: `Mepet H-${diffDays}`, days: diffDays };
    }
    return { type: "normal", label: `H-${diffDays}`, days: diffDays };
  };

  // Filtering berdasarkan Tab Status, Option, dan Search Query
  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "semua" || order.status_pengerjaan === activeTab;
    const customerName = order.customers?.name || "";
    const phone = order.customers?.phone_number || "";
    const matchesSearch =
      order.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery);

    const deadlineInfo = getDeadlineStatus(order.tgl_deadline, order.status_pengerjaan);
    const sisaBayar = order.total_biaya - order.dp_dibayar;

    let matchesOption = true;
    if (activeOption === "mepet") {
      matchesOption =
        deadlineInfo?.type === "mepet" ||
        deadlineInfo?.type === "today" ||
        deadlineInfo?.type === "overdue";
    } else if (activeOption === "terlambat") {
      matchesOption = deadlineInfo?.type === "overdue";
    } else if (activeOption === "belum_lunas") {
      matchesOption = sisaBayar > 0 && order.status_pengerjaan !== "batal";
    }

    return matchesTab && matchesSearch && matchesOption;
  });

  // Hitung Kuota Badge Counter
  const countStatus = (status: string) =>
    orders.filter((o) => status === "semua" || o.status_pengerjaan === status).length;

  const countMepet = orders.filter((o) => {
    const d = getDeadlineStatus(o.tgl_deadline, o.status_pengerjaan);
    return d?.type === "mepet" || d?.type === "today" || d?.type === "overdue";
  }).length;

  const countBelumLunas = orders.filter(
    (o) => o.total_biaya - o.dp_dibayar > 0 && o.status_pengerjaan !== "batal"
  ).length;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Tanpa Deadline";
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
      new Date(dateStr)
    );
  };

  return (
    <div className="space-y-6 select-none">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Antrean & Status Jahit</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Kelola tahapan pengerjaan jahit, pantau deadline mepet, dan perbarui status pesanan.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari pelanggan / item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161F30] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* SUB-FILTER QUICK OPTION CHIPS (URL QUERY PARAM OPTION) */}
      <div className="flex items-center gap-2 flex-wrap border-b border-slate-800/80 pb-3">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Filter Cepat:
        </span>

        <button
          onClick={() => handleOptionChange("semua")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
            activeOption === "semua"
              ? "bg-slate-700 text-white border-slate-600"
              : "bg-[#0F172A] text-slate-400 border-slate-800 hover:text-slate-200"
          }`}
        >
          Semua
        </button>

        <button
          onClick={() => handleOptionChange("mepet")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
            activeOption === "mepet"
              ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
          }`}
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>Deadline Mepet (≤ 3 Hari)</span>
          {countMepet > 0 && (
            <span className="px-1.5 py-0.2 rounded-md bg-amber-950 text-amber-300 text-[10px]">
              {countMepet}
            </span>
          )}
        </button>

        <button
          onClick={() => handleOptionChange("belum_lunas")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
            activeOption === "belum_lunas"
              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Belum Lunas</span>
          {countBelumLunas > 0 && (
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-300 text-[10px]">
              {countBelumLunas}
            </span>
          )}
        </button>
      </div>

      {/* FILTER GROUP TABS STATUS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "antrean", label: "Belum Dijahit", icon: Clock },
          { id: "proses", label: "Sedang Dijahit", icon: Scissors },
          { id: "selesai", label: "Siap Ambil", icon: CheckCircle2 },
          { id: "batal", label: "Retur / Batal", icon: Ban },
          { id: "semua", label: "Semua Status", icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const count = countStatus(tab.id);
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20"
                  : "bg-[#161F30] text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* LIST KARTU ANTREAN ORDER */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const sisaBayar = order.total_biaya - order.dp_dibayar;
            const isLunas = sisaBayar <= 0;
            const isUpdating = updatingId === order.id;

            const deadlineInfo = getDeadlineStatus(order.tgl_deadline, order.status_pengerjaan);
            const isUrgent = deadlineInfo?.type === "mepet" || deadlineInfo?.type === "today" || deadlineInfo?.type === "overdue";

            // Template pesan WhatsApp untuk penjahit
            const waMessage = encodeURIComponent(
              `Halo kak ${order.customers?.name || ''}, mengenai pesanan jahit ${order.item_name} di toko kami.`
            );

            return (
              <div
                key={order.id}
                className={`bg-[#161F30] border rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between transition relative overflow-hidden ${
                  isUrgent
                    ? "border-amber-500/60 ring-1 ring-amber-500/20"
                    : "border-slate-800/90 hover:border-slate-700/80"
                }`}
              >
                {/* Banner Strip khusus jika Deadline Mepet / Overdue */}
                {deadlineInfo && isUrgent && (
                  <div
                    className={`-mx-5 -mt-5 mb-1 px-5 py-1.5 text-[11px] font-extrabold flex items-center justify-between ${
                      deadlineInfo.type === "overdue"
                        ? "bg-red-500 text-white"
                        : deadlineInfo.type === "today"
                        ? "bg-amber-500 text-slate-950 animate-pulse"
                        : "bg-amber-500/20 text-amber-300 border-b border-amber-500/30"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {deadlineInfo.label}
                    </span>
                    <span>Deadline: {formatDate(order.tgl_deadline)}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Header Kartu: Pelanggan & Status Badge */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-bold text-white truncate">
                        {order.customers?.name || "Pelanggan Tanpa Nama"}
                      </h3>
                      {order.customers?.phone_number && (
                        <a
                          href={`https://wa.me/${order.customers.phone_number}?text=${waMessage}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5 font-medium"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.customers.phone_number}</span>
                          <MessageSquare className="w-2.5 h-2.5 opacity-70 ml-0.5" />
                        </a>
                      )}
                    </div>

                    {/* Badge Status Pengerjaan */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                        order.status_pengerjaan === "antrean"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : order.status_pengerjaan === "proses"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : order.status_pengerjaan === "selesai"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {order.status_pengerjaan === "antrean"
                        ? "Belum Dijahit"
                        : order.status_pengerjaan === "proses"
                        ? "Sedang Dijahit"
                        : order.status_pengerjaan === "selesai"
                        ? "Siap Ambil"
                        : "Batal / Retur"}
                    </span>
                  </div>

                  {/* Detail Item & Instruksi */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-blue-400" />
                        {order.item_name}
                      </span>
                      <span className="text-[10px] bg-[#0F172A] px-2 py-0.5 rounded text-slate-400 font-medium">
                        {order.service_type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-[#0F172A] border border-slate-800 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                      <strong className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                        Instruksi Penjahit:
                      </strong>
                      {order.detail_instruksi}
                    </p>
                  </div>

                  {/* Info Keuangan & Deadline */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-[#0F172A]/70 p-2.5 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block font-medium">Total / Sisa Bayar</span>
                      <span className="text-xs font-bold text-white">
                        Rp {order.total_biaya.toLocaleString("id-ID")}
                      </span>
                      <div className="mt-0.5">
                        {isLunas ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Lunas (DP Rp {order.dp_dibayar.toLocaleString("id-ID")})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400">
                            Sisa: Rp {sisaBayar.toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#0F172A]/70 p-2.5 rounded-xl border border-slate-800/60 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> Deadline
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {formatDate(order.tgl_deadline)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTON GROUP */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  {order.status_pengerjaan === "antrean" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "proses")}
                        disabled={isUpdating}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isUpdating ? "Memproses..." : "Jahit Sekarang"}</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(order.id, "batal")}
                        disabled={isUpdating}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retur / Batal</span>
                      </button>
                    </>
                  )}

                  {order.status_pengerjaan === "proses" && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "selesai")}
                      disabled={isUpdating}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isUpdating ? "Memproses..." : "Selesai Jahit (Siap Ambil)"}</span>
                    </button>
                  )}

                  {order.status_pengerjaan === "selesai" && (
                    <div className="w-full flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-400 text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Siap diserahkan ke pelanggan
                      </span>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "antrean")}
                        disabled={isUpdating}
                        className="text-[11px] text-slate-400 hover:text-white underline"
                      >
                        Kembalikan
                      </button>
                    </div>
                  )}

                  {order.status_pengerjaan === "batal" && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "antrean")}
                      disabled={isUpdating}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pulihkan Pesanan Ke Antrean</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Tidak Ada Pesanan Dalam Filter Ini</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Belum ada pesanan yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
        </div>
      )}
    </div>
  );
}
