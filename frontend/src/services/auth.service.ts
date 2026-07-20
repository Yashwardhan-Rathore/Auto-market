import { apiClient } from "@/services/api-client";
import type { AuthUser, LoginResponse } from "@/types/auth";

export const authService = {
  login: async (payload: { email: string; password: string }) => (await apiClient.post<LoginResponse>("/api/auth/login/", payload)).data,
  profile: async () => (await apiClient.get<AuthUser>("/api/auth/profile/")).data,
  logout: async (refresh: string) => (await apiClient.post("/api/auth/logout/", { refresh })).data,
  forgotPassword: async (email: string) => (await apiClient.post("/api/auth/forgot-password/", { email })).data,
  resetPassword: async (payload: { email: string; otp: string; password: string; confirm_password: string }) => (await apiClient.post("/api/auth/reset-password/", payload)).data,
};
