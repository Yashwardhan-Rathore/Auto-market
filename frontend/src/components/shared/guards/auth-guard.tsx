'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { ROUTES } from '@/constants';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return; // Wait for Zustand to rehydrate from localStorage

    if (!isAuthenticated) {
      const callbackUrl = window.location.pathname;
      router.replace(`${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // Show nothing while checking auth state
  if (!_hasHydrated || !checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
