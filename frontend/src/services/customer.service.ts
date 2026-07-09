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
  list: async (): Promise<Customer[]> => {
    const { data } = await apiClient.get<Customer[]>('/api/customers/');
    return data;
  }
};
