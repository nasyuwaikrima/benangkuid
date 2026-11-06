export interface Shop {
  id: string;
  owner_name: string;
  email: string;
  shop_name: string | null;
  whatsapp_number: string | null;
  is_onboarded: boolean;
  subscription_status: 'trialing' | 'paid' | 'pending' | 'expired';
  trial_ends_at: string;
  pro_valid_until: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone_number: string;
  created_at: string;
}

export interface CustomerMeasurement {
  id: string;
  customer_id: string;
  label: string;
  chest?: number;
  waist?: number;
  hip?: number;
  shoulder?: number;
  sleeve?: number;
  pants_length?: number;
  notes?: string;
  updated_at: string;
}

export interface Order {
  id: string;
  shop_id: string;
  customer_id: string;
  item_name: string;
  service_type: string;
  detail_instruksi: string;
  photo_before_url?: string;
  total_biaya: number;
  dp_dibayar: number;
  status_pengerjaan: 'antrean' | 'proses' | 'fitting' | 'selesai' | 'diambil';
  tgl_deadline?: string;
  created_at: string;
  customer?: Customer;
}

export interface Subscription {
  id: string;
  shop_id: string;
  invoice_id: string;
  amount: number;
  plan: 'pro';
  status: 'pending' | 'paid' | 'expired';
  qris_image?: string | null;
  expired_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ===== NOTIFIKASI (dikontrol via Telegram bot) =====
export type NotificationType = 'info' | 'promo' | 'warning';

export interface NotificationRow {
  id: number;
  shop_id: string | null; // null = broadcast ke semua toko
  title: string;
  body: string;
  type: NotificationType;
  created_by: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  type: NotificationType;
  created_at: string;
  is_read: boolean;
}
