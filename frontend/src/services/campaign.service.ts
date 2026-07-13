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

  create: async (name: string, description: string, task: number): Promise<any> => {
    const { data } = await apiClient.post('/api/campaigns/create/', { name, description, task });
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/campaigns/${id}/delete/`);
  },

  get: async (id: number): Promise<Campaign> => {
    const { data } = await apiClient.get<Campaign>(`/api/campaigns/${id}/`);
    return data;
  },

  update: async (id: number, payload: { name: string, description?: string }): Promise<Campaign> => {
    const { data } = await apiClient.patch<Campaign>(`/api/campaigns/${id}/`, payload);
    return data;
  },

  listTemplates: async (): Promise<any[]> => {
    try {
      const { data } = await apiClient.get<any[]>('/api/templates/');
      return data;
    } catch (e) {
      return [];
    }
  },

  assignTemplate: async (campaign: number, channel: number, template: number): Promise<any> => {
    const { data } = await apiClient.post('/api/campaigns/templates/assign/', { campaign, channel, template });
    return data;
  },

  schedule: async (campaign: number, scheduled_at: string): Promise<any> => {
    const { data } = await apiClient.post('/api/campaigns/schedule/', { campaign, scheduled_at });
    return data;
  },

  send: async (campaign: number): Promise<any> => {
    const { data } = await apiClient.post('/api/campaigns/send/', { campaign });
    return data;
  },

  listChannels: async (): Promise<any[]> => {
    try {
      const { data } = await apiClient.get<any[]>('/api/channels/');
      return data;
    } catch (e) {
      return [];
    }
  },

  listAudiences: async (): Promise<any[]> => {
    try {
      const { data } = await apiClient.get<any[]>('/api/audiences/');
      return data;
    } catch (e) {
      return [];
    }
  },

  createAudience: async (payload: { name: string, customer_upload: number, definition: any }): Promise<any> => {
    const { data } = await apiClient.post('/api/audiences/create/', payload);
    return data;
  },

  previewAudience: async (payload: { customer_upload: number, definition: any }): Promise<any> => {
    const { data } = await apiClient.post('/api/audiences/preview/', payload);
    return data;
  },

  createTemplate: async (payload: { name: string; channel: number; subject?: string; body: string }): Promise<any> => {
    const { data } = await apiClient.post('/api/templates/create/', payload);
    return data;
  }
};
