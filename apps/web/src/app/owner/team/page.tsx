"use client";

import { useState } from "react";
import { Mail, MoreVertical, Phone, Plus, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { Badge, Button, Dialog, FormField, Select } from "@/components/ui";
import { Avatar } from "@/components/ui";

type Role = "MANAGER" | "WARDEN" | "ACCOUNTANT" | "MAINTENANCE";

const ROLE_META: Record<Role, { label: string; color: string; perms: string[] }> = {
  MANAGER: {
    label: "Manager",
    color: "bg-blue-100 text-blue-700",
    perms: ["Full PMS access", "Add/remove tenants", "Mark rent", "View reports"],
  },
  WARDEN: {
    label: "Warden",
    color: "bg-emerald-100 text-emerald-700",
    perms: ["Bed map view", "Log visitors", "Log complaints", "No financial access"],
  },
  ACCOUNTANT: {
    label: "Accountant",
    color: "bg-purple-100 text-purple-700",
    perms: ["Finance view", "Export reports", "Log expenses", "No tenant management"],
  },
  MAINTENANCE: {
    label: "Maintenance",
    color: "bg-amber-100 text-amber-700",
    perms: ["View complaints only", "Update complaint status", "No rent/financial access"],
  },
};

const STAFF = [
  {
    id: "s1",
    name: "Ramesh Kumar",
    role: "MANAGER" as Role,
    phone: "9876543210",
    email: "ramesh@gmail.com",
    property: "Sunrise Boys PG",
    joinedDate: "Jan 2023",
    status: "ACTIVE",
  },
  {
    id: "s2",
    name: "Sita Devi",
    role: "WARDEN" as Role,
    phone: "9123456789",
    email: "sita@gmail.com",
    property: "Sunrise Boys PG",
    joinedDate: "Mar 2023",
    status: "ACTIVE",
  },
  {
    id: "s3",
    name: "Pradeep Verma",
    role: "ACCOUNTANT" as Role,
    phone: "9988776655",
    email: "pradeep@gmail.com",
    property: "All properties",
    joinedDate: "Jun 2023",
    status: "ACTIVE",
  },
  {
    id: "s4",
    name: "Mohan Singh",
    role: "MAINTENANCE" as Role,
    phone: "9911223344",
    email: "mohan@gmail.com",
    property: "Green Valley PG",
    joinedDate: "Sep 2024",
    status: "ACTIVE",
  },
];

export default function TeamPage() {
  const [staff, setStaff] = useState(STAFF);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", phone: "", email: "", role: "WARDEN" as Role, property: "" });

  function handleInvite() {
    if (!form.name || !form.phone) return;
    setStaff((prev) => [
      ...prev,
      {
        id: `s${prev.length + 1}`,
        name: form.name,
        role: form.role,
        phone: form.phone,
        email: form.email,
        property: form.property || "All properties",
        joinedDate: "May 2025",
        status: "ACTIVE",
      },
    ]);
    setInviteDialog(false);
    setForm({ name: "", phone: "", email: "", role: "WARDEN", property: "" });
  }

  function handleRemove(id: string) {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    setActiveMenu(null);
  }

  return (
    <div className="grid gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Team</h1>
          <p className="mt-1 text-sm text-text-secondary">{staff.length} staff members across your properties</p>
        </div>
        <Button onClick={() => setInviteDialog(true)}>
          <UserPlus className="h-4 w-4" /> Invite staff
        </Button>
      </div>

      {/* Role legend */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([role, meta]) => (
          <div key={role} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${meta.color}`}>{meta.label}</span>
            </div>
            <ul className="grid gap-1">
              {meta.perms.map((p) => (
                <li key={p} className="text-xs text-text-secondary">· {p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Staff list */}
      <div className="grid gap-4">
        {staff.map((member) => (
          <div key={member.id} className="relative rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <Avatar name={member.name} className="h-11 w-11 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold">{member.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ROLE_META[member.role].color}`}>
                    {ROLE_META[member.role].label}
                  </span>
                  <Badge variant="active" className="text-xs">Active</Badge>
                </div>
                <p className="mt-0.5 text-xs text-text-tertiary">{member.property} · Since {member.joinedDate}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-secondary">
                  <a href={`tel:${member.phone}`} className="flex items-center gap-1 hover:text-primary">
                    <Phone className="h-3.5 w-3.5" /> {member.phone}
                  </a>
                  <a href={`mailto:${member.email}`} className="flex items-center gap-1 hover:text-primary">
                    <Mail className="h-3.5 w-3.5" /> {member.email}
                  </a>
                </div>
              </div>
              <button
                className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-slate-50"
                onClick={() => setActiveMenu(activeMenu === member.id ? null : member.id)}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Dropdown menu */}
            {activeMenu === member.id && (
              <div className="absolute right-4 top-12 z-10 min-w-40 rounded-xl border border-border bg-white p-1 shadow-xl">
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
                  Change role
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
                  Change property
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => handleRemove(member.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Invite staff dialog */}
      <Dialog open={inviteDialog} title="Invite new staff member" onClose={() => setInviteDialog(false)}>
        <div className="grid gap-4">
          <FormField>
            <label className="text-sm font-semibold">Full name</label>
            <input
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="e.g. Ramesh Kumar"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField>
              <label className="text-sm font-semibold">Phone number</label>
              <input
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Email (optional)</label>
              <input
                type="email"
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField>
              <label className="text-sm font-semibold">Role</label>
              <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}>
                {Object.entries(ROLE_META).map(([r, meta]) => (
                  <option key={r} value={r}>{meta.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Assign to property</label>
              <Select value={form.property} onChange={(e) => setForm((f) => ({ ...f, property: e.target.value }))}>
                <option value="">All properties</option>
                <option>Sunrise Boys PG</option>
                <option>Green Valley PG</option>
              </Select>
            </FormField>
          </div>

          {form.role && (
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold text-text-secondary mb-1">Permissions for {ROLE_META[form.role].label}:</p>
              <ul className="grid gap-0.5">
                {ROLE_META[form.role].perms.map((p) => (
                  <li key={p} className="text-xs text-text-tertiary">· {p}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-text-tertiary">
            An SMS invite will be sent to the phone number. Staff can log in using their mobile number.
          </p>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setInviteDialog(false)}>Cancel</Button>
            <Button onClick={handleInvite}>
              <UserPlus className="h-4 w-4" /> Send invite
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
