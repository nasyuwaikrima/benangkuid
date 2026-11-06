import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import Link from 'next/link';
import PaymentStatusChecker from '@/components/PaymentStatusChecker';
import QrisCardClient from '@/components/payment/QrisCardClient';
import { Subscription } from '@/types/database';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
  Sparkles,
  CreditCard,
} from 'lucide-react';

export const instant = false;

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function TransaksiPage({ searchParams }: PageProps) {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const invoiceId = resolvedParams.id;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Berhasil</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Pembayaran</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>Kadaluarsa</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  // =======================================================
  // MODE 1: DETAIL TAGIHAN & QRIS PEMBAYARAN (?id=INVOICE_ID)
  // =======================================================
  if (invoiceId) {
    const { data: rawTransaction } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('invoice_id', invoiceId)
      .eq('shop_id', user.id)
      .single();

    const transaction = rawTransaction as Subscription | null;

    if (!transaction) {
      return (
        <div className="p-6 max-w-md mx-auto text-center py-16 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Transaksi Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400">
            Tagihan dengan ID tersebut tidak tersedia atau telah dihapus.
          </p>
          <Link
            href="/dashboard/transaksi"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Riwayat Transaksi</span>
          </Link>
        </div>
      );
    }

    const isTimeExpired = transaction.expired_at ? new Date(transaction.expired_at) < new Date() : false;
    const isPending = transaction.status.toLowerCase() === 'pending' && !isTimeExpired;
    const isPaid = transaction.status.toLowerCase() === 'paid';
    const isExpired = transaction.status.toLowerCase() === 'expired' || isTimeExpired;

    return (
      <div className="max-w-xl mx-auto space-y-6 pb-12 select-none animate-in fade-in duration-200">
        <PaymentStatusChecker invoiceId={transaction.invoice_id} status={transaction.status} />

        <Link
          href="/dashboard/transaksi"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Semua Riwayat Transaksi</span>
        </Link>

        <div className="bg-[#161F30] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Tagihan */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div>
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                Detail Transaksi
              </span>
              <h1 className="text-xl font-bold text-white capitalize">
                Paket {transaction.plan}
              </h1>
            </div>
            {getStatusBadge(isExpired ? 'expired' : transaction.status)}
          </div>

          {/* Informasi Harga & Batas Waktu */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-2 text-center">
            <span className="text-xs text-slate-400 font-medium">Total Pembayaran</span>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {formatRupiah(transaction.amount)}
            </div>

            {isPending && transaction.expired_at && (
              <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-amber-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Batas Pembayaran: {new Date(transaction.expired_at).toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>

          {/* Konten Berdasarkan Status Pembayaran */}
          {isPending && transaction.qris_image ? (
            <QrisCardClient
              transaction={transaction}
              formattedAmount={formatRupiah(transaction.amount)}
            />
          ) : isPaid ? (
            <div className="my-6 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Pembayaran Berhasil!</h3>
              <p className="text-xs text-slate-300">
                Terima kasih, lisensi akun toko Anda telah otomatis diperbarui dan aktif.
              </p>
            </div>
          ) : (
            <div className="my-6 p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-2">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Tagihan Kadaluarsa</h3>
              <p className="text-xs text-slate-300">
                Waktu pembayaran telah habis. Kode QRIS sudah tidak dapat digunakan.
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row gap-3">
            {isExpired && (
              <Link
                href="/dashboard/upgrade"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl text-center shadow-lg transition"
              >
                Buat Tagihan Baru
              </Link>
            )}
            <Link
              href="/dashboard/transaksi"
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl text-center border border-slate-700/80 transition"
            >
              Lihat Riwayat Transaksi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // MODE 2: TABEL RIWAYAT TRANSAKSI (DARK THEME UI)
  // =======================================================
  const { data: rawTransactions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('shop_id', user.id)
    .order('created_at', { ascending: false });

  const transactions = (rawTransactions || []) as Subscription[];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Tagihan & Pembayaran</span>
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Riwayat Transaksi</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar seluruh tagihan langganan usaha jahit Anda.
          </p>
        </div>
        <Link
          href="/dashboard/upgrade"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-3 rounded-xl transition shadow-lg shadow-blue-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upgrade Paket</span>
        </Link>
      </div>

      {/* Tabel Data */}
      {transactions.length === 0 ? (
        <div className="bg-[#161F30] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Belum Ada Transaksi</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Anda belum pernah membuat tagihan langganan. Upgrade akun Anda untuk mendapatkan fitur Pro.
          </p>
        </div>
      ) : (
        <div className="bg-[#161F30] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0F172A] text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID Invoice</th>
                  <th className="px-6 py-4">Paket</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.map((item) => {
                  const isTimeExpired = item.expired_at ? new Date(item.expired_at) < new Date() : false;
                  const displayStatus = item.status.toLowerCase() === 'pending' && isTimeExpired ? 'expired' : item.status;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-mono font-semibold text-slate-200">
                        #{item.invoice_id}
                      </td>
                      <td className="px-6 py-4 font-bold text-white capitalize">
                        {item.plan}
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-400">
                        {formatRupiah(item.amount)}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(displayStatus)}</td>
                      <td className="px-6 py-4 text-right">
                        {displayStatus.toLowerCase() === 'pending' ? (
                          <Link
                            href={`/dashboard/transaksi?id=${item.invoice_id}`}
                            className="inline-flex items-center gap-1 font-bold text-blue-400 hover:text-blue-300 transition"
                          >
                            <span>Bayar Sekarang</span>
                            <span>&rarr;</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/dashboard/transaksi?id=${item.invoice_id}`}
                            className="font-medium text-slate-400 hover:text-white transition"
                          >
                            Detail
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
