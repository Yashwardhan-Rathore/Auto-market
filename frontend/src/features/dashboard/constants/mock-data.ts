import type {
  DashboardStats,
  RevenueDataPoint,
  ContactGrowthDataPoint,
  CampaignTypeDataPoint,
  RecentActivity,
  UpcomingCampaign,
} from '../types';

export const MOCK_STATS: DashboardStats = {
  totalContacts: 48320,
  contactsChange: 12.5,
  totalCampaigns: 247,
  campaignsChange: 8.3,
  emailsSent: 1284000,
  emailsSentChange: 23.1,
  revenue: 198450,
  revenueChange: 15.7,
  openRate: 28.4,
  clickRate: 4.7,
  conversionRate: 3.2,
  workflowSuccessRate: 94.8,
};

export const MOCK_REVENUE_DATA: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 125000, target: 120000 },
  { month: 'Feb', revenue: 138000, target: 130000 },
  { month: 'Mar', revenue: 142000, target: 140000 },
  { month: 'Apr', revenue: 158000, target: 150000 },
  { month: 'May', revenue: 162000, target: 160000 },
  { month: 'Jun', revenue: 178000, target: 170000 },
  { month: 'Jul', revenue: 185000, target: 180000 },
  { month: 'Aug', revenue: 192000, target: 185000 },
  { month: 'Sep', revenue: 198450, target: 190000 },
];

export const MOCK_CONTACT_GROWTH: ContactGrowthDataPoint[] = [
  { month: 'Jan', contacts: 32000, new: 2800 },
  { month: 'Feb', contacts: 34500, new: 2500 },
  { month: 'Mar', contacts: 36200, new: 1700 },
  { month: 'Apr', contacts: 38800, new: 2600 },
  { month: 'May', contacts: 41200, new: 2400 },
  { month: 'Jun', contacts: 43900, new: 2700 },
  { month: 'Jul', contacts: 45700, new: 1800 },
  { month: 'Aug', contacts: 47100, new: 1400 },
  { month: 'Sep', contacts: 48320, new: 1220 },
];

export const MOCK_CAMPAIGN_TYPES: CampaignTypeDataPoint[] = [
  { name: 'Email', value: 58, color: '#6366f1' },
  { name: 'SMS', value: 22, color: '#8b5cf6' },
  { name: 'WhatsApp', value: 12, color: '#10b981' },
  { name: 'Push', value: 8, color: '#f59e0b' },
];

export const MOCK_RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: '1',
    type: 'campaign_sent',
    title: 'Campaign launched',
    description: '"Summer Sale 2025" sent to 12,400 contacts',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    actorName: 'Sarah Wilson',
  },
  {
    id: '2',
    type: 'contact_added',
    title: 'New contact imported',
    description: '340 contacts imported from HubSpot integration',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actorName: 'System',
  },
  {
    id: '3',
    type: 'workflow_triggered',
    title: 'Workflow executed',
    description: '"Lead Nurture Sequence" triggered for 89 contacts',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actorName: 'AutoMarket AI',
  },
  {
    id: '4',
    type: 'form_submitted',
    title: 'Form submission spike',
    description: '"Product Demo Request" received 47 submissions today',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    actorName: 'System',
  },
  {
    id: '5',
    type: 'payment',
    title: 'Invoice paid',
    description: 'Acme Corp paid $4,200 for Professional plan',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actorName: 'Stripe',
  },
  {
    id: '6',
    type: 'campaign_sent',
    title: 'A/B test concluded',
    description: 'Variant B won with 31.2% open rate (+6.4%)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    actorName: 'James Cooper',
  },
];

export const MOCK_UPCOMING_CAMPAIGNS: UpcomingCampaign[] = [
  {
    id: '1',
    name: 'October Newsletter',
    type: 'EMAIL',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    recipientsCount: 24800,
    status: 'SCHEDULED',
  },
  {
    id: '2',
    name: 'Flash Sale SMS Blast',
    type: 'SMS',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    recipientsCount: 9300,
    status: 'SCHEDULED',
  },
  {
    id: '3',
    name: 'Re-engagement Push',
    type: 'PUSH',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    recipientsCount: 5600,
    status: 'SCHEDULED',
  },
  {
    id: '4',
    name: 'WhatsApp Product Drop',
    type: 'WHATSAPP',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    recipientsCount: 3200,
    status: 'DRAFT',
  },
];
