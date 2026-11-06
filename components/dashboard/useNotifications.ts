"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/dashboard/notification-actions";
import type { NotificationItem, NotificationRow } from "@/types/database";

const MAX_ITEMS = 30;

export function useNotifications(
  shopId: string | undefined,
  initial: NotificationItem[] = []
) {
  const [items, setItems] = useState<NotificationItem[]>(initial);

  // Realtime: notifikasi baru muncul otomatis (RLS memastikan hanya yang berhak)
  useEffect(() => {
    if (!shopId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${shopId}`)
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
  }, [shopId]);

  const markRead = useCallback((id: number) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    void markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    void markAllNotificationsRead();
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  return { items, unreadCount, markRead, markAllRead };
}
