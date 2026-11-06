import type { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationItem, NotificationType } from '@/types/database';

type RawRow = {
  id: number;
  title: string;
  body: string;
  type: NotificationType;
  created_at: string;
  notification_reads: { notification_id: number }[] | null;
};

/**
 * Ambil notifikasi untuk toko yang sedang login (RLS sudah menyaring
 * broadcast + notifikasi milik toko ini). `since` = tanggal akun dibuat,
 * supaya toko baru tidak kebanjiran broadcast lama.
 */
export async function getNotifications(
  supabase: SupabaseClient,
  since: string,
  limit = 30
): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, body, type, created_at, notification_reads(notification_id)')
    .gte('created_at', since)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error('[notifications] gagal memuat:', error.message);
    return [];
  }

  return (data as unknown as RawRow[]).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    created_at: n.created_at,
    is_read: (n.notification_reads?.length ?? 0) > 0,
  }));
}
