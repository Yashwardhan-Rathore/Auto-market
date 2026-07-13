import apiClient from '@/lib/apiClient';

export interface GeneratedContentResponse {
  id: string;
  content_type: string;
  platform: string;
  text_content: string;
  image_url: string;
  version_id: string;
}

export const ContentStudioService = {
  generate: async (payload: { prompt: string; content_type: string; platform?: string }): Promise<GeneratedContentResponse> => {
    const { data } = await apiClient.post<GeneratedContentResponse>('/api/content/generate/', payload);
    return data;
  },

  update: async (id: string, text_content: string): Promise<void> => {
    await apiClient.put(`/api/content/${id}/update/`, { text_content });
  },

  action: async (id: string, action: 'save_to_library' | 'post' | 'schedule', scheduled_time?: string): Promise<void> => {
    await apiClient.post(`/api/content/${id}/action/`, { action, scheduled_time });
  }
};
