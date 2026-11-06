// `@/lib/telegram-alert.ts`
import 'server-only';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface NewShopDetails {
  shopName: string;
  whatsappNumber: string;
  ownerName: string;
  ownerEmail: string;
  userId: string;
}

/**
 * Mengirim Notifikasi Toko Baru Terdaftar ke Telegram Admin
 */
export async function sendNewShopAlertToTelegram(details: NewShopDetails): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) return;

  const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  
  const message = `🎉 <b>USER / TOKO BARU TERDAFTAR!</b> 🎉

<b>🕒 Waktu:</b> <code>${now} WIB</code>
<b>🏪 Nama Toko:</b> <b>${escapeHtml(details.shopName)}</b>
<b>👤 Pemilik:</b> ${escapeHtml(details.ownerName)}
<b>✉️ Email:</b> <code>${escapeHtml(details.ownerEmail)}</code>
<b>📱 WhatsApp:</b> <a href="https://wa.me/${details.whatsappNumber.replace(/[^0-9]/g, '')}">${escapeHtml(details.whatsappNumber)}</a>
<b>🆔 User ID:</b> <code>${details.userId}</code>

<code>#user_baru #benangku_onboarding</code>`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error('[Telegram New Shop Alert Error]:', err);
  }
}
