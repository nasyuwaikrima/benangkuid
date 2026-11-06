import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

const apiUrl = (method: string) =>
  `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

export function escapeHtml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function sendTelegramMessage(chatId: number | string, html: string) {
  try {
    const res = await fetch(apiUrl('sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      }),
      cache: 'no-store',
    });
    if (!res.ok) console.error('[telegram] sendMessage gagal:', res.status, await res.text());
  } catch (e) {
    console.error('[telegram] sendMessage error:', e);
  }
}

/** Daftar Telegram user ID admin, dipisah koma di env TELEGRAM_ADMIN_IDS */
export function isTelegramAdmin(userId: number | string): boolean {
  const ids = (process.env.TELEGRAM_ADMIN_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(String(userId));
}

/** Perbandingan secret yang aman dari timing attack */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}
