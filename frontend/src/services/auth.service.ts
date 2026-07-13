import apiClient from '@/lib/apiClient';
import { LoginCredentials, RegisterCredentials, AuthResponse, UserProfile } from '@/types/auth';
import Cookies from 'js-cookie';

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<{success: boolean, message: string, data: AuthResponse}>('/api/auth/login/', credentials);
    
    const authData = response.data.data;

    // Store tokens
    if (authData.access && authData.refresh) {
      Cookies.set('accessToken', authData.access, { secure: true, sameSite: 'strict' });
      Cookies.set('refreshToken', authData.refresh, { secure: true, sameSite: 'strict' });
    }
    
    return authData;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<{success: boolean, message: string, data: AuthResponse}>('/api/auth/register/', credentials);
    return response.data.data;
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/api/auth/profile/');
    return response.data;
  },

  listUsers: async (): Promise<{id: number, email: string, first_name: string, last_name: string}[]> => {
    const response = await apiClient.get('/api/auth/users/');
    return response.data;
  },

  createTeamMember: async (payload: any): Promise<any> => {
    const response = await apiClient.post('/api/auth/team/create/', payload);
    return response.data;
  }
};
