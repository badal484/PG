"use client";

import { create } from "zustand";
import type { PropertyCardProps } from "@/components/property/PropertyCard";

const MAX_COMPARE = 3;

interface CompareState {
  properties: PropertyCardProps[];
  add: (p: PropertyCardProps) => void;
  remove: (slug: string) => void;
  toggle: (p: PropertyCardProps) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  isFull: () => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  properties: [],

  add: (p) =>
    set((state) => {
      if (state.properties.length >= MAX_COMPARE || state.properties.some((x) => x.slug === p.slug)) return state;
      return { properties: [...state.properties, p] };
    }),

  remove: (slug) =>
    set((state) => ({ properties: state.properties.filter((p) => p.slug !== slug) })),

  toggle: (p) => {
    if (get().has(p.slug)) get().remove(p.slug);
    else get().add(p);
  },

  clear: () => set({ properties: [] }),

  has: (slug) => get().properties.some((p) => p.slug === slug),

  isFull: () => get().properties.length >= MAX_COMPARE,
}));
