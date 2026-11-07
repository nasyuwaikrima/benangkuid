export type PlanId = 'trial' | 'pro';

export interface PricingPlan {
  id: PlanId;
  name: string;
  subtitle: string;
  priceAmount: number;      // sumber kebenaran harga (angka)
  originalAmount?: number;
  period: string;
  durationDays: number;
  maxCustomers: number;
  maxOrders: number;
  isPopular?: boolean;
  badge?: string;
  features: string[];
  ctaText: string;
}

export const formatRupiah = (n?: number | null) => {
  if (typeof n !== 'number' || isNaN(n)) return 'Rp 0';
  return `Rp ${n.toLocaleString('id-ID')}`;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'trial',
    name: 'Uji Coba Gratis',
    subtitle: 'Khusus Pengguna Baru (1x)',
    priceAmount: 0,
    period: '/ 14 hari',
    durationDays: 14,
    maxCustomers: 15,
    maxOrders: 20,
    badge: 'Trial Gratis',
    features: [
      'Akses penuh fitur selama 14 hari',
      'Hingga 15 pelanggan & 20 pesanan',
      'Simpan ukuran, antrean, DP & pelunasan',
      'Chat pelanggan via WhatsApp sekali klik',
      'Tanpa kartu kredit',
    ],
    ctaText: 'Coba Gratis 14 Hari',
  },
  {
    id: 'pro',
    name: 'Penjahit Lokal',
    subtitle: 'Penjahit Rumahan / Perorangan',
    priceAmount: 19000,
    originalAmount: 29000,
    period: '/ bulan',
    durationDays: 30,
    maxCustomers: Infinity,
    maxOrders: Infinity,
    isPopular: true,
    badge: 'Promo',
    features: [
      'Pelanggan & pesanan tanpa batas',
      'Simpan ukuran, antrean, DP & pelunasan',
      'Ringkasan omzet & deadline di dashboard',
      'Bayar QRIS, aktif otomatis',
      'Dukungan prioritas via WhatsApp',
    ],
    ctaText: 'Mulai Langganan',
  },
];

export const getPlan = (id: string) => PRICING_PLANS.find((p) => p.id === id);

// Turunan otomatis dari PRICING_PLANS
export const PLAN_LIMITS = Object.fromEntries(
  PRICING_PLANS.map((p) => [p.id, { maxCustomers: p.maxCustomers, maxOrders: p.maxOrders }])
) as Record<PlanId, { maxCustomers: number; maxOrders: number }>;
