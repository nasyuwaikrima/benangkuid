#!/usr/bin/env node
// Daftarkan webhook + menu perintah bot Telegram.
// Pakai:  node --env-file=.env.local scripts/telegram-setup.mjs
//    atau npm run telegram:setup
const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_WEBHOOK_SECRET: secret, NEXT_PUBLIC_APP_URL } = process.env;
const base = (NEXT_PUBLIC_APP_URL || 'https://benangku.id').replace(/\/$/, '');

if (!token || !secret) {
  console.error('✗ TELEGRAM_BOT_TOKEN dan TELEGRAM_WEBHOOK_SECRET wajib diisi.');
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]{16,256}$/.test(secret)) {
  console.error('✗ TELEGRAM_WEBHOOK_SECRET hanya boleh huruf/angka/_/- (16–256 karakter).');
  process.exit(1);
}

const call = async (method, body) => {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`${method}: ${json.description}`);
  return json.result;
};

const commands = [
  { command: 'help', description: 'Daftar perintah' },
  { command: 'stats', description: 'Statistik pengguna & omzet' },
  { command: 'cari', description: 'Cari toko (email/nama/WA)' },
  { command: 'perpanjang', description: 'Perpanjang Pro: email hari' },
  { command: 'notif', description: 'Broadcast info: Judul | Isi' },
  { command: 'promo', description: 'Broadcast promo: Judul | Isi' },
  { command: 'peringatan', description: 'Broadcast peringatan: Judul | Isi' },
  { command: 'kirim', description: 'Kirim ke 1 toko: email | Judul | Isi' },
  { command: 'list', description: '10 notifikasi terakhir' },
  { command: 'hapus', description: 'Hapus notifikasi: ID' },
];

try {
  const me = await call('getMe', {});
  await call('setWebhook', {
    url: `${base}/api/telegram/webhook`,
    secret_token: secret,
    allowed_updates: ['message'],
    drop_pending_updates: true,
    max_connections: 5,
  });
  await call('setMyCommands', { commands, scope: { type: 'all_private_chats' } });
  console.log(`✓ Bot @${me.username} siap`);
  console.log(`✓ Webhook → ${base}/api/telegram/webhook`);
  console.log('✓ Menu perintah terdaftar. Kirim /start ke bot untuk mencoba.');
} catch (e) {
  console.error('✗', e.message);
  process.exit(1);
}
