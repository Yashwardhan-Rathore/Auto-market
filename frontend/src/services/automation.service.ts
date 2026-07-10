import apiClient from '@/lib/apiClient';

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const AutomationService = {
  list: async (): Promise<Automation[]> => {
    const { data } = await apiClient.get<Automation[]>('/api/automations/');
    return data;
  },

  get: async (id: string): Promise<Automation> => {
    const { data } = await apiClient.get<Automation>(`/api/automations/${id}/`);
    return data;
  },

  create: async (payload: { name: string, description: string }): Promise<Automation> => {
    const { data } = await apiClient.post<Automation>('/api/automations/', payload);
    return data;
  },

  getNodes: async (automationId: string): Promise<any[]> => {
    const { data } = await apiClient.get<any[]>(`/api/automations/${automationId}/nodes/`);
    return data;
  },

  createNode: async (automationId: string, payload: any): Promise<any> => {
    const { data } = await apiClient.post<any>(`/api/automations/${automationId}/nodes/`, payload);
    return data;
  },

  updateNode: async (nodeId: string, payload: any): Promise<any> => {
    const { data } = await apiClient.patch<any>(`/api/automations/nodes/${nodeId}/`, payload);
    return data;
  },

  deleteNode: async (nodeId: string): Promise<void> => {
    await apiClient.delete(`/api/automations/nodes/${nodeId}/`);
  },

  getEdges: async (automationId: string): Promise<any[]> => {
    const { data } = await apiClient.get<any[]>(`/api/automations/${automationId}/edges/`);
    return data;
  },

  createEdge: async (automationId: string, payload: any): Promise<any> => {
    const { data } = await apiClient.post<any>(`/api/automations/${automationId}/edges/`, payload);
    return data;
  },

  deleteEdge: async (edgeId: string): Promise<void> => {
    await apiClient.delete(`/api/automations/edges/${edgeId}/`);
  },

  publish: async (id: string): Promise<any> => {
    const { data } = await apiClient.post(`/api/automations/${id}/publish/`);
    return data;
  }
};
