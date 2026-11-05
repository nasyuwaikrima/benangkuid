'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Users, Clock, ArrowRight } from 'lucide-react';
import { AccessGuard } from '@/lib/subscription';
import { PLAN_LIMITS } from '@/config/pricing';

interface PaywallBannerProps {
  access?: AccessGuard;
  onUpgradeClick?: () => void;
}

export function PaywallBanner({ access, onUpgradeClick }: PaywallBannerProps) {
  // Jika access tidak dikirim, banner tidak perlu dirender
  if (!access) return null;

  // Sembunyikan banner jika trial masih lebih dari 3 hari dan tidak expired / belum capai limit
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
