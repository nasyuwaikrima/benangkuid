import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatWib, safeEqual, sendAdminAlert } from '@/lib/telegram/api';
import { formatStats } from '@/lib/telegram/stats';

/**
 * Cron harian — jalankan 1x/hari (mis. 08:00 WIB):
 *   curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://benangku.id/api/cron/daily
 *
 * 1. Kirim pengingat in-app ke toko yang Pro/Trial-nya berakhir ≤ 3 hari (tanpa duplikat).
 * 2. Kirim ringkasan harian ke admin via Telegram.
 */
const REMIND_DAYS = 3;
const KIND = {
  pro: { title: 'Pengingat: langganan Pro segera berakhir', status: ['active', 'paid', 'success'], col: 'pro_valid_until' },
  trial: { title: 'Pengingat: masa uji coba segera berakhir', status: ['trialing', 'trial'], col: 'trial_ends_at' },
} as const;

async function remind(kind: keyof typeof KIND): Promise<number> {
  const admin = createAdminClient();
  const cfg = KIND[kind];
  const now = new Date();
  const limit = new Date(now.getTime() + REMIND_DAYS * 86_400_000);

  const { data: shops } = await admin
    .from('shops')
    .select(`id, ${cfg.col}`)
    .in('subscription_status', [...cfg.status])
    .gt(cfg.col, now.toISOString())
    .lte(cfg.col, limit.toISOString());

  const rows = (shops ?? []) as unknown as Array<Record<string, string>>;
  if (!rows.length) return 0;

  // Lewati toko yang sudah diingatkan dalam 3 hari terakhir
  const since = new Date(now.getTime() - REMIND_DAYS * 86_400_000).toISOString();
  const { data: already } = await admin
    .from('notifications')
    .select('shop_id')
    .eq('title', cfg.title)
    .gte('created_at', since)
    .in('shop_id', rows.map((r) => r.id));
  const skip = new Set((already ?? []).map((n) => n.shop_id));

  const inserts = rows
    .filter((r) => !skip.has(r.id))
    .map((r) => ({
      shop_id: r.id,
      type: 'warning' as const,
      title: cfg.title,
      body: `Akses ${kind === 'pro' ? 'Pro' : 'uji coba'} kamu berakhir ${formatWib(r[cfg.col])}. Perpanjang lewat menu Upgrade supaya pesanan & data pelanggan tetap bisa diakses.`,
      created_by: 'cron',
      expires_at: r[cfg.col],
    }));

  if (!inserts.length) return 0;
  const { error } = await admin.from('notifications').insert(inserts);
  if (error) {
    console.error('[cron] gagal insert pengingat:', error.message);
    return 0;
  }
  return inserts.length;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET belum diatur' }, { status: 503 });

  const bearer = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!safeEqual(bearer, secret)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [pro, trial] = await Promise.all([remind('pro'), remind('trial')]);
    const digest = await formatStats('🌅 <b>Ringkasan harian benangku.id</b>');
    await sendAdminAlert(`${digest}\n\n🔔 Pengingat terkirim: Pro <b>${pro}</b> · Trial <b>${trial}</b>`);
    return NextResponse.json({ success: true, reminded: { pro, trial } });
  } catch (e) {
    console.error('[cron] error:', e);
    return NextResponse.json({ error: 'Gagal menjalankan cron' }, { status: 500 });
  }
}
