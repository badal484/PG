"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/providers";
import { apiClient } from "@/lib/api/api-client";
import { Loader2 } from "lucide-react";

interface PropertySummary {
  id: string;
  name: string;
  city: string;
}

export default function PmsRootPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login?redirect=/pms");
      return;
    }

    // Ask the API which properties this manager is assigned to
    apiClient.get<PropertySummary[]>("/pms/my-properties")
      .then((properties) => {
        if (properties.length === 0) {
          setError("You are not assigned to any property yet. Contact the property owner.");
          return;
        }
        // Redirect to first assigned property
        router.replace(`/pms/${properties[0].id}`);
      })
      .catch(() => setError("Failed to load your properties. Please try again."));
  }, [user, isLoading, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-slate-700">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
        >
          Go home
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
