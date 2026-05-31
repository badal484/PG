"use client";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { apiClient } from "@/lib/api/api-client";

type UserRole = "TENANT" | "OWNER" | "MANAGER" | "ADMIN" | "SUPER_ADMIN";

export type CurrentUser = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  unreadNotifications: number;
};

type UserContextValue = {
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function useUser() {
  const value = useContext(UserContext);
  if (!value) throw new Error("useUser must be used inside UserProvider");
  return value;
}

// Rehydrates user from stored JWT on every mount
function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<CurrentUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // On mount, check if there's a valid token and load the user
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("roomly_token") : null;
    if (!token) { setHydrated(true); return; }

    apiClient.get<any>("/auth/me")
      .then((u) => {
        setUserState({
          id: u.id,
          name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.phone,
          phone: u.phone,
          role: u.role,
          avatarUrl: u.profilePhoto ?? undefined,
          unreadNotifications: 0,
        });
      })
      .catch(() => {
        localStorage.removeItem("roomly_token");
        localStorage.removeItem("roomly_refresh");
      })
      .finally(() => setHydrated(true));
  }, []);

  const setUser = (u: CurrentUser | null) => {
    setUserState(u);
    if (!u) {
      localStorage.removeItem("roomly_token");
      localStorage.removeItem("roomly_refresh");
    }
  };

  const value = useMemo(() => ({ user, setUser, isLoading: !hydrated }), [user, hydrated]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ToastProvider>{children}</ToastProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
