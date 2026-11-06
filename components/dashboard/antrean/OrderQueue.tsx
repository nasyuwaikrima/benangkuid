'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Clock,
  Scissors,
  CheckCircle2,
  Ban,
  Search,
  Sparkles,
  Flame,
  Coins,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { OrderWithCustomer } from './types';
import OrderCard from './OrderCard';
import OrderDetailModal from './OrderDetailModal';
import OrderEditModal from './OrderEditModal';

interface OrderQueueProps {
  initialOrders: OrderWithCustomer[];
  initialOption?: string;
  initialStatus?: string;
  selectedOrderId?: string | null;
}

export default function OrderQueue({
  initialOrders,
  initialOption = 'semua',
  initialStatus = 'antrean',
  selectedOrderId = null,
}: OrderQueueProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [orders, setOrders] = useState<OrderWithCustomer[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<string>(initialStatus);
  const [activeOption, setActiveOption] = useState<string>(initialOption);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [activeDetailOrder, setActiveDetailOrder] = useState<OrderWithCustomer | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderWithCustomer | null>(null);

  useEffect(() => {
    const opt = searchParams.get('option');
    const st = searchParams.get('status');
    const idParam = searchParams.get('id');

    if (opt) setActiveOption(opt);
    if (st) setActiveTab(st);

    if (idParam) {
      const found = orders.find((o) => o.id === idParam);
      if (found) setActiveDetailOrder(found);
    } else {
      setActiveDetailOrder(null);
    }
  }, [searchParams, orders]);

  const updateQueryParams = (patch: { status?: string; option?: string; id?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (patch.status !== undefined) {
      if (patch.status && patch.status !== 'semua') params.set('status', patch.status);
      else params.delete('status');
    }

    if (patch.option !== undefined) {
      if (patch.option && patch.option !== 'semua') params.set('option', patch.option);
      else params.delete('option');
    }

    if (patch.id !== undefined) {
      if (patch.id) params.set('id', patch.id);
      else params.delete('id');
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    updateQueryParams({ status: tabId, option: activeOption });
  };

  const handleOptionChange = (optionId: string) => {
    setActiveOption(optionId);
    const targetStatus = optionId === 'mepet' || optionId === 'terlambat' ? 'semua' : activeTab;
    if (targetStatus !== activeTab) setActiveTab(targetStatus);
    updateQueryParams({ status: targetStatus, option: optionId });
  };

  const handleOpenDetail = (order: OrderWithCustomer) => {
    setActiveDetailOrder(order);
    updateQueryParams({ id: order.id });
  };

  const handleCloseDetail = () => {
    setActiveDetailOrder(null);
    updateQueryParams({ id: null });
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: string,
    additionalFields?: Partial<OrderWithCustomer>
  ) => {
    setUpdatingId(orderId);
    try {
      const payload = { status_pengerjaan: newStatus, ...additionalFields };
      const { error } = await supabase.from('orders').update(payload).eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...payload } : o))
      );

      if (activeDetailOrder?.id === orderId) {
        setActiveDetailOrder((prev) => (prev ? { ...prev, ...payload } : null));
      }

      router.refresh();
    } catch (err: any) {
      alert('Gagal memperbarui status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveEdit = async (payload: Partial<OrderWithCustomer>) => {
    if (!editingOrder) return;
    setUpdatingId(editingOrder.id);
    try {
      const { error } = await supabase.from('orders').update(payload).eq('id', editingOrder.id);
      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrder.id ? { ...o, ...payload } : o))
      );

      if (activeDetailOrder?.id === editingOrder.id) {
        setActiveDetailOrder((prev) => (prev ? { ...prev, ...payload } : null));
      }

      setEditingOrder(null);
      router.refresh();
    } catch (err: any) {
      alert('Gagal mengedit pesanan: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper Kalkulasi Deadline
  const getDeadlineStatus = (deadlineStr: string | null, status: string) => {
    if (!deadlineStr || status === 'selesai' || status === 'batal') return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { type: 'overdue' };
    if (diffDays === 0) return { type: 'today' };
    if (diffDays <= 3) return { type: 'mepet' };
    return { type: 'normal' };
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'semua' || order.status_pengerjaan === activeTab;
    const customerName = order.customers?.name || '';
    const phone = order.customers?.phone_number || '';
    const matchesSearch =
      order.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery);

    const deadlineInfo = getDeadlineStatus(order.tgl_deadline, order.status_pengerjaan);
    const sisaBayar = order.total_biaya - order.dp_dibayar;

    let matchesOption = true;
    if (activeOption === 'mepet') {
      matchesOption =
        deadlineInfo?.type === 'mepet' ||
        deadlineInfo?.type === 'today' ||
        deadlineInfo?.type === 'overdue';
    } else if (activeOption === 'terlambat') {
      matchesOption = deadlineInfo?.type === 'overdue';
    } else if (activeOption === 'belum_lunas') {
      matchesOption = sisaBayar > 0 && order.status_pengerjaan !== 'batal';
    }

    return matchesTab && matchesSearch && matchesOption;
  });

  const countStatus = (status: string) =>
    orders.filter((o) => status === 'semua' || o.status_pengerjaan === status).length;

  const countMepet = orders.filter((o) => {
    const d = getDeadlineStatus(o.tgl_deadline, o.status_pengerjaan);
    return d?.type === 'mepet' || d?.type === 'today' || d?.type === 'overdue';
  }).length;

  const countBelumLunas = orders.filter(
    (o) => o.total_biaya - o.dp_dibayar > 0 && o.status_pengerjaan !== 'batal'
  ).length;

  return (
    <div className="space-y-5 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Antrean & Status Jahit
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau status pengerjaan dan intip ukuran badan pelanggan dalam sentimeter (cm).
          </p>
        </div>

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

      {/* Filter Cepat */}
      <div className="flex items-center gap-2 flex-wrap border-b border-slate-800/80 pb-3">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Filter Cepat:
        </span>

        <button
          onClick={() => handleOptionChange('semua')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
            activeOption === 'semua'
              ? 'bg-slate-700 text-white border-slate-600'
              : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Semua
        </button>

        <button
          onClick={() => handleOptionChange('mepet')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
            activeOption === 'mepet'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
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
          onClick={() => handleOptionChange('belum_lunas')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
            activeOption === 'belum_lunas'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
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

      {/* Tabs Status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'antrean', label: 'Belum Dijahit', icon: Clock },
          { id: 'proses', label: 'Sedang Dijahit', icon: Scissors },
          { id: 'selesai', label: 'Selesai / Siap Ambil', icon: CheckCircle2 },
          { id: 'batal', label: 'Retur / Batal', icon: Ban },
          { id: 'semua', label: 'Semua Status', icon: Search },
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
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                  : 'bg-[#161F30] text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid Kartu Antrean */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isUpdating={updatingId === order.id}
              onOpenDetail={handleOpenDetail}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Tidak Ada Pesanan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Belum ada pesanan yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
        </div>
      )}

      {/* Modal Detail Ukuran */}
      {activeDetailOrder && (
        <OrderDetailModal
          order={activeDetailOrder}
          onClose={handleCloseDetail}
          onOpenEdit={(ord) => setEditingOrder(ord)}
        />
      )}

      {/* Modal Edit Pesanan */}
      {editingOrder && (
        <OrderEditModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveEdit}
          isUpdating={updatingId === editingOrder.id}
        />
      )}
    </div>
  );
}
