export interface Campaign {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  recipientsCount: number;
  sentCount: number;
  openRate?: number;
  clickRate?: number;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}
