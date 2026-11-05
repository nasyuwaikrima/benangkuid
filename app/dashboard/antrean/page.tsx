import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server'; // <-- 1. IMPORT CONNECTION
import OrderQueue from '@/components/dashboard/order-queue';

// 2. Tandai rute ini sebagai blocking route untuk Next.js 16 PPR
export const instant = false;

export default async function AntreanPage() {
  // 3. Wajib dipanggil di baris paling atas fungsi Server Component!
  await connection();

  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch Data Orders beserta Pelanggan
  const { data: rawOrders } = await supabase
    .from('orders')
    .select(`
      id,
      item_name,
      service_type,
      detail_instruksi,
      photo_before_url,
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

  // Transformasi array `customers` menjadi objek tunggal
  const orders = (rawOrders || []).map((order) => {
    const customerObj = Array.isArray(order.customers)
      ? order.customers[0]
      : order.customers;

    return {
      ...order,
      customers: customerObj || { name: 'Pelanggan', phone_number: '-' },
    };
  });

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <OrderQueue initialOrders={orders} />
    </div>
  );
}
