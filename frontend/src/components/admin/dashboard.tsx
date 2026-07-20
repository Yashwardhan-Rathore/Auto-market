"use client";

import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, Clock3, Mail, Megaphone, Send, Target, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { parseApiError } from "@/services/api-client";
import { superAdminService } from "@/services/super-admin.service";

const reveal={hidden:{opacity:0,y:12},show:(i:number)=>({opacity:1,y:0,transition:{delay:i*.06,duration:.3}})};
const compact=(value:number)=>new Intl.NumberFormat("en",{notation:value>9999?"compact":"standard",maximumFractionDigits:1}).format(value);

export function AdminDashboard(){
  const [dashboard,analytics]=useQueries({queries:[
    {queryKey:["admin-dashboard"],queryFn:superAdminService.dashboard},
    {queryKey:["admin-analytics"],queryFn:superAdminService.analytics},
  ]});
  if(dashboard.isLoading||analytics.isLoading)return <div className="space-y-5"><div className="h-20 animate-pulse rounded-2xl bg-white"/><div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i=><div className="h-36 animate-pulse rounded-2xl bg-white" key={i}/>)}</div><div className="h-96 animate-pulse rounded-2xl bg-white"/></div>;
  const error=dashboard.error||analytics.error;
  if(error)return <div className="sa-card p-12 text-center"><Activity className="mx-auto text-red-500"/><h2 className="mt-3 text-lg font-bold">Dashboard data unavailable</h2><p className="mt-1 text-sm text-slate-500">{parseApiError(error)}</p></div>;
  const campaigns=dashboard.data?.campaigns;
  const delivery=dashboard.data?.deliveries;
  const totalSent=(analytics.data?.email.sent??0)+(analytics.data?.sms.sent??0)+(analytics.data?.whatsapp.sent??0);
  const cards=[
    {label:"Total campaigns",value:campaigns?.total??0,note:`${campaigns?.sending??0} currently sending`,icon:Megaphone,color:"from-blue-500 to-cyan-500"},
    {label:"Messages sent",value:totalSent,note:"Across all active channels",icon:Send,color:"from-violet-500 to-fuchsia-500"},
    {label:"Delivery rate",value:`${delivery?.success_rate??0}%`,note:`${compact(delivery?.delivered??0)} delivered`,icon:CheckCircle2,color:"from-emerald-500 to-teal-500"},
    {label:"Email open rate",value:`${analytics.data?.email.open_rate??0}%`,note:`${analytics.data?.email.click_rate??0}% click rate`,icon:Target,color:"from-orange-500 to-rose-500"},
  ];
  const chart=[
    {name:"Draft",value:campaigns?.draft??0},{name:"Scheduled",value:campaigns?.scheduled??0},
    {name:"Sending",value:campaigns?.sending??0},{name:"Completed",value:campaigns?.completed??0},
  ];
  return <div>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-emerald-700"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"/>Live analytics</span><h1 className="sa-title mt-3">ADMIN DASHBOARD</h1><p className="sa-subtitle">Campaign, delivery and engagement performance at a glance</p></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card,i)=><motion.article variants={reveal} initial="hidden" animate="show" custom={i} className="sa-card group relative overflow-hidden p-5 hover:-translate-y-1" key={card.label}><div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${card.color} opacity-10 blur-xl transition group-hover:scale-125 group-hover:opacity-20`}/><div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}><card.icon size={20}/></div><strong className="mt-5 block text-3xl font-black tracking-tight text-slate-950">{typeof card.value==="number"?compact(card.value):card.value}</strong><p className="mt-1 font-semibold text-slate-700">{card.label}</p><p className="mt-1 text-xs text-slate-400">{card.note}</p></motion.article>)}</div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.75fr]">
      <motion.section variants={reveal} initial="hidden" animate="show" custom={5} className="sa-card min-h-[390px] p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Campaign pipeline</h2><p className="text-xs text-slate-500">Live campaign status distribution</p></div><TrendingUp className="text-blue-500"/></div><div className="mt-5 h-[290px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><defs><linearGradient id="campaignFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={.35}/><stop offset="100%" stopColor="#2563eb" stopOpacity={.02}/></linearGradient></defs><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:"#64748b",fontSize:12}}/><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill:"#94a3b8",fontSize:11}}/><Tooltip contentStyle={{borderRadius:12,border:"1px solid #e2e8f0",boxShadow:"0 12px 30px rgba(15,23,42,.1)"}}/><Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="url(#campaignFill)"/></AreaChart></ResponsiveContainer></div></motion.section>
      <motion.section variants={reveal} initial="hidden" animate="show" custom={6} className="sa-card p-6"><h2 className="font-bold text-slate-900">Performance pulse</h2><p className="text-xs text-slate-500">Key operational signals</p><div className="mt-6 space-y-4">{[{label:"Completed campaigns",value:campaigns?.completed??0,icon:CheckCircle2,tone:"bg-emerald-100 text-emerald-600"},{label:"Scheduled",value:campaigns?.scheduled??0,icon:Clock3,tone:"bg-violet-100 text-violet-600"},{label:"Pending deliveries",value:delivery?.pending??0,icon:Mail,tone:"bg-amber-100 text-amber-600"},{label:"Failed deliveries",value:delivery?.failed??0,icon:Activity,tone:"bg-rose-100 text-rose-600"}].map(item=><div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/40" key={item.label}><div className={`grid h-10 w-10 place-items-center rounded-xl ${item.tone}`}><item.icon size={19}/></div><div className="min-w-0 flex-1"><p className="text-xs text-slate-500">{item.label}</p><strong className="text-xl text-slate-900">{compact(item.value)}</strong></div></div>)}</div></motion.section>
    </div>
  </div>;
}
