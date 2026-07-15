import apiClient from '@/lib/apiClient';

export interface contentDraft {
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

export const contentDraftService = {
  list: async (): Promise<contentDraft[]> => {
    const { data } = await apiClient.get<contentDraft[]>('/api/content-drafts/');
    return data;
  },

  create: async (name: string, description: string, task: number): Promise<any> => {
    const { data } = await apiClient.post('/api/content-drafts/create/', { name, description, task });
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/content-drafts/${id}/delete/`);
  },

  get: async (id: number): Promise<contentDraft> => {
    const { data } = await apiClient.get<contentDraft>(`/api/content-drafts/${id}/`);
    return data;
  },

  update: async (id: number, payload: { name: string, description?: string }): Promise<contentDraft> => {
    const { data } = await apiClient.patch<contentDraft>(`/api/content-drafts/${id}/`, payload);
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

  assignTemplate: async (contentDraft: number, channel: number, template: number): Promise<any> => {
    const { data } = await apiClient.post('/api/content-drafts/templates/assign/', { contentDraft, channel, template });
    return data;
  },

  schedule: async (contentDraft: number, scheduled_at: string): Promise<any> => {
    const { data } = await apiClient.post('/api/content-drafts/schedule/', { contentDraft, scheduled_at });
    return data;
  },

  send: async (contentDraft: number): Promise<any> => {
    const { data } = await apiClient.post('/api/content-drafts/send/', { contentDraft });
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
