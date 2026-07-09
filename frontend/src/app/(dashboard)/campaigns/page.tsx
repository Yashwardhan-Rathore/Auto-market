import type { Metadata } from 'next';
import { CampaignsListView } from '@/features/campaigns';

export const metadata: Metadata = {
  title: 'Campaigns Dashboard',
};

export default function CampaignsPage() {
  return <CampaignsListView />;
}
