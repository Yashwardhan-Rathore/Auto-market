'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Mail,
  GitBranch,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  FileText,
  CreditCard,
  Zap,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime, formatCurrency, formatCompactNumber } from '@/utils';
import { StatCard } from '@/components/shared/atoms/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  MOCK_STATS,
  MOCK_REVENUE_DATA,
  MOCK_CONTACT_GROWTH,
  MOCK_CAMPAIGN_TYPES,
  MOCK_RECENT_ACTIVITY,
  MOCK_UPCOMING_CAMPAIGNS,
} from '../constants/mock-data';
import type { RecentActivity, UpcomingCampaign } from '../types';
import { ROUTES } from '@/constants';

// ============================================================
// Custom Recharts Tooltip
// ============================================================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg text-xs space-y-1.5 min-w-[140px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium text-foreground">
            {typeof entry.value === 'number' && entry.value > 1000
              ? formatCurrency(entry.value)
              : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Activity Icon
// ============================================================
function ActivityIcon({ type }: { type: RecentActivity['type'] }) {
  const config = {
    contact_added: { icon: Users, className: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    campaign_sent: { icon: Send, className: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    workflow_triggered: { icon: GitBranch, className: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    form_submitted: { icon: FileText, className: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    payment: { icon: CreditCard, className: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  }[type];

  const Icon = config.icon;
  return (
    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', config.className)}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

// ============================================================
// Campaign type badge colors
// ============================================================
const CAMPAIGN_TYPE_BADGE: Record<string, 'default' | 'success' | 'warning' | 'info' | 'purple'> = {
  EMAIL: 'info',
  SMS: 'purple',
  WHATSAPP: 'success',
  PUSH: 'warning',
};

// ============================================================
// Section Header
// ============================================================
function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-4 shrink-0"
        >
          {action.label} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

// ============================================================
// Metric Row (open/click/conversion rates)
// ============================================================
function MetricBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ============================================================
// Main Dashboard View
// ============================================================
export function DashboardView() {
  const stats = MOCK_STATS;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Good morning, Alex 👋 — here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0">
          <Zap className="h-3.5 w-3.5" /> New Campaign
        </Button>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts}
          compact
          change={stats.contactsChange}
          icon={<Users className="h-5 w-5" />}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="Total Campaigns"
          value={stats.totalCampaigns}
          change={stats.campaignsChange}
          icon={<Mail className="h-5 w-5" />}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatCard
          title="Emails Sent"
          value={stats.emailsSent}
          compact
          change={stats.emailsSentChange}
          icon={<Send className="h-5 w-5" />}
          iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
        />
        <StatCard
          title="Revenue"
          value={stats.revenue}
          compact
          prefix="$"
          change={stats.revenueChange}
          icon={<DollarSign className="h-5 w-5" />}
          iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
      </motion.div>

      {/* ── CHARTS ROW 1: Revenue + Contact Growth ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Revenue Chart */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Revenue Overview"
              description="Monthly revenue vs. target"
              action={{ label: 'View reports', href: ROUTES.REPORTS }}
            />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={MOCK_REVENUE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="target" name="Target" stroke="#10b981" strokeWidth={2} strokeDasharray="4 3" fill="url(#targetGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <SectionHeader title="Email Performance" description="Avg. across all campaigns" />
          </CardHeader>
          <CardContent className="space-y-5">
            <MetricBar label="Open Rate" value={stats.openRate} color="#6366f1" />
            <MetricBar label="Click Rate" value={stats.clickRate} max={20} color="#8b5cf6" />
            <MetricBar label="Conversion Rate" value={stats.conversionRate} max={10} color="#10b981" />
            <MetricBar label="Workflow Success" value={stats.workflowSuccessRate} color="#f59e0b" />
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span>Performance is <strong className="text-foreground">15% above</strong> industry average</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── CHARTS ROW 2: Contact Growth + Campaign Types ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Contact Growth Bar Chart */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Contact Growth"
              description="New contacts added per month"
              action={{ label: 'View contacts', href: ROUTES.CONTACTS }}
            />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_CONTACT_GROWTH} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                <Bar dataKey="contacts" name="Total" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={32} />
                <Bar dataKey="new" name="New" fill="#a5b4fc" radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Type Donut */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <SectionHeader title="Campaigns by Type" description="Channel distribution" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={MOCK_CAMPAIGN_TYPES}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {MOCK_CAMPAIGN_TYPES.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, '']}
                  contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2">
              {MOCK_CAMPAIGN_TYPES.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </span>
                  <span className="font-semibold text-foreground">{entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── BOTTOM ROW: Activity + Upcoming Campaigns ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader
              title="Recent Activity"
              description="Latest events across your workspace"
            />
          </CardHeader>
          <CardContent className="space-y-0">
            {MOCK_RECENT_ACTIVITY.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-3 py-3',
                  index !== MOCK_RECENT_ACTIVITY.length - 1 && 'border-b'
                )}
              >
                <ActivityIcon type={activity.type} />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-foreground leading-snug">{activity.title}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{activity.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(activity.timestamp)} by{' '}
                    <span className="font-medium">{activity.actorName}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Campaigns */}
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader
              title="Upcoming Campaigns"
              description="Scheduled to send in the next 48 hours"
              action={{ label: 'View all', href: ROUTES.CAMPAIGNS }}
            />
          </CardHeader>
          <CardContent className="space-y-0">
            {MOCK_UPCOMING_CAMPAIGNS.map((campaign, index) => (
              <div
                key={campaign.id}
                className={cn(
                  'flex items-center gap-3 py-3',
                  index !== MOCK_UPCOMING_CAMPAIGNS.length - 1 && 'border-b'
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{campaign.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={CAMPAIGN_TYPE_BADGE[campaign.type] ?? 'default'} className="text-[10px] px-1.5 py-0 h-4">
                      {campaign.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatCompactNumber(campaign.recipientsCount)} recipients
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-foreground">
                    {formatRelativeTime(campaign.scheduledAt)}
                  </p>
                  <Badge
                    variant={campaign.status === 'SCHEDULED' ? 'success' : 'secondary'}
                    dot
                    className="text-[10px] px-1.5 py-0 h-4 mt-1"
                  >
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="pt-3">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={ROUTES.CAMPAIGNS}>
                  View all campaigns <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
