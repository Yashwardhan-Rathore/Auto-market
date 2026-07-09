'use client';

import React, { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryProvider } from './query-provider';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/store/use-auth-store';
import { useUiStore } from '@/store/use-ui-store';

// Hydrates Zustand persisted stores on client mount
function StoreHydrator() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useUiStore.persist.rehydrate();
  }, []);
  return null;
}

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <StoreHydrator />
        {children}
        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </QueryProvider>
    </NextThemesProvider>
  );
}
