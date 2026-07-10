import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from cookie
    const token = Cookies.get('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = Cookies.get('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh token
        const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        
        // Save new access token
        Cookies.set('accessToken', access, { secure: true, sameSite: 'strict' });
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        // Only redirect if we're in the browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        toast.error("Access Denied: You do not have permission to perform this action.");
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
