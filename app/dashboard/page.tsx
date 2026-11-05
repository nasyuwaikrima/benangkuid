import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import DashboardOverview from '@/components/dashboard/dashboard-overview';

// Beritahu Next.js 16 PPR bahwa halaman ini adalah blocking route saat navigasi
export const instant = false;

export default async function DashboardPage() {
  await connection();

  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Query Data Toko & Pesanan
  const { data: shop } = await supabase
    .from('shops')
    .select('shop_name, owner_name')
    .eq('id', user.id)
    .maybeSingle();

  const { data: rawOrders } = await supabase
    .from('orders')
    .select(`
      id,
      item_name,
      service_type,
      detail_instruksi,
      total_biaya,
      dp_dibayar,
      status_pengerjaan,
      tgl_deadline,
      created_at,
      customer_id,
      customers (
        name,
        phone_number
      )
    `)
    .order('created_at', { ascending: false });

  // Transformasi array `customers` menjadi objek tunggal agar sesuai tipe OrderItem
  const allOrders = (rawOrders || []).map((order) => {
    const customerObj = Array.isArray(order.customers)
      ? order.customers[0]
      : order.customers;

    return {
      ...order,
      customers: customerObj || { name: 'Pelanggan', phone_number: '-' },
    };
  });

  // 3. KALKULASI ANALITIK UTAMA
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // A. Filter Pesanan Bulan Ini
  const ordersThisMonth = allOrders.filter(
    (o) => new Date(o.created_at) >= startOfMonth && o.status_pengerjaan !== 'batal'
  );

  // B. Total Omzet & DP Bulan Ini
  const omzetBulanIni = ordersThisMonth.reduce((acc, o) => acc + Number(o.total_biaya || 0), 0);
  const dpDiterimaBulanIni = ordersThisMonth.reduce((acc, o) => acc + Number(o.dp_dibayar || 0), 0);
  const totalJahitanBulanIni = ordersThisMonth.length;

  // C. Antrean Aktif (Belum Selesai & Tidak Batal)
  const activeOrders = allOrders.filter(
    (o) => o.status_pengerjaan === 'antrean' || o.status_pengerjaan === 'proses'
  );

  // D. Total Sisa Tagihan (Piutang) dari Seluruh Pesanan Aktif
  const sisaPiutang = allOrders
    .filter((o) => o.status_pengerjaan !== 'batal')
    .reduce((acc, o) => {
      const sisa = Number(o.total_biaya || 0) - Number(o.dp_dibayar || 0);
      return acc + (sisa > 0 ? sisa : 0);
    }, 0);

  // E. Pesanan Mendekati Deadline (Dalam 7 hari ke depan)
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(now.getDate() + 7);

  const deadlineUrgent = activeOrders.filter((o) => {
    if (!o.tgl_deadline) return false;
    const deadlineDate = new Date(o.tgl_deadline);
    return deadlineDate >= now && deadlineDate <= sevenDaysLater;
  });

  const stats = {
    omzetBulanIni,
    dpDiterimaBulanIni,
    totalJahitanBulanIni,
    antreanAktifCount: activeOrders.length,
    sisaPiutang,
    urgentDeadlineCount: deadlineUrgent.length,
    ownerName: shop?.owner_name || user.user_metadata?.full_name || 'Penjahit',
    shopName: shop?.shop_name || 'Toko Saya',
  };

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <DashboardOverview
        stats={stats}
        recentOrders={allOrders.slice(0, 5)}
        urgentOrders={deadlineUrgent}
      />
    </div>
  );
}
