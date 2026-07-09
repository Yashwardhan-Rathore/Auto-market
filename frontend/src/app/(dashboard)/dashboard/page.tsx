'use client';

import { useAuth } from '@/hooks/useAuth';
import { 
  Megaphone, Users, UserCheck, DollarSign, Cpu, Mail, Zap, Target, TrendingUp 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${className}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>;
}

function KpiCard({ icon, label, value, delta, wide }: { icon: React.ReactNode; label: string; value: string | number; delta?: string; wide?: boolean }) {
  const pos = delta?.startsWith("+") ?? true;
  return (
    <div className={`bg-card border border-border p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow ${wide ? "col-span-2" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{icon}</span>
        {delta && <Badge className={pos ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{delta}</Badge>}
      </div>
      <div>
        <p className="text-2xl font-black" style={{ fontFamily: "'Archivo Black', sans-serif" }}>{value}</p>
        <p {...mono("text-xs text-muted-foreground mt-0.5 tracking-wide uppercase")}>{label}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
      <div>
        <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>{title}</h2>
        {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// Removed mock fallback data for channels and campaigns
const COLORS = ["#0a0a0a", "#e8001a", "#2563eb", "#16a34a", "#9333ea"];

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: overview } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: DashboardService.getOverview,
    enabled: !!user,
  });

  const { data: analytics } = useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: DashboardService.getAnalyticsSummary,
    enabled: !!user,
  });

  if (!user || !user.role) return null;

  const role = user.role.toUpperCase();

  const campStatusData = overview ? [
    { status: "Draft", count: overview.campaigns?.draft || 0 },
    { status: "Scheduled", count: overview.campaigns?.scheduled || 0 },
    { status: "Sending", count: overview.campaigns?.sending || 0 },
    { status: "Completed", count: overview.campaigns?.completed || 0 },
  ] : [];

  const channelData = analytics ? [
    { channel: "Email", value: analytics.email?.sent || 0 },
    { channel: "SMS", value: analytics.sms?.sent || 0 },
    { channel: "WhatsApp", value: analytics.whatsapp?.sent || 0 },
  ].filter(c => c.value > 0) : [];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title={`${role.replace('_', ' ')} Dashboard`} sub={`Welcome back, ${user.first_name || user.email}`} />
      
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {role === 'SUPER_ADMIN' && (
          <>
            <KpiCard icon={<Megaphone size={18} />} label="Total Campaigns" value={overview?.campaigns?.total || 0} />
            <KpiCard icon={<Mail size={18} />} label="Total Deliveries" value={overview?.deliveries?.total || 0} />
            <KpiCard icon={<Zap size={18} />} label="Email Open Rate" value={`${analytics?.email?.open_rate || 0}%`} />
            <KpiCard icon={<Target size={18} />} label="Global Success Rate" value={`${overview?.deliveries?.success_rate || 0}%`} />
            <KpiCard icon={<TrendingUp size={18} />} label="Automations Executed" value={analytics?.workflow?.execution_count || 0} />
          </>
        )}
        
        {role === 'ADMIN' && (
          <>
            <KpiCard icon={<Megaphone size={18} />} label="Active Campaigns" value={overview?.campaigns?.total || 0} />
            <KpiCard icon={<Mail size={18} />} label="Emails Sent" value={analytics?.email?.sent || 0} />
            <KpiCard icon={<Zap size={18} />} label="Email Open Rate" value={`${analytics?.email?.open_rate || 0}%`} />
            <KpiCard icon={<Target size={18} />} label="Delivery Success" value={`${overview?.deliveries?.success_rate || 0}%`} />
            <KpiCard icon={<TrendingUp size={18} />} label="Automations Run" value={analytics?.workflow?.execution_count || 0} />
          </>
        )}

        {role === 'USER' && (
          <>
            <KpiCard icon={<Megaphone size={18} />} label="My Campaigns" value={overview?.campaigns?.total || 0} />
            <KpiCard icon={<Mail size={18} />} label="My Deliveries" value={overview?.deliveries?.total || 0} />
            <KpiCard icon={<Zap size={18} />} label="Email Open Rate" value={`${analytics?.email?.open_rate || 0}%`} />
            <KpiCard icon={<Target size={18} />} label="My Delivery Success" value={`${overview?.deliveries?.success_rate || 0}%`} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border p-5">
          <p className="font-semibold text-sm mb-1">Campaign Overview</p>
          <p className="text-xs text-muted-foreground mb-4">Distribution by status</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={campStatusData} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#f8f8f8' }} contentStyle={{ fontSize: 11, fontFamily: "JetBrains Mono", border: "1px solid #0a0a0a", borderRadius: 0 }} />
              <Bar dataKey="count" fill="#0a0a0a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border p-5 flex-1">
            <p className="font-semibold text-sm mb-4">Channel Split</p>
            {channelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={channelData} dataKey="value" nameKey="channel" cx="50%" cy="50%" outerRadius={55} label={({ channel, percent }: any) => `${channel} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 9, fontFamily: "JetBrains Mono" }}>
                    {channelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[130px] items-center justify-center text-sm text-muted-foreground italic">No communication data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
