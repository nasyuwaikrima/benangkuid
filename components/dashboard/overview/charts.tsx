"use client";

import { useEffect, useId, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";

/* ---------- Formatter deterministik (aman untuk SSR/hydration) ---------- */
export const rp = (n: number) =>
  "Rp " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function rpCompact(n: number): string {
  const trim = (x: number) => x.toFixed(1).replace(/\.0$/, "").replace(".", ",");
  if (n >= 1e9) return `${trim(n / 1e9)} M`;
  if (n >= 1e6) return `${trim(n / 1e6)} jt`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} rb`;
  return String(Math.round(n));
}

/* ---------- Angka yang menghitung naik ---------- */
export function CountUp({
  value,
  format = (n: number) => String(n),
  duration = 0.9,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);

  useEffect(() => {
    if (reduce) {
      setV(value);
      return;
    }
    const controls = animate(0, value, { duration, ease: "easeOut", onUpdate: setV });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <>{format(v)}</>;
}

/* ---------- Sparkline ---------- */
export function Sparkline({ data, color, height = 36 }: { data: number[]; color: string; height?: number }) {
  const gid = useId().replace(/:/g, "");
  const W = 100, H = 32, PAD = 2;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [
    (i / Math.max(data.length - 1, 1)) * W,
    H - PAD - (v / max) * (H - PAD * 2),
  ]);
  const line = "M" + pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" L");
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${gid})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ---------- Bar chart (HTML, responsif) ---------- */
export interface BarDatum {
  label: string;
  value: number;
  current?: boolean;
  tooltip?: string;
}

export function BarChart({
  data,
  format,
  height = 200,
}: {
  data: BarDatum[];
  format: (n: number) => string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <div className="relative" style={{ height }}>
        {/* garis bantu */}
        {[0, 25, 50, 75, 100].map((p) => (
          <div
            key={p}
            className="absolute inset-x-0 border-t border-dashed border-slate-800/80"
            style={{ bottom: `${p}%` }}
          />
        ))}
        <div className="absolute inset-0 flex items-end gap-2 sm:gap-4 px-1">
          {data.map((d, i) => {
            const pct = Math.max((d.value / max) * 88, d.value > 0 ? 3 : 1);
            return (
              <div key={d.label} className="group relative flex-1 h-full flex items-end justify-center">
                <motion.div
                  className={`relative w-full max-w-[56px] rounded-t-lg transition-colors ${
                    d.current
                      ? "bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-600/20"
                      : "bg-blue-500/25 group-hover:bg-blue-500/50"
                  }`}
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 0.7, delay: 0.08 * i, ease: "easeOut" }}
                >
                  <span
                    className={`absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold transition-opacity ${
                      d.current ? "text-blue-300 opacity-100" : "text-slate-300 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {format(d.value)}
                  </span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex gap-2 sm:gap-4 px-1">
        {data.map((d) => (
          <span
            key={d.label}
            className={`flex-1 text-center text-[10px] font-medium ${d.current ? "text-blue-300" : "text-slate-500"}`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Donut chart ---------- */
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const R = 40;
  const C = 2 * Math.PI * R;
  const total = segments.reduce((a, s) => a + s.value, 0);
  let acc = 0;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#1E293B" strokeWidth="11" />
        {total > 0 &&
          segments.map((s) => {
            const len = (s.value / total) * C;
            const gap = segments.filter((x) => x.value > 0).length > 1 ? 1.5 : 0;
            const dash = Math.max(len - gap, 0);
            const offset = -acc;
            acc += len;
            if (s.value === 0) return null;
            return (
              <circle
                key={s.label}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="11"
                strokeDasharray={ready ? `${dash} ${C - dash}` : `0 ${C}`}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dasharray 0.9s ease-out" }}
              />
            );
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white leading-none">{centerValue}</span>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{centerLabel}</span>
      </div>
    </div>
  );
}

/* ---------- Horizontal bar list ---------- */
export function HBarList({
  rows,
}: {
  rows: { name: string; value: number; sub: string }[];
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3.5">
      {rows.map((r, i) => (
        <li key={r.name}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="font-medium text-slate-200 truncate">{r.name}</span>
            <span className="shrink-0 text-[11px] text-slate-400">{r.sub}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-800/80 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max((r.value / max) * 100, 4)}%` }}
              transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
