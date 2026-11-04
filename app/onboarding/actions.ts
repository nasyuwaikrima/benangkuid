'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type FormState = {
  errors?: {
    shop_name?: string[]
    whatsapp_number?: string[]
    global?: string[]
  }
}

const onboardingSchema = z.object({
  shop_name: z.string().min(3, "Nama usaha minimal 3 karakter"),
  whatsapp_number: z.string().transform((val) => {
    let clean = val.replace(/[^0-9]/g, '')
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1)
    }
    return clean
  }).refine((val) => /^628[1-9][0-9]{7,11}$/.test(val), {
    message: "Nomor WhatsApp tidak valid (contoh: 081234567890)",
  }),
})

export async function completeOnboarding(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const rawShopName = formData.get('shop_name') as string
  const rawWa = formData.get('whatsapp_number') as string

  const validation = onboardingSchema.safeParse({
    shop_name: rawShopName,
    whatsapp_number: rawWa,
  })

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors }
  }

  const { error } = await supabase
    .from('shops')
    .update({
      shop_name: validation.data.shop_name,
      whatsapp_number: validation.data.whatsapp_number,
      is_onboarded: true,
    })
    .eq('id', user.id)

  if (error) {
    return { errors: { global: [error.message] } }
  }

  redirect('/dashboard')
}
