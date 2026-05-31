"use client";

import { use, useState } from "react";
import { Mail, Phone, Plus, ShieldCheck, UserPlus } from "lucide-react";
import { Badge, Button, Dialog, FormField, Select } from "@/components/ui";
import { Avatar } from "@/components/ui";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  shift: "MORNING" | "AFTERNOON" | "NIGHT" | "FULL_DAY";
  salary: number;
  joinedDate: string;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
}

const STAFF_DATA: StaffMember[] = [
  { id: "s1", name: "Ramesh Kumar", role: "Warden", phone: "9876543210", shift: "FULL_DAY", salary: 22000, joinedDate: "Jan 2023", status: "ACTIVE" },
  { id: "s2", name: "Lakshmi Devi", role: "Housekeeper", phone: "9123456789", shift: "MORNING", salary: 12000, joinedDate: "Mar 2023", status: "ACTIVE" },
  { id: "s3", name: "Ravi Kumar", role: "Security Guard", phone: "9988776655", shift: "NIGHT", salary: 15000, joinedDate: "Jun 2023", status: "ACTIVE" },
  { id: "s4", name: "Suresh M.", role: "Cook", phone: "9111222333", shift: "FULL_DAY", salary: 18000, joinedDate: "Sep 2023", status: "ACTIVE" },
  { id: "s5", name: "Priya R.", role: "Maintenance", phone: "9444555666", shift: "MORNING", salary: 14000, joinedDate: "Dec 2023", status: "ON_LEAVE" },
];

const SHIFT_LABELS = {
  MORNING: "Morning (6AM–2PM)",
  AFTERNOON: "Afternoon (2PM–10PM)",
  NIGHT: "Night (10PM–6AM)",
  FULL_DAY: "Full day",
};

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  ON_LEAVE: "bg-amber-100 text-amber-700",
  INACTIVE: "bg-slate-100 text-slate-600",
};

export default function StaffPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [staff, setStaff] = useState(STAFF_DATA);
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", phone: "", shift: "FULL_DAY" as StaffMember["shift"], salary: "" });

  const totalSalary = staff.filter((s) => s.status === "ACTIVE").reduce((sum, s) => sum + s.salary, 0);

  function handleAdd() {
    if (!form.name || !form.role) return;
    setStaff((prev) => [
      ...prev,
      {
        id: `s${prev.length + 1}`,
        name: form.name,
        role: form.role,
        phone: form.phone,
        shift: form.shift,
        salary: Number(form.salary) || 0,
        joinedDate: "May 2025",
        status: "ACTIVE",
      },
    ]);
    setAddDialog(false);
    setForm({ name: "", role: "", phone: "", shift: "FULL_DAY", salary: "" });
  }

  return (
    <div className="grid gap-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black">Staff</h1>
          <p className="text-sm text-text-secondary mt-0.5">{staff.filter((s) => s.status === "ACTIVE").length} active · Monthly payroll: ₹{totalSalary.toLocaleString("en-IN")}</p>
        </div>
        <Button size="sm" onClick={() => setAddDialog(true)}>
          <UserPlus className="h-4 w-4" /> Add staff
        </Button>
      </div>

      {/* Payroll summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total staff", value: staff.length },
          { label: "Active", value: staff.filter((s) => s.status === "ACTIVE").length },
          { label: "On leave", value: staff.filter((s) => s.status === "ON_LEAVE").length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-black text-primary">{s.value}</p>
            <p className="text-xs text-text-tertiary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Staff list */}
      <div className="grid gap-3">
        {staff.map((member) => (
          <div key={member.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Avatar name={member.name} className="h-11 w-11 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold">{member.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLES[member.status]}`}>
                    {member.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-text-secondary">{member.role}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {SHIFT_LABELS[member.shift]} · Since {member.joinedDate}
                </p>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-text-secondary">
                  <a href={`tel:${member.phone}`} className="flex items-center gap-1 hover:text-primary">
                    <Phone className="h-3.5 w-3.5" /> {member.phone}
                  </a>
                  <span className="font-semibold text-text-primary">₹{member.salary.toLocaleString("en-IN")}/mo</span>
                </div>
              </div>
              <div className="flex gap-2">
                {member.status === "ACTIVE" && (
                  <button
                    className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                    onClick={() =>
                      setStaff((prev) =>
                        prev.map((s) => s.id === member.id ? { ...s, status: "ON_LEAVE" } : s)
                      )
                    }
                  >
                    Mark leave
                  </button>
                )}
                {member.status === "ON_LEAVE" && (
                  <button
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                    onClick={() =>
                      setStaff((prev) =>
                        prev.map((s) => s.id === member.id ? { ...s, status: "ACTIVE" } : s)
                      )
                    }
                  >
                    Mark active
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add staff dialog */}
      <Dialog open={addDialog} title="Add staff member" onClose={() => setAddDialog(false)}>
        <div className="grid gap-4">
          <FormField>
            <label className="text-sm font-semibold">Full name *</label>
            <input
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
              placeholder="Staff member's name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField>
              <label className="text-sm font-semibold">Role *</label>
              <input
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                placeholder="e.g. Warden, Cook"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Phone</label>
              <input
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField>
              <label className="text-sm font-semibold">Shift</label>
              <Select value={form.shift} onChange={(e) => setForm((f) => ({ ...f, shift: e.target.value as StaffMember["shift"] }))}>
                {Object.entries(SHIFT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Monthly salary (₹)</label>
              <input
                type="number"
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                placeholder="e.g. 15000"
                value={form.salary}
                onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add staff member</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
