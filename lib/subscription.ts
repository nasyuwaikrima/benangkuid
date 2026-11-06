import { Shop } from '@/types/database';
import { PLAN_LIMITS } from '@/config/pricing';

export interface AccessGuard {
  canCreateCustomer: boolean;
  canCreateOrder: boolean;
  isExpired: boolean;
  isTrial: boolean;
  blockReason: 'EXPIRED' | 'CUSTOMER_LIMIT' | 'ORDER_LIMIT' | null;
  daysRemaining: number;
}

/**
 * Memeriksa hak akses toko berdasarkan status langganan dan kuota pengunaan.
 */
export function checkShopAccess(
  shop: Shop,
  currentCustomerCount: number = 0,
  currentOrderCount: number = 0,
  now: Date = new Date()
): AccessGuard {
  // 1. Parsing Tanggal secara Aman
  const trialEnd = shop.trial_ends_at ? new Date(shop.trial_ends_at) : new Date(0);
  const proEnd = shop.pro_valid_until ? new Date(shop.pro_valid_until) : null;

  // 2. Normalisasi Status Kebal terhadap Case-Sensitivity
  const status = (shop.subscription_status || '').toLowerCase().trim();

  // 3. Pengecekan Status Aktif Pro (Mendukung 'active', 'paid', atau 'success')
  const isProStatus = ['active', 'paid', 'success'].includes(status);
  const isProActive =
    isProStatus &&
    proEnd !== null &&
    !isNaN(proEnd.getTime()) &&
    proEnd.getTime() > now.getTime();

  // 4. Pengecekan Status Aktif Trial
  const isTrialActive =
    !isProActive &&
    (status === 'trialing' || status === 'trial') &&
    !isNaN(trialEnd.getTime()) &&
    trialEnd.getTime() > now.getTime();

  // 5. Penentuan Status Expired
  const isExpired = !isProActive && !isTrialActive;

  // 6. Hitung Sisa Hari
  const activeEndDate = isProActive ? proEnd! : trialEnd;
  const daysRemaining = isExpired
    ? 0
    : Math.max(0, Math.ceil((activeEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Jika Expired, langsung kunci akses
  if (isExpired) {
    return {
      canCreateCustomer: false,
      canCreateOrder: false,
      isExpired: true,
      isTrial: false,
      blockReason: 'EXPIRED',
      daysRemaining: 0,
    };
  }

  let canCreateCustomer = true;
  let canCreateOrder = true;
  let blockReason: AccessGuard['blockReason'] = null;

  // 7. Penguncian Limit Khusus Akun Trial (Akun Pro lewati blok ini / Unlimited)
  if (isTrialActive) {
    if (currentCustomerCount >= PLAN_LIMITS.trial.maxCustomers) {
      canCreateCustomer = false;
      blockReason = 'CUSTOMER_LIMIT';
    }
    if (currentOrderCount >= PLAN_LIMITS.trial.maxOrders) {
      canCreateOrder = false;
      blockReason = 'ORDER_LIMIT';
    }
  }

  return {
    canCreateCustomer,
    canCreateOrder,
    isExpired: false,
    isTrial: isTrialActive,
    blockReason,
    daysRemaining,
  };
}
