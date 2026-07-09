import apiClient from '@/lib/apiClient';

export interface Form {
  id: number;
  uuid: string;
  name: string;
  title: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const FormsService = {
  list: async (): Promise<Form[]> => {
    try {
      const { data } = await apiClient.get<Form[]>('/api/forms/');
      return data;
    } catch (e) {
      return [];
    }
  }
};
