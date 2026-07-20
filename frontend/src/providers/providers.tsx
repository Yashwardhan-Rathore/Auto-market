"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: (count, error: unknown) => { const status = (error as { response?: { status?: number } })?.response?.status; return !status || status >= 500 ? count < 1 : false; } } } }));
  return <QueryClientProvider client={client}><AuthProvider>{children}</AuthProvider><Toaster theme="dark" richColors /></QueryClientProvider>;
}
