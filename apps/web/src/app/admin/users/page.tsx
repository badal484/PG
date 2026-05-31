"use client";

import { useState } from "react";
import {
  BadgeCheck, Bell, BookOpen, CreditCard, FileText,
  MessageSquare, Search, Shield, ShieldOff, X,
} from "lucide-react";
import { Avatar } from "@/components/ui";
import { Badge, Dialog } from "@/components/ui";
import { formatInr } from "@/lib/utils";

type UserRole = "TENANT" | "OWNER" | "MANAGER";
type UserStatus = "ACTIVE" | "SUSPENDED" | "FLAGGED";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joined: string;
  city: string;
  kycVerified: boolean;
  bookingCount: number;
  totalSpend: number;
  notes?: string;
  recentActivity: string[];
}

const USERS: User[] = [
  { id: "USR-1001", name: "Rahul Mehta", phone: "9876543210", email: "rahul@gmail.com", role: "TENANT", status: "ACTIVE", joined: "Jan 2025", city: "Bangalore", kycVerified: true, bookingCount: 2, totalSpend: 56000, recentActivity: ["Paid May rent BK-4421", "Renewed booking", "Submitted review"] },
  { id: "USR-1002", name: "Priya Kumar", phone: "9123456789", email: "priya@gmail.com", role: "TENANT", status: "ACTIVE", joined: "Mar 2025", city: "Bangalore", kycVerified: true, bookingCount: 1, totalSpend: 19000, recentActivity: ["Completed KYC", "Booked Green Valley PG"] },
  { id: "USR-1003", name: "Vikram Nair", phone: "9444555666", email: "vikram@yahoo.com", role: "TENANT", status: "FLAGGED", joined: "Apr 2025", city: "Mumbai", kycVerified: true, bookingCount: 1, totalSpend: 12000, notes: "Dispute D-2204 open. Possible fraud — check evidence.", recentActivity: ["Opened dispute D-2204", "Disputed deposit refund"] },
  { id: "USR-1004", name: "Ramesh Jain", phone: "9876543210", email: "ramesh@jain.com", role: "OWNER", status: "ACTIVE", joined: "Dec 2022", city: "Bangalore", kycVerified: true, bookingCount: 0, totalSpend: 0, recentActivity: ["Submitted Sunshine PG for verification", "Collected May rent", "Replied to dispute"] },
  { id: "USR-1005", name: "Kiran Joshi", phone: "9000111222", email: "kiran@gmail.com", role: "TENANT", status: "SUSPENDED", joined: "Apr 2025", city: "Bangalore", kycVerified: false, bookingCount: 1, totalSpend: 0, notes: "KYC failed — suspicious documents. Suspended pending verification.", recentActivity: ["KYC verification failed", "Booking BK-4399 cancelled"] },
  { id: "USR-1006", name: "Sunita Rao", phone: "9777888999", email: "sunita@gmail.com", role: "TENANT", status: "ACTIVE", joined: "Feb 2025", city: "Hyderabad", kycVerified: true, bookingCount: 3, totalSpend: 45000, recentActivity: ["Opened dispute D-2198", "Paid April rent", "Submitted AC complaint"] },
];

const STATUS_STYLE: Record<UserStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  SUSPENDED: "bg-red-100 text-red-700",
  FLAGGED: "bg-amber-100 text-amber-700",
};

