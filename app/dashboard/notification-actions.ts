'use server';

import { createClient } from '@/lib/supabase/server';

export async function markNotificationRead(id: number) {
  if (!Number.isInteger(id) || id <= 0) return { success: false };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from('notification_reads')
    .upsert(
      { notification_id: id, shop_id: user.id },
      { onConflict: 'notification_id,shop_id', ignoreDuplicates: true }
    );
  return { success: !error };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { data } = await supabase
    .from('notifications')
    .select('id, notification_reads(notification_id)')
    .order('created_at', { ascending: false })
    .limit(100);

  const unread = ((data ?? []) as { id: number; notification_reads: unknown[] | null }[])
    .filter((n) => (n.notification_reads?.length ?? 0) === 0)
    .map((n) => ({ notification_id: n.id, shop_id: user.id }));

  if (!unread.length) return { success: true };

  const { error } = await supabase
    .from('notification_reads')
    .upsert(unread, { onConflict: 'notification_id,shop_id', ignoreDuplicates: true });
  return { success: !error };
}
