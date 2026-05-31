"use client";

import { useState } from "react";
import {
  AlertTriangle, BadgeCheck, Camera, CheckCircle, ChevronDown,
  Clock, Download, FileText, Send, Shield, Wifi, X, XCircle,
} from "lucide-react";
import { Badge, Button, Dialog, Select, Textarea } from "@/components/ui";
import { formatInr } from "@/lib/utils";

type VerifStatus = "PENDING" | "VISIT_SCHEDULED" | "VISIT_DONE" | "INFO_REQUESTED";

interface Property {
  id: string;
  name: string;
  owner: string;
  ownerPhone: string;
  city: string;
  locality: string;
  submittedDate: string;
  status: VerifStatus;
  beds: number;
  style: string;
  tier: string;
  videoUrl?: string;
  inspectorReport?: InspectorReport;
}

interface InspectorReport {
  inspector: string;
  visitDate: string;
  checklist: { item: string; pass: boolean; category: string }[];
  wifiSpeed: number;
  photos: string[];
  tours: string[];
  notes: string;
  score: number;
  suggestedTier: string;
}

const CHECKLIST_TEMPLATE: { item: string; category: string }[] = [
  { category: "Safety", item: "CCTV functional at entrance" },
  { category: "Safety", item: "Fire extinguisher present" },
  { category: "Safety", item: "Emergency exit clearly marked" },
  { category: "Safety", item: "Main door lock functional" },
  { category: "Cleanliness", item: "Common areas clean and maintained" },
  { category: "Cleanliness", item: "Washrooms hygienic" },
  { category: "Cleanliness", item: "Bed linen provided and clean" },
  { category: "Cleanliness", item: "Kitchen/mess area clean" },
  { category: "Room quality", item: "Mattress quality acceptable" },
  { category: "Room quality", item: "Study table and chair present" },
  { category: "Room quality", item: "Locker/wardrobe present" },
  { category: "Room quality", item: "Adequate lighting" },
  { category: "Room quality", item: "Proper ventilation / window" },
  { category: "Room quality", item: "Room door lock functional" },
  { category: "Utilities", item: "Electricity supply stable" },
  { category: "Utilities", item: "WiFi available throughout" },
  { category: "Utilities", item: "Water supply 24/7" },
  { category: "Utilities", item: "Geyser / hot water available" },
  { category: "Utilities", item: "Power backup present" },
  { category: "Utilities", item: "Laundry facility present" },
  { category: "Amenities", item: "Meals served as listed" },
  { category: "Amenities", item: "Parking available (if listed)" },
  { category: "Amenities", item: "Water purifier functional" },
  { category: "Amenities", item: "TV in common area (if listed)" },
  { category: "Compliance", item: "Owner has valid NOC/permission" },
  { category: "Compliance", item: "Police verification register maintained" },
  { category: "Compliance", item: "Fire NOC displayed" },
  { category: "Compliance", item: "Address matches property documents" },
  { category: "Compliance", item: "Owner identity verified (Aadhar)" },
  { category: "Compliance", item: "No illegal sub-letting" },
];

const SAMPLE_REPORT: InspectorReport = {
  inspector: "Suresh Babu",
  visitDate: "28 May 2025",
  checklist: CHECKLIST_TEMPLATE.map((t, i) => ({ ...t, pass: i !== 6 && i !== 21 })),
  wifiSpeed: 94,
  photos: [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=300&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=300&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&q=80",
  ],
  tours: ["Lobby walkthrough (2:14)", "Room 101 tour (1:38)", "Common area (0:55)"],
  notes: "Property is generally well-maintained. Bedlinen not provided in Room 204. Parking area listed but does not have dedicated slots — only street parking. WiFi coverage good throughout. Owner cooperative and documents complete.",
  score: 28,
  suggestedTier: "STANDARD",
};

const PROPERTIES: Property[] = [
  { id: "p1", name: "Sunshine PG for Boys", owner: "Ramesh Jain", ownerPhone: "9876543210", city: "Bangalore", locality: "Koramangala", submittedDate: "26 May 2025", status: "VISIT_DONE", beds: 32, style: "PG", tier: "STANDARD", videoUrl: "video-001.mp4", inspectorReport: SAMPLE_REPORT },
  { id: "p2", name: "Urban Stay Women's PG", owner: "Priya Hegde", ownerPhone: "9123456789", city: "Bangalore", locality: "Indiranagar", submittedDate: "27 May 2025", status: "PENDING", beds: 18, style: "PG", tier: "" },
  { id: "p3", name: "The Student Hub", owner: "Arun Kumar", ownerPhone: "9988776655", city: "Hyderabad", locality: "Madhapur", submittedDate: "28 May 2025", status: "VISIT_SCHEDULED", beds: 24, style: "COLIVING", tier: "" },
  { id: "p4", name: "Green Acres Hostel", owner: "Sunita Rao", ownerPhone: "9111222333", city: "Pune", locality: "Baner", submittedDate: "29 May 2025", status: "INFO_REQUESTED", beds: 40, style: "HOSTEL", tier: "" },
  { id: "p5", name: "City Nest Co-living", owner: "Vijay Pillai", ownerPhone: "9444555666", city: "Mumbai", locality: "Andheri", submittedDate: "30 May 2025", status: "PENDING", beds: 28, style: "COLIVING", tier: "" },
];

