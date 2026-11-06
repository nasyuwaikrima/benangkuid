// `@/lib/telegram-alert.ts`
import 'server-only';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export interface ThreatDetails {
  ip: string;
  method: string;
  path: string;
  reason: string;
  userAgent: string;
  origin?: string;
  payloadSnippet?: string;
}

/**
 * Mengirim notifikasi ancaman keamanan ke Telegram Admin
 */
export async function sendSecurityAlertToTelegram(details: ThreatDetails): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) return;

  const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const message = `🚨 <b>SECURITY ALERT - POTENTIAL EXPLOIT PREVENTED</b> 🚨

<b>🕒 Waktu:</b> <code>${now} WIB</code>
<b>⚠️ Alasan:</b> <code>${escapeHtml(details.reason)}</code>
<b>🌐 IP Client:</b> <code>${escapeHtml(details.ip)}</code>
<b>📌 Route/Endpoint:</b> <code>${details.method} ${escapeHtml(details.path)}</code>
<b>🖥️ User-Agent:</b> <code>${escapeHtml(details.userAgent || 'Unknown')}</code>
${details.origin ? `<b>🔗 Origin:</b> <code>${escapeHtml(details.origin)}</code>\n` : ''}
<code>#security_alert #benangku_waf</code>`;

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
    console.error('[Telegram Security Alert Error]:', err);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
