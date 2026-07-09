import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';

export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public payload: ApiErrorResponse
  ) {
    super(payload.message || 'An unexpected error occurred');
    this.name = 'ApiError';
  }
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Injects authentication token and active tenant
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId && config.headers) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles token refreshes and uniform API errors
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh automatically on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        if (refreshToken) {
          const refreshResponse = await axios.post<{ token: string }>(
            `${env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`,
            { refreshToken }
          );
          const newAccessToken = refreshResponse.data.token;
          localStorage.setItem('auth_token', newAccessToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return httpClient(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Wrap and normalize external backend error payload
    const normalizedError = new ApiError(
      error.response?.status || 500,
      error.response?.data || {
        message: 'A network error occurred. Please check your connection.',
        code: 'NETWORK_ERROR',
      }
    );

    return Promise.reject(normalizedError);
  }
);
