"use client";

import { useState } from "react";
import { Bell, CheckCircle, MessageSquare, Percent, Save, Settings, Shield } from "lucide-react";
import { Button, Dialog, Select, Switch, Textarea } from "@/components/ui";

const COMMISSION_RATES = [
  { type: "Monthly", rate: 10, gstIncluded: true },
  { type: "Long-term (3+ months)", rate: 8, gstIncluded: true },
  { type: "Weekly", rate: 15, gstIncluded: true },
  { type: "Daily", rate: 20, gstIncluded: true },
];

const TIER_THRESHOLDS = [
  { tier: "PREMIUM", minScore: 26, label: "Premium", color: "bg-amber-100 text-amber-700" },
  { tier: "STANDARD", minScore: 18, label: "Standard", color: "bg-blue-100 text-blue-700" },
  { tier: "BUDGET", minScore: 0, label: "Budget", color: "bg-slate-100 text-slate-600" },
];

const WA_TEMPLATES = [
  { id: "wt1", name: "rent_reminder", label: "Rent reminder", body: "Hi {{tenant_name}}, your rent of ₹{{amount}} for {{month}} is due. Pay now: {{payment_link}}" },
  { id: "wt2", name: "booking_confirmed", label: "Booking confirmed", body: "Your booking at {{property_name}} ({{bed_label}}) is confirmed! Check-in: {{checkin_date}}. 📋 Complete KYC here: {{kyc_link}}" },
  { id: "wt3", name: "kyc_approved", label: "KYC approved", body: "Your KYC verification is complete! You're all set to move in on {{checkin_date}}. 🎉" },
  { id: "wt4", name: "dispute_resolved", label: "Dispute resolved", body: "Your dispute {{dispute_id}} has been resolved. Refund of ₹{{amount}} will be credited in 5-7 business days." },
  { id: "wt5", name: "move_out_reminder", label: "Move-out reminder", body: "Reminder: Your move-out date is {{checkout_date}}. Inspection scheduled at {{inspection_time}}." },
];

const TABS = ["Commission", "Tier criteria", "WA templates", "Broadcasts", "Feature flags"] as const;

