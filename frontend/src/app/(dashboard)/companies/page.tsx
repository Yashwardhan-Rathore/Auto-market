import type { Metadata } from 'next';
import { CompaniesListView } from '@/features/companies';

export const metadata: Metadata = {
  title: 'Companies Accounts',
};

export default function CompaniesPage() {
  return <CompaniesListView />;
}
