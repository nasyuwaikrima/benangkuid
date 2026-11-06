import 'server-only';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import type { NotificationType } from '@/types/database';
import { escapeHtml } from './api';

const TYPE_BY_COMMAND: Record<string, NotificationType> = {
  notif: 'info',
  info: 'info',
  promo: 'promo',
  peringatan: 'warning',
};

const TYPE_EMOJI: Record<NotificationType, string> = { info: 'ℹ️', promo: '🎁', warning: '⚠️' };

const contentSchema = z.object({
  title: z.string().trim().min(1, 'Judul tidak boleh kosong.').max(100, 'Judul maksimal 100 karakter.'),
  body: z.string().trim().min(1, 'Isi pesan tidak boleh kosong.').max(500, 'Isi pesan maksimal 500 karakter.'),
});

export const HELP_TEXT = `<b>🧵 Admin Bot benangku.id</b>

<b>Kirim ke SEMUA toko</b>
<code>/notif Judul | Isi pesan</code>  (info)
<code>/promo Judul | Isi pesan</code>
<code>/peringatan Judul | Isi pesan</code>

<b>Kirim ke SATU toko</b>
<code>/kirim email@toko.com | Judul | Isi pesan</code>

<b>Kelola</b>
<code>/list</code> – 10 notifikasi terakhir
<code>/hapus 12</code> – hapus notifikasi id 12
<code>/help</code> – bantuan ini`;

type Ctx = { adminId: number };

export async function handleCommand(command: string, args: string, ctx: Ctx): Promise<string> {
  switch (command) {
    case 'start':
    case 'help':
      return HELP_TEXT;
    case 'notif':
    case 'info':
    case 'promo':
    case 'peringatan':
      return broadcast(TYPE_BY_COMMAND[command], args, ctx);
    case 'kirim':
      return sendToShop(args, ctx);
    case 'list':
      return listNotifications();
    case 'hapus':
      return deleteNotification(args);
    default:
      return `Perintah <code>/${escapeHtml(command)}</code> tidak dikenal.\n\n${HELP_TEXT}`;
  }
}

// "Judul | Isi" — isi boleh mengandung tanda "|"
function parseTitleBody(raw: string) {
  const [title = '', ...rest] = raw.split('|');
  return contentSchema.safeParse({ title, body: rest.join('|') });
}

async function broadcast(type: NotificationType, args: string, ctx: Ctx): Promise<string> {
  const parsed = parseTitleBody(args);
  if (!parsed.success) {
    return `❌ ${escapeHtml(parsed.error.issues[0]?.message ?? 'Format salah.')}\n\nFormat: <code>/notif Judul | Isi pesan</code>`;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('notifications')
    .insert({ ...parsed.data, type, shop_id: null, created_by: String(ctx.adminId) })
    .select('id')
    .single();
  if (error) return `❌ Gagal menyimpan: ${escapeHtml(error.message)}`;

  const { count } = await admin.from('shops').select('*', { count: 'exact', head: true });
  return `✅ Notifikasi <b>#${data.id}</b> ${TYPE_EMOJI[type]} terkirim ke <b>semua toko</b> (${count ?? 0} toko).\n\n<b>${escapeHtml(parsed.data.title)}</b>\n${escapeHtml(parsed.data.body)}`;
}

async function sendToShop(args: string, ctx: Ctx): Promise<string> {
  const [emailRaw = '', ...rest] = args.split('|');
  const email = emailRaw.trim().toLowerCase();
  const usage = 'Format: <code>/kirim email@toko.com | Judul | Isi pesan</code>';

  if (!z.string().email().safeParse(email).success) return `❌ Email tidak valid.\n\n${usage}`;
  const parsed = parseTitleBody(rest.join('|'));
  if (!parsed.success) return `❌ ${escapeHtml(parsed.error.issues[0]?.message ?? 'Format salah.')}\n\n${usage}`;

  const admin = createAdminClient();
  // escape wildcard ilike agar email dicocokkan persis (tanpa beda huruf besar/kecil)
  const pattern = email.replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data: shop } = await admin
    .from('shops')
    .select('id, shop_name, owner_name')
    .ilike('email', pattern)
    .maybeSingle();
  if (!shop) return `❌ Toko dengan email <code>${escapeHtml(email)}</code> tidak ditemukan.`;

  const { data, error } = await admin
    .from('notifications')
    .insert({ ...parsed.data, type: 'info', shop_id: shop.id, created_by: String(ctx.adminId) })
    .select('id')
    .single();
  if (error) return `❌ Gagal menyimpan: ${escapeHtml(error.message)}`;

  return `✅ Notifikasi <b>#${data.id}</b> terkirim ke <b>${escapeHtml(shop.shop_name || shop.owner_name || email)}</b>.`;
}

async function listNotifications(): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('notifications')
    .select('id, title, type, shop_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) return `❌ ${escapeHtml(error.message)}`;
  if (!data?.length) return 'Belum ada notifikasi.';

  const lines = data.map((n) => {
    const tgt = n.shop_id ? '👤 1 toko' : '📢 semua';
    const date = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
    }).format(new Date(n.created_at));
    return `<b>#${n.id}</b> ${TYPE_EMOJI[n.type as NotificationType] ?? ''} ${escapeHtml(n.title)}\n    ${tgt} · ${date}`;
  });
  return `<b>10 notifikasi terakhir</b>\n\n${lines.join('\n')}\n\nHapus: <code>/hapus ID</code>`;
}

async function deleteNotification(args: string): Promise<string> {
  const id = Number(args.trim().replace(/^#/, ''));
  if (!Number.isInteger(id) || id <= 0) return '❌ Format: <code>/hapus 12</code>';

  const admin = createAdminClient();
  const { data, error } = await admin.from('notifications').delete().eq('id', id).select('id');
  if (error) return `❌ ${escapeHtml(error.message)}`;
  if (!data?.length) return `❌ Notifikasi #${id} tidak ditemukan.`;
  return `🗑️ Notifikasi <b>#${id}</b> dihapus.`;
}
