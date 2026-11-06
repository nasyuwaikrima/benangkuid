import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import OrderQueue from '@/components/dashboard/antrean/OrderQueue';
import { OrderWithCustomer } from '@/components/dashboard/antrean/types';

export const instant = false;

interface PageProps {
  searchParams: Promise<{ option?: string; status?: string; id?: string }>;
}

export default async function AntreanPage({ searchParams }: PageProps) {
  // 1. Hindari static prerendering pada Next.js 16 untuk dynamic route
  await connection();

  const supabase = await createClient();

  // 2. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const initialOption = resolvedParams.option || 'semua';
  const initialStatus = resolvedParams.status || 'antrean';
  const selectedOrderId = resolvedParams.id || null;

  // 3. Fetch Data Orders beserta Relasi Customers & Measurements
  const { data: rawOrders, error } = await supabase
    .from('orders')
    .select(`
      id,
      shop_id,
      customer_id,
      item_name,
      service_type,
      detail_instruksi,
      photo_before_url,
      total_biaya,
      dp_dibayar,
      status_pengerjaan,
      tgl_deadline,
      created_at,
      customers (
        id,
        shop_id,
        name,
        phone_number,
        created_at,
        customer_measurements (
          id,
          customer_id,
          label,
          chest,
          waist,
          hip,
          shoulder,
          sleeve,
          pants_length,
          notes,
          updated_at
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error.message);
  }

  // 4. Transformasi Data agar Sesuai dengan Type `OrderWithCustomer`
  const orders: OrderWithCustomer[] = (rawOrders || []).map((order) => {
    // Normalisasi join Supabase jika mengembalikan array/single object
    const customerObj = Array.isArray(order.customers)
      ? order.customers[0]
      : order.customers;

    const rawMeasurements = customerObj?.customer_measurements;
    const measurementsArr = Array.isArray(rawMeasurements)
      ? rawMeasurements
      : rawMeasurements
      ? [rawMeasurements]
      : [];

    return {
      id: order.id,
      shop_id: order.shop_id,
      customer_id: order.customer_id,
      item_name: order.item_name,
      service_type: order.service_type,
      detail_instruksi: order.detail_instruksi,
      photo_before_url: order.photo_before_url ?? undefined,
      total_biaya: Number(order.total_biaya),
      dp_dibayar: Number(order.dp_dibayar),
      status_pengerjaan: order.status_pengerjaan as OrderWithCustomer['status_pengerjaan'],
      tgl_deadline: order.tgl_deadline ?? undefined,
      created_at: order.created_at,
      customers: customerObj
        ? {
            id: customerObj.id,
            shop_id: customerObj.shop_id,
            name: customerObj.name,
            phone_number: customerObj.phone_number,
            created_at: customerObj.created_at,
            customer_measurements: measurementsArr,
          }
        : null,
    };
  });

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 md:px-0">
      <OrderQueue
        initialOrders={orders}
        initialOption={initialOption}
        initialStatus={initialStatus}
        selectedOrderId={selectedOrderId}
      />
    </div>
  );
}
