"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Grid3x3, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Photo {
  url: string;
  caption?: string;
}

interface PropertyDetailGalleryProps {
  photos: Photo[];
  name: string;
}

function Lightbox({
  photos,
  name,
  initial,
  onClose,
}: {
  photos: Photo[];
  name: string;
  initial: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initial);

  const prev = useCallback(() => setIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-semibold text-white/80">{name}</p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60">{idx + 1} / {photos.length}</span>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close gallery">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-16">
        <button onClick={prev} className="absolute left-3 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous photo">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="relative h-full max-h-[70vh] w-full">
          <Image
            src={photos[idx]?.url ?? ""}
            alt={photos[idx]?.caption ?? `${name} photo ${idx + 1}`}
            fill
            className="object-contain"
            sizes="90vw"
          />
        </div>
        <button onClick={next} className="absolute right-3 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next photo">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Caption */}
      {photos[idx]?.caption && (
        <p className="py-3 text-center text-sm text-white/60">{photos[idx]?.caption}</p>
      )}

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={cn(
              "relative h-16 w-24 shrink-0 overflow-hidden rounded",
              i === idx ? "ring-2 ring-white" : "opacity-60 hover:opacity-100",
            )}
            aria-label={`Go to photo ${i + 1}`}
          >
            <Image src={photo.url} alt={photo.caption ?? ""} fill className="object-cover" sizes="96px" />
          </button>
        ))}
      </div>
    </div>
  );
}

// Dynamic import to keep Lightbox out of initial bundle
import dynamic from "next/dynamic";
const _Lightbox = dynamic(() => Promise.resolve(Lightbox), { ssr: false });

// ─── useEffect import fix ─────────────────────────────────────────────────────
import { useEffect } from "react";

export function PropertyDetailGallery({ photos, name }: PropertyDetailGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const main = photos[0];
  const thumbs = photos.slice(1, 5);
  const remaining = photos.length - 5;

  return (
    <>
      {lightboxIndex !== null && (
        <_Lightbox
          photos={photos}
          name={name}
          initial={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Grid layout */}
      <div className="relative grid h-[460px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">
        {/* Main large photo */}
        {main && (
          <button
            className="relative col-span-2 row-span-2 overflow-hidden"
            onClick={() => setLightboxIndex(0)}
            aria-label="View photo 1"
          >
            <Image
              src={main.url}
              alt={main.caption ?? `${name} - main photo`}
              fill
              className="object-cover transition duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </button>
        )}

        {/* 4 thumbnails */}
        {thumbs.map((photo, i) => (
          <button
            key={i}
            className="relative overflow-hidden"
            onClick={() => setLightboxIndex(i + 1)}
            aria-label={`View photo ${i + 2}`}
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? `${name} photo ${i + 2}`}
              fill
              className="object-cover transition duration-500 hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </button>
        ))}

        {/* "Show all" overlay on last thumb */}
        {photos.length > 5 && (
          <button
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold shadow-md hover:bg-slate-50"
            onClick={() => setLightboxIndex(0)}
          >
            <Grid3x3 className="h-4 w-4" />
            Show all {photos.length} photos
          </button>
        )}

        {/* Photo count badge */}
        <span className="absolute left-3 bottom-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {photos.length} photos
        </span>
      </div>
    </>
  );
}
