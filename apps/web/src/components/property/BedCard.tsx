import { Box, DoorOpen, Video } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { PriceDisplay } from "./shared";

export type BedCardProps = {
  bedLabel: string;
  roomNumber: string;
  floor: string;
  attributes: string[];
  monthlyRent: number;
  availableFrom?: string;
  hasTour?: boolean;
};

export function BedCard({ bedLabel, roomNumber, floor, attributes, monthlyRent, availableFrom, hasTour }: BedCardProps) {
  const availableNow = !availableFrom;
  return (
    <article className="rounded-sm border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold"><Box className="h-5 w-5 text-accent" />{bedLabel}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary"><DoorOpen className="h-4 w-4" />Room {roomNumber}, {floor}</p>
        </div>
        <Badge variant={availableNow ? "active" : "due"}>{availableNow ? "Available now" : `Available from ${availableFrom}`}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{attributes.map((attribute) => <Badge key={attribute}>{attribute}</Badge>)}</div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PriceDisplay amount={monthlyRent} className="text-xl" />
        <div className="flex gap-2">
          {hasTour ? <Button variant="outline"><Video className="h-4 w-4" />360 tour</Button> : null}
          <Button>Book this bed</Button>
        </div>
      </div>
    </article>
  );
}
