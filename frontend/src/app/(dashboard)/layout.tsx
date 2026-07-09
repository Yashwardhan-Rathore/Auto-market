import { DashboardLayout } from '@/layouts/dashboard-layout/dashboard-layout';
import { AuthGuard } from '@/components/shared/guards/auth-guard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Dashboard',
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
