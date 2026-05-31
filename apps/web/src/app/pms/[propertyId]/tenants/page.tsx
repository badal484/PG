"use client";

import { use, useState } from "react";
import Link from "next/link";
import { MessageCircle, Phone, Plus, Search, UserPlus } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { Avatar } from "@/components/ui";
import { formatInr } from "@/lib/utils";

interface Tenant {
  id: string;
  name: string;
  phone: string;
  room: string;
  bed: string;
  since: string;
  rent: number;
  rentStatus: "PAID" | "DUE" | "OVERDUE";
  noticePeriod?: boolean;
  kycVerified: boolean;
}

const TENANTS: Tenant[] = [
  { id: "tn1", name: "Raj Kumar", phone: "9876543210", room: "101", bed: "A", since: "Jan 2025", rent: 7500, rentStatus: "PAID", kycVerified: true },
  { id: "tn2", name: "Arjun Nair", phone: "9123456789", room: "101", bed: "B", since: "Mar 2025", rent: 7500, rentStatus: "OVERDUE", kycVerified: true },
  { id: "tn3", name: "Vinod S.", phone: "9988776655", room: "102", bed: "A", since: "Feb 2025", rent: 9500, rentStatus: "PAID", kycVerified: true },
  { id: "tn4", name: "Saurabh T.", phone: "9111222333", room: "201", bed: "A", since: "Dec 2024", rent: 6500, rentStatus: "DUE", kycVerified: false },
  { id: "tn5", name: "Deepak R.", phone: "9444555666", room: "201", bed: "B", since: "Nov 2024", rent: 6500, rentStatus: "PAID", kycVerified: true },
  { id: "tn6", name: "Karan S.", phone: "9777888999", room: "202", bed: "A", since: "Apr 2025", rent: 9500, rentStatus: "PAID", kycVerified: true },
  { id: "tn7", name: "Nitin M.", phone: "9000111222", room: "202", bed: "B", since: "Jan 2025", rent: 9500, rentStatus: "OVERDUE", kycVerified: true },
  { id: "tn8", name: "Rahul M.", phone: "9555666777", room: "301", bed: "A", since: "May 2025", rent: 14000, rentStatus: "PAID", kycVerified: true },
  { id: "tn9", name: "Amit V.", phone: "9333444555", room: "303", bed: "A", since: "Mar 2025", rent: 11000, rentStatus: "PAID", kycVerified: true },
  { id: "tn10", name: "Suresh P.", phone: "9222333444", room: "303", bed: "B", since: "Feb 2025", rent: 11000, rentStatus: "DUE", noticePeriod: true, kycVerified: true },
];

const RENT_STYLE = {
  PAID: "bg-emerald-100 text-emerald-700",
  DUE: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default function TenantsPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "OVERDUE" | "NOTICE">("ALL");

  const filtered = TENANTS.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.room.includes(search) || t.phone.includes(search);
    const matchFilter =
      filter === "ALL" ||
      (filter === "OVERDUE" && t.rentStatus === "OVERDUE") ||
      (filter === "NOTICE" && t.noticePeriod);
    return matchSearch && matchFilter;
  });

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black">Tenants</h1>
          <p className="text-sm text-text-secondary mt-0.5">{TENANTS.length} active tenants</p>
        </div>
        <Link href={`/pms/${propertyId}/tenants/new`}>
          <Button size="sm">
            <UserPlus className="h-4 w-4" /> Add
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          className="h-11 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-primary"
          placeholder="Search by name, room, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["ALL", "OVERDUE", "NOTICE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === f ? "bg-primary text-white" : "border border-border bg-white text-text-secondary"
            }`}
          >
            {f === "ALL" ? `All (${TENANTS.length})` : f === "OVERDUE" ? `Overdue (${TENANTS.filter((t) => t.rentStatus === "OVERDUE").length})` : `Notice (${TENANTS.filter((t) => t.noticePeriod).length})`}
          </button>
        ))}
      </div>

      {/* Tenant list */}
      <div className="grid gap-3">
        {filtered.map((tenant) => (
          <div key={tenant.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Avatar name={tenant.name} className="h-10 w-10 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold">{tenant.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${RENT_STYLE[tenant.rentStatus]}`}>
                    {tenant.rentStatus}
                  </span>
                  {tenant.noticePeriod && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Moving out</span>
                  )}
                  {!tenant.kycVerified && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">KYC pending</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  Room {tenant.room} · Bed {tenant.bed} · Since {tenant.since}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-text-secondary">{formatInr(tenant.rent)}/month</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={`tel:${tenant.phone}`}>
                  <button className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:bg-slate-50">
                    <Phone className="h-4 w-4" />
                  </button>
                </a>
                <a href={`https://wa.me/91${tenant.phone}`} target="_blank" rel="noopener noreferrer">
                  <button className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:bg-slate-50">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
