import { apiClient } from "@/services/api-client";
export const accountService = {
  createAdmin: async (payload: { email: string; password: string; first_name: string; last_name: string; mobile_no: string }) => (await apiClient.post("/api/auth/admins/", payload)).data,
  createUser: async (payload: { email: string; password: string; first_name: string; last_name: string; mobile_no: string }) => (await apiClient.post("/api/auth/users/", payload)).data,
  deleteAdmin: async (id: number) => (await apiClient.delete(`/api/auth/admins/${id}/`)).data,
  deleteUser: async (id: number) => (await apiClient.delete(`/api/auth/users/${id}/`)).data,
};
