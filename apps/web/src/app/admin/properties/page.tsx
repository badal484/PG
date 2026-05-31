"use client";

import { useState } from "react";
import {
  BadgeCheck, Building2, ChevronDown, ChevronRight, Download,
  Eye, Flag, MapPin, MoreHorizontal, Search, SlidersHorizontal,
  Star, TrendingUp, Users, X,
} from "lucide-react";
import { Dialog } from "@/components/ui";
import { formatInr } from "@/lib/utils";

type PropStatus = "ACTIVE" | "PENDING_VERIFICATION" | "REJECTED" | "SUSPENDED" | "DRAFT";
type PropTier = "PREMIUM" | "STANDARD" | "BUDGET" | "UNTIERED";

interface Property {
  id: string;
  name: string;
  city: string;
  locality: string;
  owner: string;
  ownerPhone: string;
  ownerEmail: string;
  status: PropStatus;
  tier: PropTier;
  totalBeds: number;
  occupiedBeds: number;
  monthlyRevenue: number;
  commissionRate: number;
  inspectionScore: number | null;
  listedDate: string;
  lastInspection: string | null;
  amenities: string[];
  flagged: boolean;
  flagReason?: string;
}

const PROPERTIES: Property[] = [
  {
    id: "PRP-1001", name: "Sunrise Boys PG", city: "Bangalore", locality: "Koramangala",
    owner: "Ramesh Jain", ownerPhone: "9876543210", ownerEmail: "ramesh@jain.com",
    status: "ACTIVE", tier: "PREMIUM", totalBeds: 24, occupiedBeds: 22,
    monthlyRevenue: 163200, commissionRate: 10, inspectionScore: 27,
    listedDate: "Jan 2025", lastInspection: "15 May 2025",
    amenities: ["WiFi", "AC", "Laundry", "Meals", "CCTV", "Gym"],
    flagged: false,
  },
  {
    id: "PRP-1002", name: "Green Valley PG", city: "Bangalore", locality: "Indiranagar",
    owner: "Priya Hegde", ownerPhone: "9123456789", ownerEmail: "priya.hegde@gmail.com",
    status: "ACTIVE", tier: "STANDARD", totalBeds: 18, occupiedBeds: 14,
    monthlyRevenue: 102000, commissionRate: 10, inspectionScore: 21,
    listedDate: "Feb 2025", lastInspection: "20 Apr 2025",
    amenities: ["WiFi", "AC", "Meals", "CCTV"],
    flagged: false,
  },
  {
    id: "PRP-1003", name: "City Nest", city: "Mumbai", locality: "Andheri West",
    owner: "Arun Kumar", ownerPhone: "9444555666", ownerEmail: "arun@citynest.in",
    status: "ACTIVE", tier: "STANDARD", totalBeds: 30, occupiedBeds: 22,
    monthlyRevenue: 85000, commissionRate: 10, inspectionScore: 20,
    listedDate: "Dec 2024", lastInspection: "01 May 2025",
    amenities: ["WiFi", "AC", "Laundry", "Meals"],
    flagged: true, flagReason: "Multiple tenant complaints about food quality in May",
  },
  {
    id: "PRP-1004", name: "Urban Nest PG", city: "Hyderabad", locality: "Gachibowli",
    owner: "Sunitha Reddy", ownerPhone: "9000111222", ownerEmail: "sunitha@urbannest.com",
    status: "ACTIVE", tier: "PREMIUM", totalBeds: 20, occupiedBeds: 19,
    monthlyRevenue: 142000, commissionRate: 10, inspectionScore: 26,
    listedDate: "Nov 2024", lastInspection: "10 May 2025",
    amenities: ["WiFi", "AC", "Gym", "Meals", "CCTV", "RO Water"],
    flagged: false,
  },
  {
    id: "PRP-1005", name: "Sunshine PG", city: "Bangalore", locality: "HSR Layout",
    owner: "Rajesh Kumar", ownerPhone: "9777888999", ownerEmail: "rajesh@gmail.com",
    status: "PENDING_VERIFICATION", tier: "UNTIERED", totalBeds: 16, occupiedBeds: 0,
    monthlyRevenue: 0, commissionRate: 10, inspectionScore: null,
    listedDate: "28 May 2025", lastInspection: null,
    amenities: ["WiFi", "AC", "Meals"],
    flagged: false,
  },
  {
    id: "PRP-1006", name: "Bloom Stay", city: "Chennai", locality: "Anna Nagar",
    owner: "Meera Iyer", ownerPhone: "9888777666", ownerEmail: "meera.iyer@gmail.com",
    status: "ACTIVE", tier: "BUDGET", totalBeds: 12, occupiedBeds: 9,
    monthlyRevenue: 36000, commissionRate: 10, inspectionScore: 14,
    listedDate: "Mar 2025", lastInspection: "05 Apr 2025",
    amenities: ["WiFi", "Meals"],
    flagged: false,
  },
  {
    id: "PRP-1007", name: "Tiger Den PG", city: "Pune", locality: "Wakad",
    owner: "Vikram Patil", ownerPhone: "9555444333", ownerEmail: "vikram@tigerden.in",
    status: "SUSPENDED", tier: "STANDARD", totalBeds: 14, occupiedBeds: 8,
    monthlyRevenue: 0, commissionRate: 10, inspectionScore: 18,
    listedDate: "Jan 2025", lastInspection: "01 Apr 2025",
    amenities: ["WiFi", "AC"],
    flagged: true, flagReason: "Owner unresponsive. Multiple rent collection failures.",
  },
  {
    id: "PRP-1008", name: "Haven Co-living", city: "Bangalore", locality: "Whitefield",
    owner: "Deepak Shetty", ownerPhone: "9222333444", ownerEmail: "deepak@haven.co",
    status: "DRAFT", tier: "UNTIERED", totalBeds: 40, occupiedBeds: 0,
    monthlyRevenue: 0, commissionRate: 10, inspectionScore: null,
    listedDate: "—", lastInspection: null,
    amenities: ["WiFi", "AC", "Gym", "Meals", "Coworking"],
    flagged: false,
  },
];

