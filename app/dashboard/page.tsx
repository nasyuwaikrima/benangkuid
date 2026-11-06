import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import DashboardOverview, { type DashboardData } from '@/components/dashboard/dashboard-overview';
import { getNotifications } from '@/lib/notifications';

// Beritahu Next.js 16 PPR bahwa halaman ini adalah blocking route saat navigasi
export const instant = false;

/* ---------- Helper zona waktu WIB (server Vercel berjalan di UTC) ---------- */
const WIB_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;
const wib = (d: Date) => new Date(d.getTime() + WIB_MS);
const dayKey = (d: Date) => Math.floor(wib(d).getTime() / DAY_MS);
const monthKey = (d: Date) => wib(d).getUTCFullYear() * 12 + wib(d).getUTCMonth();

const fmt = (d: Date, opt: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', ...opt }).format(d);

const growth = (cur: number, prev: number): number | null =>
  prev === 0 ? (cur === 0 ? 0 : null) : Math.round(((cur - prev) / prev) * 100);

function waLink(phone: string | null | undefined): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length < 8) return null;
  const intl = digits.startsWith('0') ? '62' + digits.slice(1) : digits.startsWith('62') ? digits : digits;
  return `https://wa.me/${intl}`;
}

type RawOrder = {
  id: string;
  item_name: string;
  service_type: string;
  total_biaya: number | string | null;
  dp_dibayar: number | string | null;
  status_pengerjaan: string;
  tgl_deadline: string | null;
  created_at: string;
  customers: { name: string; phone_number: string } | { name: string; phone_number: string }[] | null;
};

