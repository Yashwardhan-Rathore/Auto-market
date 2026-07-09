import apiClient from '@/lib/apiClient';

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const AutomationService = {
  list: async (): Promise<Automation[]> => {
    const { data } = await apiClient.get<Automation[]>('/api/automations/');
    return data;
  }
};
