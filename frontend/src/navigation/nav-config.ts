import {
  LayoutDashboard,
  Users,
  Building2,
  Mail,
  GitBranch,
  FileText,
  Globe,
  PenTool,
  Share2,
  BarChart3,
  PieChart,
  Settings,
  Bell,
  CreditCard,
  UserCircle,
  Shield,
  Puzzle,
  ScrollText,
  Activity,
} from 'lucide-react';
import type { NavItem, UserRole } from '@/types';
import { ROUTES } from '@/constants';

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    id: 'crm',
    label: 'CRM',
    href: '#',
    icon: Users,
    children: [
      { id: 'contacts', label: 'Contacts', href: ROUTES.CONTACTS, icon: Users },
      { id: 'companies', label: 'Companies', href: ROUTES.COMPANIES, icon: Building2 },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    href: '#',
    icon: Mail,
    children: [
      { id: 'campaigns', label: 'Campaigns', href: ROUTES.CAMPAIGNS, icon: Mail },
      { id: 'workflows', label: 'Workflows', href: ROUTES.WORKFLOWS, icon: GitBranch },
      { id: 'workflow-logs', label: 'Workflow Logs', href: ROUTES.WORKFLOW_LOGS, icon: Activity },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    href: '#',
    icon: PenTool,
    children: [
      { id: 'forms', label: 'Forms', href: ROUTES.FORMS, icon: FileText },
      { id: 'landing-pages', label: 'Landing Pages', href: ROUTES.LANDING_PAGES, icon: Globe },
      { id: 'content-studio', label: 'Content Studio', href: ROUTES.CONTENT_STUDIO, icon: PenTool },
      { id: 'social', label: 'Social Publishing', href: ROUTES.SOCIAL, icon: Share2, isNew: true },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '#',
    icon: BarChart3,
    children: [
      { id: 'analytics', label: 'Analytics', href: ROUTES.ANALYTICS, icon: BarChart3 },
      { id: 'reports', label: 'Reports', href: ROUTES.REPORTS, icon: PieChart },
    ],
  },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'team',
    label: 'Team',
    href: ROUTES.SETTINGS_TEAM,
    icon: Users,
    roles: ['COMPANY_ADMIN', 'SUPER_ADMIN'],
  },
  {
    id: 'billing',
    label: 'Billing',
    href: ROUTES.SETTINGS_BILLING,
    icon: CreditCard,
    roles: ['COMPANY_ADMIN', 'SUPER_ADMIN'],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    href: ROUTES.SETTINGS_INTEGRATIONS,
    icon: Puzzle,
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    href: ROUTES.SETTINGS_AUDIT_LOGS,
    icon: ScrollText,
    roles: ['COMPANY_ADMIN', 'SUPER_ADMIN'],
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    id: 'notifications',
    label: 'Notifications',
    href: ROUTES.NOTIFICATIONS,
    icon: Bell,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
];

export function filterNavByRole(items: NavItem[], role: UserRole): NavItem[] {
  return items
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children ? filterNavByRole(item.children, role) : undefined,
    }));
}
