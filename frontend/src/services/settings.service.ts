import apiClient from '@/lib/apiClient';

export const SettingsService = {
  listEmailProviders: async (): Promise<any[]> => {
    const { data } = await apiClient.get('/api/communications/email-providers/');
    return data;
  },

  createEmailProvider: async (payload: any): Promise<any> => {
    const { data } = await apiClient.post('/api/communications/email-providers/', payload);
    return data;
  },

  listSMSProviders: async (): Promise<any[]> => {
    const { data } = await apiClient.get('/api/communications/sms-providers/');
    return data;
  },

  createSMSProvider: async (payload: any): Promise<any> => {
    const { data } = await apiClient.post('/api/communications/sms-providers/', payload);
    return data;
  },

  listWhatsAppProviders: async (): Promise<any[]> => {
    const { data } = await apiClient.get('/api/communications/whatsapp-providers/');
    return data;
  },

  createWhatsAppProvider: async (payload: any): Promise<any> => {
    const { data } = await apiClient.post('/api/communications/whatsapp-providers/', payload);
    return data;
  }
};
