"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatLabel?: (v: number) => string;
  className?: string;
}

export function RangeSlider({
  min,
  max,
  value: [low, high],
  onChange,
  step = 500,
  formatLabel = (v) => `₹${(v / 1000).toFixed(0)}k`,
  className,
}: RangeSliderProps) {
  const rangeRef = useRef<HTMLDivElement>(null);

  const pct = useCallback(
    (v: number) => ((v - min) / (max - min)) * 100,
    [min, max],
  );

  function handleLow(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(Number(e.target.value), high - step);
    onChange([v, high]);
  }

  function handleHigh(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(Number(e.target.value), low + step);
    onChange([low, v]);
  }

  useEffect(() => {
    if (!rangeRef.current) return;
    rangeRef.current.style.setProperty("--low", `${pct(low)}%`);
    rangeRef.current.style.setProperty("--high", `${pct(high)}%`);
  }, [low, high, pct]);

  return (
    <div className={cn("select-none", className)}>
      <div
        ref={rangeRef}
        className="relative h-5 [--high:80%] [--low:0%]"
        style={{ "--low": `${pct(low)}%`, "--high": `${pct(high)}%` } as React.CSSProperties}
      >
        {/* Track base */}
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-slate-200" />
        {/* Active fill */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
        />
        {/* Low thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={handleLow}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Minimum rent"
          style={{ zIndex: low > max - step ? 5 : 3 }}
        />
        {/* High thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={handleHigh}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Maximum rent"
          style={{ zIndex: 4 }}
        />
        {/* Visual low thumb */}
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-white shadow"
          style={{ left: `${pct(low)}%` }}
        />
        {/* Visual high thumb */}
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-white shadow"
          style={{ left: `${pct(high)}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-sm font-semibold">
        <span>{formatLabel(low)}</span>
        <span>{formatLabel(high)}{high === max ? "+" : ""}</span>
      </div>
    </div>
  );
}
