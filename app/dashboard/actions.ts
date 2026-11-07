'use server';

import { createClient } from '@/lib/supabase/server';
import { onboardingSchema, profileSchema } from '@/lib/validations/shop';
import { checkRateLimit } from '@/lib/rate-limit';
import { checkShopAccess } from '@/lib/subscription';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { sendNewShopAlert } from '@/lib/telegram/alerts';

// 1. Action Onboarding Toko (Rate Limit + Zod Validation + Telegram Admin Alert)
export async function submitOnboarding(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Sesi tidak valid, silakan login kembali.' };
  }

  // Rate Limiting Check (Maksimal 5x submit per menit per user)
  const isAllowed = checkRateLimit(`onboarding:${user.id}`, 5, 60 * 1000);
  if (!isAllowed) {
    return { success: false, error: 'Terlalu banyak percobaan. Coba lagi dalam 1 menit.' };
  }

  // Schema Validation via Zod
  const rawData = {
    shop_name: formData.get('shop_name'),
    whatsapp_number: formData.get('whatsapp_number'),
  };

  const validation = onboardingSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || 'Input tidak valid';
    return { success: false, error: errorMessage };
  }

  // Update Database & Ambil Data Profil Toko Terkait
  const { data: updatedShop, error } = await supabase
    .from('shops')
    .update({
      shop_name: validation.data.shop_name,
      whatsapp_number: validation.data.whatsapp_number,
      is_onboarded: true,
    })
    .eq('id', user.id)
    .select('owner_name, email')
    .single();

  if (error) {
    return { success: false, error: 'Gagal memperbarui profil toko: ' + error.message };
  }

  // Alert admin dikirim setelah respons selesai (tidak memperlambat user, aman di serverless)
  after(() =>
    sendNewShopAlert({
      shopName: validation.data.shop_name,
      whatsappNumber: validation.data.whatsapp_number,
      ownerName: updatedShop?.owner_name || user.user_metadata?.full_name || 'Pemilik Toko',
      ownerEmail: updatedShop?.email || user.email || '-',
      userId: user.id,
    })
  );

  revalidatePath('/dashboard');
  return { success: true };
}

// 2. Action Tambah Pelanggan (Subscription Guard + Limit Check)
export async function createCustomerAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Sesi telah berakhir. Silakan login kembali.' };
  }

  const [{ data: shop }, { count: customerCount }] = await Promise.all([
    supabase.from('shops').select('*').eq('id', user.id).single(),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('shop_id', user.id),
  ]);

  if (!shop) {
    return { success: false, error: 'Profil toko tidak ditemukan.' };
  }

  const access = checkShopAccess(shop, customerCount || 0, 0);

  if (!access.canCreateCustomer) {
    return {
      success: false,
      isPaywallTriggered: true,
      blockReason: access.blockReason,
      error: access.isExpired
        ? 'Masa trial/aktif paket telah habis. Silakan upgrade ke Pro.'
        : `Batas ${customerCount} pelanggan trial telah tercapai. Upgrade ke Pro untuk akses tanpa batas!`,
    };
  }

  const name = formData.get('name') as string;
  const phone_number = formData.get('phone_number') as string;

  if (!name || !phone_number) {
    return { success: false, error: 'Nama dan nomor WhatsApp wajib diisi.' };
  }

  const { data, error } = await supabase
    .from('customers')
    .insert([{ shop_id: user.id, name, phone_number }])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true, data };
}


// 3. Action Ubah Profil Toko (halaman /dashboard/pengaturan)
export async function updateShopProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Sesi tidak valid, silakan login kembali.' };

  if (!checkRateLimit(`profile:${user.id}`, 10, 60 * 1000)) {
    return { success: false, error: 'Terlalu banyak percobaan. Coba lagi dalam 1 menit.' };
  }

  const validation = profileSchema.safeParse({
    owner_name: formData.get('owner_name'),
    shop_name: formData.get('shop_name'),
    whatsapp_number: formData.get('whatsapp_number'),
  });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Input tidak valid' };
  }

  const { error } = await supabase
    .from('shops')
    .update(validation.data)
    .eq('id', user.id);
  if (error) return { success: false, error: 'Gagal menyimpan perubahan. Coba lagi.' };

  revalidatePath('/dashboard', 'layout');
  return { success: true };
}
