'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export type OnboardingState = {
  errors?: {
    shop_name?: string[]
    whatsapp_number?: string[]
    global?: string[]
  }
} | null

const onboardingSchema = z.object({
  shop_name: z
    .string()
    .trim()
    .min(3, 'Nama usaha minimal 3 karakter')
    .max(50, 'Nama usaha maksimal 50 karakter'),
  whatsapp_number: z
    .string()
    .transform((val) => {
      let clean = val.replace(/[^0-9]/g, '')
      if (clean.startsWith('0')) {
        clean = '62' + clean.slice(1)
      }
      return clean
    })
    .refine((val) => /^628[1-9][0-9]{7,11}$/.test(val), {
      message: 'Nomor WhatsApp tidak valid (contoh: 081234567890)',
    }),
})

export async function completeOnboarding(
  prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient()

  // 1. Cek autentikasi user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  const rawShopName = formData.get('shop_name') as string
  const rawWa = formData.get('whatsapp_number') as string

  // 2. Validasi Input
  const validation = onboardingSchema.safeParse({
    shop_name: rawShopName,
    whatsapp_number: rawWa,
  })

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
    }
  }

  // 3. Update Database Supabase
  const { error: dbError } = await supabase
    .from('shops')
    .update({
      shop_name: validation.data.shop_name,
      whatsapp_number: validation.data.whatsapp_number,
      is_onboarded: true,
    })
    .eq('id', user.id)

  if (dbError) {
    return {
      errors: {
        global: ['Gagal menyimpan data: ' + dbError.message],
      },
    }
  }

  // 4. Invalidate Cache agar status toko langsung terbaca oleh Middleware & App
  revalidatePath('/', 'layout')

  // 5. Lempar ke Dashboard
  redirect('/dashboard')
}
