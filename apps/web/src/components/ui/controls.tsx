"use client";

import { HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, useState } from "react";
import { CalendarDays, Check, ChevronDown, Star, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Badge } from "./badge";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn("h-11 w-full appearance-none rounded-sm border border-border bg-surface px-3 pr-9 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
    </div>
  );
}

export function MultiSelect({ options, value = [], onChange }: { options: string[]; value?: string[]; onChange?: (value: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            className={cn("rounded-full border px-3 py-1.5 text-sm transition", selected ? "border-primary bg-primary text-white" : "border-border bg-surface")}
            onClick={() => onChange?.(selected ? value.filter((item) => item !== option) : [...value, option])}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={cn("h-4 w-4 rounded-xs accent-accent", className)} {...props} />;
}

export function Radio({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="radio" className={cn("h-4 w-4 accent-accent", className)} {...props} />;
}

export function Switch({ checked, onChange, label }: { checked?: boolean; onChange?: (checked: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="inline-flex items-center gap-3" onClick={() => onChange?.(!checked)}>
      <span className={cn("flex h-6 w-11 rounded-full p-1 transition", checked ? "bg-accent" : "bg-slate-300")}>
        <span className={cn("h-4 w-4 rounded-full bg-white transition", checked && "translate-x-5")} />
      </span>
      {label ? <span className="text-sm font-medium">{label}</span> : null}
    </button>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 rounded-sm border border-border bg-surface p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10", className)} {...props} />;
}

export function Dialog({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4">
      <section className="w-full max-w-lg rounded-md bg-surface shadow-lg">
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button aria-label="Close dialog" onClick={onClose}><X className="h-5 w-5" /></button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

export function Sheet({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className={cn("fixed inset-0 z-[70] transition", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div className={cn("absolute inset-0 bg-black/35 transition", open ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <aside className={cn("absolute right-0 top-0 h-full w-[min(420px,100vw)] bg-surface shadow-xl transition-transform", open ? "translate-x-0" : "translate-x-full")}>
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button aria-label="Close panel" onClick={onClose}><X className="h-5 w-5" /></button>
        </header>
        <div className="p-5">{children}</div>
      </aside>
    </div>
  );
}

export function Tabs({ tabs }: { tabs: Array<{ label: string; content: React.ReactNode }> }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab, index) => (
          <button key={tab.label} className={cn("px-4 py-3 text-sm font-semibold", active === index ? "border-b-2 border-accent text-accent" : "text-text-secondary")} onClick={() => setActive(index)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-5">{tabs[active]?.content}</div>
    </div>
  );
}

export function DropdownMenu({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)}>{label}</button>
      {open ? <div className="absolute right-0 top-full z-50 mt-3 min-w-48 rounded-sm border border-border bg-surface p-2 shadow-xl">{children}</div> : null}
    </div>
  );
}

export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xs bg-primary px-2 py-1 text-xs text-white group-hover:block">{label}</span>
    </span>
  );
}

export function Progress({ value }: { value: number }) {
  return <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} /></div>;
}

export function RatingStars({ value, onChange }: { value: number; onChange?: (value: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange?.(star)} aria-label={`${star} stars`}>
          <Star className={cn("h-5 w-5", star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange?: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>Previous</Button>
      <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
      <Button variant="outline" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>Next</Button>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return <div className="grid place-items-center rounded-sm border border-dashed border-border bg-surface p-10 text-center">{icon}<h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-2 max-w-md text-sm text-text-secondary">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div>;
}

export function DataTable({ columns, rows }: { columns: string[]; rows: Array<Record<string, React.ReactNode>> }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-text-secondary">
          <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}</tr>
        </thead>
        <tbody>{rows.map((row, index) => <tr key={index} className="border-t border-border">{columns.map((column) => <td key={column} className="px-4 py-3">{row[column]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function DatePicker(props: InputHTMLAttributes<HTMLInputElement>) {
  return <div className="relative"><input type="date" className="h-11 w-full rounded-sm border border-border bg-surface px-3 pr-10 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" {...props} /><CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" /></div>;
}

export function FileUpload({ label = "Upload file" }: { label?: string }) {
  return <label className="grid cursor-pointer place-items-center rounded-sm border border-dashed border-border bg-surface p-6 text-center hover:border-accent"><UploadCloud className="h-7 w-7 text-accent" /><span className="mt-2 text-sm font-semibold">{label}</span><span className="text-xs text-text-secondary">JPG, PNG, WEBP or PDF</span><input type="file" className="sr-only" /></label>;
}

export function MapView({ label = "Map preview" }: { label?: string }) {
  return <div className="relative min-h-64 overflow-hidden rounded-sm border border-border bg-[linear-gradient(135deg,#e2e8f0_25%,#f8fafc_25%,#f8fafc_50%,#e2e8f0_50%,#e2e8f0_75%,#f8fafc_75%)] bg-[length:32px_32px]"><Badge className="absolute left-4 top-4" variant="standard">{label}</Badge><span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-lg ring-8 ring-accent/20" /></div>;
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><h2 className="text-2xl font-bold">{title}</h2>{subtitle ? <p className="mt-2 text-text-secondary">{subtitle}</p> : null}</div>{action}</div>;
}

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return <div className="flex gap-2">{steps.map((step, index) => <div key={step} className="flex min-w-0 flex-1 items-center gap-2"><span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold", index <= current ? "bg-accent text-white" : "bg-slate-200 text-text-secondary")}>{index < current ? <Check className="h-4 w-4" /> : index + 1}</span><span className="truncate text-sm font-medium">{step}</span></div>)}</div>;
}

export function FilterChips({ items, active, onSelect }: { items: string[]; active?: string; onSelect?: (item: string) => void }) {
  return <div className="flex gap-2 overflow-x-auto pb-2">{items.map((item) => <button key={item} type="button" onClick={() => onSelect?.(item)} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", active === item ? "border-primary bg-primary text-white" : "border-border bg-surface")}>{item}</button>)}</div>;
}

export function OTPInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="flex gap-2">{Array.from({ length: 6 }).map((_, index) => <input key={index} className="h-12 w-10 rounded-sm border border-border text-center text-lg font-bold outline-none focus:border-accent focus:ring-4 focus:ring-accent/10" value={value[index] ?? ""} maxLength={1} inputMode="numeric" onChange={(event) => { const next = value.split(""); next[index] = event.target.value.replace(/\D/g, ""); onChange(next.join("").slice(0, 6)); }} />)}</div>;
}

export function FormField({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}
