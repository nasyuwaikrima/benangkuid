'use server';

import { createClient } from '@/lib/supabase/server';
import { onboardingSchema } from '@/lib/validations/shop';
import { checkRateLimit } from '@/lib/rate-limit';
import { revalidatePath } from 'next/cache';

export async function submitOnboarding(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Sesi tidak valid, silakan login kembali.' };
  }

  // 1. Rate Limiting Check (Maksimal 5x submit per menit per user)
  const isAllowed = checkRateLimit(`onboarding:${user.id}`, 5, 60 * 1000);
  if (!isAllowed) {
    return { success: false, error: 'Terlalu banyak percobaan. Coba lagi dalam 1 menit.' };
  }

  // 2. Schema Validation via Zod
  const rawData = {
    shop_name: formData.get('shop_name'),
    whatsapp_number: formData.get('whatsapp_number'),
  };

  const validation = onboardingSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMessage = validation.error.issues[0]?.message || 'Input tidak valid';
    return { success: false, error: errorMessage };
  }

  // 3. Update Database
  const { error } = await supabase
    .from('shops')
    .update({
      shop_name: validation.data.shop_name,
      whatsapp_number: validation.data.whatsapp_number,
      is_onboarded: true,
    })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: 'Gagal memperbarui profil toko: ' + error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
