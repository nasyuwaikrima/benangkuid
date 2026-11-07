import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProfileEditForm from '@/components/dashboard/profile-edit-form';

export const metadata = { title: 'Edit Profil Toko' };
export const instant = false;

export default async function SettingsPage() {
  await connection();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: shop } = await supabase
    .from('shops')
    .select('owner_name, shop_name, whatsapp_number')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/dashboard/profile" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Kembali ke profil
      </Link>
      <h1 className="text-xl font-bold text-white">Edit Profil Toko</h1>
      <ProfileEditForm
        ownerName={shop?.owner_name ?? ''}
        shopName={shop?.shop_name ?? ''}
        whatsapp={shop?.whatsapp_number ?? ''}
      />
    </div>
  );
}
