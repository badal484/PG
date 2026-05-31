"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";
import { ToastProvider } from "@/components/ui/toast";

type UserRole = "TENANT" | "OWNER" | "MANAGER" | "ADMIN";

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
};

const UserContext = createContext<UserContextValue | null>(null);

export function useUser() {
  const value = useContext(UserContext);
  if (!value) throw new Error("useUser must be used inside UserProvider");
  return value;
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [user, setUser] = useState<CurrentUser | null>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserContext.Provider value={value}>
          <ToastProvider>{children}</ToastProvider>
        </UserContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
