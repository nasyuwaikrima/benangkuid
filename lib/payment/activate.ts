import { createAdminClient } from '@/lib/supabase/admin';
import { getPlan } from '@/config/pricing';

const BASE_URL = 'https://pixpayz.com';

export async function fetchPixpayzStatus(invoiceId: string) {
  const res = await fetch(
    `${BASE_URL}/api/checkinvoice?apikey=${process.env.PIXPAYZ_API_KEY}&id=${invoiceId}`,
    { cache: 'no-store' }
  );
  return res.json();
}

export async function activateSubscription(invoiceId: string) {
  const admin = createAdminClient();

  // Update atomik: hanya satu proses (check/webhook) yang berhasil menandai paid
  const { data: sub } = await admin
    .from('subscriptions')
    .update({ status: 'paid', updated_at: new Date().toISOString() })
    .eq('invoice_id', invoiceId)
    .neq('status', 'paid')
    .select('shop_id, plan')
    .maybeSingle();

  if (!sub) return; // sudah diproses atau tidak ada

  const plan = getPlan(sub.plan);
  if (!plan) return;

  const { data: shop } = await admin
    .from('shops').select('pro_valid_until').eq('id', sub.shop_id).single();

  // Perpanjang dari sisa masa aktif jika masih berlaku
  const start = shop?.pro_valid_until && new Date(shop.pro_valid_until) > new Date()
    ? new Date(shop.pro_valid_until) : new Date();
  start.setDate(start.getDate() + plan.durationDays);

  await admin.from('shops').update({
    subscription_status: 'active',
    pro_valid_until: start.toISOString(),
  }).eq('id', sub.shop_id);
}