export default function ConfigPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("Commission");
  const [saved, setSaved] = useState(false);
  const [broadcastDialog, setBroadcastDialog] = useState(false);
  const [commission, setCommission] = useState(COMMISSION_RATES);
  const [tierThresholds, setTierThresholds] = useState(TIER_THRESHOLDS);
  const [editTemplate, setEditTemplate] = useState<typeof WA_TEMPLATES[0] | null>(null);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("ALL_TENANTS");

  const [flags, setFlags] = useState({
    referralProgram: true,
    foodMenuTenantView: true,
    compareFeature: true,
    launchPartnerDiscount: false,
    betaKycV2: false,
    autoEscrowRelease: true,
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="grid gap-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-black text-slate-900">Platform Config</h1>
        {tab !== "Broadcasts" && tab !== "WA templates" && (
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
          >
            <Save className="h-4 w-4" />
            {saved ? "Saved!" : "Save changes"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${tab === t ? "border-accent text-accent" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Commission rates */}
      {tab === "Commission" && (
        <div className="grid gap-4">
          <p className="text-sm text-slate-500">Commission charged to owners on every payment collected. GST is included in the displayed rate.</p>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Stay type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Commission rate (%)</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">GST included</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Net rate (excl. 18% GST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commission.map((row, i) => (
                  <tr key={row.type}>
                    <td className="px-5 py-3 font-medium text-slate-700">{row.type}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          className="h-8 w-20 rounded-lg border border-slate-200 px-2 text-sm font-bold text-accent outline-none focus:border-accent"
                          value={row.rate}
                          onChange={(e) =>
                            setCommission((prev) =>
                              prev.map((r, j) => j === i ? { ...r, rate: Number(e.target.value) } : r)
                            )
                          }
                        />
                        <Percent className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Switch checked={row.gstIncluded} onChange={(v) =>
                        setCommission((prev) => prev.map((r, j) => j === i ? { ...r, gstIncluded: v } : r))
                      } />
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-600">
                      {(row.rate / 1.18).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
            <p className="text-xs text-blue-700">
              <strong>Launch partner discount:</strong> Waive commission for first 3 months for new properties.
              Currently <strong>disabled</strong>.
              <button className="ml-2 font-bold underline">Enable</button>
            </p>
          </div>
        </div>
      )}

      {/* Tier criteria */}
      {tab === "Tier criteria" && (
        <div className="grid gap-4">
          <p className="text-sm text-slate-500">Inspector checklist has 30 items. Score determines property tier assignment.</p>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Tier</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Minimum score (out of 30)</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tierThresholds.map((row, i) => (
                  <tr key={row.tier}>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.color}`}>{row.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        className="h-8 w-20 rounded-lg border border-slate-200 px-2 text-sm font-bold outline-none focus:border-accent"
                        value={row.minScore}
                        onChange={(e) =>
                          setTierThresholds((prev) =>
                            prev.map((r, j) => j === i ? { ...r, minScore: Number(e.target.value) } : r)
                          )
                        }
                      />
                      {i === 0 && <span className="ml-2 text-xs text-slate-400">and above</span>}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                      {i < tierThresholds.length - 1
                        ? `${row.minScore} – ${(tierThresholds[i + 1]?.minScore ?? 30) - 1}`
                        : `0 – ${row.minScore - 1}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WA templates */}
      {tab === "WA templates" && (
        <div className="grid gap-3">
          {WA_TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-slate-800">{tpl.label}</p>
                    <span className="font-mono text-xs text-slate-400">{tpl.name}</span>
                  </div>
                  <p className="text-sm text-slate-600 font-mono bg-slate-50 rounded-lg px-3 py-2">{tpl.body}</p>
                </div>
                <button
                  onClick={() => setEditTemplate(tpl)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shrink-0"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcasts */}
      {tab === "Broadcasts" && (
        <div className="grid gap-5">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Target audience</label>
              <Select value={broadcastTarget} onChange={(e) => setBroadcastTarget(e.target.value)} className="w-64">
                <option value="ALL_TENANTS">All active tenants</option>
                <option value="ALL_OWNERS">All owners</option>
                <option value="ALL_USERS">Everyone (tenants + owners)</option>
                <option value="CITY_BANGALORE">Bangalore users</option>
                <option value="CITY_MUMBAI">Mumbai users</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Message</label>
              <Textarea
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Announcement message..."
                rows={4}
              />
              <p className="text-xs text-slate-400">{broadcastMsg.length}/500 characters</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Channels</label>
              <div className="flex gap-3">
                {["Push notification", "SMS", "In-app"].map((ch) => (
                  <label key={ch} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-accent h-4 w-4" />
                    {ch}
                  </label>
                ))}
              </div>
            </div>
            <button
              disabled={!broadcastMsg.trim()}
              onClick={() => setBroadcastDialog(true)}
              className="w-fit flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-light disabled:opacity-40"
            >
              <Bell className="h-4 w-4" /> Send broadcast
            </button>
          </div>
        </div>
      )}

      {/* Feature flags */}
      {tab === "Feature flags" && (
        <div className="grid gap-3">
          {Object.entries(flags).map(([key, value]) => {
            const labels: Record<string, { label: string; desc: string }> = {
              referralProgram: { label: "Referral program", desc: "Enable tenant referral with wallet rewards" },
              foodMenuTenantView: { label: "Food menu (tenant view)", desc: "Show food menu in tenant dashboard" },
              compareFeature: { label: "Property compare", desc: "Allow tenants to compare up to 3 properties" },
              launchPartnerDiscount: { label: "Launch partner discount", desc: "Waive commission for new properties first 3 months" },
              betaKycV2: { label: "KYC v2 (beta)", desc: "New DigiLocker-based KYC flow" },
              autoEscrowRelease: { label: "Auto escrow release", desc: "Auto-release deposit after 7 clean checkout days" },
            };
            const meta = labels[key] ?? { label: key, desc: "" };
            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4 shadow-sm">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{meta.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{meta.desc}</p>
                </div>
                <Switch
                  checked={value}
                  onChange={(v) => setFlags((prev) => ({ ...prev, [key]: v }))}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Edit template dialog */}
      <Dialog
        open={!!editTemplate}
        title={`Edit template: ${editTemplate?.label ?? ""}`}
        onClose={() => setEditTemplate(null)}
      >
        {editTemplate && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Template body</label>
              <textarea
                className="min-h-28 rounded-lg border border-slate-200 p-3 font-mono text-sm outline-none focus:border-accent"
                defaultValue={editTemplate.body}
              />
              <p className="text-xs text-slate-400">Variables: {"{{tenant_name}}"} {"{{amount}}"} {"{{property_name}}"} {"{{payment_link}}"}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditTemplate(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
              <button onClick={() => setEditTemplate(null)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Save template</button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Broadcast confirm */}
      <Dialog open={broadcastDialog} title="Confirm broadcast" onClose={() => setBroadcastDialog(false)}>
        <div className="grid gap-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-semibold text-amber-700">This will send a message to all {broadcastTarget.replace("_", " ").toLowerCase()}.</p>
            <p className="text-xs text-amber-600 mt-1">This action cannot be undone. Make sure the message is correct.</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 font-mono text-sm text-slate-700">{broadcastMsg}</div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setBroadcastDialog(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Cancel</button>
            <button onClick={() => setBroadcastDialog(false)} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white">
              <Bell className="inline h-4 w-4 mr-1.5" /> Confirm send
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
