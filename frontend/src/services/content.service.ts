import apiClient from '@/lib/apiClient';

export interface GeneratedContentResponse {
  id: string;
  content_type: string;
  platform: string;
  text_content: string;
  image_url: string;
  version_id: string;
}

export interface BrandVoice {
  id: string;
  tone: string;
  target_audience: string;
  guidelines: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  prompt_template: string;
  content_type: string;
  is_active: boolean;
}

export const ContentStudioService = {
  getBrandVoice: async (): Promise<BrandVoice> => {
    const { data } = await apiClient.get<BrandVoice>('/api/content/brand-voice/');
    return data;
  },

  updateBrandVoice: async (payload: Partial<BrandVoice>): Promise<BrandVoice> => {
    const { data } = await apiClient.put<BrandVoice>('/api/content/brand-voice/', payload);
    return data;
  },

  getTemplates: async (): Promise<ContentTemplate[]> => {
    const { data } = await apiClient.get<ContentTemplate[]>('/api/content/templates/');
    return data;
  },

  generate: async (payload: { prompt: string; content_type: string; platform?: string; template_id?: string }): Promise<GeneratedContentResponse> => {
    const { data } = await apiClient.post<GeneratedContentResponse>('/api/content/generate/', payload);
    return data;
  },

  regenerate: async (id: string, prompt: string): Promise<GeneratedContentResponse> => {
    const { data } = await apiClient.post<GeneratedContentResponse>(`/api/content/${id}/regenerate/`, { prompt });
    return data;
  },

  update: async (id: string, text_content: string): Promise<void> => {
    await apiClient.put(`/api/content/${id}/update/`, { text_content });
  },

  action: async (id: string, action: 'save_to_library' | 'post' | 'schedule', scheduled_time?: string): Promise<void> => {
    await apiClient.post(`/api/content/${id}/action/`, { action, scheduled_time });
  },

  getHistory: async (): Promise<any[]> => {
    const { data } = await apiClient.get<any[]>('/api/content/history/');
    return data;
  }
};
