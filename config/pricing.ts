export interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  originalPrice?: string;
  isPopular?: boolean;
  badge?: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "trial-14-hari",
    name: "Uji Coba Gratis",
    subtitle: "Khusus Pengguna Baru (1x)",
    price: "Rp 0",
    period: "/ 14 hari",
    badge: "Trial Gratis",
    features: [
      "Akses Penuh Selama 14 Hari",
      "Batas Maksimal 15 Ukuran Pelanggan",
      "Uji Coba Struk WA (Dengan Watermark)",
      "Manajemen Antrean Sederhana",
      "Akses 1 Perangkat HP / Laptop",
    ],
    ctaText: "Coba Gratis 14 Hari",
    ctaHref: "/dashboard?plan=trial",
  },
  {
    id: "penjahit-lokal",
    name: "Penjahit Lokal",
    subtitle: "Penjahit Rumahan / Perorangan",
    price: "Rp 19.000",
    period: "/ bulan",
    originalPrice: "Rp 29.000",
    isPopular: true,
    badge: "Promo",
    features: [
      "Simpan Ukuran Pelanggan Tanpa Batas",
      "Kirim Struk WA Otomatis (Tanpa Watermark)",
      "Manajemen Antrean Sederhana",
      "Akses 1 Perangkat HP / Laptop",
      "Dukungan Prioritas WA",
    ],
    ctaText: "Mulai Langganan",
    ctaHref: "/dashboard?plan=pro",
  },
];

export const PLAN_LIMITS = {
  trial: {
    maxCustomers: 10,
    maxOrders: 20,
    trialDays: 14,
  },
  pro: {
    maxCustomers: Infinity,
    maxOrders: Infinity,
    priceMonthly: 20000,
  },
} as const;
