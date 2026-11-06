'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Users, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { AccessGuard } from '@/lib/subscription';
import { PLAN_LIMITS, formatRupiah } from '@/config/pricing';
import { createClient } from '@/lib/supabase/client';
import { Subscription } from '@/types/database';

interface PaywallBannerProps {
  access?: AccessGuard;
  onUpgradeClick?: () => void;
}

export function PaywallBanner({ access, onUpgradeClick }: PaywallBannerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [pendingSubscription, setPendingSubscription] = useState<Subscription | null>(null);
  const [checkingPending, setCheckingPending] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkPendingTransaction() {
      try {
        // 1. Ambil user session
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          if (isMounted) setCheckingPending(false);
          return;
        }

        // 2. Query transaksi pending dari Supabase
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('shop_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('[PaywallBanner] Error fetching pending subscription:', error);
        }

        if (data && isMounted) {
          // Pengecekan expired_at
          const isExpired = data.expired_at ? new Date(data.expired_at) < new Date() : false;
          if (!isExpired) {
            setPendingSubscription(data as Subscription);
          }
        }
      } catch (err) {
        console.error('[PaywallBanner] Unexpected error:', err);
      } finally {
        if (isMounted) setCheckingPending(false);
      }
    }

    checkPendingTransaction();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // PRIORITAS 1: Jika ada transaksi pending, tampilkan Banner Tagihan Pending!
  // Ini mengabaikan status access (isExpired / limits) agar user fokus menyelesaikan pembayaran
  if (pendingSubscription) {
    return (
      <div className="p-4 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all animate-in fade-in duration-200">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>

          <div className="text-xs sm:text-sm">
            <p className="font-bold text-amber-300">
              Ada Transaksi Menunggu Pembayaran
            </p>
            <p className="text-amber-400/90 text-xs mt-0.5">
              Tagihan paket{' '}
              <span className="font-semibold uppercase">{pendingSubscription.plan}</span>{' '}
              ({pendingSubscription.invoice_id ? `#${pendingSubscription.invoice_id}` : ''}) sebesar{' '}
              <span className="font-semibold">{formatRupiah(pendingSubscription.amount)}</span> belum dibayar.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const path = pendingSubscription.invoice_id
              ? `/dashboard/transaksi?id=${pendingSubscription.invoice_id}`
              : '/dashboard/upgrade';
            router.push(path);
          }}
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <span>Bayar QRIS Sekarang</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Jika masih loading fetch pending, tahan dulu (jangan tampilkan banner expired mendadak)
  if (checkingPending) {
    return null;
  }

  // PRIORITAS 2: Jika tidak ada transaksi pending, baru periksa Access Guard biasa
  if (!access) return null;

  // Sembunyikan jika trial masih di atas 3 hari dan tidak expired / no limit
  if (!access.isExpired && access.daysRemaining > 3 && !access.blockReason) {
    return null;
  }

  const isExpired = access.isExpired;
  const isCustomerLimit = access.blockReason === 'CUSTOMER_LIMIT';

  return (
    <div
      className={`p-4 mb-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border transition-all ${
        isExpired
          ? 'bg-red-950/30 border-red-500/30 text-red-200'
          : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isExpired
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}
        >
          {isExpired ? (
            <AlertTriangle className="w-5 h-5" />
          ) : isCustomerLimit ? (
            <Users className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
        </div>

        <div className="text-xs sm:text-sm">
          {isExpired ? (
            <p className="font-semibold text-red-300">
              Masa berlangganan telah berakhir. Fitur penambahan data baru dinonaktifkan.
            </p>
          ) : isCustomerLimit ? (
            <p className="font-semibold text-amber-300">
              Batas maksimal {PLAN_LIMITS.trial.maxCustomers} pelanggan trial telah tercapai.
            </p>
          ) : (
            <p className="font-semibold text-amber-300">
              Masa trial menyisakan {access.daysRemaining} hari lagi.
            </p>
          )}
        </div>
      </div>

      {onUpgradeClick ? (
        <button
          onClick={onUpgradeClick}
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <span>Upgrade Pro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <Link
          href="/dashboard/upgrade"
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <span>Upgrade Pro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
