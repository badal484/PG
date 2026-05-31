"use client";

import { use, useState } from "react";
import { Camera, CheckCircle, ChevronDown, MessageCircle, Plus } from "lucide-react";
import { Badge, Button, Dialog, FormField, Select, Textarea } from "@/components/ui";

type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
type ComplaintPriority = "HIGH" | "MEDIUM" | "LOW";

interface Complaint {
  id: string;
  title: string;
  description: string;
  room: string;
  tenantName: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
}

const COMPLAINTS: Complaint[] = [
  {
    id: "c1",
    title: "WiFi not working in Room 201",
    description: "The WiFi has been down since yesterday morning. All residents in the room are affected.",
    room: "201",
    tenantName: "Saurabh T.",
    status: "OPEN",
    priority: "HIGH",
    category: "Connectivity",
    createdAt: "31 May, 10:30 AM",
    updatedAt: "31 May, 10:30 AM",
  },
  {
    id: "c2",
    title: "Water pressure low — Room 303 bathroom",
    description: "Low water pressure since 2 days. Shower barely works.",
    room: "303",
    tenantName: "Suresh P.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    category: "Plumbing",
    createdAt: "29 May, 8:00 AM",
    updatedAt: "30 May, 2:00 PM",
    assignedTo: "Mohan (Plumber)",
  },
  {
    id: "c3",
    title: "AC not cooling — Room 202",
    description: "AC is on but not cooling. Temperature setting at 16°C but room is still hot.",
    room: "202",
    tenantName: "Karan S.",
    status: "OPEN",
    priority: "HIGH",
    category: "Electrical",
    createdAt: "30 May, 4:00 PM",
    updatedAt: "30 May, 4:00 PM",
  },
  {
    id: "c4",
    title: "Broken chair — Room 101",
    description: "Study chair leg is broken. Need replacement.",
    room: "101",
    tenantName: "Raj Kumar",
    status: "RESOLVED",
    priority: "LOW",
    category: "Furniture",
    createdAt: "22 May, 11:00 AM",
    updatedAt: "24 May, 3:00 PM",
    resolution: "New chair provided from spare inventory.",
  },
  {
    id: "c5",
    title: "Common area TV remote missing",
    description: "TV remote in common room has been missing for 3 days.",
    room: "Common",
    tenantName: "Arjun Nair",
    status: "RESOLVED",
    priority: "LOW",
    category: "Misc",
    createdAt: "20 May, 6:00 PM",
    updatedAt: "21 May, 10:00 AM",
    resolution: "New remote purchased and installed.",
  },
];

const STATUS_STYLES: Record<ComplaintStatus, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

const PRIORITY_STYLES: Record<ComplaintPriority, string> = {
  HIGH: "text-red-600",
  MEDIUM: "text-amber-600",
  LOW: "text-slate-500",
};

const TABS: ComplaintStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];

