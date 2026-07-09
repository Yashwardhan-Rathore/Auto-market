import apiClient from '@/lib/apiClient';

export interface Campaign {
  id: number;
  name: string;
  status: string;
  created_at: string;
  scheduled_at: string | null;
  // Mock data fields for the UI until backend supports them
  type?: string;
  contacts?: number;
  opens?: string;
  clicks?: string;
}

export const CampaignService = {
  list: async (): Promise<Campaign[]> => {
    const { data } = await apiClient.get<Campaign[]>('/api/campaigns/');
    return data;
  },

  create: async (name: string, description: string): Promise<any> => {
    const { data } = await apiClient.post('/api/campaigns/create/', { name, description, task: 1 });
    return data;
  }
};
