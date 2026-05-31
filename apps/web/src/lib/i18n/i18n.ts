"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import en from "./locales/en.json";
import hi from "./locales/hi.json";

export type Locale = "en" | "hi";
export type TranslationKey = string; // deep dot-notation keys

const LOCALES: Record<Locale, Record<string, unknown>> = { en, hi };
const STORAGE_KEY = "roomly_locale";

// ── Deep key resolver ────────────────────────────────────────────────────────

function resolve(obj: Record<string, unknown>, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof value === "string" ? value : path;
}

// ── Interpolation ────────────────────────────────────────────────────────────

function interpolate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{{${k}}}`, String(v)),
    template,
  );
}

// ── Context ──────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

import React from "react";
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in LOCALES) return stored;
    const browser = navigator.language.slice(0, 2) as Locale;
    return browser in LOCALES ? browser : "en";
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = LOCALES[locale] as Record<string, unknown>;
      const raw = resolve(dict, key);
      return vars ? interpolate(raw, vars) : raw;
    },
    [locale],
  );

  return React.createElement(I18nContext.Provider, { value: { locale, setLocale, t } }, children);
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

// ── Currency formatter ───────────────────────────────────────────────────────

export interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  compact?: boolean;
}

export function formatCurrency(
  amount: number,
  { currency = "INR", locale = "en-IN", compact = false }: FormatCurrencyOptions = {},
): string {
  if (compact && amount >= 100_000) {
    const lakhs = amount / 100_000;
    return `₹${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)}L`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Currency symbol map ──────────────────────────────────────────────────────

export const CURRENCY_CONFIG: Record<string, { locale: string; currency: string }> = {
  IN: { locale: "en-IN", currency: "INR" },
  US: { locale: "en-US", currency: "USD" },
  GB: { locale: "en-GB", currency: "GBP" },
  SG: { locale: "en-SG", currency: "SGD" },
  AE: { locale: "ar-AE", currency: "AED" },
};

export function formatAmountForCountry(amount: number, countryCode = "IN"): string {
  const config = CURRENCY_CONFIG[countryCode] ?? CURRENCY_CONFIG.IN;
  return formatCurrency(amount, config);
}
