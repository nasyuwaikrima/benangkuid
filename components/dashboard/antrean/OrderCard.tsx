'use client';

import {
  Play,
  RotateCcw,
  CheckCircle2,
  Scissors,
  Phone,
  Calendar,
  AlertTriangle,
  PackageCheck,
  Undo2,
  Ruler,
} from 'lucide-react';
import { OrderWithCustomer } from './types';

interface OrderCardProps {
  order: OrderWithCustomer;
  isUpdating: boolean;
  onOpenDetail: (order: OrderWithCustomer) => void;
  onUpdateStatus: (
    orderId: string,
    newStatus: string,
    additionalFields?: Partial<OrderWithCustomer>
  ) => void;
}

export default function OrderCard({
  order,
  isUpdating,
  onOpenDetail,
  onUpdateStatus,
}: OrderCardProps) {
  // Parsing angka yang konsisten untuk menghindari Mismatch Hydration Error
  const totalBiaya = Number(order.total_biaya) || 0;
  const dpDibayar = Number(order.dp_dibayar) || 0;
  const sisaBayar = Math.max(0, totalBiaya - dpDibayar);
  const isLunas = totalBiaya > 0 ? sisaBayar <= 0 : false;

  // Helper Kalkulasi Deadline
  const getDeadlineInfo = (deadlineStr: string | null, status: string) => {
    if (!deadlineStr || status === 'selesai' || status === 'diambil' || status === 'batal') return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { type: 'overdue', label: `Terlambat ${Math.abs(diffDays)} Hari!` };
    if (diffDays === 0) return { type: 'today', label: 'DEADLINE HARI INI!' };
    if (diffDays <= 3) return { type: 'mepet', label: `Mepet H-${diffDays}` };
    return { type: 'normal', label: `H-${diffDays}` };
  };

  const deadlineInfo = getDeadlineInfo(order.tgl_deadline, order.status_pengerjaan);
  const isUrgent =
    deadlineInfo?.type === 'mepet' ||
    deadlineInfo?.type === 'today' ||
    deadlineInfo?.type === 'overdue';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Tanpa Deadline';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(
      new Date(dateStr)
    );
  };

  return (
    <div
      className={`bg-[#161F30] border rounded-2xl p-4 md:p-5 space-y-3.5 shadow-lg flex flex-col justify-between transition relative overflow-hidden ${
        isUrgent
          ? 'border-amber-500/60 ring-1 ring-amber-500/20'
          : 'border-slate-800/90 hover:border-slate-700'
      }`}
    >
      {/* Banner Strip khusus jika Deadline Mepet */}
      {deadlineInfo && isUrgent && (
        <div
          className={`-mx-5 -mt-5 mb-1 px-4 py-1.5 text-[10px] font-extrabold flex items-center justify-between ${
            deadlineInfo.type === 'overdue'
              ? 'bg-red-500 text-white'
              : deadlineInfo.type === 'today'
              ? 'bg-amber-500 text-slate-950 animate-pulse'
              : 'bg-amber-500/20 text-amber-300 border-b border-amber-500/30'
          }`}
        >
          <span className="flex items-center gap-1 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            {deadlineInfo.label}
          </span>
          <span>Deadline: {formatDate(order.tgl_deadline)}</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Pelanggan & Status Badge */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div>
            <h3 className="text-xs md:text-sm font-bold text-white truncate">
              {order.customers?.name || 'Pelanggan Tanpa Nama'}
            </h3>
            {order.customers?.phone_number && (
              <a
                href={`https://wa.me/${order.customers.phone_number}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5 font-mono"
              >
                <Phone className="w-3 h-3" />
                <span>{order.customers.phone_number}</span>
              </a>
            )}
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
              order.status_pengerjaan === 'antrean'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : order.status_pengerjaan === 'proses'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : order.status_pengerjaan === 'selesai'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : order.status_pengerjaan === 'diambil'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            {order.status_pengerjaan === 'antrean'
              ? 'Belum Dijahit'
              : order.status_pengerjaan === 'proses'
              ? 'Sedang Dijahit'
              : order.status_pengerjaan === 'selesai'
              ? 'Selesai'
              : order.status_pengerjaan === 'diambil'
              ? 'Sudah Diambil'
              : 'Batal'}
          </span>
        </div>

        {/* Detail Item & Jenis Permak/Jahit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5 truncate">
              <Scissors className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {order.item_name}
            </span>
            <span className="text-[10px] bg-[#0F172A] border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-semibold shrink-0">
              {order.service_type}
            </span>
          </div>

          {/* Box Instruksi Penjahit */}
          <div className="bg-[#0F172A] border border-slate-800 p-2.5 rounded-xl text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Instruksi Penjahit:
            </span>
            <p className="text-slate-200 line-clamp-2 leading-relaxed">
              {(() => {
                const teks = order.detail_instruksi || '-';
                if (/\b(target|potong|tambah|kurang|jadi)\b/i.test(teks) && !/cm/i.test(teks)) {
                  return teks.replace(/(\d+(?:[.,]\d+)?)/g, '$1 cm');
                }
                return teks;
              })()}
            </p>
          </div>
        </div>

        {/* Keuangan & Deadline */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#0F172A]/70 p-2 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block font-medium">Total / Sisa Bayar</span>
            <span className="text-xs font-bold text-white">
              Rp {totalBiaya.toLocaleString('id-ID')}
            </span>
            <div className="mt-0.5">
              {isLunas ? (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">
                  Lunas
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-400">
                  Sisa: Rp {sisaBayar.toLocaleString('id-ID')}
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#0F172A]/70 p-2 rounded-xl border border-slate-800/60 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Deadline
            </span>
            <span className="text-xs font-bold text-slate-200">
              {formatDate(order.tgl_deadline)}
            </span>
          </div>
        </div>
      </div>

      {/* Group Tombol Eksekusi & Detail Ukuran */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
        {order.status_pengerjaan === 'antrean' && (
          <>
            <button
              onClick={() => onUpdateStatus(order.id, 'proses')}
              disabled={isUpdating}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isUpdating ? '...' : 'Mulai Dijahit'}</span>
            </button>
            <button
              onClick={() => onOpenDetail(order)}
              className="px-3 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shrink-0"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Detail & Ukuran</span>
            </button>
          </>
        )}

        {order.status_pengerjaan === 'proses' && (
          <>
            <button
              onClick={() => onUpdateStatus(order.id, 'selesai')}
              disabled={isUpdating}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isUpdating ? '...' : 'Selesai Dijahit'}</span>
            </button>
            <button
              onClick={() => onOpenDetail(order)}
              className="px-3 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shrink-0"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Detail & Ukuran</span>
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, 'antrean')}
              disabled={isUpdating}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="Kembalikan ke antrean"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          </>
        )}

        {order.status_pengerjaan === 'selesai' && (
          <div className="w-full flex gap-2">
            <button
              onClick={() =>
                onUpdateStatus(
                  order.id,
                  isLunas ? 'diambil' : 'selesai',
                  isLunas ? {} : { dp_dibayar: totalBiaya }
                )
              }
              disabled={isUpdating}
              className={`flex-1 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 ${
                isLunas
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>
                {isUpdating
                  ? '...'
                  : isLunas
                  ? 'Tandai Sudah Diambil'
                  : 'Serahkan & Lunasi'}
              </span>
            </button>
            <button
              onClick={() => onOpenDetail(order)}
              className="px-3 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shrink-0"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Detail & Ukuran</span>
            </button>
          </div>
        )}

        {order.status_pengerjaan === 'diambil' && (
          <div className="w-full flex gap-2">
            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5">
              <PackageCheck className="w-4 h-4" />
              <span>Sudah Diserahkan & Diambil</span>
            </div>
            <button
              onClick={() => onOpenDetail(order)}
              className="px-3 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shrink-0"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Detail & Ukuran</span>
            </button>
          </div>
        )}

        {order.status_pengerjaan === 'batal' && (
          <div className="w-full flex gap-2">
            <button
              onClick={() => onUpdateStatus(order.id, 'antrean')}
              disabled={isUpdating}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Pulihkan Pesanan</span>
            </button>
            <button
              onClick={() => onOpenDetail(order)}
              className="px-3 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shrink-0"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Detail & Ukuran</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
