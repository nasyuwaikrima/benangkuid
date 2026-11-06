  'use client';

import { X, Ruler, Phone, Edit3, Scissors, Calendar, CheckCircle2 } from 'lucide-react';
import { OrderWithCustomer } from './types';

interface OrderDetailModalProps {
  order: OrderWithCustomer;
  onClose: () => void;
  onOpenEdit: (order: OrderWithCustomer) => void;
}

export default function OrderDetailModal({
  order,
  onClose,
  onOpenEdit,
}: OrderDetailModalProps) {
  const measurement = order.customers?.customer_measurements?.[0];
  const sisaBayar = order.total_biaya - order.dp_dibayar;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 select-none">
      <div className="bg-[#161F30] border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 md:p-7 space-y-6 relative">
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-slate-800/90 pb-4">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-0.5">
              Detail Antrean Jahit (#{order.id.slice(0, 8)})
            </span>
            <h2 className="text-lg font-bold text-white">
              {order.customers?.name || 'Pelanggan'}
            </h2>
            {order.customers?.phone_number && (
              <a
                href={`https://wa.me/${order.customers.phone_number}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-mono"
              >
                <Phone className="w-3 h-3" />
                <span>{order.customers.phone_number}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenEdit(order)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Edit Pesanan"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section 1: Item & Permak */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-blue-400" />
              {order.item_name}
            </span>
            <span className="text-[10px] bg-[#0F172A] border border-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded">
              {order.service_type}
            </span>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/90 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Instruksi Penjahit:
            </span>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {order.detail_instruksi || 'Tidak ada catatan khusus.'}
            </p>
          </div>
        </div>

        {/* Section 2: Ukuran Badan (cm) */}
        <div className="space-y-3 pt-2 border-t border-slate-800/90">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-purple-400" />
              <span>Ukuran Badan (cm)</span>
            </h3>
            {measurement?.label && (
              <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-md font-semibold">
                Label: {measurement.label}
              </span>
            )}
          </div>

          {measurement ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {[
                { label: 'Lingkar Dada', val: measurement.chest },
                { label: 'Lingkar Pinggang', val: measurement.waist },
                { label: 'Lingkar Pinggul', val: measurement.hip },
                { label: 'Lebar Bahu', val: measurement.shoulder },
                { label: 'Panjang Lengan', val: measurement.sleeve },
                { label: 'Panjang Celana/Rok', val: measurement.pants_length },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className="bg-[#0F172A] border border-slate-800 p-2.5 rounded-xl flex items-center justify-between"
                >
                  <span className="text-[11px] text-slate-400">{m.label}</span>
                  <span className="text-xs font-extrabold text-purple-300">
                    {m.val ? `${m.val} cm` : '-'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl text-center">
              <p className="text-xs text-slate-400">
                Belum ada data ukuran tersimpan untuk pelanggan ini.
              </p>
            </div>
          )}
        </div>

        {/* Section 3: Ringkasan Biaya */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 flex justify-between items-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Total Biaya</span>
            <span className="text-xs font-bold text-white">
              Rp {order.total_biaya.toLocaleString('id-ID')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">DP Dibayar</span>
            <span className="text-xs font-bold text-emerald-400">
              Rp {order.dp_dibayar.toLocaleString('id-ID')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Sisa Pembayaran</span>
            <span className="text-xs font-bold text-amber-400">
              {sisaBayar <= 0 ? 'LUNAS' : `Rp ${sisaBayar.toLocaleString('id-ID')}`}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
