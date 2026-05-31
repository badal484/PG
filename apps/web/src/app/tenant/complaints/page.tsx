"use client";

import { useState } from "react";
import { AlertCircle, Camera, ChevronDown, ChevronRight, MessageSquare, Plus } from "lucide-react";
import { Badge, Button, Dialog, EmptyState, Select, Textarea } from "@/components/ui";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

const STATUS_BADGE: Record<ComplaintStatus, { label: string; variant: "due" | "active" | "paid" | "neutral" }> = {
  OPEN: { label: "Open", variant: "due" },
  IN_PROGRESS: { label: "In progress", variant: "active" },
  RESOLVED: { label: "Resolved", variant: "paid" },
  CLOSED: { label: "Closed", variant: "neutral" },
};

const CATEGORIES = ["WiFi / Internet", "Plumbing", "Electricity", "Food quality", "Cleanliness", "Security", "Pest control", "Other"];

const MOCK_COMPLAINTS = [
  {
    id: "c1",
    title: "WiFi speed very slow in room 201",
    category: "WiFi / Internet",
    description: "The internet speed has been under 5 Mbps since last week. I need it for work calls.",
    status: "OPEN" as ComplaintStatus,
    created: "2 Jun 2025",
    timeline: [
      { date: "2 Jun 2025", actor: "You", text: "Complaint raised" },
      { date: "2 Jun 2025", actor: "System", text: "Assigned to property manager" },
    ],
  },
  {
    id: "c2",
    title: "Water heater not working in bathroom",
    category: "Plumbing",
    description: "The water heater on the 2nd floor bathroom stopped working on Sunday.",
    status: "RESOLVED" as ComplaintStatus,
    created: "15 May 2025",
    timeline: [
      { date: "15 May 2025", actor: "You", text: "Complaint raised" },
      { date: "15 May 2025", actor: "Manager", text: "Looking into this, plumber will visit tomorrow" },
      { date: "17 May 2025", actor: "Manager", text: "Heater repaired and tested. Please confirm." },
      { date: "17 May 2025", actor: "You", text: "Confirmed — working now. Thank you!" },
    ],
  },
];

function ComplaintItem({ complaint }: { complaint: typeof MOCK_COMPLAINTS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const { label, variant } = STATUS_BADGE[complaint.status];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold line-clamp-1">{complaint.title}</p>
            <Badge variant={variant} className="shrink-0 text-xs">{label}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-text-tertiary">{complaint.category} · {complaint.created}</p>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-text-tertiary" /> : <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          <p className="mt-3 text-sm text-text-secondary">{complaint.description}</p>

          {/* Timeline */}
          <div className="mt-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-tertiary">Timeline</p>
            <div className="grid gap-3">
              {complaint.timeline.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                    {i < complaint.timeline.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-xs font-semibold">{entry.actor} <span className="font-normal text-text-tertiary">· {entry.date}</span></p>
                    <p className="mt-0.5 text-sm">{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewComplaintModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
          <MessageSquare className="h-7 w-7 text-success" />
        </div>
        <p className="text-lg font-bold">Complaint raised!</p>
        <p className="mt-2 text-sm text-text-secondary">Your manager will be notified and respond within 24 hours.</p>
        <Button className="mt-5 w-full" onClick={onClose}>Done</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Category</label>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Select…</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
      </div>

      <Input
        label="Title"
        placeholder="Brief summary of the issue"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="Describe the issue in detail…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Photos (optional, up to 3)</label>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <label key={i} className="grid h-20 w-20 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border bg-slate-50 hover:border-primary">
              <Camera className="h-5 w-5 text-text-tertiary" />
              <input type="file" accept="image/*" className="sr-only" />
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">Submit complaint</Button>
    </form>
  );
}

export default function ComplaintsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const open = MOCK_COMPLAINTS.filter((c) => c.status === "OPEN" || c.status === "IN_PROGRESS");
  const resolved = MOCK_COMPLAINTS.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");

  return (
    <div className="grid gap-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Complaints</h1>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Raise complaint
        </Button>
      </div>

      {open.length > 0 && (
        <section>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-text-tertiary">Active</p>
          <div className="grid gap-3">
            {open.map((c) => <ComplaintItem key={c.id} complaint={c} />)}
          </div>
        </section>
      )}

      {resolved.length > 0 && (
        <section>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-text-tertiary">Resolved</p>
          <div className="grid gap-3">
            {resolved.map((c) => <ComplaintItem key={c.id} complaint={c} />)}
          </div>
        </section>
      )}

      {MOCK_COMPLAINTS.length === 0 && (
        <EmptyState
          icon={<AlertCircle className="h-10 w-10 text-text-tertiary" />}
          title="No complaints yet"
          description="Raise a complaint if something needs attention at your PG."
          action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Raise complaint</Button>}
        />
      )}

      <Dialog open={modalOpen} title="Raise a complaint" onClose={() => setModalOpen(false)}>
        <NewComplaintModal onClose={() => setModalOpen(false)} />
      </Dialog>
    </div>
  );
}
