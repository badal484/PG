"use client";

import { useMemo, useState } from "react";
import { Badge, FilterChips, Sheet } from "@/components/ui";
import { cn } from "@/lib/utils";

type Bed = { id: string; label: string; status: "vacant" | "occupied" | "reserved" | "maintenance"; tenant?: string };
type Room = { roomNumber: string; beds: Bed[] };
type Floor = { name: string; rooms: Room[] };

const colors = {
  vacant: "bg-success",
  occupied: "bg-error",
  reserved: "bg-warning",
  maintenance: "bg-slate-400",
};

export function BedMapGrid({ floors }: { floors: Floor[] }) {
  const [floor, setFloor] = useState(floors[0]?.name ?? "");
  const [selected, setSelected] = useState<Bed | null>(null);
  const current = floors.find((item) => item.name === floor) ?? floors[0];
  const stats = useMemo(() => current?.rooms.flatMap((room) => room.beds).reduce<Record<string, number>>((acc, bed) => ({ ...acc, [bed.status]: (acc[bed.status] ?? 0) + 1 }), {}) ?? {}, [current]);
  return (
    <section className="rounded-sm border border-border bg-surface p-5">
      <FilterChips items={floors.map((item) => item.name)} active={floor} onSelect={setFloor} />
      <div className="mt-4 flex flex-wrap gap-2">{Object.entries(stats).map(([key, value]) => <Badge key={key}>{key}: {value}</Badge>)}</div>
      <div className="mt-6 grid gap-5">
        {current?.rooms.map((room) => (
          <div key={room.roomNumber} className="rounded-sm bg-slate-50 p-4">
            <h3 className="font-semibold">Room {room.roomNumber}</h3>
            <div className="mt-3 flex flex-wrap gap-3">{room.beds.map((bed) => <button key={bed.id} onClick={() => setSelected(bed)} className={cn("h-9 w-9 rounded-full text-xs font-bold text-white shadow-sm", colors[bed.status])}>{bed.label}</button>)}</div>
          </div>
        ))}
      </div>
      <Sheet open={Boolean(selected)} title={selected?.label ?? "Bed details"} onClose={() => setSelected(null)}>
        <p className="text-sm text-text-secondary">Status: {selected?.status}</p>
        {selected?.tenant ? <p className="mt-2 font-semibold">Tenant: {selected.tenant}</p> : null}
      </Sheet>
    </section>
  );
}
