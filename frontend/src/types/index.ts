// ============================================================
// Global API Types
// ============================================================

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: Pagination;
  message: string;
  success: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, string[]>;
}

// ============================================================
// Query / Filter Types
// ============================================================

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

// ============================================================
// Entity Base Types
// ============================================================

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantEntity extends BaseEntity {
  tenantId: string;
}

// ============================================================
// User & Auth Types
// ============================================================

export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'EMPLOYEE';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

export interface User extends TenantEntity {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

// ============================================================
// Workspace / Tenant Types
// ============================================================

export interface Workspace extends BaseEntity {
  name: string;
  slug: string;
  logo?: string;
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  membersCount: number;
  contactsCount: number;
  timezone: string;
  currency: string;
}

// ============================================================
// Select / Option Types
// ============================================================

export interface SelectOption<T = string> {
  label: string;
  value: T;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// ============================================================
// Table Types
// ============================================================

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string | number;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface BulkAction {
  label: string;
  value: string;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
}

// ============================================================
// Navigation Types
// ============================================================

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
  roles?: UserRole[];
  permissions?: string[];
  isNew?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ============================================================
// Notification Types
// ============================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification extends TenantEntity {
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
}
