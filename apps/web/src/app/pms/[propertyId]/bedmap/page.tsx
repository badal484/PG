"use client";

import { use, useState } from "react";
import { MessageCircle, Phone, AlertTriangle, CheckCircle, Clock, Wrench, X } from "lucide-react";
import { Badge, Button, Sheet } from "@/components/ui";
import { formatInr } from "@/lib/utils";

type BedStatus = "OCCUPIED" | "VACANT" | "MAINTENANCE" | "RESERVED";

interface Bed {
  id: string;
  label: string;
  status: BedStatus;
  tenant?: {
    name: string;
    phone: string;
    since: string;
    rent: number;
    rentStatus: "PAID" | "DUE" | "OVERDUE";
    daysOverdue?: number;
  };
  rent?: number;
}

interface Room {
  id: string;
  number: string;
  floor: number;
  sharing: number;
  ac: boolean;
  beds: Bed[];
}

const FLOORS_DATA: { floor: number; rooms: Room[] }[] = [
  {
    floor: 1,
    rooms: [
      {
        id: "r101", number: "101", floor: 1, sharing: 3, ac: false,
        beds: [
          { id: "b101a", label: "A", status: "OCCUPIED", rent: 7500, tenant: { name: "Raj Kumar", phone: "9876543210", since: "Jan 2025", rent: 7500, rentStatus: "PAID" } },
          { id: "b101b", label: "B", status: "OCCUPIED", rent: 7500, tenant: { name: "Arjun Nair", phone: "9123456789", since: "Mar 2025", rent: 7500, rentStatus: "OVERDUE", daysOverdue: 12 } },
          { id: "b101c", label: "C", status: "VACANT", rent: 7500 },
        ],
      },
      {
        id: "r102", number: "102", floor: 1, sharing: 2, ac: true,
        beds: [
          { id: "b102a", label: "A", status: "OCCUPIED", rent: 9500, tenant: { name: "Vinod S.", phone: "9988776655", since: "Feb 2025", rent: 9500, rentStatus: "PAID" } },
          { id: "b102b", label: "B", status: "MAINTENANCE", rent: 9500 },
        ],
      },
    ],
  },
  {
    floor: 2,
    rooms: [
      {
        id: "r201", number: "201", floor: 2, sharing: 4, ac: false,
        beds: [
          { id: "b201a", label: "A", status: "OCCUPIED", rent: 6500, tenant: { name: "Saurabh T.", phone: "9111222333", since: "Dec 2024", rent: 6500, rentStatus: "DUE" } },
          { id: "b201b", label: "B", status: "OCCUPIED", rent: 6500, tenant: { name: "Deepak R.", phone: "9444555666", since: "Nov 2024", rent: 6500, rentStatus: "PAID" } },
          { id: "b201c", label: "C", status: "VACANT", rent: 6500 },
          { id: "b201d", label: "D", status: "RESERVED", rent: 6500 },
        ],
      },
      {
        id: "r202", number: "202", floor: 2, sharing: 2, ac: true,
        beds: [
          { id: "b202a", label: "A", status: "OCCUPIED", rent: 9500, tenant: { name: "Karan S.", phone: "9777888999", since: "Apr 2025", rent: 9500, rentStatus: "PAID" } },
          { id: "b202b", label: "B", status: "OCCUPIED", rent: 9500, tenant: { name: "Nitin M.", phone: "9000111222", since: "Jan 2025", rent: 9500, rentStatus: "OVERDUE", daysOverdue: 5 } },
        ],
      },
    ],
  },
  {
    floor: 3,
    rooms: [
      {
        id: "r301", number: "301", floor: 3, sharing: 1, ac: true,
        beds: [
          { id: "b301a", label: "A", status: "OCCUPIED", rent: 14000, tenant: { name: "Rahul M.", phone: "9555666777", since: "May 2025", rent: 14000, rentStatus: "PAID" } },
        ],
      },
      {
        id: "r302", number: "302", floor: 3, sharing: 1, ac: true,
        beds: [
          { id: "b302a", label: "A", status: "VACANT", rent: 14000 },
        ],
      },
      {
        id: "r303", number: "303", floor: 3, sharing: 3, ac: true,
        beds: [
          { id: "b303a", label: "A", status: "OCCUPIED", rent: 11000, tenant: { name: "Amit V.", phone: "9333444555", since: "Mar 2025", rent: 11000, rentStatus: "PAID" } },
          { id: "b303b", label: "B", status: "OCCUPIED", rent: 11000, tenant: { name: "Suresh P.", phone: "9222333444", since: "Feb 2025", rent: 11000, rentStatus: "DUE" } },
          { id: "b303c", label: "C", status: "VACANT", rent: 11000 },
        ],
      },
    ],
  },
];

