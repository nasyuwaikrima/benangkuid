import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OrderQueue from '@/components/dashboard/order-queue';

export default async function AntreanPage() {
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch Data Orders beserta Pelanggan
  const { data: orders } = await supabase
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

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <OrderQueue initialOrders={orders || []} />
    </div>
  );
}
