"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2, Building2, CreditCard, LayoutDashboard,
  LogOut, Menu, Settings, TrendingUp, Users, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/properties", label: "Properties", icon: Building2 },
  { href: "/owner/finance", label: "Finance", icon: TrendingUp },
  { href: "/owner/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/owner/team", label: "Team", icon: Users },
  { href: "/owner/subscription", label: "Subscription", icon: CreditCard },
];

function NavLink({ href, label, icon: Icon, onClick }: (typeof NAV)[0] & { onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/owner/dashboard" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
        active ? "bg-primary text-white" : "text-text-secondary hover:bg-slate-100 hover:text-text-primary",
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {label}
    </Link>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-5">
        <Link href="/owner/dashboard" onClick={onClose} className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-black text-primary">ROOMLY</span>
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">OWNER</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden"><X className="h-5 w-5" /></button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-3">
        <div className="grid gap-0.5">
          {NAV.map((item) => <NavLink key={item.href} {...item} onClick={onClose} />)}
        </div>
      </nav>
      <div className="border-t border-border px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-error"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Sign out
        </Link>
      </div>
    </div>
  );
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-white lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-white shadow-xl">
            <Sidebar onClose={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/owner/dashboard" className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-black text-primary text-sm">ROOMLY OWNER</span>
          </Link>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
