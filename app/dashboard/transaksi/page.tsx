import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import Link from 'next/link';
import PaymentStatusChecker from '@/components/PaymentStatusChecker';
import { Subscription } from '@/types/database'; // Pastikan path sesuai

export const instant = false;

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function TransaksiPage({ searchParams }: PageProps) {
  await connection();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const getStatusBadge = (status: Subscription['status']) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Berhasil
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Menunggu Pembayaran
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            Kadaluarsa
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  // =======================================================
  // MODE 1: TAMPILKAN DETAIL TAGIHAN / QRIS (?id=INVOICE_ID)
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
        <div className="p-6 max-w-md mx-auto text-center py-12">
          <p className="text-slate-600 font-medium">Transaksi tidak ditemukan.</p>
          <Link
            href="/dashboard/transaksi"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline font-medium"
          >
            &larr; Kembali ke Riwayat Transaksi
          </Link>
        </div>
      );
    }

    // Cek apakah waktu expired_at sudah lewat
    const isTimeExpired = transaction.expired_at ? new Date(transaction.expired_at) < new Date() : false;
    const isPending = transaction.status.toLowerCase() === 'pending' && !isTimeExpired;
    const isPaid = transaction.status.toLowerCase() === 'paid';
    const isExpired = transaction.status.toLowerCase() === 'expired' || isTimeExpired;

    return (
      <div className="p-6 max-w-lg mx-auto">
        <PaymentStatusChecker invoiceId={transaction.invoice_id} status={transaction.status} />

        <Link
          href="/dashboard/transaksi"
          className="text-xs text-slate-500 hover:text-slate-800 mb-4 inline-block font-medium"
        >
          &larr; Kembali ke semua transaksi
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
            <span className="text-xs font-mono text-slate-500">#{transaction.invoice_id}</span>
            {getStatusBadge(isExpired ? 'expired' : transaction.status)}
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-1 capitalize">
            Pembayaran Paket {transaction.plan}
          </h2>
          <p className="text-3xl font-extrabold text-blue-600 my-3">
            {formatRupiah(transaction.amount)}
          </p>

          {isPending && transaction.qris_image ? (
            <div className="my-6 flex flex-col items-center">
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-inner">
                <img
                  src={transaction.qris_image}
                  alt="QRIS Pembayaran"
                  className="w-64 h-64 object-contain mx-auto"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Scan kode QRIS di atas menggunakan m-Banking atau e-Wallet (Gopay, OVO, ShopeePay, Dana, dll).
              </p>
              {transaction.expired_at && (
                <p className="text-xs text-amber-600 font-medium mt-1">
                  Batas Pembayaran: {new Date(transaction.expired_at).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          ) : isPaid ? (
            <div className="my-8 py-6 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-emerald-800 font-semibold text-sm">
                Pembayaran telah berhasil diterima!
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Lisensi akun kamu sudah otomatis aktif.
              </p>
            </div>
          ) : (
            <div className="my-8 py-6 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-700 font-semibold text-sm">
                Tagihan Pembayaran Kadaluarsa
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Kode QRIS sudah tidak berlaku. Silakan buat tagihan baru melalui halaman upgrade.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            {isExpired && (
              <Link
                href="/dashboard/upgrade"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white transition"
              >
                Buat Tagihan Baru
              </Link>
            )}
            <Link
              href="/dashboard/transaksi"
              className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Lihat Riwayat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // MODE 2: TAMPILKAN DAFTAR RIWAYAT TRANSAKSI (Tabel)
  // =======================================================
  const { data: rawTransactions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('shop_id', user.id)
    .order('created_at', { ascending: false });

  const transactions = (rawTransactions || []) as Subscription[];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Transaksi</h1>
          <p className="text-sm text-slate-500">
            Daftar tagihan dan status pembayaran langganan aplikasi kamu.
          </p>
        </div>
        <Link
          href="/dashboard/upgrade"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          Upgrade Paket
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-500 text-sm">Belum ada riwayat transaksi.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">ID Invoice</th>
                  <th className="px-6 py-3">Paket</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((item) => {
                  const isTimeExpired = item.expired_at ? new Date(item.expired_at) < new Date() : false;
                  const displayStatus = (item.status.toLowerCase() === 'pending' && isTimeExpired) ? 'expired' : item.status;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-800">
                        #{item.invoice_id}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 capitalize">
                        {item.plan}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatRupiah(item.amount)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
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
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                          >
                            Bayar Sekarang &rarr;
                          </Link>
                        ) : (
                          <Link
                            href={`/dashboard/transaksi?id=${item.invoice_id}`}
                            className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
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
