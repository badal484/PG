"use client";

import { use, useState } from "react";
import { Clock, Plus, Search, UserCheck, Users, X } from "lucide-react";
import { Badge, Button, FormField } from "@/components/ui";

interface Visitor {
  id: string;
  name: string;
  phone: string;
  meetingTenant: string;
  room: string;
  purpose: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  status: "ACTIVE" | "CHECKED_OUT";
}

const VISITORS: Visitor[] = [
  { id: "v1", name: "Manoj Kumar", phone: "9812345670", meetingTenant: "Raj Kumar", room: "101", purpose: "Personal visit", checkIn: "2:30 PM", date: "31 May", status: "ACTIVE" },
  { id: "v2", name: "Savita Devi", phone: "9712345670", meetingTenant: "Arjun Nair", room: "101", purpose: "Family visit", checkIn: "11:00 AM", checkOut: "1:00 PM", date: "31 May", status: "CHECKED_OUT" },
  { id: "v3", name: "Delivery — Swiggy", phone: "—", meetingTenant: "Nitin M.", room: "202", purpose: "Food delivery", checkIn: "1:15 PM", checkOut: "1:20 PM", date: "31 May", status: "CHECKED_OUT" },
  { id: "v4", name: "Pradeep Rao", phone: "9612345670", meetingTenant: "Deepak R.", room: "201", purpose: "Friend visit", checkIn: "6:00 PM", checkOut: "8:30 PM", date: "30 May", status: "CHECKED_OUT" },
  { id: "v5", name: "Electrician — Ramu", phone: "9512345670", meetingTenant: "—", room: "202", purpose: "AC repair", checkIn: "10:00 AM", checkOut: "12:00 PM", date: "30 May", status: "CHECKED_OUT" },
];

export default function VisitorsPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [visitors, setVisitors] = useState(VISITORS);
  const [logSheet, setLogSheet] = useState(false);
  const [tab, setTab] = useState<"TODAY" | "HISTORY">("TODAY");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    meetingTenant: "",
    room: "",
    purpose: "",
  });

  const todayActive = visitors.filter((v) => v.date === "31 May" && v.status === "ACTIVE");
  const todayAll = visitors.filter((v) => v.date === "31 May");
  const history = visitors.filter((v) => v.date !== "31 May");

  const displayList = tab === "TODAY" ? todayAll : history;
  const filtered = displayList.filter(
    (v) =>
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.room.includes(search) ||
      v.meetingTenant.toLowerCase().includes(search.toLowerCase()),
  );

  function handleLog() {
    if (!form.name) return;
    setVisitors((prev) => [
      {
        id: `v${prev.length + 1}`,
        ...form,
        checkIn: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        date: "31 May",
        status: "ACTIVE",
      },
      ...prev,
    ]);
    setLogSheet(false);
    setForm({ name: "", phone: "", meetingTenant: "", room: "", purpose: "" });
  }

  function handleCheckOut(id: string) {
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: "CHECKED_OUT",
              checkOut: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            }
          : v,
      ),
    );
  }

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black">Visitor Log</h1>
          <p className="text-sm text-text-secondary mt-0.5">{todayActive.length} currently inside</p>
        </div>
        <Button size="sm" onClick={() => setLogSheet(true)}>
          <Plus className="h-4 w-4" /> Log visitor
        </Button>
      </div>

      {/* Active visitors */}
      {todayActive.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="font-bold text-emerald-700">{todayActive.length} visitor{todayActive.length > 1 ? "s" : ""} currently inside</p>
          </div>
          <div className="grid gap-2">
            {todayActive.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3">
                <div>
                  <p className="font-semibold text-sm">{v.name}</p>
                  <p className="text-xs text-text-tertiary">
                    Room {v.room} · {v.meetingTenant} · In since {v.checkIn}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleCheckOut(v.id)}>
                  <UserCheck className="h-3.5 w-3.5" /> Check out
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["TODAY", "HISTORY"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t ? "bg-primary text-white" : "border border-border bg-white text-text-secondary"
            }`}
          >
            {t === "TODAY" ? `Today (${todayAll.length})` : `History (${history.length})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-primary"
          placeholder="Search visitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Visitor list */}
      <div className="grid gap-3">
        {filtered.map((v) => (
          <div key={v.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{v.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    v.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {v.status === "ACTIVE" ? "Inside" : "Left"}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary">
                  Visiting: {v.meetingTenant} · Room {v.room}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{v.purpose}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                  <Clock className="h-3 w-3" />
                  {v.date} · In: {v.checkIn}
                  {v.checkOut && <> · Out: {v.checkOut}</>}
                </div>
              </div>
              {v.status === "ACTIVE" && (
                <Button size="sm" variant="outline" onClick={() => handleCheckOut(v.id)}>
                  Check out
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Log visitor sheet */}
      {logSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setLogSheet(false)} />
          <div className="relative rounded-t-2xl bg-white px-4 pb-8 pt-5 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <p className="text-lg font-bold">Log visitor</p>
              <button onClick={() => setLogSheet(false)}><X className="h-5 w-5" /></button>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField>
                  <label className="text-sm font-semibold">Visitor name *</label>
                  <input
                    className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </FormField>
                <FormField>
                  <label className="text-sm font-semibold">Phone</label>
                  <input
                    className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                    placeholder="Mobile number"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField>
                  <label className="text-sm font-semibold">Meeting tenant</label>
                  <input
                    className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                    placeholder="Tenant name"
                    value={form.meetingTenant}
                    onChange={(e) => setForm((f) => ({ ...f, meetingTenant: e.target.value }))}
                  />
                </FormField>
                <FormField>
                  <label className="text-sm font-semibold">Room</label>
                  <input
                    className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                    placeholder="Room number"
                    value={form.room}
                    onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                  />
                </FormField>
              </div>
              <FormField>
                <label className="text-sm font-semibold">Purpose</label>
                <input
                  className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                  placeholder="e.g. Personal visit, Delivery"
                  value={form.purpose}
                  onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                />
              </FormField>
              <Button onClick={handleLog} disabled={!form.name}>Log check-in</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
