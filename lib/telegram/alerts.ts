// Semua alert otomatis ke admin lewat satu pintu. Tidak pernah throw.
import { checkRateLimit } from '@/lib/rate-limit';
import { escapeHtml, formatWib, sendAdminAlert } from './api';
import { formatRupiah } from '@/config/pricing';

export interface ThreatDetails {
  ip: string;
  method: string;
  path: string;
  reason: string;
  userAgent: string;
  origin?: string;
}

/** Alert WAF — dibatasi per-IP (3/menit) dan global (10/menit) agar Telegram tidak banjir saat diserang. */
export async function sendSecurityAlert(d: ThreatDetails): Promise<void> {
  if (!checkRateLimit(`waf-alert:${d.ip}`, 3, 60_000)) return;
  if (!checkRateLimit('waf-alert:global', 10, 60_000)) return;

  await sendAdminAlert(
    [
      '🚨 <b>Security Alert — request diblokir</b>',
      '',
      `🕒 ${formatWib()}`,
      `⚠️ <code>${escapeHtml(d.reason)}</code>`,
      `🌐 IP: <code>${escapeHtml(d.ip)}</code>`,
      `📌 <code>${escapeHtml(d.method)} ${escapeHtml(d.path.slice(0, 200))}</code>`,
      `🖥️ <code>${escapeHtml((d.userAgent || 'unknown').slice(0, 150))}</code>`,
      d.origin ? `🔗 <code>${escapeHtml(d.origin.slice(0, 150))}</code>` : '',
      '',
      '#security #waf',
    ].filter(Boolean).join('\n')
  );
}

export interface NewShopDetails {
  shopName: string;
  whatsappNumber: string;
  ownerName: string;
  ownerEmail: string;
  userId: string;
}

export async function sendNewShopAlert(d: NewShopDetails): Promise<void> {
  const wa = d.whatsappNumber.replace(/\D/g, '').replace(/^0/, '62');
  await sendAdminAlert(
    [
      '🎉 <b>Toko baru terdaftar</b>',
      '',
      `🕒 ${formatWib()}`,
      `🏪 <b>${escapeHtml(d.shopName)}</b>`,
      `👤 ${escapeHtml(d.ownerName)}`,
      `✉️ <code>${escapeHtml(d.ownerEmail)}</code>`,
      `📱 <a href="https://wa.me/${wa}">${escapeHtml(d.whatsappNumber)}</a>`,
      `🆔 <code>${escapeHtml(d.userId)}</code>`,
      '',
      '#user_baru',
    ].join('\n')
  );
}

export interface PaymentDetails {
  shopName: string;
  ownerEmail: string;
  plan: string;
  amount: number;
  invoiceId: string;
  validUntil: string;
}

export async function sendPaymentAlert(d: PaymentDetails): Promise<void> {
  await sendAdminAlert(
    [
      '💰 <b>Pembayaran diterima</b>',
      '',
      `🕒 ${formatWib()}`,
      `🏪 <b>${escapeHtml(d.shopName)}</b> (<code>${escapeHtml(d.ownerEmail)}</code>)`,
      `📦 Paket: ${escapeHtml(d.plan)} — <b>${escapeHtml(formatRupiah(d.amount))}</b>`,
      `🧾 <code>${escapeHtml(d.invoiceId)}</code>`,
      `✅ Aktif sampai: ${formatWib(d.validUntil)}`,
      '',
      '#pembayaran',
    ].join('\n')
  );
}
