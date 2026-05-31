"use client";

import Link from "next/link";
import { Bell, Building2, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/providers";
import { Avatar, Button, DropdownMenu } from "@/components/ui";
import { clearTokens } from "@/lib/api/api-client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/search", label: "Find PGs" },
  { href: "/cities", label: "Cities" },
  { href: "/owners", label: "For Owners" },
];

function dashboardLink(role: string) {
  if (role === "OWNER") return "/owner/dashboard";
  if (role === "MANAGER" || role === "WARDEN") return "/pms";
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "/admin";
  return "/tenant";
}

export function RoomlyLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2" aria-label="ROOMLY home">
      <span className="grid h-9 w-9 place-items-center rounded-sm bg-primary text-white">
        <Building2 className="h-5 w-5" />
      </span>
      <span className="text-xl font-black tracking-normal text-primary">ROOMLY</span>
    </Link>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    clearTokens();
    setUser(null);
    router.push("/");
  }

  return (
    <header className={cn("sticky top-0 z-50 transition", scrolled ? "bg-white/95 shadow-sm backdrop-blur" : "bg-white")}>
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <RoomlyLogo />

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} className="text-sm font-semibold text-text-secondary hover:text-primary" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/search" aria-label="Search properties">
            <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
          </Link>

          {user ? (
            <>
              <button
                className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {user.unreadNotifications > 0 && (
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                )}
              </button>

              <DropdownMenu label={<Avatar name={user.name || user.phone} src={user.avatarUrl} className="h-9 w-9" />}>
                <div className="grid min-w-[180px] py-1">
                  <Link className="px-4 py-2 text-sm hover:bg-slate-100" href={dashboardLink(user.role)}>
                    Dashboard
                  </Link>
                  {user.role === "TENANT" && (
                    <>
                      <Link className="px-4 py-2 text-sm hover:bg-slate-100" href="/tenant/bookings">My Bookings</Link>
                      <Link className="px-4 py-2 text-sm hover:bg-slate-100" href="/tenant/profile">My Profile</Link>
                    </>
                  )}
                  {user.role === "OWNER" && (
                    <>
                      <Link className="px-4 py-2 text-sm hover:bg-slate-100" href="/owner/properties">My Properties</Link>
                      <Link className="px-4 py-2 text-sm hover:bg-slate-100" href="/owner/finance">Finance</Link>
                    </>
                  )}
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    className="px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/owners/onboarding" className="text-sm font-semibold text-text-secondary hover:text-primary">
                Become a Partner
              </Link>
              <Link href="/auth/login">
                <Button size="sm">Login</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="grid h-10 w-10 place-items-center rounded-sm border border-border md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-[90] bg-white transition-transform md:hidden", open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex h-18 items-center justify-between px-4">
          <RoomlyLogo />
          <button aria-label="Close menu" onClick={() => setOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="grid gap-2 px-4 pt-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="rounded-sm px-3 py-4 text-lg font-semibold hover:bg-slate-50"
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <Link href={dashboardLink(user.role)} className="block rounded-sm px-3 py-3 text-base font-semibold hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <button
                  className="w-full rounded-sm px-3 py-3 text-left text-base font-semibold text-red-600 hover:bg-red-50"
                  onClick={() => { handleLogout(); setOpen(false); }}
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)}>
                <Button className="mt-4 w-full">Login</Button>
              </Link>
              <Link href="/owners/onboarding" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">Become a Partner</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
