"use client";

import { Download, FileCheck, FileText } from "lucide-react";
import { Badge } from "@/components/ui";

const DOCUMENTS = [
  {
    group: "Agreements",
    items: [
      { id: "d1", name: "Rent Agreement — Dec 2024", type: "PDF", size: "245 KB", url: "#", verified: true },
    ],
  },
  {
    group: "Rent receipts",
    items: [
      { id: "r5", name: "Receipt — Apr 2025", type: "PDF", size: "42 KB", url: "#", verified: false },
      { id: "r4", name: "Receipt — Mar 2025", type: "PDF", size: "42 KB", url: "#", verified: false },
      { id: "r3", name: "Receipt — Feb 2025", type: "PDF", size: "42 KB", url: "#", verified: false },
      { id: "r2", name: "Receipt — Jan 2025", type: "PDF", size: "42 KB", url: "#", verified: false },
      { id: "r1", name: "Receipt — Dec 2024", type: "PDF", size: "42 KB", url: "#", verified: false },
    ],
  },
  {
    group: "KYC",
    items: [
      { id: "k1", name: "KYC Certificate", type: "PDF", size: "88 KB", url: "#", verified: true },
    ],
  },
];

export default function DocumentsPage() {
  return (
    <div className="grid gap-6 pb-24 lg:pb-6">
      <div>
        <h1 className="text-2xl font-black">Documents</h1>
        <p className="mt-1 text-text-secondary">All your agreements, receipts, and KYC documents in one place</p>
      </div>

      {DOCUMENTS.map(({ group, items }) => (
        <section key={group}>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-text-tertiary">{group}</p>
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            {items.map((doc, i) => (
              <a
                key={doc.id}
                href={doc.url}
                className={`flex items-center gap-4 px-4 py-3.5 transition hover:bg-slate-50 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100">
                  {doc.verified
                    ? <FileCheck className="h-5 w-5 text-success" />
                    : <FileText className="h-5 w-5 text-text-tertiary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{doc.name}</p>
                  <p className="text-xs text-text-tertiary">{doc.type} · {doc.size}</p>
                </div>
                {doc.verified && <Badge variant="active" className="text-xs shrink-0">Verified</Badge>}
                <Download className="h-4 w-4 text-text-tertiary shrink-0" />
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
