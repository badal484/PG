"use client";

import { use, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BedDouble, Bell, Building2, ChevronLeft, ClipboardList,
  Home, Menu, MoreHorizontal, Users, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROPERTY_META: Record<string, { name: string; locality: string }> = {
  "prop-sunrise": { name: "Sunrise Boys PG", locality: "Koramangala, Bangalore" },
  "prop-green": { name: "Green Valley PG", locality: "HSR Layout, Bangalore" },
};

function getTabNav(propertyId: string) {
  return [
    { href: `/pms/${propertyId}`, label: "Home", icon: Home, exact: true },
    { href: `/pms/${propertyId}/bedmap`, label: "Beds", icon: BedDouble },
    { href: `/pms/${propertyId}/rent`, label: "Rent", icon: ClipboardList },
    { href: `/pms/${propertyId}/complaints`, label: "Issues", icon: Bell },
    { href: `/pms/${propertyId}/tenants`, label: "More", icon: MoreHorizontal },
  ];
}

function getSideNav(propertyId: string) {
  return [
    { href: `/pms/${propertyId}`, label: "Overview", icon: Home, exact: true },
    { href: `/pms/${propertyId}/bedmap`, label: "Bed Map", icon: BedDouble },
    { href: `/pms/${propertyId}/rent`, label: "Rent", icon: ClipboardList },
    { href: `/pms/${propertyId}/tenants`, label: "Tenants", icon: Users },
    { href: `/pms/${propertyId}/complaints`, label: "Complaints", icon: Bell },
    { href: `/pms/${propertyId}/expenses`, label: "Expenses", icon: ClipboardList },
    { href: `/pms/${propertyId}/food`, label: "Food Menu", icon: Home },
    { href: `/pms/${propertyId}/staff`, label: "Staff", icon: Users },
    { href: `/pms/${propertyId}/visitors`, label: "Visitors", icon: Users },
    { href: `/pms/${propertyId}/meters`, label: "Meters", icon: Home },
    { href: `/pms/${propertyId}/assets`, label: "Assets", icon: Building2 },
  ];
}

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
  mobile,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex flex-col items-center gap-1 py-2 px-1 min-w-[56px] text-center transition",
          active ? "text-primary" : "text-text-secondary",
        )}
      >
        <Icon className={cn("h-6 w-6", active && "stroke-[2.5]")} />
        <span className="text-[10px] font-semibold leading-none">{label}</span>
      </Link>
    );
  }

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

function MobileBottomTab({
  propertyId,
  onMoreClick,
}: {
  propertyId: string;
  onMoreClick: () => void;
}) {
  const tabs = getTabNav(propertyId);
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex items-stretch justify-around border-t border-border bg-white safe-area-bottom lg:hidden">
      {tabs.map((tab) => {
        if (tab.label === "More") {
          const isMoreActive = [
            `/pms/${propertyId}/tenants`,
            `/pms/${propertyId}/expenses`,
            `/pms/${propertyId}/food`,
            `/pms/${propertyId}/staff`,
            `/pms/${propertyId}/visitors`,
            `/pms/${propertyId}/meters`,
            `/pms/${propertyId}/assets`,
          ].some((p) => pathname.startsWith(p));
          return (
            <button
              key="more"
              onClick={onMoreClick}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 min-w-[56px] text-center transition",
                isMoreActive ? "text-primary" : "text-text-secondary",
              )}
            >
              <MoreHorizontal className={cn("h-6 w-6", isMoreActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-semibold leading-none">More</span>
            </button>
          );
        }
        return (
          <NavLink key={tab.href} {...tab} mobile />
        );
      })}
    </nav>
  );
}

export default function PMSLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);
  const [moreDrawer, setMoreDrawer] = useState(false);
  const meta = PROPERTY_META[propertyId] ?? { name: "Property", locality: "" };
  const sideNav = getSideNav(propertyId);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-white lg:flex lg:flex-col">
        <div className="sticky top-0 h-screen flex flex-col overflow-y-auto">
          {/* Back to owner */}
          <div className="px-4 pt-5 pb-3">
            <Link href="/owner/properties" className="flex items-center gap-2 text-xs text-text-secondary hover:text-primary mb-4">
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to properties
            </Link>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-black text-sm text-primary truncate">{meta.name}</p>
                <p className="text-[10px] text-text-tertiary truncate">{meta.locality}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            <div className="grid gap-0.5">
              {sideNav.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          </nav>
        </div>
      </aside>

      {/* More drawer (mobile) */}
      {moreDrawer && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMoreDrawer(false)} />
          <div className="fixed bottom-16 inset-x-0 z-50 rounded-t-2xl bg-white px-4 py-5 shadow-xl lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold">More options</p>
              <button onClick={() => setMoreDrawer(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { href: `/pms/${propertyId}/tenants`, label: "Tenants", icon: Users },
                { href: `/pms/${propertyId}/expenses`, label: "Expenses", icon: ClipboardList },
                { href: `/pms/${propertyId}/food`, label: "Food Menu", icon: Home },
                { href: `/pms/${propertyId}/staff`, label: "Staff", icon: Users },
                { href: `/pms/${propertyId}/visitors`, label: "Visitors", icon: Users },
                { href: `/pms/${propertyId}/meters`, label: "Meters", icon: Building2 },
                { href: `/pms/${propertyId}/assets`, label: "Assets", icon: Building2 },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreDrawer(false)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-center hover:border-primary hover:bg-primary/5 transition"
                >
                  <item.icon className="h-6 w-6 text-primary" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-white px-4 py-3 lg:hidden">
          <Link href="/owner/properties" className="grid h-8 w-8 place-items-center rounded-lg border border-border">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-primary truncate">{meta.name}</p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <MobileBottomTab propertyId={propertyId} onMoreClick={() => setMoreDrawer(true)} />
    </div>
  );
}
