"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig, type Variants } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  MessageCircle,
  Plus,
  Scissors,
  TrendingUp,
  Trophy,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { NotificationItem } from "@/types/database";
import {
  BarChart,
  CountUp,
  DonutChart,
  HBarList,
  Sparkline,
  rp,
  rpCompact,
} from "@/components/dashboard/overview/charts";
import UnreadNotifications from "@/components/dashboard/overview/UnreadNotifications";

/* ============================ TIPE DATA ============================ */
export interface DashboardData {
  shopName: string;
  todayLabel: string;
  periodLabel: string;
  kpi: {
    omzet: number;
    omzetGrowth: number | null;
    omzetSpark: number[];
    orders: number;
    ordersGrowth: number | null;
    ordersSpark: number[];
    activeCount: number;
    urgentCount: number;
    overdueCount: number;
    piutang: number;
    piutangCount: number;
    dp: number;
    collectedPct: number;
  };
  monthly: { label: string; omzet: number; orders: number; current: boolean }[];
  pipeline: { key: string; label: string; count: number }[];
  services: { name: string; count: number; revenue: number }[];
  deadlines: {
    id: string;
    customer: string;
    item: string;
    service: string;
    daysLeft: number;
    dateLabel: string;
    waUrl: string | null;
  }[];
  recent: {
    id: string;
    customer: string;
    item: string;
    service: string;
    status: string;
    total: number;
    sisa: number;
    createdLabel: string;
  }[];
}

interface Props {
  data: DashboardData;
  shopId: string;
  notifications: NotificationItem[];
}

/* ============================ ANIMASI ============================ */
const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className={`bg-[#161F30] border border-slate-800/90 rounded-2xl shadow-lg shadow-black/10 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({
  icon: Icon,
  title,
  subtitle,
  right,
  tone = "text-blue-400",
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  tone?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 ${tone}`} />
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white truncate">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

