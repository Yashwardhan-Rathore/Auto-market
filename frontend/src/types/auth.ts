export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  company: {
    id: string;
    name: string;
  };
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: UserProfile;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  first_name: string;
  last_name: string;
  company_name: string;
}
