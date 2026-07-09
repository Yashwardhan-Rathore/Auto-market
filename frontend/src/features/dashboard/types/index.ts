export interface DashboardStats {
  totalContacts: number;
  contactsChange: number;
  totalCampaigns: number;
  campaignsChange: number;
  emailsSent: number;
  emailsSentChange: number;
  revenue: number;
  revenueChange: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  workflowSuccessRate: number;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  target: number;
}

export interface ContactGrowthDataPoint {
  month: string;
  contacts: number;
  new: number;
}

export interface CampaignTypeDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: 'contact_added' | 'campaign_sent' | 'workflow_triggered' | 'form_submitted' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  avatar?: string;
  actorName: string;
}

export interface UpcomingCampaign {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
  scheduledAt: string;
  recipientsCount: number;
  status: 'SCHEDULED' | 'DRAFT';
}
