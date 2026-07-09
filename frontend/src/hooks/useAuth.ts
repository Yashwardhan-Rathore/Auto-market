import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@/services/auth.service';
import { LoginCredentials, RegisterCredentials } from '@/types/auth';
import Cookies from 'js-cookie';

export function useAuth() {
  const queryClient = useQueryClient();

  // Fetch current user profile
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: AuthService.getProfile,
    retry: false, // Don't retry on 401
    enabled: !!Cookies.get('accessToken'), // Only fetch if we have a token
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => AuthService.login(credentials),
    onSuccess: () => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => AuthService.register(credentials),
    onSuccess: (data) => {
      // Auto-login after registration is handled by the service storing tokens
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: AuthService.logout,
    isAuthenticated: !!user,
  };
}
