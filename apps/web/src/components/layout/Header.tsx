"use client";

import Link from "next/link";
import { Bell, Building2, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/app/providers";
import { Avatar, Button, DropdownMenu } from "@/components/ui";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/properties", label: "Properties" },
  { href: "/cities", label: "Cities" },
  { href: "/owners", label: "For Owners" },
];

export function RoomlyLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2" aria-label="ROOMLY home">
      <span className="grid h-9 w-9 place-items-center rounded-sm bg-primary text-white"><Building2 className="h-5 w-5" /></span>
      <span className="text-xl font-black tracking-normal text-primary">ROOMLY</span>
    </Link>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, setUser } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-50 transition", scrolled ? "bg-white/95 shadow-sm backdrop-blur" : "bg-white")}>
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <RoomlyLogo />
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => <Link key={item.href} className="text-sm font-semibold text-text-secondary hover:text-primary" href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="icon" aria-label="Search"><Search className="h-5 w-5" /></Button>
          {user ? (
            <>
              <button className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {user.unreadNotifications ? <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-accent" /> : null}
              </button>
              <DropdownMenu label={<Avatar name={user.name} src={user.avatarUrl} />}>
                <div className="grid">
                  <Link className="rounded-xs px-3 py-2 text-sm hover:bg-slate-100" href="/bookings">My Bookings</Link>
                  <Link className="rounded-xs px-3 py-2 text-sm hover:bg-slate-100" href="/profile">My Profile</Link>
                  {user.role === "OWNER" ? <Link className="rounded-xs px-3 py-2 text-sm hover:bg-slate-100" href="/owner">Dashboard</Link> : null}
                  {user.role === "OWNER" ? <Link className="rounded-xs px-3 py-2 text-sm hover:bg-slate-100" href="/owner/properties">My Properties</Link> : null}
                  <button className="rounded-xs px-3 py-2 text-left text-sm text-error hover:bg-red-50" onClick={() => setUser(null)}>Logout</button>
                </div>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link className="text-sm font-semibold text-text-secondary hover:text-primary" href="/owners/onboarding">Become a Partner</Link>
              <Button size="sm">Login</Button>
            </>
          )}
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-sm border border-border md:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      </div>
      <div className={cn("fixed inset-0 z-[90] bg-white transition-transform md:hidden", open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex h-18 items-center justify-between px-4">
          <RoomlyLogo />
          <button aria-label="Close menu" onClick={() => setOpen(false)}><X className="h-6 w-6" /></button>
        </div>
        <nav className="grid gap-2 px-4 pt-6">
          {navItems.map((item) => <Link key={item.href} className="rounded-sm px-3 py-4 text-lg font-semibold hover:bg-slate-50" href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
          <Button className="mt-4">Login</Button>
          <Button variant="outline">Become a Partner</Button>
        </nav>
      </div>
    </header>
  );
}