export default function ComplaintsPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [tab, setTab] = useState<ComplaintStatus>("OPEN");
  const [resolveModal, setResolveModal] = useState<Complaint | null>(null);
  const [newModal, setNewModal] = useState(false);
  const [complaints, setComplaints] = useState(COMPLAINTS);
  const [resolution, setResolution] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = complaints.filter((c) => c.status === tab);

  function handleResolve() {
    if (!resolveModal) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === resolveModal.id
          ? { ...c, status: "RESOLVED", resolution, updatedAt: "31 May, now" }
          : c,
      ),
    );
    setResolveModal(null);
    setResolution("");
  }

  function handleMarkInProgress(id: string) {
    setComplaints((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: "IN_PROGRESS", updatedAt: "31 May, now" } : c),
    );
  }

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-black">Complaints</h1>
        <Button size="sm" onClick={() => setNewModal(true)}>
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2">
        {TABS.map((t) => {
          const count = complaints.filter((c) => c.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t ? "bg-primary text-white" : "border border-border bg-white text-text-secondary"
              }`}
            >
              {t.replace("_", " ")} <span className="opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Complaint cards */}
      <div className="grid gap-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-white py-12 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <p className="font-semibold text-text-secondary">No {tab.replace("_", " ").toLowerCase()} complaints</p>
          </div>
        )}
        {filtered.map((complaint) => (
          <div key={complaint.id} className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
            <button
              className="w-full text-left p-4"
              onClick={() => setExpanded(expanded === complaint.id ? null : complaint.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[complaint.status]}`}>
                      {complaint.status.replace("_", " ")}
                    </span>
                    <span className={`text-xs font-bold ${PRIORITY_STYLES[complaint.priority]}`}>
                      ● {complaint.priority}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-text-secondary">
                      {complaint.category}
                    </span>
                  </div>
                  <p className="font-bold leading-snug">{complaint.title}</p>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    Room {complaint.room} · {complaint.tenantName} · {complaint.createdAt}
                  </p>
                </div>
                <ChevronDown className={`h-4 w-4 shrink-0 text-text-tertiary transition ${expanded === complaint.id ? "rotate-180" : ""}`} />
              </div>
            </button>

            {expanded === complaint.id && (
              <div className="border-t border-border px-4 pb-4">
                <p className="mt-3 text-sm text-text-secondary">{complaint.description}</p>

                {complaint.assignedTo && (
                  <p className="mt-2 text-xs text-blue-600">Assigned to: {complaint.assignedTo}</p>
                )}

                {complaint.resolution && (
                  <div className="mt-3 rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs font-semibold text-emerald-700">Resolution:</p>
                    <p className="text-sm text-emerald-700">{complaint.resolution}</p>
                  </div>
                )}

                {complaint.status !== "RESOLVED" && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {complaint.status === "OPEN" && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkInProgress(complaint.id)}>
                        Mark in progress
                      </Button>
                    )}
                    <Button size="sm" onClick={() => setResolveModal(complaint)}>
                      <CheckCircle className="h-4 w-4" /> Resolve
                    </Button>
                    <button className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium">
                      <MessageCircle className="h-3 w-3" /> Contact tenant
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resolve dialog */}
      <Dialog open={!!resolveModal} title="Resolve complaint" onClose={() => setResolveModal(null)}>
        {resolveModal && (
          <div className="grid gap-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-semibold">{resolveModal.title}</p>
              <p className="text-xs text-text-secondary">Room {resolveModal.room} · {resolveModal.tenantName}</p>
            </div>
            <FormField>
              <label className="text-sm font-semibold">Resolution details</label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe what was done to resolve the issue..."
                rows={4}
              />
            </FormField>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border p-3 hover:border-primary">
              <Camera className="h-5 w-5 text-text-tertiary" />
              <span className="text-sm text-text-secondary">Attach photo (optional)</span>
              <input type="file" accept="image/*" className="sr-only" />
            </label>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setResolveModal(null)}>Cancel</Button>
              <Button onClick={handleResolve} disabled={!resolution.trim()}>
                <CheckCircle className="h-4 w-4" /> Mark resolved
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* New complaint dialog */}
      <Dialog open={newModal} title="Log new complaint" onClose={() => setNewModal(false)}>
        <div className="grid gap-4">
          <FormField>
            <label className="text-sm font-semibold">Room number</label>
            <input className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" placeholder="e.g. 201" />
          </FormField>
          <FormField>
            <label className="text-sm font-semibold">Category</label>
            <Select>
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Connectivity</option>
              <option>Furniture</option>
              <option>Pest control</option>
              <option>Misc</option>
            </Select>
          </FormField>
          <FormField>
            <label className="text-sm font-semibold">Title</label>
            <input className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" placeholder="Brief title..." />
          </FormField>
          <FormField>
            <label className="text-sm font-semibold">Description</label>
            <Textarea rows={3} placeholder="Describe the issue in detail..." />
          </FormField>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setNewModal(false)}>Cancel</Button>
            <Button onClick={() => setNewModal(false)}>Log complaint</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
