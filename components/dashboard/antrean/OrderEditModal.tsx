'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { OrderWithCustomer } from './types';

interface OrderEditModalProps {
  order: OrderWithCustomer;
  onClose: () => void;
  onSave: (payload: Partial<OrderWithCustomer>) => Promise<void>;
  isUpdating: boolean;
}

export default function OrderEditModal({
  order,
  onClose,
  onSave,
  isUpdating,
}: OrderEditModalProps) {
  const [form, setForm] = useState({
    item_name: order.item_name,
    service_type: order.service_type,
    detail_instruksi: order.detail_instruksi,
    total_biaya: order.total_biaya,
    dp_dibayar: order.dp_dibayar,
    tgl_deadline: order.tgl_deadline || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      item_name: form.item_name,
      service_type: form.service_type,
      detail_instruksi: form.detail_instruksi,
      total_biaya: Number(form.total_biaya) || 0,
      dp_dibayar: Number(form.dp_dibayar) || 0,
      tgl_deadline: form.tgl_deadline || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 select-none">
      <div className="bg-[#161F30] border border-slate-800 rounded-3xl w-full max-w-lg p-5 md:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">Ubah Data Pesanan</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nama Barang</label>
            <input
              type="text"
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Instruksi Penjahit</label>
            <textarea
              rows={3}
              value={form.detail_instruksi}
              onChange={(e) => setForm({ ...form, detail_instruksi: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Total Biaya (Rp)</label>
              <input
                type="number"
                value={form.total_biaya}
                onChange={(e) => setForm({ ...form, total_biaya: Number(e.target.value) })}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">DP Dibayar (Rp)</label>
              <input
                type="number"
                value={form.dp_dibayar}
                onChange={(e) => setForm({ ...form, dp_dibayar: Number(e.target.value) })}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tanggal Deadline</label>
            <input
              type="date"
              value={form.tgl_deadline}
              onChange={(e) => setForm({ ...form, tgl_deadline: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isUpdating ? 'Simpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
