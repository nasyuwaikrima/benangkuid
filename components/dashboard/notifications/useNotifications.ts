"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/dashboard/notification-actions";
import type { NotificationItem, NotificationRow } from "@/types/database";
import { emitNotifRead, NOTIF_READ_EVENT, type NotifReadDetail } from "./events";

const MAX_ITEMS = 30;

export function useNotifications(
  shopId: string | undefined,
  initial: NotificationItem[] = [],
  channelName = "bell" // nama unik per pemakai hook agar channel realtime tidak bentrok
) {
  const [items, setItems] = useState<NotificationItem[]>(initial);

  // Realtime: notifikasi baru muncul otomatis (RLS memastikan hanya yang berhak)
  useEffect(() => {
    if (!shopId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${channelName}:${shopId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new as NotificationRow;
          if (n.expires_at && new Date(n.expires_at) <= new Date()) return;
          setItems((prev) =>
            prev.some((p) => p.id === n.id)
              ? prev
              : [
                  {
                    id: n.id,
                    title: n.title,
                    body: n.body,
                    type: n.type,
                    created_at: n.created_at,
                    is_read: false,
                  },
                  ...prev,
                ].slice(0, MAX_ITEMS)
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications" },
        (payload) => {
          const id = (payload.old as { id?: number }).id;
          if (id) setItems((prev) => prev.filter((p) => p.id !== id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, channelName]);

  // Dengarkan perubahan "dibaca" dari komponen lain
  useEffect(() => {
    const onRead = (e: Event) => {
      const { ids } = (e as CustomEvent<NotifReadDetail>).detail;
      setItems((prev) =>
        prev.map((n) => (ids === "all" || ids.includes(n.id) ? { ...n, is_read: true } : n))
      );
    };
    window.addEventListener(NOTIF_READ_EVENT, onRead);
    return () => window.removeEventListener(NOTIF_READ_EVENT, onRead);
  }, []);

  const markRead = useCallback((id: number) => {
    emitNotifRead({ ids: [id] }); // memperbarui semua pemakai hook (termasuk ini)
    void markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(() => {
    emitNotifRead({ ids: "all" });
    void markAllNotificationsRead();
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  return { items, unreadCount, markRead, markAllRead };
}
