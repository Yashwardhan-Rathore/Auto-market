import { UserStatus } from '@/types';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  tags: string[];
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
}
