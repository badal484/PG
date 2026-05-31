import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { RoomlyLogo } from "./Header";

const columns = [
  { title: "For Tenants", links: ["Search PGs", "How booking works", "KYC help", "Rent payments"] },
  { title: "For Owners", links: ["List property", "PMS tools", "Pricing", "Owner app"] },
  { title: "Cities", links: ["Bengaluru", "Pune", "Hyderabad", "Mumbai"] },
  { title: "Company", links: ["About", "Careers", "Contact", "Trust & Safety"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_3fr] lg:px-8">
        <div>
          <RoomlyLogo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-text-secondary">Verified PGs, smarter bookings, and modern property management for India.</p>
          <div className="mt-5 flex gap-3 text-text-secondary">
            {[Instagram, Twitter, Linkedin, Facebook].map((Icon, index) => <Icon key={index} className="h-5 w-5" />)}
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold">{column.title}</h3>
              <div className="mt-4 grid gap-3">
                {column.links.map((link) => <Link key={link} className="text-sm text-text-secondary hover:text-primary" href="#">{link}</Link>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} ROOMLY Technologies Pvt Ltd.</span>
          <div className="flex gap-4"><Link href="#">Privacy</Link><Link href="#">Terms</Link><Link href="#">Refund policy</Link><span>App Store soon</span></div>
        </div>
      </div>
    </footer>
  );
}
