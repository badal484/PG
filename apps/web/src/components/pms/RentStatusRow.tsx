import { Avatar, Badge, Button } from "@/components/ui";
import { formatInr } from "@/lib/utils";

export function RentStatusRow({ tenantName, tenantPhoto, bedNumber, status, amount, daysOverdue }: { tenantName: string; tenantPhoto?: string; bedNumber: string; status: "Paid" | "Due" | "Overdue"; amount: number; daysOverdue?: number }) {
  const variant = status === "Paid" ? "paid" : status === "Overdue" ? "overdue" : "due";
  return (
    <div className="grid gap-4 rounded-sm border border-border bg-surface p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div className="flex items-center gap-3"><Avatar name={tenantName} src={tenantPhoto} /><div><p className="font-semibold">{tenantName}</p><p className="text-sm text-text-secondary">Bed {bedNumber}</p></div></div>
      <div className="flex items-center gap-3"><Badge variant={variant}>{status}</Badge><span className="font-bold">{formatInr(amount)}</span>{daysOverdue ? <span className="text-sm font-semibold text-error">{daysOverdue} days overdue</span> : null}</div>
      <div className="flex gap-2"><Button variant="outline" size="sm">Send reminder</Button><Button size="sm">Mark paid</Button></div>
    </div>
  );
}