export default async function DashboardPage() {
  await connection();

  const supabase = await createClient();

  // 1. Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Data (paralel)
  const [{ data: shop }, { data: rawOrders }, notifications] = await Promise.all([
    supabase.from('shops').select('shop_name').eq('id', user.id).maybeSingle(),
    supabase
      .from('orders')
      .select(
        'id, item_name, service_type, total_biaya, dp_dibayar, status_pengerjaan, tgl_deadline, created_at, customers ( name, phone_number )'
      )
      .order('created_at', { ascending: false }),
    getNotifications(supabase, user.created_at),
  ]);

  const orders = ((rawOrders ?? []) as unknown as RawOrder[])
    .filter((o) => o.status_pengerjaan !== 'batal')
    .map((o) => {
      const c = Array.isArray(o.customers) ? o.customers[0] : o.customers;
      return {
        ...o,
        total: Number(o.total_biaya || 0),
        dp: Number(o.dp_dibayar || 0),
        customerName: c?.name || 'Pelanggan',
        customerPhone: c?.phone_number || null,
      };
    });

  // 3. Kalkulasi
  const now = new Date();
  const today = dayKey(now);
  const curMonth = monthKey(now);

  const inMonth = (o: { created_at: string }, key: number) => monthKey(new Date(o.created_at)) === key;
  const thisMonth = orders.filter((o) => inMonth(o, curMonth));
  const lastMonth = orders.filter((o) => inMonth(o, curMonth - 1));

  const omzet = thisMonth.reduce((a, o) => a + o.total, 0);
  const omzetPrev = lastMonth.reduce((a, o) => a + o.total, 0);
  const dp = thisMonth.reduce((a, o) => a + o.dp, 0);

  // Sparkline 14 hari
  const omzetSpark = Array<number>(14).fill(0);
  const ordersSpark = Array<number>(14).fill(0);
  for (const o of orders) {
    const idx = dayKey(new Date(o.created_at)) - (today - 13);
    if (idx >= 0 && idx < 14) {
      omzetSpark[idx] += o.total;
      ordersSpark[idx] += 1;
    }
  }

  // Tren 6 bulan
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const key = curMonth - (5 - i);
    const inM = orders.filter((o) => inMonth(o, key));
    const labelDate = new Date(Date.UTC(Math.floor(key / 12), key % 12, 1));
    return {
      label: new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', month: 'short' }).format(labelDate),
      omzet: inM.reduce((a, o) => a + o.total, 0),
      orders: inM.length,
      current: key === curMonth,
    };
  });

  // Antrean aktif = belum selesai dikerjakan
  const active = orders.filter((o) => ['antrean', 'proses', 'fitting'].includes(o.status_pengerjaan));
  const daysLeftOf = (o: { tgl_deadline: string | null }) =>
    o.tgl_deadline ? dayKey(new Date(o.tgl_deadline)) - today : null;

  const overdue = active.filter((o) => (daysLeftOf(o) ?? 0) < 0 && o.tgl_deadline);
  const urgent = active.filter((o) => {
    const d = daysLeftOf(o);
    return d !== null && d >= 0 && d <= 7;
  });

  // Piutang: sisa tagihan pesanan yang belum diambil pelanggan
  const unpaid = orders.filter((o) => o.status_pengerjaan !== 'diambil' && o.total - o.dp > 0);
  const piutang = unpaid.reduce((a, o) => a + (o.total - o.dp), 0);

  // Pipeline
  const pipeline = [
    { key: 'antrean', label: 'Antrean' },
    { key: 'proses', label: 'Dijahit' },
    { key: 'fitting', label: 'Fitting' },
    { key: 'selesai', label: 'Siap Diambil' },
  ].map((s) => ({ ...s, count: orders.filter((o) => o.status_pengerjaan === s.key).length }));

  // Layanan terlaris (6 bulan)
  const svcMap = new Map<string, { count: number; revenue: number }>();
  for (const o of orders) {
    if (monthKey(new Date(o.created_at)) < curMonth - 5) continue;
    const name = o.service_type?.trim() || 'Lainnya';
    const cur = svcMap.get(name) ?? { count: 0, revenue: 0 };
    svcMap.set(name, { count: cur.count + 1, revenue: cur.revenue + o.total });
  }
  const services = [...svcMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
    .slice(0, 5);

  // Deadline list (terlambat dulu, lalu terdekat)
  const deadlines = [...overdue, ...urgent]
    .sort((a, b) => (daysLeftOf(a) ?? 0) - (daysLeftOf(b) ?? 0))
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      customer: o.customerName,
      item: o.item_name,
      service: o.service_type,
      daysLeft: daysLeftOf(o) ?? 0,
      dateLabel: fmt(new Date(o.tgl_deadline!), { day: 'numeric', month: 'short' }),
      waUrl: waLink(o.customerPhone),
    }));

  // Pesanan terbaru
  const createdLabel = (iso: string) => {
    const diff = today - dayKey(new Date(iso));
    if (diff <= 0) return 'Hari ini';
    if (diff === 1) return 'Kemarin';
    return fmt(new Date(iso), { day: 'numeric', month: 'short' });
  };
  const recent = orders.slice(0, 6).map((o) => ({
    id: o.id,
    customer: o.customerName,
    item: o.item_name,
    service: o.service_type,
    status: o.status_pengerjaan,
    total: o.total,
    sisa: o.total - o.dp,
    createdLabel: createdLabel(o.created_at),
  }));

  const data: DashboardData = {
    shopName: shop?.shop_name || 'Toko Saya',
    todayLabel: fmt(now, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    periodLabel: fmt(now, { month: 'long', year: 'numeric' }),
    kpi: {
      omzet,
      omzetGrowth: growth(omzet, omzetPrev),
      omzetSpark,
      orders: thisMonth.length,
      ordersGrowth: growth(thisMonth.length, lastMonth.length),
      ordersSpark,
      activeCount: active.length,
      urgentCount: urgent.length,
      overdueCount: overdue.length,
      piutang,
      piutangCount: unpaid.length,
      dp,
      collectedPct: omzet > 0 ? Math.round((dp / omzet) * 100) : 0,
    },
    monthly,
    pipeline,
    services,
    deadlines,
    recent,
  };

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <DashboardOverview data={data} shopId={user.id} notifications={notifications} />
    </div>
  );
}
