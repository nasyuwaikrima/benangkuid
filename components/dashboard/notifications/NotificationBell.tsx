"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Info, Megaphone, TriangleAlert } from "lucide-react";
import type { NotificationItem, NotificationType } from "@/types/database";

interface NotificationBellProps {
  variant: "desktop" | "mobile";
  items: NotificationItem[];
  unreadCount: number;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}

const TYPE_STYLE: Record<NotificationType, { icon: typeof Info; box: string }> = {
  info: { icon: Info, box: "bg-blue-500/15 text-blue-400" },
  promo: { icon: Megaphone, box: "bg-emerald-500/15 text-emerald-400" },
  warning: { icon: TriangleAlert, box: "bg-amber-500/15 text-amber-400" },
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} hari lalu`;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(iso));
}

export default function NotificationBell({
  variant,
  items,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar / tekan Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isMobile = variant === "mobile";

  return (
    // Mobile: tidak "relative" supaya panel melebar mengikuti header (sticky)
    <div ref={wrapperRef} className={isMobile ? "" : "relative"}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ""}`}
        aria-expanded={open}
        className="relative p-2 rounded-xl bg-[#0F172A] border border-slate-800/80 text-slate-400 hover:text-white transition"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-blue-500 text-white text-[9px] font-bold ring-2 ring-[#161F30]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 top-full rounded-2xl bg-[#161F30] border border-slate-800 shadow-2xl shadow-black/40 overflow-hidden ${
            isMobile ? "left-3 right-3" : "right-0 w-96"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <h3 className="text-xs font-semibold text-white">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-[60vh] md:max-h-96 overflow-y-auto divide-y divide-slate-800/70">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                <p className="text-xs text-slate-500">Belum ada notifikasi</p>
              </div>
            ) : (
              items.map((n) => {
                const { icon: Icon, box } = TYPE_STYLE[n.type] ?? TYPE_STYLE.info;
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.is_read && onMarkRead(n.id)}
                    className={`w-full flex gap-3 px-4 py-3 text-left transition hover:bg-[#0F172A]/70 ${
                      n.is_read ? "opacity-60" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${box}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-white leading-snug">{n.title}</p>
                        {!n.is_read && <span className="mt-1 w-2 h-2 shrink-0 rounded-full bg-blue-500" />}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed whitespace-pre-line break-words">
                        {n.body}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
