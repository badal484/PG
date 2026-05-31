"use client";

import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v) => (v - min) / range);
}

// ─── LineChart ────────────────────────────────────────────────────────────────

export interface ChartDataPoint { label: string; value: number }

export function LineChart({
  data,
  height = 120,
  color = "var(--color-primary, #E8471C)",
  showDots = true,
  showLabels = false,
  className,
}: {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  showDots?: boolean;
  showLabels?: boolean;
  className?: string;
}) {
  if (data.length < 2) return null;
  const pad = { top: 8, bottom: showLabels ? 24 : 8, left: 4, right: 4 };
  const W = 400;
  const H = height;
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const normalized = normalize(data.map((d) => d.value));

  const pts = normalized.map((n, i) => ({
    x: pad.left + (i / (data.length - 1)) * cW,
    y: pad.top + (1 - n) * cH,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = [
    ...pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
    `L ${pts[pts.length - 1]!.x.toFixed(1)} ${(H - pad.bottom).toFixed(1)}`,
    `L ${pts[0]!.x.toFixed(1)} ${(H - pad.bottom).toFixed(1)}`,
    "Z",
  ].join(" ");

  const gradId = `lg-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("w-full", className)}
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} />
      ))}
      {showLabels && data.map((d, i) => (
        <text key={i} x={pts[i]!.x} y={H - 4} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>
      ))}
    </svg>
  );
}

// ─── BarChart ─────────────────────────────────────────────────────────────────

export function BarChart({
  data,
  height = 80,
  color = "var(--color-primary, #E8471C)",
  className,
}: {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("flex items-end gap-1", className)} style={{ height }}>
      {data.map(({ label, value }) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-1 min-h-full justify-end">
          <div
            className="w-full rounded-t transition-all duration-500"
            style={{ height: `${Math.max((value / max) * (height - 16), 2)}px`, backgroundColor: color, opacity: 0.8 }}
          />
          <span className="text-[9px] leading-none text-text-tertiary">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── DonutChart ───────────────────────────────────────────────────────────────

export function DonutChart({
  value,
  total,
  color = "var(--color-primary, #E8471C)",
  size = 80,
  strokeWidth = 10,
  label,
}: {
  value: number;
  total: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (value / total) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <span className="absolute text-xs font-bold" style={{ fontSize: size * 0.18 }}>{label}</span>
      )}
    </div>
  );
}