/* ============================ KPI ============================ */
const TONES = {
  emerald: { box: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", hex: "#34d399" },
  blue: { box: "bg-blue-500/10 border-blue-500/20 text-blue-400", hex: "#60a5fa" },
  amber: { box: "bg-amber-500/10 border-amber-500/20 text-amber-400", hex: "#fbbf24" },
  purple: { box: "bg-purple-500/10 border-purple-500/20 text-purple-400", hex: "#c084fc" },
} as const;

function GrowthBadge({ growth, hasValue }: { growth: number | null; hasValue: boolean }) {
  if (growth === null) {
    return hasValue ? (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
        Baru
      </span>
    ) : null;
  }
  if (growth === 0) {
    return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Stabil</span>;
  }
  const up = growth > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
        up
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
      }`}
    >
      <Icon className="w-3 h-3" />
      {Math.abs(growth)}%
    </span>
  );
}

function KpiCard({
  title,
  icon: Icon,
  tone,
  value,
  footer,
  badge,
  spark,
}: {
  title: string;
  icon: LucideIcon;
  tone: keyof typeof TONES;
  value: ReactNode;
  footer: ReactNode;
  badge?: ReactNode;
  spark?: number[];
}) {
  const t = TONES[tone];
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="bg-[#161F30] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-lg shadow-black/10 flex flex-col"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${t.box}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <h3 className="text-2xl font-bold text-white tracking-tight leading-none">{value}</h3>
        {badge}
      </div>
      <div className="mt-2 text-[11px] text-slate-400 min-h-[16px]">{footer}</div>
      {spark && (
        <div className="mt-3 -mx-1">
          <Sparkline data={spark} color={t.hex} />
        </div>
      )}
    </motion.div>
  );
}

/* ============================ HELPER UI ============================ */
const STATUS_STYLE: Record<string, string> = {
  antrean: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  proses: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  fitting: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  selesai: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  diambil: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const PIPELINE_COLOR: Record<string, string> = {
  antrean: "#f59e0b",
  proses: "#3b82f6",
  fitting: "#a855f7",
  selesai: "#10b981",
};

function deadlineLabel(daysLeft: number) {
  if (daysLeft < 0) return { text: `Telat ${Math.abs(daysLeft)} hari`, cls: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  if (daysLeft === 0) return { text: "Hari ini", cls: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  if (daysLeft === 1) return { text: "Besok", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
  return { text: `${daysLeft} hari lagi`, cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
}

/* ============================ KOMPONEN UTAMA ============================ */
export default function DashboardOverview({ data, shopId, notifications }: Props) {
  const { kpi } = data;
  const [metric, setMetric] = useState<"omzet" | "orders">("omzet");

  const barData = data.monthly.map((m) => ({
    label: m.label,
    value: metric === "omzet" ? m.omzet : m.orders,
    current: m.current,
  }));
  const total = barData.reduce((a, d) => a + d.value, 0);
  const avg = total / Math.max(barData.length, 1);
  const fmtMetric = metric === "omzet" ? rpCompact : (n: number) => String(n);
  const fmtMetricFull = metric === "omzet" ? rp : (n: number) => `${Math.round(n)} pesanan`;

  const pipelineTotal = data.pipeline.reduce((a, p) => a + p.count, 0);
  const noOrdersYet = data.recent.length === 0;

  return (
    <MotionConfig reducedMotion="user">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        {/* ---------- HEADER RINGKAS ---------- */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              <span className="text-slate-200 font-medium">{data.shopName}</span>
              <span className="mx-1.5 text-slate-600">•</span>
              {data.todayLabel}
            </p>
          </div>
          <Link
            href="/dashboard/tambah"
            className="self-start sm:self-auto bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            Pesanan Baru
          </Link>
        </motion.div>

        {/* ---------- PERINGATAN TERLAMBAT ---------- */}
        {kpi.overdueCount > 0 && (
          <motion.div variants={fadeUp}>
            <Link
              href="/dashboard/antrean"
              className="flex items-center gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 hover:bg-rose-500/15 transition group"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-xs text-rose-200 flex-1">
                <strong className="text-rose-300">{kpi.overdueCount} pesanan</strong> sudah melewati deadline. Segera
                cek antrean.
              </p>
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        )}

        {/* ---------- KPI ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            title="Omzet Bulan Ini"
            icon={TrendingUp}
            tone="emerald"
            value={<CountUp value={kpi.omzet} format={rp} />}
            badge={<GrowthBadge growth={kpi.omzetGrowth} hasValue={kpi.omzet > 0} />}
            footer="dibanding bulan lalu • 14 hari terakhir"
            spark={kpi.omzetSpark}
          />
          <KpiCard
            title="Pesanan Bulan Ini"
            icon={Scissors}
            tone="blue"
            value={
              <>
                <CountUp value={kpi.orders} />
                <span className="ml-1 text-xs font-normal text-slate-400">pesanan</span>
              </>
            }
            badge={<GrowthBadge growth={kpi.ordersGrowth} hasValue={kpi.orders > 0} />}
            footer="dibanding bulan lalu • 14 hari terakhir"
            spark={kpi.ordersSpark}
          />
          <KpiCard
            title="Antrean Aktif"
            icon={Clock}
            tone="amber"
            value={
              <>
                <CountUp value={kpi.activeCount} />
                <span className="ml-1 text-xs font-normal text-slate-400">pesanan</span>
              </>
            }
            footer={
              kpi.overdueCount + kpi.urgentCount > 0 ? (
                <span className="flex flex-wrap gap-x-3">
                  {kpi.overdueCount > 0 && <span className="text-rose-400 font-semibold">{kpi.overdueCount} terlambat</span>}
                  {kpi.urgentCount > 0 && <span className="text-amber-400 font-semibold">{kpi.urgentCount} deadline ≤ 7 hari</span>}
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">Semua deadline aman ✓</span>
              )
            }
          />
          <KpiCard
            title="Belum Dilunasi"
            icon={Wallet}
            tone="purple"
            value={<CountUp value={kpi.piutang} format={rp} />}
            footer={
              <div>
                <p>
                  {kpi.piutangCount} pesanan • DP bulan ini {rp(kpi.dp)}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(kpi.collectedPct, 100)}%` }}
                    transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500">{kpi.collectedPct}% omzet bulan ini sudah terbayar DP</p>
              </div>
            }
          />
        </div>

        {/* ---------- GRAFIK UTAMA + DONUT ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-5">
            <CardHeader
              icon={TrendingUp}
              title="Performa 6 Bulan Terakhir"
              subtitle={`Total ${fmtMetricFull(total)} • rata-rata ${fmtMetric(avg)}/bulan`}
              right={
                <div className="flex rounded-xl bg-[#0F172A] border border-slate-800 p-0.5 shrink-0">
                  {(["omzet", "orders"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMetric(m)}
                      className={`relative px-3 py-1.5 text-[11px] font-semibold rounded-lg transition ${
                        metric === m ? "text-white" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {metric === m && (
                        <motion.span
                          layoutId="metric-pill"
                          className="absolute inset-0 rounded-lg bg-blue-600"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative">{m === "omzet" ? "Omzet" : "Pesanan"}</span>
                    </button>
                  ))}
                </div>
              }
            />
            <div className="pt-8 pb-1">
              <BarChart key={metric} data={barData} format={fmtMetric} />
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader icon={Scissors} title="Status Pengerjaan" subtitle="Posisi semua pesanan saat ini" />
            <div className="pt-5">
              {pipelineTotal === 0 ? (
                <p className="py-10 text-center text-xs text-slate-500">Belum ada pesanan berjalan.</p>
              ) : (
                <>
                  <DonutChart
                    segments={data.pipeline.map((p) => ({
                      label: p.label,
                      value: p.count,
                      color: PIPELINE_COLOR[p.key] ?? "#64748b",
                    }))}
                    centerValue={String(pipelineTotal)}
                    centerLabel="pesanan"
                  />
                  <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {data.pipeline.map((p) => (
                      <li key={p.key} className="flex items-center gap-2 text-[11px]">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIPELINE_COLOR[p.key] }} />
                        <span className="text-slate-300 truncate">{p.label}</span>
                        <span className="ml-auto font-bold text-white">{p.count}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* ---------- NOTIFIKASI + DEADLINE + LAYANAN ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-5">
            <UnreadNotifications shopId={shopId} initial={notifications} />
          </Card>

          <Card className="p-5 flex flex-col">
            <CardHeader
              icon={CalendarClock}
              tone="text-amber-400"
              title="Deadline Terdekat"
              subtitle="Terlambat & 7 hari ke depan"
            />
            <div className="mt-3 flex-1">
              {data.deadlines.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                  <p className="mt-2 text-xs font-medium text-slate-200">Tidak ada deadline mendesak</p>
                  <p className="text-[11px] text-slate-500">Semua pengerjaan tepat waktu.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {data.deadlines.map((d) => {
                    const lbl = deadlineLabel(d.daysLeft);
                    return (
                      <li
                        key={d.id}
                        className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{d.customer}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {d.item} • {d.dateLabel}
                          </p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${lbl.cls}`}>
                          {lbl.text}
                        </span>
                        {d.waUrl && (
                          <a
                            href={d.waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Hubungi ${d.customer} via WhatsApp`}
                            className="shrink-0 p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <Link
              href="/dashboard/antrean"
              className="mt-3 w-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              Buka Antrean <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          <Card className="p-5">
            <CardHeader icon={Trophy} tone="text-cyan-400" title="Layanan Terlaris" subtitle="6 bulan terakhir" />
            <div className="pt-4">
              {data.services.length === 0 ? (
                <p className="py-10 text-center text-xs text-slate-500">Belum ada data layanan.</p>
              ) : (
                <HBarList
                  rows={data.services.map((s) => ({
                    name: s.name,
                    value: s.count,
                    sub: `${s.count}× • ${rpCompact(s.revenue)}`,
                  }))}
                />
              )}
            </div>
          </Card>
        </div>

        {/* ---------- PESANAN TERBARU ---------- */}
        <Card className="p-5">
          <CardHeader
            icon={Scissors}
            title="Pesanan Terbaru"
            subtitle="Aktivitas order terakhir"
            right={
              <Link
                href="/dashboard/antrean"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 shrink-0"
              >
                Lihat semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          {noOrdersYet ? (
            <div className="py-10 text-center">
              <p className="text-xs text-slate-400">Belum ada pesanan yang dicatat.</p>
              <Link
                href="/dashboard/tambah"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-3.5 h-3.5" /> Catat pesanan pertama
              </Link>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              <AnimatePresence>
                {data.recent.map((o, i) => (
                  <motion.li
                    key={o.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                  >
                    <Link
                      href="/dashboard/antrean"
                      className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{o.customer}</h4>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                              STATUS_STYLE[o.status] ?? STATUS_STYLE.diambil
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {o.item} • {o.service} • {o.createdLabel}
                        </p>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <span className="text-xs font-bold text-white block">{rp(o.total)}</span>
                        <span className="text-[10px] block">
                          {o.sisa <= 0 ? (
                            <span className="text-emerald-400 font-semibold">Lunas</span>
                          ) : (
                            <span className="text-slate-400">Sisa {rp(o.sisa)}</span>
                          )}
                        </span>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </Card>
      </motion.div>
    </MotionConfig>
  );
}
