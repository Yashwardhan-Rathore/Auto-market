import apiClient from '@/lib/apiClient';

export const DashboardService = {
  getOverview: async () => {
    const response = await apiClient.get('/api/dashboard/');
    return response.data;
  },

  getAnalyticsSummary: async () => {
    const response = await apiClient.get('/api/analytics/summary/');
    return response.data;
  }
};
