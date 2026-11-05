import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewOrderForm from '@/components/dashboard/new-order-form';

export const instant = false;

export default async function NewOrderPage() {
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch Daftar Pelanggan beserta Ukuran Badannya untuk Pencarian Instant
  const { data: customers } = await supabase
    .from('customers')
    .select(`
      id,
      name,
      phone_number,
      customer_measurements (
        id, label, chest, waist, hip, shoulder, sleeve, pants_length, notes
      )
    `)
    .order('name', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <NewOrderForm existingCustomers={customers || []} shopId={user.id} />
    </div>
  );
}
