import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { isTelegramAdmin, safeEqual, sendTelegramMessage } from '@/lib/telegram/api';
import { handleCommand, HELP_TEXT } from '@/lib/telegram/commands';

type TelegramUpdate = {
  update_id?: number;
  message?: {
    text?: string;
    from?: { id: number };
    chat: { id: number; type: string };
  };
};

// Telegram bisa mengirim ulang update yang sama bila respons lambat → abaikan duplikat
const seen = new Set<number>();
const remember = (id: number) => {
  seen.add(id);
  if (seen.size > 500) seen.delete(seen.values().next().value as number);
};

// Selalu balas 200 agar Telegram tidak mengulang update yang sama
const ok = () => NextResponse.json({ ok: true });

export async function POST(req: Request) {
  // 1. Pastikan request benar-benar dari Telegram (secret_token saat setWebhook)
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET ?? '';
  const received = req.headers.get('x-telegram-bot-api-secret-token') ?? '';
  if (!expected || !safeEqual(received, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  if (typeof update.update_id === 'number') {
    if (seen.has(update.update_id)) return ok();
    remember(update.update_id);
  }

  const message = update.message;
  if (!message?.text || !message.from || message.chat.type !== 'private') return ok();

  const chatId = message.chat.id;
  const adminId = message.from.id;

  // 2. Hanya admin terdaftar (TELEGRAM_ADMIN_IDS)
  if (!isTelegramAdmin(adminId)) {
    console.warn('[telegram] akses ditolak untuk user', adminId);
    await sendTelegramMessage(chatId, '⛔ Kamu tidak punya akses ke bot ini.');
    return ok();
  }

  if (!checkRateLimit(`telegram:${adminId}`, 20, 60 * 1000)) {
    await sendTelegramMessage(chatId, '⏳ Terlalu cepat, coba lagi sebentar.');
    return ok();
  }

  // 3. Parse "/perintah@namabot argumen..."
  const match = message.text.trim().match(/^\/(\w+)(?:@\w+)?\s*([\s\S]*)$/);
  if (!match) {
    await sendTelegramMessage(chatId, HELP_TEXT);
    return ok();
  }

  try {
    const reply = await handleCommand(match[1].toLowerCase(), match[2], { adminId });
    await sendTelegramMessage(chatId, reply);
  } catch (e) {
    console.error('[telegram] handler error:', e);
    await sendTelegramMessage(chatId, '❌ Terjadi kesalahan di server.');
  }
  return ok();
}
