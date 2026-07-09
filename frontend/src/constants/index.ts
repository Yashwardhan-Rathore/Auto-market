// ============================================================
// App Constants
// ============================================================

export const APP_NAME = 'AutoMarket' as const;
export const APP_DESCRIPTION = 'Enterprise Marketing Automation Platform' as const;
export const APP_VERSION = '1.0.0' as const;

// ============================================================
// Routing
// ============================================================

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // App
  DASHBOARD: '/dashboard',

  // CRM
  CONTACTS: '/contacts',
  CONTACT_DETAIL: (id: string) => `/contacts/${id}`,
  COMPANIES: '/companies',
  COMPANY_DETAIL: (id: string) => `/companies/${id}`,

  // Marketing
  CAMPAIGNS: '/campaigns',
  CAMPAIGN_DETAIL: (id: string) => `/campaigns/${id}`,
  CAMPAIGN_NEW: '/campaigns/new',

  // Automation
  WORKFLOWS: '/workflows',
  WORKFLOW_BUILDER: (id: string) => `/workflows/${id}/builder`,
  WORKFLOW_LOGS: '/workflows/logs',

  // Content
  FORMS: '/forms',
  FORM_BUILDER: (id: string) => `/forms/${id}/builder`,
  LANDING_PAGES: '/landing-pages',
  CONTENT_STUDIO: '/content-studio',
  SOCIAL: '/social',

  // Analytics
  ANALYTICS: '/analytics',
  REPORTS: '/reports',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_INTEGRATIONS: '/settings/integrations',
  SETTINGS_BILLING: '/settings/billing',
  SETTINGS_TEAM: '/settings/team',
  SETTINGS_AUDIT_LOGS: '/settings/audit-logs',

  // Profile
  PROFILE: '/profile',

  // Notifications
  NOTIFICATIONS: '/notifications',
} as const;

// ============================================================
// Pagination
// ============================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 25,
  LIMIT_OPTIONS: [10, 25, 50, 100],
} as const;

// ============================================================
// Local Storage Keys
// ============================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'am_access_token',
  REFRESH_TOKEN: 'am_refresh_token',
  TENANT_ID: 'am_tenant_id',
  WORKSPACE_ID: 'am_workspace_id',
  THEME: 'am_theme',
  SIDEBAR_STATE: 'am_sidebar_collapsed',
} as const;

// ============================================================
// Date Formats
// ============================================================

export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_TIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
  SHORT: 'MM/dd/yyyy',
  MONTH_YEAR: 'MMMM yyyy',
  TIME: 'h:mm a',
} as const;

// ============================================================
// Status Colors
// ============================================================

export const STATUS_COLORS = {
  ACTIVE: 'text-green-600 bg-green-50 border-green-200',
  INACTIVE: 'text-gray-600 bg-gray-50 border-gray-200',
  PENDING: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  SUSPENDED: 'text-red-600 bg-red-50 border-red-200',
  DRAFT: 'text-gray-600 bg-gray-50 border-gray-200',
  PUBLISHED: 'text-green-600 bg-green-50 border-green-200',
  SCHEDULED: 'text-blue-600 bg-blue-50 border-blue-200',
  PAUSED: 'text-orange-600 bg-orange-50 border-orange-200',
  COMPLETED: 'text-purple-600 bg-purple-50 border-purple-200',
  FAILED: 'text-red-600 bg-red-50 border-red-200',
} as const;

// ============================================================
// Campaign Types
// ============================================================

export const CAMPAIGN_TYPES = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  WHATSAPP: 'WHATSAPP',
  PUSH: 'PUSH',
} as const;

// ============================================================
// Workflow Node Types
// ============================================================

export const WORKFLOW_NODE_TYPES = {
  TRIGGER: 'trigger',
  CONDITION: 'condition',
  ACTION: 'action',
  DELAY: 'delay',
  BRANCH: 'branch',
  WEBHOOK: 'webhook',
  END: 'end',
} as const;

// ============================================================
// Query Keys
// ============================================================

export const QUERY_KEYS = {
  USER: ['user'] as const,
  WORKSPACE: ['workspace'] as const,
  CONTACTS: ['contacts'] as const,
  CONTACT: (id: string) => ['contacts', id] as const,
  COMPANIES: ['companies'] as const,
  COMPANY: (id: string) => ['companies', id] as const,
  CAMPAIGNS: ['campaigns'] as const,
  CAMPAIGN: (id: string) => ['campaigns', id] as const,
  WORKFLOWS: ['workflows'] as const,
  WORKFLOW: (id: string) => ['workflows', id] as const,
  ANALYTICS: ['analytics'] as const,
  NOTIFICATIONS: ['notifications'] as const,
  DASHBOARD_STATS: ['dashboard', 'stats'] as const,
} as const;