const STATUS_STYLES: Record<BedStatus, { bg: string; text: string; border: string; icon: React.ElementType; label: string }> = {
  OCCUPIED: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", icon: CheckCircle, label: "Occupied" },
  VACANT: { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-300", icon: CheckCircle, label: "Vacant" },
  MAINTENANCE: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-400", icon: Wrench, label: "Maintenance" },
  RESERVED: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", icon: Clock, label: "Reserved" },
};

const RENT_STATUS_STYLES = {
  PAID: "bg-emerald-100 text-emerald-700",
  DUE: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default function BedMapPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const floors = FLOORS_DATA;
  const currentFloorData = floors.find((f) => f.floor === activeFloor);

  const allBeds = floors.flatMap((f) => f.rooms.flatMap((r) => r.beds));
  const stats = {
    occupied: allBeds.filter((b) => b.status === "OCCUPIED").length,
    vacant: allBeds.filter((b) => b.status === "VACANT").length,
    maintenance: allBeds.filter((b) => b.status === "MAINTENANCE").length,
    reserved: allBeds.filter((b) => b.status === "RESERVED").length,
    total: allBeds.length,
  };

  function handleBedClick(bed: Bed, room: Room) {
    setSelectedBed(bed);
    setSelectedRoom(room);
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-xl font-black">Bed Map</h1>
        <p className="text-sm text-text-secondary mt-0.5">Tap any bed for details and actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Occupied", count: stats.occupied, color: "bg-emerald-100 text-emerald-700" },
          { label: "Vacant", count: stats.vacant, color: "bg-slate-100 text-slate-600" },
          { label: "Maint.", count: stats.maintenance, color: "bg-amber-100 text-amber-700" },
          { label: "Reserved", count: stats.reserved, color: "bg-blue-100 text-blue-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
            <p className="text-xl font-black">{s.count}</p>
            <p className="text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Floor tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {floors.map((f) => (
          <button
            key={f.floor}
            onClick={() => setActiveFloor(f.floor)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeFloor === f.floor
                ? "bg-primary text-white"
                : "border border-border bg-white text-text-secondary"
            }`}
          >
            Floor {f.floor}
          </button>
        ))}
      </div>

      {/* Rooms grid */}
      {currentFloorData && (
        <div className="grid gap-4">
          {currentFloorData.rooms.map((room) => (
            <div key={room.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <p className="font-bold">Room {room.number}</p>
                <span className="text-xs text-text-tertiary">{room.sharing}-sharing</span>
                {room.ac && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">AC</span>}
              </div>
              <div className="flex gap-3 flex-wrap">
                {room.beds.map((bed) => {
                  const style = STATUS_STYLES[bed.status];
                  const isOverdue = bed.tenant?.rentStatus === "OVERDUE";
                  return (
                    <button
                      key={bed.id}
                      onClick={() => handleBedClick(bed, room)}
                      className={`relative flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 transition active:scale-95 hover:shadow-md ${style.bg} ${style.border}`}
                    >
                      <span className={`text-lg font-black ${style.text}`}>{bed.label}</span>
                      <span className={`text-[9px] font-semibold ${style.text}`}>
                        {bed.status === "OCCUPIED" ? (bed.tenant?.name.split(" ")[0] ?? "").slice(0, 6) : style.label}
                      </span>
                      {isOverdue && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 ring-2 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_STYLES).map(([status, style]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`h-4 w-4 rounded border-2 ${style.bg} ${style.border}`} />
            <span className="text-xs text-text-secondary">{style.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-xs text-text-secondary">Rent overdue</span>
        </div>
      </div>

      {/* Bed detail sheet */}
      <Sheet
        open={!!selectedBed}
        title={selectedBed ? `Bed ${selectedBed.label} · Room ${selectedRoom?.number}` : ""}
        onClose={() => { setSelectedBed(null); setSelectedRoom(null); }}
      >
        {selectedBed && (
          <div className="grid gap-5">
            {/* Status badge */}
            <div className={`rounded-xl px-4 py-3 ${STATUS_STYLES[selectedBed.status].bg}`}>
              <p className={`font-bold ${STATUS_STYLES[selectedBed.status].text}`}>
                {STATUS_STYLES[selectedBed.status].label}
              </p>
              {selectedBed.rent && (
                <p className="text-sm opacity-80">Rent: {formatInr(selectedBed.rent)}/month</p>
              )}
            </div>

            {/* Tenant details */}
            {selectedBed.status === "OCCUPIED" && selectedBed.tenant && (
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{selectedBed.tenant.name}</p>
                    <p className="text-sm text-text-secondary">Since {selectedBed.tenant.since}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${RENT_STATUS_STYLES[selectedBed.tenant.rentStatus]}`}>
                    {selectedBed.tenant.rentStatus}
                    {selectedBed.tenant.daysOverdue ? ` · ${selectedBed.tenant.daysOverdue}d` : ""}
                  </span>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-2">
                  <a href={`tel:${selectedBed.tenant.phone}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Phone className="h-4 w-4" /> Call
                    </Button>
                  </a>
                  <a href={`https://wa.me/91${selectedBed.tenant.phone}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </Button>
                  </a>
                </div>

                {selectedBed.tenant.rentStatus !== "PAID" && (
                  <div className="grid gap-2">
                    <Button size="sm" className="w-full">
                      Send payment link
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Mark as cash paid
                    </Button>
                  </div>
                )}

                <div className="grid gap-2 border-t border-border pt-3">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-text-secondary">
                    <AlertTriangle className="h-4 w-4" /> Log complaint
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:bg-red-50">
                    Initiate move-out
                  </Button>
                </div>
              </div>
            )}

            {/* Vacant bed actions */}
            {selectedBed.status === "VACANT" && (
              <div className="grid gap-2">
                <Button className="w-full">Book this bed</Button>
                <Button variant="outline" className="w-full">
                  <Wrench className="h-4 w-4" /> Mark as maintenance
                </Button>
              </div>
            )}

            {/* Maintenance bed actions */}
            {selectedBed.status === "MAINTENANCE" && (
              <div className="grid gap-3">
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-sm font-semibold text-amber-700">Under maintenance</p>
                  <p className="text-xs text-amber-600 mt-0.5">Mark as available once repairs are done</p>
                </div>
                <Button className="w-full">Mark as available</Button>
                <Button variant="outline" className="w-full">Log repair expense</Button>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
