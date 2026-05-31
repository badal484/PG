"use client";

import Link from "next/link";
import { ArrowUpRight, BedDouble, Building2, MoreVertical, Plus, Settings } from "lucide-react";
import { Badge, Button, EmptyState } from "@/components/ui";
import { DonutChart } from "@/components/charts/SparkChart";
import { formatInr } from "@/lib/utils";

const PROPERTIES = [
  {
    id: "prop-sunrise",
    name: "Sunrise Boys PG",
    locality: "Koramangala, Bangalore",
    tier: "PREMIUM",
    status: "ACTIVE",
    totalBeds: 24,
    occupiedBeds: 20,
    monthlyRent: formatInr(163200),
    pendingRent: formatInr(20400),
    openComplaints: 2,
    photo: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80",
    establishedYear: 2016,
  },
  {
    id: "prop-green",
    name: "Green Valley PG",
    locality: "HSR Layout, Bangalore",
    tier: "STANDARD",
    status: "ACTIVE",
    totalBeds: 16,
    occupiedBeds: 12,
    monthlyRent: formatInr(102000),
    pendingRent: formatInr(8500),
    openComplaints: 2,
    photo: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80",
    establishedYear: 2019,
  },
];

export default function PropertiesPage() {
  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Properties</h1>
          <p className="mt-1 text-sm text-text-secondary">{PROPERTIES.length} properties · 40 total beds</p>
        </div>
        <Link href="/owner/properties/new">
          <Button><Plus className="h-4 w-4" /> Add property</Button>
        </Link>
      </div>

      {/* Property cards */}
      {PROPERTIES.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-10 w-10 text-text-tertiary" />}
          title="No properties yet"
          description="Add your first property to start managing tenants and collecting rent."
          action={<Link href="/owner/properties/new"><Button><Plus className="h-4 w-4" /> Add property</Button></Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {PROPERTIES.map((p) => {
            const occupancy = Math.round((p.occupiedBeds / p.totalBeds) * 100);
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                <div className="relative h-36 overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photo} alt={p.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <Badge variant={p.tier === "PREMIUM" ? "premium" : "standard"} className="text-xs">{p.tier}</Badge>
                  </div>
                  <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="mt-0.5 text-xs text-text-secondary">{p.locality}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <DonutChart value={p.occupiedBeds} total={p.totalBeds} size={52} strokeWidth={7} label={`${occupancy}%`} />
                    <div className="text-right">
                      <p className="text-xs text-text-tertiary">Rent collected</p>
                      <p className="font-bold text-primary">{p.monthlyRent}</p>
                      {parseFloat(p.pendingRent.replace(/[^0-9]/g, "")) > 0 && (
                        <p className="text-xs text-amber-600">{p.pendingRent} pending</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-slate-50 py-2">
                      <p className="font-bold text-primary">{p.occupiedBeds}/{p.totalBeds}</p>
                      <p className="text-text-tertiary">Beds</p>
                    </div>
                    <div className={`rounded-lg py-2 ${p.openComplaints > 0 ? "bg-amber-50" : "bg-slate-50"}`}>
                      <p className={`font-bold ${p.openComplaints > 0 ? "text-amber-600" : "text-primary"}`}>{p.openComplaints}</p>
                      <p className="text-text-tertiary">Complaints</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 py-2">
                      <p className="font-bold text-primary">{p.establishedYear}</p>
                      <p className="text-text-tertiary">Since</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/pms/${p.id}`} className="flex-1">
                      <Button size="sm" className="w-full">Manage <ArrowUpRight className="h-3.5 w-3.5" /></Button>
                    </Link>
                    <Link href={`/owner/properties/${p.id}/setup`}>
                      <Button size="sm" variant="outline" className="px-2.5"><Settings className="h-4 w-4" /></Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add property card */}
          <Link href="/owner/properties/new" className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border transition hover:border-primary hover:bg-primary/5">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10">
              <Plus className="h-7 w-7 text-primary" />
            </div>
            <p className="font-semibold text-primary">Add new property</p>
            <p className="text-xs text-text-secondary">Free listing · Gets verified in 5-7 days</p>
          </Link>
        </div>
      )}
    </div>
  );
}
