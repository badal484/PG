"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/providers";
import { Loader2 } from "lucide-react";

// /pms redirects managers to their first property's dashboard.
// In production this would look up the manager's assigned properties.
export default function PmsRootPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/auth/login?redirect=/pms"); return; }
    // Redirect to the seed property — in production query /pms/my-properties
    router.replace("/pms/prop-001");
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
