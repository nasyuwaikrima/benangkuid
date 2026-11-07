import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { escapeHtml, formatWib } from './api';
import { formatRupiah } from '@/config/pricing';

const PRO_STATUS = ['active', 'paid', 'success'];
const TRIAL_STATUS = ['trialing', 'trial'];

/** Awal hari ini (00:00 WIB) dalam ISO UTC */
function startOfTodayWib(): string {
  const wib = new Date(Date.now() + 7 * 3600_000);
  wib.setUTCHours(0, 0, 0, 0);
  return new Date(wib.getTime() - 7 * 3600_000).toISOString();
}

export async function getStats() {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const today = startOfTodayWib();
  const d30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const head = { count: 'exact', head: true } as const;

  const [total, pro, trial, newToday, ordersToday, paid30] = await Promise.all([
    admin.from('shops').select('id', head),
    admin.from('shops').select('id', head).in('subscription_status', PRO_STATUS).gt('pro_valid_until', now),
    admin.from('shops').select('id', head).in('subscription_status', TRIAL_STATUS).gt('trial_ends_at', now),
    admin.from('shops').select('id', head).gte('created_at', today),
    admin.from('orders').select('id', head).gte('created_at', today),
    admin.from('subscriptions').select('amount').eq('status', 'paid').gt('amount', 0).gte('updated_at', d30),
  ]);

  const totalShops = total.count ?? 0;
  const proActive = pro.count ?? 0;
  const trialActive = trial.count ?? 0;
  return {
    totalShops,
    proActive,
    trialActive,
    expired: Math.max(0, totalShops - proActive - trialActive),
    newToday: newToday.count ?? 0,
    ordersToday: ordersToday.count ?? 0,
    revenue30d: (paid30.data ?? []).reduce((sum, r) => sum + (r.amount ?? 0), 0),
  };
}

export async function formatStats(title = '📊 <b>Statistik benangku.id</b>'): Promise<string> {
  const s = await getStats();
  return [
    title,
    `<i>${escapeHtml(formatWib())}</i>`,
    '',
    `🏪 Total toko: <b>${s.totalShops}</b>  (+${s.newToday} hari ini)`,
    `💎 Pro aktif: <b>${s.proActive}</b>`,
    `🆓 Trial aktif: <b>${s.trialActive}</b>`,
    `⏳ Kedaluwarsa: <b>${s.expired}</b>`,
    `🧵 Order masuk hari ini: <b>${s.ordersToday}</b>`,
    `💰 Omzet 30 hari: <b>${escapeHtml(formatRupiah(s.revenue30d))}</b>`,
  ].join('\n');
}
