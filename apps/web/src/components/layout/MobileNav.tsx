"use client";

import Link from "next/link";
import { BedDouble, Home, Search, User } from "lucide-react";
import { useUser } from "@/app/providers";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/bookings", label: "Bookings", icon: BedDouble },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const { user } = useUser();
  if (!user || user.role !== "TENANT") return null;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-border bg-white md:hidden">
      {tabs.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="grid place-items-center gap-1 py-2 text-xs font-medium text-text-secondary">
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
