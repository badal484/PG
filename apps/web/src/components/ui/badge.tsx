import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "premium" | "standard" | "budget" | "new" | "active" | "paid" | "due" | "overdue" | "neutral";

const variants: Record<BadgeVariant, string> = {
  premium: "bg-amber-100 text-amber-800",
  standard: "bg-blue-100 text-blue-800",
  budget: "bg-slate-100 text-slate-700",
  new: "bg-orange-100 text-orange-800",
  active: "bg-emerald-100 text-emerald-800",
  paid: "bg-emerald-100 text-emerald-800",
  due: "bg-amber-100 text-amber-800",
  overdue: "bg-red-100 text-red-700",
  neutral: "bg-slate-100 text-slate-700",
};

export function Badge({ className, variant = "neutral", ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", variants[variant], className)} {...props} />;
}

export function TierBadge({ tier }: { tier?: string }) {
  const normalized = tier?.toLowerCase() ?? "standard";
  const variant = normalized.includes("premium") ? "premium" : normalized.includes("budget") ? "budget" : "standard";
  const label = variant === "premium" ? "Verified Premium" : variant === "budget" ? "Verified Budget" : "Verified Standard";
  return <Badge variant={variant}>{label}</Badge>;
}
