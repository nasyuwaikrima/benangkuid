// Sinkronisasi status "dibaca" antar komponen (lonceng Topbar <-> panel dashboard)
export const NOTIF_READ_EVENT = "benangku:notifications-read";
export type NotifReadDetail = { ids: number[] | "all" };

export function emitNotifRead(detail: NotifReadDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<NotifReadDetail>(NOTIF_READ_EVENT, { detail }));
}
