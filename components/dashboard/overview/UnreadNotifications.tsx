"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, CheckCheck, PartyPopper } from "lucide-react";
import { useNotifications } from "@/components/dashboard/notifications/useNotifications";
import { TYPE_STYLE, timeAgo } from "@/components/dashboard/notifications/NotificationBell";
import type { NotificationItem } from "@/types/database";

const VISIBLE = 4;

export default function UnreadNotifications({
  shopId,
  initial,
}: {
  shopId: string;
  initial: NotificationItem[];
}) {
  const { items, unreadCount, markRead, markAllRead } = useNotifications(shopId, initial, "overview");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const unread = items.filter((n) => !n.is_read);
  const shown = unread.slice(0, VISIBLE);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <BellRing className="w-4 h-4 text-blue-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </div>
          <h2 className="text-sm font-bold text-white">Notifikasi Baru</h2>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tandai dibaca
          </button>
        )}
      </div>

      <div className="mt-3 flex-1">
        {shown.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <PartyPopper className="w-8 h-8 mx-auto text-emerald-400" />
            <p className="mt-2 text-xs font-medium text-slate-200">Semua sudah dibaca</p>
            <p className="text-[11px] text-slate-500">Tidak ada notifikasi baru.</p>
          </motion.div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {shown.map((n) => {
                const { icon: Icon, box } = TYPE_STYLE[n.type] ?? TYPE_STYLE.info;
                return (
                  <motion.li
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <button
                      onClick={() => markRead(n.id)}
                      className="w-full flex gap-3 p-3 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-blue-500/40 text-left transition group"
                      title="Klik untuk tandai sudah dibaca"
                    >
                      <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${box}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white leading-snug">{n.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed line-clamp-2 break-words">
                          {n.body}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {mounted ? timeAgo(n.created_at) : "\u00A0"}
                        </p>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {unread.length > VISIBLE && (
        <p className="mt-2 text-center text-[11px] text-slate-500">
          +{unread.length - VISIBLE} notifikasi lainnya di ikon lonceng
        </p>
      )}
    </div>
  );
}
