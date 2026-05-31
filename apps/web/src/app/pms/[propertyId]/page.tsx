"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowUpRight, BedDouble, Bell, ClipboardList, DollarSign,
  TrendingDown, TrendingUp, Users, UtensilsCrossed, Wrench, Zap,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { DonutChart } from "@/components/charts/SparkChart";
import { formatInr } from "@/lib/utils";

const PROPERTY_DATA: Record<string, {
  name: string;
  totalBeds: number;
  occupiedBeds: number;
  pendingRent: number;
  pendingCount: number;
  openComplaints: number;
  monthlyRevenue: number;
  recentActivity: Array<{ id: string; text: string; time: string; icon: React.ElementType; color: string }>;
}> = {
  "prop-sunrise": {
    name: "Sunrise Boys PG",
    totalBeds: 24,
    occupiedBeds: 20,
    pendingRent: 20400,
    pendingCount: 3,
    openComplaints: 2,
    monthlyRevenue: 163200,
    recentActivity: [
      { id: "a1", text: "Karan S. paid ₹10,200 May rent", time: "2h ago", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
      { id: "a2", text: "New complaint: WiFi down — Room 201", time: "5h ago", icon: Bell, color: "bg-amber-50 text-amber-600" },
      { id: "a3", text: "Rahul M. booked Bed A · Room 301", time: "1d ago", icon: BedDouble, color: "bg-blue-50 text-blue-600" },
      { id: "a4", text: "Priya K. move-out notice submitted", time: "2d ago", icon: TrendingDown, color: "bg-red-50 text-red-600" },
    ],
  },
  "prop-green": {
    name: "Green Valley PG",
    totalBeds: 16,
    occupiedBeds: 12,
    pendingRent: 8500,
    pendingCount: 2,
    openComplaints: 2,
    monthlyRevenue: 102000,
    recentActivity: [
      { id: "a1", text: "Amit V. paid ₹9,500 May rent", time: "3h ago", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
      { id: "a2", text: "Water issue — Block B reported", time: "8h ago", icon: Bell, color: "bg-amber-50 text-amber-600" },
    ],
  },
};

const QUICK_ACTIONS = [
  { label: "Add tenant", href: "tenants/new", icon: Users, color: "bg-blue-50 text-blue-600" },
  { label: "Bed map", href: "bedmap", icon: BedDouble, color: "bg-primary/10 text-primary" },
  { label: "Collect rent", href: "rent", icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
  { label: "Complaints", href: "complaints", icon: Bell, color: "bg-amber-50 text-amber-600" },
  { label: "Log expense", href: "expenses", icon: ClipboardList, color: "bg-purple-50 text-purple-600" },
  { label: "Food menu", href: "food", icon: UtensilsCrossed, color: "bg-orange-50 text-orange-600" },
  { label: "Meters", href: "meters", icon: Zap, color: "bg-cyan-50 text-cyan-600" },
  { label: "Visitors", href: "visitors", icon: Users, color: "bg-slate-100 text-slate-600" },
];

export default function PMSOverviewPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const data = PROPERTY_DATA[propertyId] ?? PROPERTY_DATA["prop-sunrise"]!;
  const occupancy = Math.round((data.occupiedBeds / data.totalBeds) * 100);

  return (
    <div className="grid gap-5">
      {/* Today's snapshot */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Today's snapshot</p>
            <p className="mt-1 text-lg font-black">{data.name}</p>
            <p className="text-sm text-text-secondary">Sunday, 31 May 2025</p>
          </div>
          <DonutChart value={data.occupiedBeds} total={data.totalBeds} size={64} strokeWidth={8} label={`${occupancy}%`} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xl font-black text-primary">{data.occupiedBeds}/{data.totalBeds}</p>
            <p className="mt-0.5 text-xs text-text-tertiary">Beds occupied</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${data.pendingCount > 0 ? "bg-amber-50" : "bg-slate-50"}`}>
            <p className={`text-xl font-black ${data.pendingCount > 0 ? "text-amber-600" : "text-primary"}`}>{data.pendingCount}</p>
            <p className="mt-0.5 text-xs text-text-tertiary">Rent pending</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${data.openComplaints > 0 ? "bg-red-50" : "bg-slate-50"}`}>
            <p className={`text-xl font-black ${data.openComplaints > 0 ? "text-red-600" : "text-primary"}`}>{data.openComplaints}</p>
            <p className="mt-0.5 text-xs text-text-tertiary">Open issues</p>
          </div>
        </div>

        {data.pendingCount > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-amber-700">{formatInr(data.pendingRent)} pending</p>
              <p className="text-xs text-amber-600">{data.pendingCount} tenants haven't paid this month</p>
            </div>
            <Link href={`/pms/${propertyId}/rent`}>
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                Collect <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-sm font-bold text-text-secondary">Quick actions</p>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={`/pms/${propertyId}/${action.href}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white py-4 px-2 text-center shadow-sm transition hover:border-primary hover:shadow-md active:scale-95"
            >
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Revenue card */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">This month's revenue</p>
            <p className="mt-1 text-3xl font-black text-primary">{formatInr(data.monthlyRevenue)}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" /> +8%
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-primary" style={{ width: "76%" }} />
        </div>
        <p className="mt-1.5 text-xs text-text-tertiary">76% of monthly target collected</p>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="font-bold mb-4">Recent activity</p>
        <div className="grid gap-4">
          {data.recentActivity.map(({ id, text, time, icon: Icon, color }) => (
            <div key={id} className="flex items-start gap-3">
              <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${color.split(" ")[0]}`}>
                <Icon className={`h-4 w-4 ${color.split(" ")[1]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{text}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">{time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
