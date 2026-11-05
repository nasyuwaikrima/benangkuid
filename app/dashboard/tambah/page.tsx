import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import NewOrderForm from '@/components/dashboard/new-order-form'; // Sesuaikan path impor komponen client NewOrderForm Anda

// Tandai rute ini sebagai blocking route saat navigasi
export const instant = false;

export default async function NewOrderPage() {
  // Beritahu Next.js 16 bahwa halaman ini dinamis per-request
  await connection();

  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Query Data Pelanggan Beserta Ukurannya
  const { data: existingCustomers } = await supabase
    .from('customers')
    .select(`
      id,
      name,
      phone_number,
      customer_measurements (
        id,
        label,
        chest,
        waist,
        hip,
        shoulder,
        sleeve,
        pants_length,
        notes
      )
    `)
    .eq('shop_id', user.id)
    .order('name', { ascending: true });

  return (
    <div className="max-w-3xl mx-auto">
      <NewOrderForm
        existingCustomers={existingCustomers || []}
        shopId={user.id}
      />
    </div>
  );
}
