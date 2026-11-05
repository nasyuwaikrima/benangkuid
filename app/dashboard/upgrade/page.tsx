import { PRICING_PLANS, PricingPlan, formatRupiah } from '@/config/pricing';

const handleUpgrade = async (plan: PricingPlan) => {
  setLoadingPlanId(plan.id);
  try {
    const res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: plan.id }),
    });
    const data = await res.json();
    if (data.success && data.payment_link) router.push(data.payment_link);
    else alert(data.error || 'Gagal membuat tagihan pembayaran.');
  } catch {
    alert('Terjadi kesalahan koneksi. Silakan coba lagi.');
  } finally {
    setLoadingPlanId(null);
  }
};