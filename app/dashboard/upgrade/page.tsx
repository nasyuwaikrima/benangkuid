'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING_PLANS, PricingPlan, formatRupiah } from '@/config/pricing';
import { Subscription } from '@/types/database'; // Pastikan path sesuai
import { createClient } from '@/lib/supabase/client';
import {
  Check,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  QrCode,
  Loader2,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function UpgradePage() {
  const router = useRouter();
  const supabase = createClient();

  const paidPlans = PRICING_PLANS.filter((p) => p.id !== 'trial');

  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingSubscription, setPendingSubscription] = useState<Subscription | null>(null);
  const [checkingPending, setCheckingPending] = useState(true);

  // Cek apakah user memiliki transaksi yang masih pending
  useEffect(() => {
    async function checkPendingTransaction() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('shop_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          // Jika expired_at sudah terlewati, abaikan sebagai pending aktif
          const isExpired = data.expired_at && new Date(data.expired_at) < new Date();
          if (!isExpired) {
            setPendingSubscription(data as Subscription);
          }
        }
      } catch (err) {
        console.error('Error checking pending subscription:', err);
      } finally {
        setCheckingPending(false);
      }
    }

    checkPendingTransaction();
  }, [supabase]);

  // Fungsi proses pembayaran ke API
  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.invoice_id) {
          router.push(`/dashboard/transaksi?id=${data.invoice_id}`);
        } else if (data.payment_link) {
          router.push(data.payment_link);
        } else {
          setErrorMsg('Respon dari server pembayaran tidak valid.');
        }
      } else {
        setErrorMsg(data.error || 'Gagal membuat tagihan pembayaran.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi. Silakan periksa jaringan Anda.');
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // TAMPILAN 2: HALAMAN KONFIRMASI PEMBAYARAN & QRIS
  // =======================================================
  if (selectedPlan) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12 select-none animate-in fade-in duration-200">
        <button
          onClick={() => {
            setSelectedPlan(null);
            setErrorMsg(null);
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali Pilih Paket</span>
        </button>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-[#161F30] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div>
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                Konfirmasi Pembayaran
              </span>
              <h1 className="text-xl font-bold text-white">Ringkasan Tagihan</h1>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedPlan.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedPlan.subtitle}</p>
              </div>
              <div className="text-right">
                {selectedPlan.originalAmount && (
                  <span className="text-xs text-slate-500 line-through block">
                    {formatRupiah(selectedPlan.originalAmount)}
                  </span>
                )}
                <span className="text-xl font-extrabold text-blue-400">
                  {formatRupiah(selectedPlan.priceAmount)}
                </span>
                <span className="text-[11px] text-slate-400 block">{selectedPlan.period}</span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3">
              <span className="text-xs font-semibold text-slate-300 block mb-2">Benefit Termasuk:</span>
              <ul className="space-y-1.5">
                {selectedPlan.features.map((feat, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 block">Metode Pembayaran</span>
            <div className="bg-[#0F172A] border-2 border-blue-600/60 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                  <QrCode className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">QRIS (Otomatis)</span>
                  <span className="text-[11px] text-slate-400">
                    GoPay, OVO, ShopeePay, Dana, LinkAja & m-Banking
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                Instan
              </span>
            </div>
          </div>

          <button
            onClick={handleConfirmPayment}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Membuat Kode QRIS...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Bayar Sekarang ({formatRupiah(selectedPlan.priceAmount)})</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-500 text-center">
            Tagihan akan otomatis diterbitkan dan QRIS langsung ditampilkan.
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // TAMPILAN 1: DAFTAR PAKET LANGGANAN
  // =======================================================
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 select-none">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Paket Langganan Usaha</span>
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Tingkatkan Kapasitas Usaha Jahit Anda
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
          Simpan pelanggan tanpa batas, cetak & kirim struk WhatsApp resmi tanpa watermark.
        </p>
      </div>

      {/* Banner Notifikasi Jika Ada Transaksi Pending */}
      {!checkingPending && pendingSubscription && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-300">
                Ada Transaksi Menunggu Pembayaran
              </h3>
              <p className="text-xs text-amber-400/80 mt-0.5">
                Anda memiliki tagihan paket <span className="font-semibold uppercase">{pendingSubscription.plan}</span> (#{pendingSubscription.invoice_id}) sebesar{' '}
                <span className="font-semibold">{formatRupiah(pendingSubscription.amount)}</span> yang belum dibayar.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/dashboard/transaksi?id=${pendingSubscription.invoice_id}`)}
            className="w-full md:w-auto shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-md"
          >
            <span>Bayar QRIS Sekarang</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid Paket */}
      <div className={`grid grid-cols-1 ${paidPlans.length > 1 ? 'md:grid-cols-2' : 'max-w-md mx-auto w-full'} gap-6`}>
        {paidPlans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-[#161F30] border rounded-3xl p-6 md:p-8 flex flex-col justify-between relative shadow-xl transition-all duration-200 ${
              plan.isPopular ? 'border-blue-500/60 ring-1 ring-blue-500/30' : 'border-slate-800'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-blue-400/30 shadow-md">
                {plan.badge}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{plan.subtitle}</p>
              </div>

              <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-baseline gap-2">
                  {plan.originalAmount && (
                    <span className="text-xs text-slate-500 line-through">
                      {formatRupiah(plan.originalAmount)}
                    </span>
                  )}
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {formatRupiah(plan.priceAmount)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-300 block">Fitur Unggulan:</span>
                <ul className="space-y-2.5">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80">
              {pendingSubscription ? (
                <button
                  onClick={() => router.push(`/dashboard/transaksi?id=${pendingSubscription.invoice_id}`)}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition active:scale-[0.98]"
                >
                  Selesaikan Tagihan Pending
                </button>
              ) : (
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition active:scale-[0.98]"
                >
                  {plan.ctaText || 'Pilih Paket Pro'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