const STATUS_BADGE: Record<VerifStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  VISIT_SCHEDULED: "bg-blue-100 text-blue-700",
  VISIT_DONE: "bg-purple-100 text-purple-700",
  INFO_REQUESTED: "bg-slate-100 text-slate-600",
};

const STATUS_LABEL: Record<VerifStatus, string> = {
  PENDING: "Pending",
  VISIT_SCHEDULED: "Visit scheduled",
  VISIT_DONE: "Visit done",
  INFO_REQUESTED: "Info requested",
};

type ActionType = "approve" | "reject" | "visit" | "info" | null;

export default function VerificationsPage() {
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [action, setAction] = useState<ActionType>(null);
  const [tier, setTier] = useState("STANDARD");
  const [actionNotes, setActionNotes] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [done, setDone] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const pending = PROPERTIES.filter((p) => !done.includes(p.id));

  function executeAction() {
    if (!selectedProp) return;
    setDone((prev) => [...prev, selectedProp.id]);
    setSelectedProp(null);
    setAction(null);
    setActionNotes("");
  }

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  const report = selectedProp?.inspectorReport;
  const checklistByCategory = report
    ? Object.groupBy(report.checklist, (c) => c.category)
    : null;
  const passCount = report?.checklist.filter((c) => c.pass).length ?? 0;

  return (
    <div className="flex h-[calc(100vh-48px-48px)] gap-4">
      {/* ── Left: Table ── */}
      <div className="flex w-96 shrink-0 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-black text-slate-900">Verifications</h1>
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">{pending.length} pending</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-2">
            {pending.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProp(p)}
                className={`w-full rounded-xl border p-4 text-left transition hover:border-accent ${selectedProp?.id === p.id ? "border-accent bg-accent/5" : "border-slate-200 bg-white"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{p.owner} · {p.city}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.beds} beds · {p.style} · {p.submittedDate}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                {p.inspectorReport && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <BadgeCheck className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">Inspector report ready · Score: {p.inspectorReport.score}/30</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Detail panel ── */}
      {!selectedProp ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
          <div className="text-center">
            <Shield className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-400">Select a property to review</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div>
              <h2 className="font-bold text-slate-900">{selectedProp.name}</h2>
              <p className="text-xs text-slate-400">{selectedProp.locality}, {selectedProp.city} · {selectedProp.style} · {selectedProp.beds} beds</p>
            </div>
            <button onClick={() => { setSelectedProp(null); setAction(null); }}>
              <X className="h-5 w-5 text-slate-400 hover:text-slate-700" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-5 grid gap-5">
              {/* Owner info */}
              <div className="rounded-xl bg-slate-50 p-4 grid grid-cols-4 gap-4 text-sm">
                {[
                  { label: "Owner", value: selectedProp.owner },
                  { label: "Phone", value: selectedProp.ownerPhone },
                  { label: "Submitted", value: selectedProp.submittedDate },
                  { label: "Status", value: STATUS_LABEL[selectedProp.status] },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-slate-400">{f.label}</p>
                    <p className="font-semibold mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>

              {/* Video */}
              {selectedProp.videoUrl && (
                <div className="rounded-xl bg-slate-900 p-4 flex items-center gap-3">
                  <Camera className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Owner walkthrough video</p>
                    <p className="text-xs text-slate-400">{selectedProp.videoUrl}</p>
                  </div>
                  <button className="ml-auto rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20">Play</button>
                </div>
              )}

              {/* Inspector report */}
              {report && (
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800">Field Inspector's Report</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">by {report.inspector} on {report.visitDate}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${report.score >= 25 ? "bg-emerald-100 text-emerald-700" : report.score >= 20 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {passCount}/30 passed
                      </span>
                    </div>
                  </div>

                  {/* WiFi */}
                  <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                    <Wifi className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">WiFi speed: {report.wifiSpeed} Mbps</span>
                    {report.wifiSpeed >= 50
                      ? <CheckCircle className="h-4 w-4 text-emerald-500 ml-auto" />
                      : <AlertTriangle className="h-4 w-4 text-amber-500 ml-auto" />}
                  </div>

                  {/* Checklist */}
                  {checklistByCategory && Object.entries(checklistByCategory).map(([cat, items]) => {
                    if (!items) return null;
                    const catPass = items.filter((i) => i.pass).length;
                    const expanded = expandedCategories.includes(cat);
                    return (
                      <div key={cat} className="rounded-xl border border-slate-200 overflow-hidden">
                        <button
                          onClick={() => toggleCategory(cat)}
                          className="flex w-full items-center justify-between bg-slate-50 px-4 py-2.5 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">{cat}</span>
                            <span className={`text-xs font-bold ${catPass === items.length ? "text-emerald-600" : "text-amber-600"}`}>
                              {catPass}/{items.length}
                            </span>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        {expanded && (
                          <div className="divide-y divide-slate-50">
                            {items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between px-4 py-2">
                                <span className="text-sm text-slate-600">{item.item}</span>
                                {item.pass
                                  ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                                  : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Photos */}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Photos captured ({report.photos.length})</p>
                    <div className="grid grid-cols-4 gap-2">
                      {report.photos.map((src, i) => (
                        <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 360 tours */}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">360° tours</p>
                    <div className="grid gap-1.5">
                      {report.tours.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                          <Camera className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-slate-600">{t}</span>
                          <button className="ml-auto text-xs font-semibold text-accent hover:underline">View</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inspector notes */}
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Inspector notes</p>
                    <p className="text-sm text-amber-800">{report.notes}</p>
                  </div>

                  {/* Suggested tier */}
                  <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">
                      System-suggested tier: <strong>{report.suggestedTier}</strong> (score {report.score}/30)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
            {!action ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAction("approve")}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => setAction("visit")}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Clock className="h-4 w-4" /> Request visit
                </button>
                <button
                  onClick={() => setAction("info")}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Send className="h-4 w-4" /> Request info
                </button>
                <button
                  onClick={() => setAction("reject")}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {action === "approve" && (
                  <div className="flex items-end gap-3">
                    <div className="grid gap-1">
                      <label className="text-xs font-semibold text-slate-600">Assign tier</label>
                      <Select value={tier} onChange={(e) => setTier(e.target.value)} className="h-9 text-sm">
                        <option value="PREMIUM">Premium</option>
                        <option value="STANDARD">Standard</option>
                        <option value="BUDGET">Budget</option>
                      </Select>
                    </div>
                    <div className="flex-1 grid gap-1">
                      <label className="text-xs font-semibold text-slate-600">Admin notes</label>
                      <input
                        className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-accent"
                        placeholder="Optional notes..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                      />
                    </div>
                    <button onClick={executeAction} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                      Confirm approve
                    </button>
                    <button onClick={() => setAction(null)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                  </div>
                )}
                {action === "reject" && (
                  <div className="flex items-end gap-3">
                    <div className="flex-1 grid gap-1">
                      <label className="text-xs font-semibold text-slate-600">Rejection reason (sent to owner) *</label>
                      <input
                        className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-red-400"
                        placeholder="e.g. Insufficient safety measures..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                      />
                    </div>
                    <button onClick={executeAction} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                      Confirm reject
                    </button>
                    <button onClick={() => setAction(null)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                  </div>
                )}
                {action === "visit" && (
                  <div className="flex items-end gap-3">
                    <div className="grid gap-1">
                      <label className="text-xs font-semibold text-slate-600">Scheduled visit date</label>
                      <input type="date" className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-accent" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                    </div>
                    <div className="flex-1 grid gap-1">
                      <label className="text-xs font-semibold text-slate-600">Assign inspector</label>
                      <Select className="h-9 text-sm">
                        <option>Suresh Babu</option>
                        <option>Meena V.</option>
                        <option>Raj Patel</option>
                      </Select>
                    </div>
                    <button onClick={executeAction} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      Schedule visit
                    </button>
                    <button onClick={() => setAction(null)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                  </div>
                )}
                {action === "info" && (
                  <div className="flex items-end gap-3">
                    <div className="flex-1 grid gap-1">
                      <label className="text-xs font-semibold text-slate-600">Message to owner</label>
                      <input
                        className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-accent"
                        placeholder="What additional info is needed?"
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                      />
                    </div>
                    <button onClick={executeAction} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light">
                      Send request
                    </button>
                    <button onClick={() => setAction(null)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
