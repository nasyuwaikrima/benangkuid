// Klien Telegram tunggal: dipakai bot admin, alert keamanan, alert user baru & pembayaran.
// Catatan: tanpa 'server-only' agar bisa dipakai proxy.ts; token tidak berawalan NEXT_PUBLIC_ jadi tidak bocor ke client.
import { createHash, timingSafeEqual } from 'node:crypto';

const TIMEOUT_MS = 8000;
const MAX_LEN = 4000; // batas Telegram 4096

export function escapeHtml(input: string | number | null | undefined): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

type TelegramResult = { ok: boolean; description?: string; parameters?: { retry_after?: number } };

/** Panggil method Bot API. Tidak pernah throw — selalu mengembalikan { ok }. */
export async function callTelegram(method: string, payload: Record<string, unknown>, retry = true): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, description: 'TELEGRAM_BOT_TOKEN belum diatur' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const data = (await res.json().catch(() => ({ ok: false }))) as TelegramResult;

    // Kena flood limit: tunggu sebentar lalu coba sekali lagi
    if (res.status === 429 && retry) {
      const wait = Math.min((data.parameters?.retry_after ?? 1) * 1000, 3000);
      await new Promise((r) => setTimeout(r, wait));
      return callTelegram(method, payload, false);
    }
    if (!data.ok) console.error(`[telegram] ${method} gagal:`, res.status, data.description);
    return data;
  } catch (e) {
    console.error(`[telegram] ${method} error:`, e instanceof Error ? e.message : e);
    return { ok: false, description: 'network error' };
  }
}

export async function sendTelegramMessage(chatId: number | string, html: string): Promise<boolean> {
  const text = html.length > MAX_LEN ? `${html.slice(0, html.lastIndexOf('\n', MAX_LEN) > 0 ? html.lastIndexOf('\n', MAX_LEN) : MAX_LEN)}\n…(dipotong)` : html;
  const res = await callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  });
  return res.ok;
}

/** Daftar Telegram user ID admin (env TELEGRAM_ADMIN_IDS, dipisah koma) */
export function getAdminIds(): string[] {
  return (process.env.TELEGRAM_ADMIN_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isTelegramAdmin(userId: number | string): boolean {
  return getAdminIds().includes(String(userId));
}

/** Tujuan alert: TELEGRAM_ADMIN_CHAT_ID (grup/channel) jika ada, selain itu semua admin. */
export function getAlertTargets(): string[] {
  const chat = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  return chat ? [chat] : getAdminIds();
}

/** Kirim pesan ke admin. Aman dipanggil tanpa konfigurasi (diam-diam dilewati). */
export async function sendAdminAlert(html: string): Promise<void> {
  const targets = getAlertTargets();
  if (!process.env.TELEGRAM_BOT_TOKEN || targets.length === 0) return;
  await Promise.allSettled(targets.map((id) => sendTelegramMessage(id, html)));
}

/** Perbandingan secret yang aman dari timing attack */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export const formatWib = (date: Date | string = new Date()) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date(date)) + ' WIB';
