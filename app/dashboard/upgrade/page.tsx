'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING_PLANS, PricingPlan, formatRupiah } from '@/config/pricing';

export default function UpgradePage() {
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleUpgrade = async (plan: PricingPlan) => {
    setLoadingPlanId(plan.id);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (data.success && data.payment_link) {
        router.push(data.payment_link);
      } else {
        alert(data.error || 'Gagal membuat tagihan pembayaran.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pilih Paket Langganan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_PLANS.map((plan) => (
          <div key={plan.id} className="border p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">{plan.name}</h2>

<p className="text-lg font-bold my-2">{formatRupiah(plan.priceAmount)}</p>

            <button
              onClick={() => handleUpgrade(plan)}
              disabled={loadingPlanId === plan.id}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingPlanId === plan.id ? 'Memproses...' : plan.ctaText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