const ROLE_STYLE: Record<UserRole, string> = {
  TENANT: "bg-blue-100 text-blue-700",
  OWNER: "bg-purple-100 text-purple-700",
  MANAGER: "bg-slate-100 text-slate-600",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [addNoteDialog, setAddNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [notifDialog, setNotifDialog] = useState(false);
  const [notifText, setNotifText] = useState("");
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>(
    Object.fromEntries(USERS.map((u) => [u.id, u.status])),
  );

  const filtered = USERS.filter((u) => {
    if (!search) return true;
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.includes(search)
    );
  });

  function toggleSuspend(userId: string) {
    setUserStatuses((prev) => ({
      ...prev,
      [userId]: prev[userId] === "SUSPENDED" ? "ACTIVE" : "SUSPENDED",
    }));
  }

  function saveNote() {
    setAddNoteDialog(false);
    setNoteText("");
  }

  return (
    <div className="flex h-[calc(100vh-48px-48px)] gap-4">
      {/* ── Left: List ── */}
      <div className="flex w-80 shrink-0 flex-col gap-3">
        <h1 className="text-base font-black text-slate-900">Users</h1>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm outline-none focus:border-accent"
            placeholder="Search name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto grid gap-2 content-start">
          {filtered.map((u) => {
            const status = userStatuses[u.id] ?? u.status;
            return (
              <button
                key={u.id}
                onClick={() => setSelected(u)}
                className={`w-full rounded-xl border p-3 text-left transition hover:border-accent ${selected?.id === u.id ? "border-accent bg-accent/5" : "border-slate-200 bg-white"}`}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={u.name} className="h-9 w-9 shrink-0 text-xs" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${STATUS_STYLE[status]}`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{u.phone} · {u.role}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Profile ── */}
      {!selected ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
          <p className="text-sm text-slate-400">Select a user to view profile</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div className="flex items-center gap-3">
              <Avatar name={selected.name} className="h-10 w-10" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900">{selected.name}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ROLE_STYLE[selected.role]}`}>{selected.role}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[userStatuses[selected.id] ?? selected.status]}`}>
                    {userStatuses[selected.id] ?? selected.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{selected.id} · {selected.email}</p>
              </div>
            </div>
            <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-slate-400" /></button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-5 grid gap-5">
              {/* Info grid */}
              <div className="grid grid-cols-4 gap-4 rounded-xl bg-slate-50 p-4">
                {[
                  { label: "Phone", value: selected.phone },
                  { label: "City", value: selected.city },
                  { label: "Joined", value: selected.joined },
                  { label: "KYC", value: selected.kycVerified ? "Verified ✓" : "Pending" },
                  { label: "Bookings", value: selected.bookingCount.toString() },
                  { label: "Total spend", value: selected.totalSpend > 0 ? formatInr(selected.totalSpend) : "—" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-slate-400">{f.label}</p>
                    <p className="text-sm font-semibold mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>

              {/* Flagged note */}
              {(selected.notes || (userStatuses[selected.id] ?? selected.status) === "FLAGGED") && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-bold text-amber-700 mb-1">Admin notes</p>
                  <p className="text-sm text-amber-800">{selected.notes ?? "No notes yet."}</p>
                </div>
              )}

              {/* Recent activity */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Recent activity</p>
                <div className="grid gap-1.5">
                  {selected.recentActivity.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex items-center gap-2">
            <p className="text-xs font-semibold text-slate-500 mr-1">Actions:</p>
            <button
              onClick={() => toggleSuspend(selected.id)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                (userStatuses[selected.id] ?? selected.status) === "SUSPENDED"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              {(userStatuses[selected.id] ?? selected.status) === "SUSPENDED"
                ? <><Shield className="h-3.5 w-3.5" /> Unsuspend</>
                : <><ShieldOff className="h-3.5 w-3.5" /> Suspend</>}
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
              <BadgeCheck className="h-3.5 w-3.5" /> Verify manually
            </button>
            <button
              onClick={() => setNotifDialog(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <Bell className="h-3.5 w-3.5" /> Send notification
            </button>
            <button
              onClick={() => setAddNoteDialog(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Add note
            </button>
          </div>
        </div>
      )}

      {/* Note dialog */}
      <Dialog open={addNoteDialog} title="Add admin note" onClose={() => setAddNoteDialog(false)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Note</label>
            <textarea
              className="min-h-24 rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-accent"
              placeholder="Internal note visible only to admins..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setAddNoteDialog(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
            <button onClick={saveNote} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Save note</button>
          </div>
        </div>
      </Dialog>

      {/* Notification dialog */}
      <Dialog open={notifDialog} title="Send notification" onClose={() => setNotifDialog(false)}>
        <div className="grid gap-4">
          <p className="text-sm text-slate-500">Send push + SMS to <strong>{selected?.name}</strong></p>
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Message</label>
            <textarea
              className="min-h-20 rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-accent"
              placeholder="Type your message..."
              value={notifText}
              onChange={(e) => setNotifText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setNotifDialog(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
            <button onClick={() => setNotifDialog(false)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Send</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
