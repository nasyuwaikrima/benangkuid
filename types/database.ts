export interface Shop {
  id: string;
  owner_name: string;
  email: string;
  shop_name: string | null;
  whatsapp_number: string | null;
  is_onboarded: boolean;
  subscription_status: 'trialing' | 'paid' | 'pending' | 'expired'; // Disesuaikan dengan SQL
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
  // shirt_length dihapus karena tidak ada di schema SQL
  pants_length?: number;
  notes?: string;
  updated_at: string;
}

export interface Order {
  id: string;
  shop_id: string;
  customer_id: string;
  // measurement_id dihapus karena tidak ada di schema SQL
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

// Interface Baru sesuai Tabel public.subscriptions
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
