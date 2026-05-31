"use client";

import { useRef, ClipboardEvent, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
}

export function OTPInput({ value, onChange, length = 6, disabled, className }: OTPInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function focusAt(i: number) {
    refs.current[Math.min(Math.max(i, 0), length - 1)]?.focus();
  }

  function handleChange(i: number, raw: string) {
    const ch = raw.replace(/\D/g, "").slice(-1);
    const arr = [...digits];
    arr[i] = ch;
    onChange(arr.join(""));
    if (ch) focusAt(i + 1);
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const arr = [...digits];
        arr[i] = "";
        onChange(arr.join(""));
      } else {
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      focusAt(i + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted.padEnd(length, "").slice(0, length));
    focusAt(Math.min(pasted.length, length - 1));
  }

  return (
    <div className={cn("flex gap-3", className)}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-14 w-12 rounded-xl border-2 bg-white text-center text-xl font-bold outline-none transition",
            digits[i]
              ? "border-primary text-primary"
              : "border-border text-text-primary",
            "focus:border-primary focus:ring-4 focus:ring-primary/10",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
