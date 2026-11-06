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

export function checkShopAccess(
  shop: Shop,
  currentCustomerCount: number = 0,
  currentOrderCount: number = 0,
  now: Date = new Date()
): AccessGuard {
  const trialEnd = new Date(shop.trial_ends_at);
  const proEnd = shop.pro_valid_until ? new Date(shop.pro_valid_until) : null;

  const status = shop.subscription_status as string;

  const isProActive = (status === 'active' || status === 'paid') && proEnd !== null && proEnd > now;
  const isTrialActive = status === 'trialing' && trialEnd > now;
  const isExpired = !isProActive && !isTrialActive;

  const activeEndDate = isProActive ? proEnd! : trialEnd;
  const daysRemaining = Math.max(0, Math.ceil((activeEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

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
