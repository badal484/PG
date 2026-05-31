"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, BookOpen, CreditCard, FileText, Home, LogOut,
  MessageSquare, Settings, Star, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/tenant", label: "Overview", icon: Home, exact: true },
  { href: "/tenant/bookings", label: "My Bookings", icon: BookOpen },
  { href: "/tenant/complaints", label: "Complaints", icon: MessageSquare },
  { href: "/tenant/documents", label: "Documents", icon: FileText },
  { href: "/tenant/refer", label: "Refer &amp; Earn", icon: Users },
  { href: "/tenant/profile", label: "Profile", icon: Settings },
];

const MOBILE_NAV = [
  { href: "/tenant", icon: Home, label: "Home", exact: true },
  { href: "/tenant/bookings", icon: BookOpen, label: "Bookings" },
  { href: "/tenant/complaints", icon: MessageSquare, label: "Issues" },
  { href: "/tenant/documents", icon: FileText, label: "Docs" },
  { href: "/tenant/profile", icon: Settings, label: "Profile" },
];

function MobileTabItem({ href, icon: Icon, label, exact }: (typeof MOBILE_NAV)[0]) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "grid place-items-center gap-1 py-2 text-[10px] font-medium",
        active ? "text-primary" : "text-text-secondary",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

function MobileTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border bg-white md:hidden">
      {MOBILE_NAV.map((item) => <MobileTabItem key={item.href} {...item} />)}
    </nav>
  );
}

function NavItem({ href, label, icon: Icon, exact }: (typeof NAV)[0]) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-primary text-white"
          : "text-text-secondary hover:bg-slate-100 hover:text-text-primary",
      )}
    >
      <Icon className="h-4.5 w-4.5 shrink-0 h-[18px] w-[18px]" />
      <span dangerouslySetInnerHTML={{ __html: label }} />
    </Link>
  );
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl gap-0 px-4 py-6 sm:px-6 lg:gap-8 lg:px-8">
      {/* Sidebar — desktop */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-24">
          <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-text-tertiary">
            Tenant Portal
          </p>
          <nav className="grid gap-0.5">
            {NAV.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
          <div className="mt-6 border-t border-border pt-4">
            <Link
              href="/auth/login"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-red-50 hover:text-error"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              Sign out
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">{children}</main>

      <MobileTabBar />
    </div>
  );
}