const STATUS_STYLE: Record<PropStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PENDING_VERIFICATION: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
  SUSPENDED: "bg-red-100 text-red-700",
  DRAFT: "bg-slate-100 text-slate-500",
};

const TIER_STYLE: Record<PropTier, string> = {
  PREMIUM: "bg-amber-100 text-amber-700",
  STANDARD: "bg-blue-100 text-blue-700",
  BUDGET: "bg-slate-100 text-slate-600",
  UNTIERED: "bg-gray-100 text-gray-500",
};

const CITIES = ["All cities", "Bangalore", "Mumbai", "Hyderabad", "Pune", "Chennai"];
const STATUSES: Array<"" | PropStatus> = ["", "ACTIVE", "PENDING_VERIFICATION", "SUSPENDED", "DRAFT"];
const TIERS: Array<"" | PropTier> = ["", "PREMIUM", "STANDARD", "BUDGET", "UNTIERED"];

export default function AdminPropertiesPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All cities");
  const [status, setStatus] = useState<"" | PropStatus>("");
  const [tier, setTier] = useState<"" | PropTier>("");
  const [selected, setSelected] = useState<Property | null>(null);
  const [flagDialog, setFlagDialog] = useState<Property | null>(null);
  const [suspendDialog, setSuspendDialog] = useState<Property | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = PROPERTIES.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.owner.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
    const matchCity = city === "All cities" || p.city === city;
    const matchStatus = !status || p.status === status;
    const matchTier = !tier || p.tier === tier;
    return matchSearch && matchCity && matchStatus && matchTier;
  });

  const totalActive = PROPERTIES.filter((p) => p.status === "ACTIVE").length;
  const totalPending = PROPERTIES.filter((p) => p.status === "PENDING_VERIFICATION").length;
  const totalBeds = PROPERTIES.filter((p) => p.status === "ACTIVE").reduce((s, p) => s + p.totalBeds, 0);
  const totalGMV = PROPERTIES.filter((p) => p.status === "ACTIVE").reduce((s, p) => s + p.monthlyRevenue, 0);

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-black text-slate-900">Properties</h1>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active properties", value: totalActive, color: "text-emerald-600", sub: `${totalPending} pending verification` },
          { label: "Total beds", value: totalBeds.toString(), color: "text-primary", sub: "across active properties" },
          { label: "Monthly GMV", value: formatInr(totalGMV), color: "text-purple-600", sub: "rent collected" },
          { label: "Flagged", value: PROPERTIES.filter((p) => p.flagged).length.toString(), color: "text-red-600", sub: "require attention" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm outline-none focus:border-accent"
            placeholder="Search by name, owner, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${showFilters ? "border-accent text-accent bg-accent/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-accent"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-accent"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="">All statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-accent"
            value={tier}
            onChange={(e) => setTier(e.target.value as typeof tier)}
          >
            <option value="">All tiers</option>
            {TIERS.filter(Boolean).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {(city !== "All cities" || status || tier) && (
            <button
              onClick={() => { setCity("All cities"); setStatus(""); setTier(""); }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Property", "Owner", "City", "Tier", "Beds", "Occupancy", "Revenue", "Status", "Score", "Actions"].map((col) => (
                <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((p) => {
              const occ = p.totalBeds > 0 ? Math.round((p.occupiedBeds / p.totalBeds) * 100) : 0;
              return (
                <tr key={p.id} className={`hover:bg-slate-50 cursor-pointer ${selected?.id === p.id ? "bg-accent/5" : ""}`} onClick={() => setSelected(selected?.id === p.id ? null : p)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.flagged && <Flag className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700">{p.owner}</p>
                    <p className="text-xs text-slate-400">{p.ownerPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700">{p.city}</p>
                    <p className="text-xs text-slate-400">{p.locality}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TIER_STYLE[p.tier]}`}>{p.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{p.totalBeds}</td>
                  <td className="px-4 py-3">
                    {p.status === "ACTIVE" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${occ >= 80 ? "bg-emerald-500" : occ >= 60 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${occ}%` }} />
                        </div>
                        <span className="text-xs font-bold">{occ}%</span>
                      </div>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">{p.monthlyRevenue > 0 ? formatInr(p.monthlyRevenue) : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[p.status]}`}>{p.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.inspectionScore !== null ? (
                      <span className="flex items-center gap-1 text-xs font-bold">
                        <Star className="h-3 w-3 text-amber-400" />
                        {p.inspectionScore}/30
                      </span>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">No properties match your filters.</div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-slate-400" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900">{selected.name}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TIER_STYLE[selected.tier]}`}>{selected.tier}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[selected.status]}`}>{selected.status.replace("_", " ")}</span>
                  {selected.flagged && <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700"><Flag className="h-2.5 w-2.5" /> Flagged</span>}
                </div>
                <p className="text-xs text-slate-400">{selected.id} · {selected.locality}, {selected.city}</p>
              </div>
            </div>
            <button onClick={() => setSelected(null)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="p-5 grid gap-5">
            {selected.flagReason && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-xs font-bold text-red-700 mb-1">Flag reason</p>
                <p className="text-sm text-red-700">{selected.flagReason}</p>
              </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-4 gap-4 rounded-xl bg-slate-50 p-4">
              {[
                { label: "Owner", value: selected.owner },
                { label: "Phone", value: selected.ownerPhone },
                { label: "Email", value: selected.ownerEmail },
                { label: "Listed", value: selected.listedDate },
                { label: "Total beds", value: selected.totalBeds.toString() },
                { label: "Occupied beds", value: selected.occupiedBeds.toString() },
                { label: "Last inspection", value: selected.lastInspection ?? "Not inspected" },
                { label: "Inspection score", value: selected.inspectionScore !== null ? `${selected.inspectionScore}/30` : "N/A" },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-slate-400">{f.label}</p>
                  <p className="text-sm font-semibold mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs text-emerald-600 font-semibold mb-1">Monthly revenue</p>
                <p className="text-2xl font-black text-emerald-700">{selected.monthlyRevenue > 0 ? formatInr(selected.monthlyRevenue) : "—"}</p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <p className="text-xs text-purple-600 font-semibold mb-1">Commission earned</p>
                <p className="text-2xl font-black text-purple-700">{selected.monthlyRevenue > 0 ? formatInr(Math.round(selected.monthlyRevenue * selected.commissionRate / 100)) : "—"}</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs text-blue-600 font-semibold mb-1">Occupancy</p>
                <p className="text-2xl font-black text-blue-700">
                  {selected.totalBeds > 0 ? `${Math.round((selected.occupiedBeds / selected.totalBeds) * 100)}%` : "—"}
                </p>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {selected.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{a}</span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mr-1">Actions:</p>
              <a
                href={`/admin/verifications`}
                className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                <BadgeCheck className="h-3.5 w-3.5" /> View inspection
              </a>
              <button
                onClick={() => setFlagDialog(selected)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
              >
                <Flag className="h-3.5 w-3.5" /> {selected.flagged ? "Unflag" : "Flag"}
              </button>
              {selected.status === "ACTIVE" && (
                <button
                  onClick={() => setSuspendDialog(selected)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  <X className="h-3.5 w-3.5" /> Suspend
                </button>
              )}
              {selected.status === "SUSPENDED" && (
                <button className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                  <BadgeCheck className="h-3.5 w-3.5" /> Reactivate
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Flag dialog */}
      <Dialog open={!!flagDialog} title={flagDialog?.flagged ? "Remove flag" : "Flag property"} onClose={() => setFlagDialog(null)}>
        <div className="grid gap-4">
          <p className="text-sm text-slate-600">{flagDialog?.flagged ? "Remove the flag from" : "Flag"} <strong>{flagDialog?.name}</strong> for admin attention?</p>
          {!flagDialog?.flagged && (
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Reason</label>
              <textarea className="min-h-20 rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-accent" placeholder="Describe the issue..." />
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button onClick={() => setFlagDialog(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Cancel</button>
            <button onClick={() => setFlagDialog(null)} className={`rounded-lg px-4 py-2 text-sm font-bold text-white ${flagDialog?.flagged ? "bg-emerald-600" : "bg-amber-600"}`}>
              {flagDialog?.flagged ? "Remove flag" : "Submit flag"}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Suspend dialog */}
      <Dialog open={!!suspendDialog} title="Suspend property" onClose={() => setSuspendDialog(null)}>
        <div className="grid gap-4">
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-semibold text-red-700">Suspending <strong>{suspendDialog?.name}</strong> will hide it from search and block new bookings.</p>
            <p className="text-xs text-red-600 mt-1">Existing tenants are not affected. This action can be reversed.</p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Reason for suspension</label>
            <textarea className="min-h-20 rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-accent" placeholder="Document the reason..." />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setSuspendDialog(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Cancel</button>
            <button onClick={() => setSuspendDialog(null)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white">Suspend property</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
