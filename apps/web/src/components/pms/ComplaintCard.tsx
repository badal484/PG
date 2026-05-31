import { CircleAlert, Clock } from "lucide-react";
import { Badge, Button } from "@/components/ui";

export function ComplaintCard({ category, roomNumber, tenantName, description, timeAgo, status }: { category: string; roomNumber: string; tenantName: string; description: string; timeAgo: string; status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED" }) {
  return (
    <article className="rounded-sm border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="flex items-center gap-2 font-bold"><CircleAlert className="h-5 w-5 text-accent" />{category}</p><p className="mt-1 text-sm text-text-secondary">Room {roomNumber} • {tenantName}</p></div>
        <Badge variant={status === "RESOLVED" ? "active" : status === "ESCALATED" ? "overdue" : "due"}>{status.replace("_", " ")}</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{description}</p>
      <div className="mt-4 flex items-center justify-between gap-3"><span className="flex items-center gap-1 text-xs text-text-tertiary"><Clock className="h-4 w-4" />{timeAgo}</span><div className="flex gap-2"><Button variant="outline" size="sm">Assign</Button><Button variant="secondary" size="sm">In Progress</Button><Button size="sm">Resolve</Button></div></div>
    </article>
  );
}
