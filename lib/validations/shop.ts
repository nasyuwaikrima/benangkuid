import { z } from 'zod';

export const onboardingSchema = z.object({
  shop_name: z
    .string()
    .min(3, 'Nama toko minimal 3 karakter')
    .max(100, 'Nama toko maksimal 100 karakter'),
  whatsapp_number: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{7,11}$/, 'Format nomor WhatsApp tidak valid (contoh: 081234567890)'),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
