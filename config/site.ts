/**
 * Satu-satunya tempat untuk identitas & kontak benangku.id.
 * Ganti nomor WhatsApp lewat env NEXT_PUBLIC_WHATSAPP_NUMBER (contoh: 6281234567890).
 * Aman dipakai di server maupun client component.
 */
const rawWa = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

// 08xxx -> 628xxx
const normalizedWa = rawWa.startsWith('0') ? `62${rawWa.slice(1)}` : rawWa;

export const SITE = {
  name: 'benangku.id',
  shortName: 'Benangku',
  tagline: 'Aplikasi Catatan Order Penjahit & Konveksi',
  description:
    'Kelola antrean jahit, simpan ukuran pelanggan, catat DP & pelunasan, dan hubungi pelanggan via WhatsApp dalam satu aplikasi praktis.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://benangku.id',
  email: 'support@benangku.id',
  whatsapp: normalizedWa, // string kosong = belum diatur
  operator: 'PT Taraka Cipta Teknologi',
  // Konstanta (bukan new Date()) supaya aman untuk prerender Next.js cacheComponents
  year: 2026,
  legalUpdated: '7 November 2026',
} as const;

export const hasWhatsApp = SITE.whatsapp.length >= 10;

/** Link wa.me ke CS benangku.id. Mengembalikan null jika nomor belum diatur. */
export function waLink(message = 'Halo benangku.id, saya butuh bantuan.'): string | null {
  if (!hasWhatsApp) return null;
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const mailtoLink = (subject = 'Bantuan benangku.id') =>
  `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;

/** Tampilan nomor: 6281234567890 -> 0812-3456-7890 */
export function displayWa(): string {
  if (!hasWhatsApp) return '';
  const local = `0${SITE.whatsapp.slice(2)}`;
  return local.replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3');
}
