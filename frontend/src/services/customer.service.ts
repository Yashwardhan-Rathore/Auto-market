import apiClient from '@/lib/apiClient';

export interface Customer {
  id: number;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  data: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export const CustomerService = {
  list: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/customers/');
    return response.data;
  },

  listUploads: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/customers/uploads/');
    return response.data;
  }
};
