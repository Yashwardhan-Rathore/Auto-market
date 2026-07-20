"use client";

import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, Bot, CheckCircle2, Clock3, Mail, Megaphone, Send, Users } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { parseApiError } from "@/services/api-client";
import { superAdminService } from "@/services/super-admin.service";

const enter={hidden:{opacity:0,y:14},show:(i:number)=>({opacity:1,y:0,transition:{delay:i*.055,duration:.28}})};
const fmt=(n:number)=>new Intl.NumberFormat("en",{notation:n>9999?"compact":"standard",maximumFractionDigits:1}).format(n);

export function SuperAdminDashboard(){
  const [stats,dashboard,analytics,billing]=useQueries({queries:[
    {queryKey:["sa-stats"],queryFn:superAdminService.stats},{queryKey:["sa-dashboard"],queryFn:superAdminService.dashboard},
    {queryKey:["sa-analytics"],queryFn:superAdminService.analytics},{queryKey:["sa-billing"],queryFn:superAdminService.billing},
  ]});
  const error=[stats,dashboard,analytics,billing].find(q=>q.error)?.error;
  const loading=[stats,dashboard,analytics,billing].some(q=>q.isLoading);
  if(loading)return <DashboardSkeleton/>;
  if(error)return <div className="sa-card p-10 text-center"><Activity className="mx-auto text-red-500"/><h2 className="mt-3 text-lg font-bold">Dashboard data unavailable</h2><p className="mt-1 text-sm text-slate-500">{parseApiError(error)}</p></div>;
  const metrics=[
    {label:"Total Campaigns",value:dashboard.data?.campaigns.total??0,icon:Megaphone},
    {label:"Total Admins",value:stats.data?.total_admins??0,icon:Users},
    {label:"Total Users",value:stats.data?.total_users??0,icon:Users},
    {label:"AI Credits",value:billing.data?.balance??0,icon:Bot},
    {label:"Messages Sent",value:(analytics.data?.email.sent??0)+(analytics.data?.sms.sent??0)+(analytics.data?.whatsapp.sent??0),icon:Send},
  ];
  const channels=[{name:"Email",value:analytics.data?.email.sent??0,color:"#1670f8"},{name:"SMS",value:analytics.data?.sms.sent??0,color:"#25bd72"},{name:"WhatsApp",value:analytics.data?.whatsapp.sent??0,color:"#8957e5"}];
  const statuses=[{label:"In progress",value:dashboard.data?.campaigns.sending??0,icon:Send,color:"blue"},{label:"Completed",value:dashboard.data?.campaigns.completed??0,icon:CheckCircle2,color:"emerald"},{label:"Scheduled",value:dashboard.data?.campaigns.scheduled??0,icon:Clock3,color:"violet"},{label:"Draft",value:dashboard.data?.campaigns.draft??0,icon:Megaphone,color:"amber"}];
  return <div><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className="sa-title">SUPER ADMIN DASHBOARD</h1><p className="sa-subtitle">Platform-wide overview · live backend data</p></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{metrics.map((m,i)=><motion.article variants={enter} initial="hidden" animate="show" custom={i} className="sa-card relative overflow-hidden p-5" key={m.label}><div className="metric-icon"><m.icon size={21}/></div><strong className="mt-4 block text-3xl font-black tracking-tight text-slate-950">{fmt(m.value)}</strong><p className="mt-1 text-sm text-slate-500">{m.label}</p><span className="absolute bottom-0 left-5 h-[3px] w-24 rounded-full bg-blue-500"/></motion.article>)}</div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.8fr]"><motion.section variants={enter} initial="hidden" animate="show" custom={5} className="sa-card min-h-[390px] p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Campaign performance</h2><p className="text-xs text-slate-500">Current status distribution</p></div><span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600">Real totals</span></div><div className="mt-8 grid h-[275px] grid-cols-4 items-end gap-4 border-b border-l border-dashed border-slate-200 px-5 pb-0">{statuses.map((s,i)=>{const max=Math.max(...statuses.map(x=>x.value),1);const height=Math.max(10,(s.value/max)*220);return <div className="flex h-full flex-col items-center justify-end gap-2" key={s.label}><span className="text-xs font-bold text-slate-600">{s.value}</span><motion.div initial={{height:0}} animate={{height}} transition={{delay:.25+i*.08,duration:.55}} className="w-full max-w-16 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_8px_20px_rgba(37,99,235,.2)]"/><span className="pb-2 text-center text-xs text-slate-500">{s.label}</span></div>})}</div></motion.section>
      <motion.section variants={enter} initial="hidden" animate="show" custom={6} className="sa-card p-5"><h2 className="font-bold text-slate-900">Channel split</h2><p className="text-xs text-slate-500">Recorded communication events</p><div className="h-[285px]">{channels.some(c=>c.value>0)?<ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={channels} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={3}>{channels.map(c=><Cell key={c.name} fill={c.color}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer>:<div className="grid h-full place-items-center text-center"><div><Mail className="mx-auto text-slate-300" size={40}/><p className="mt-3 font-semibold text-slate-700">No communication events yet</p><p className="text-xs text-slate-400">Charts populate from the analytics API.</p></div></div>}</div></motion.section></div>
    <motion.section variants={enter} initial="hidden" animate="show" custom={7} className="sa-card mt-5 p-5"><h2 className="font-bold text-slate-900">Campaign overview</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{statuses.map(s=><div className="rounded-xl border border-slate-200 p-4" key={s.label}><s.icon className={`text-${s.color}-500`} size={21}/><strong className="mt-3 block text-2xl text-slate-950">{s.value}</strong><p className="text-sm text-slate-500">{s.label}</p></div>)}</div></motion.section>
  </div>;
}
function DashboardSkeleton(){return <div className="space-y-5"><div className="h-16 w-80 animate-pulse rounded-xl bg-slate-200"/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[1,2,3,4,5].map(i=><div className="h-40 animate-pulse rounded-2xl bg-white" key={i}/>)}</div><div className="grid gap-5 xl:grid-cols-2"><div className="h-96 animate-pulse rounded-2xl bg-white"/><div className="h-96 animate-pulse rounded-2xl bg-white"/></div></div>}
