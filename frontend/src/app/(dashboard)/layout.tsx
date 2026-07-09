'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import dynamic from 'next/dynamic';

const ProtectedRoute = dynamic(
  () => import('@/components/ProtectedRoute').then((mod) => mod.ProtectedRoute),
  { ssr: false }
);

export default function RootDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
