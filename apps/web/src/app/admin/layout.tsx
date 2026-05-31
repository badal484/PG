"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle, BarChart2, Bell, BookOpen, Building2,
  ChevronRight, CreditCard, FileText, Gavel, LayoutDashboard,
  Lock, LogOut, Search, Settings, Shield, Users, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/verifications", label: "Verifications", icon: Shield, badge: 7 },
  { href: "/admin/disputes", label: "Disputes", icon: Gavel, badge: 4 },
  { href: "/admin/escrow", label: "Escrow", icon: Lock },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/config", label: "Config", icon: Settings },
  { href: "/admin/audit-log", label: "Audit Log", icon: FileText },
];

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  badge,
}: (typeof NAV)[0]) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-accent/10 text-accent"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="min-w-[20px] rounded-full bg-accent px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return (
    <nav className="flex items-center gap-1 text-xs text-slate-400">
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
        return (
          <span key={href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 opacity-40" />}
            {isLast ? (
              <span className="font-semibold text-slate-200">{label}</span>
            ) : (
              <Link href={href} className="hover:text-slate-200 transition">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col bg-[#0f1117] border-r border-white/5">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-4">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-accent">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white leading-none">ROOMLY</p>
            <p className="text-[10px] font-bold text-accent leading-none mt-0.5">ADMIN</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="grid gap-0.5">
            {NAV.map((item) => <NavItem key={item.href} {...item} />)}
          </div>
        </nav>

        {/* User info */}
        <div className="border-t border-white/5 px-3 py-3">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/20 text-xs font-bold text-accent">
              SA
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">Super Admin</p>
              <p className="text-[10px] text-slate-500 truncate">admin@roomly.in</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-white/5 hover:text-slate-300 transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="ml-56 flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
          <Breadcrumbs />
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                className="h-8 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/10"
                placeholder="Search anything..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="relative grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
              <Bell className="h-4 w-4 text-slate-500" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
            </button>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-xs font-bold text-accent">
              SA
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
