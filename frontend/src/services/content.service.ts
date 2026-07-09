import apiClient from '@/lib/apiClient';

export interface ContentAsset {
  id: string;
  name: string;
  type: string; // e.g., 'image', 'video', 'document', 'template'
  url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const ContentStudioService = {
  list: async (): Promise<ContentAsset[]> => {
    // If backend doesn't have an endpoint for content studio yet, we return empty or basic structure
    try {
      const { data } = await apiClient.get<ContentAsset[]>('/api/content_studio/');
      return data;
    } catch (error) {
      // Graceful fallback for demo/stub purposes until API is fully wired
      return [];
    }
  }
};
