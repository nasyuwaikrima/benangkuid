'use client';

import React from 'react';
import { AccessGuard } from '@/lib/subscription';

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

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      const text = encodeURIComponent('Halo Admin benangku.id, saya ingin upgrade sewa toko ke Paket Pro.');
      window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
    }
  };

  return (
    <div className={`p-4 mb-6 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3 ${
      access.isExpired
        ? 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300'
        : 'bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300'
    }`}>
      <div className="text-sm">
        {access.isExpired ? (
          <p className="font-semibold">⚠️ Masa berlangganan telah berakhir. Fitur penambahan data baru dinonaktifkan.</p>
        ) : access.blockReason === 'CUSTOMER_LIMIT' ? (
          <p className="font-semibold">📌 Batas maksimal 10 pelanggan trial telah tercapai.</p>
        ) : (
          <p className="font-semibold">⏳ Masa trial menyisakan {access.daysRemaining} hari lagi.</p>
        )}
      </div>

      <button
        onClick={handleUpgrade}
        className="px-4 py-2 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-nowrap"
      >
        Hubungi Admin WA (Upgrade Pro)
      </button>
    </div>
  );
}
