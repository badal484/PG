"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string; type?: "success" | "error" | "warning" | "info" };
type ToastContextValue = { toast: (toast: Omit<Toast, "id">) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const value = useMemo(
    () => ({
      toast: (toast: Omit<Toast, "id">) => {
        const id = Date.now();
        setToasts((current) => [...current, { ...toast, id }]);
        window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4500);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[80] grid w-[min(360px,calc(100vw-32px))] gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className={cn("rounded-sm border bg-surface p-4 shadow-lg", toast.type === "error" && "border-error", toast.type === "success" && "border-success")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm text-text-secondary">{toast.description}</p> : null}
              </div>
              <button aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
