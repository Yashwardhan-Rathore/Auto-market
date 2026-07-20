import type { UserRole } from "@/constants/roles";

export interface AuthUser {
  id: number;
  email: string;
  username?: string | null;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  last_login?: string | null;
  date_joined?: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: { access: string; refresh: string; user: AuthUser };
}

export interface Paginated<T> { count: number; next: string | null; previous: string | null; results: T[] }
