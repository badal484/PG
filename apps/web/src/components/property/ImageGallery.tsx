"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui";

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="grid w-full grid-cols-2 gap-2 overflow-hidden rounded-sm text-left" onClick={() => setOpen(true)}>
        {images.slice(0, 4).map((image, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={image} src={image} alt={`${title} ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
        ))}
      </button>
      <Dialog open={open} title={title} onClose={() => setOpen(false)}>
        <div className="grid gap-3">
          {images.map((image, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image} src={image} alt={`${title} full ${index + 1}`} className="rounded-sm" />
          ))}
        </div>
      </Dialog>
    </>
  );
}
