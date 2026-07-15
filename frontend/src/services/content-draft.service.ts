import apiClient from '@/lib/apiClient';

export interface contentDraftPlatform {
  id: string;
  platform: string;
  image_size?: string;
  approval_status: string;
  scheduled_time?: string;
}

export interface ContentDraftVersion {
  id: string;
  version_number: number;
  reason: string;
  created_at: string;
}

export interface ContentDraftResponse {
  id: string;
  workflow_state: string;
  platforms: contentDraftPlatform[];
  versions: ContentDraftVersion[];
  enhanced_prompt: string;
  created_at: string;
  updated_at: string;
}

export const ContentDraftService = {
  create: async (platforms: string[]): Promise<ContentDraftResponse> => {
    const { data } = await apiClient.post<ContentDraftResponse>('/api/content-studio/content-drafts/', { platforms });
    return data;
  },

  update: async (id: string, payload: { enhanced_prompt?: string }): Promise<ContentDraftResponse> => {
    const { data } = await apiClient.patch<ContentDraftResponse>(`/api/content-studio/content-drafts/${id}/`, payload);
    return data;
  },

  get: async (id: string): Promise<ContentDraftResponse> => {
    const { data } = await apiClient.get<ContentDraftResponse>(`/api/content-studio/content-drafts/${id}/`);
    return data;
  },

  requestApproval: async (id: string): Promise<void> => {
    await apiClient.post(`/api/content-studio/content-drafts/${id}/request_approval/`);
  },

  approve: async (id: string, notes: string = ""): Promise<void> => {
    await apiClient.post(`/api/content-studio/content-drafts/${id}/approve/`, { notes });
  },

  reject: async (id: string, notes: string = ""): Promise<void> => {
    await apiClient.post(`/api/content-studio/content-drafts/${id}/reject/`, { notes });
  },

  schedule: async (id: string, schedules: { platform_id: string, scheduled_time: string }[]): Promise<void> => {
    await apiClient.post(`/api/content-studio/content-drafts/${id}/schedule/`, { schedules });
  },

  publish: async (id: string): Promise<ContentDraftResponse> => {
    const { data } = await apiClient.post<ContentDraftResponse>(`/api/content-studio/content-drafts/${id}/publish/`);
    return data;
  },

  mockRegenerate: async (id: string, reason: string): Promise<{ version_id: string, version_number: number }> => {
    const { data } = await apiClient.post(`/api/content-studio/content-drafts/${id}/regenerate/`, { reason });
    return data;
  }
};
