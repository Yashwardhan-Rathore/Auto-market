"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, MessageSquare, ArrowUpRight, ArrowDownRight,
  Instagram, Linkedin, Twitter, Facebook, ArrowRight,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ── Types ── */
type Period = "This Week" | "This Month" | "This Year";

/* ── Mock data ── */
const DAYS = ["18 May","19 May","20 May","21 May","22 May","23 May","24 May"];

const campaignData = {
  "This Week": DAYS.map((d, i) => ({
    date: d,
    Email:    [8.4,9.1,8.8,9.6,9.2,10.1,9.5][i],
    SMS:      [5.2,6.1,5.8,7.1,6.5,7.4,6.9][i],
    WhatsApp: [3.8,4.5,4.2,5.0,4.7,5.6,5.1][i],
  })),
  "This Month": DAYS.map((d, i) => ({
    date: d,
    Email:    [7.2,8.0,7.6,8.8,8.3,9.1,8.7][i],
    SMS:      [4.8,5.6,5.1,6.3,5.8,6.7,6.2][i],
    WhatsApp: [3.1,3.9,3.5,4.4,4.0,4.9,4.5][i],
  })),
  "This Year": DAYS.map((d, i) => ({
    date: d,
    Email:    [6.5,7.3,6.9,8.1,7.6,8.5,8.0][i],
    SMS:      [4.1,4.9,4.4,5.6,5.1,6.0,5.5][i],
    WhatsApp: [2.8,3.5,3.1,4.0,3.6,4.5,4.1][i],
  })),
};

const socialData = {
  "This Week": DAYS.map((d, i) => ({
    date: d,
    Instagram: [12400,13200,12800,14100,13700,15100,14600][i],
    LinkedIn:   [8700, 9300, 8900, 9800, 9500,10300, 9900][i],
    "X (Twitter)": [15800,14900,15200,16100,15600,16800,16200][i],
    Facebook:  [9600,10100, 9800,10600,10300,11000,10700][i],
  })),
  "This Month": DAYS.map((d, i) => ({
    date: d,
    Instagram: [11000,11800,11400,12600,12200,13500,13000][i],
    LinkedIn:   [7500, 8100, 7800, 8700, 8400, 9200, 8800][i],
    "X (Twitter)": [14200,13500,13800,14700,14300,15400,14900][i],
    Facebook:  [8400, 8900, 8600, 9300, 9100, 9800, 9500][i],
  })),
  "This Year": DAYS.map((d, i) => ({
    date: d,
    Instagram: [9800,10500,10100,11200,10800,12000,11500][i],
    LinkedIn:   [6600, 7200, 6900, 7700, 7400, 8200, 7800][i],
    "X (Twitter)": [12500,11900,12200,13000,12600,13700,13200][i],
    Facebook:  [7200, 7700, 7400, 8100, 7900, 8600, 8300][i],
  })),
};

const channelRows = [
  { icon: Mail,          color: "text-blue-500",   bg: "bg-blue-50",   name: "Email",    sent: 45230, ctr: 9.12,  ctrDir: "up",   ctrDelta: 14.3, active: 6, activeDir: "up",   activeDelta: 20.0 },
  { icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-50", name: "SMS",      sent: 23870, ctr: 7.21,  ctrDir: "down", ctrDelta:  5.1, active: 3, activeDir: "up",   activeDelta:  7.1 },
  { icon: WhatsAppIcon,  color: "text-green-500",  bg: "bg-green-50",  name: "WhatsApp", sent: 31560, ctr: 8.93,  ctrDir: "up",   ctrDelta: 18.2, active: 3, activeDir: "up",   activeDelta: 50.0 },
];

const socialRows = [
  { Icon: Instagram, color: "text-pink-500",   bg: "bg-pink-50",   name: "Instagram",   reach: "12.4K", reachDir: "up",   reachDelta: 15.3, followers: "5.6K", followersDir: "up",   followersDelta: 8.7  },
  { Icon: Linkedin,  color: "text-blue-600",   bg: "bg-blue-50",   name: "LinkedIn",    reach: "8.7K",  reachDir: "up",   reachDelta: 11.2, followers: "3.2K", followersDir: "up",   followersDelta: 6.8  },
  { Icon: Twitter,   color: "text-slate-700",  bg: "bg-slate-100", name: "X (Twitter)", reach: "15.8K", reachDir: "down", reachDelta:  2.3, followers: "7.1K", followersDir: "down", followersDelta: 1.1  },
  { Icon: Facebook,  color: "text-blue-500",   bg: "bg-blue-50",   name: "Facebook",    reach: "9.6K",  reachDir: "down", reachDelta:  7.8, followers: "4.3K", followersDir: "up",   followersDelta: 3.6  },
];

/* ── tiny sparkline data per row ── */
const sparkLines: Record<string, number[]> = {
  Email:       [6,7,8,7,9,9,8],
  SMS:         [8,7,6,7,5,6,5],
  WhatsApp:    [5,6,7,8,9,9,10],
  Instagram:   [10,11,12,12,13,14,15],
  LinkedIn:    [8,8,9,9,10,10,11],
  "X (Twitter)": [12,11,11,10,10,9,10],
  Facebook:    [7,8,8,9,9,10,11],
};

/* ── WhatsApp icon (not in lucide) ── */
function WhatsAppIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.121 1.534 5.857L0 24l6.335-1.521A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.783 9.783 0 01-5.013-1.38l-.36-.214-3.733.897.933-3.621-.235-.372A9.784 9.784 0 012.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z"/>
    </svg>
  );
}

/* ── Delta badge ── */
function Delta({ dir, val }: { dir: "up" | "down"; val: number }) {
  const up = dir === "up";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
      {up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
      {val}%
    </span>
  );
}

/* ── Mini sparkline ── */
function Spark({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const W = 60, H = 24, step = W / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${H - ((v - min) / range) * H}`).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Donut chart ── */
function Donut({ used, total }: { used: number; total: number }) {
  const r = 52, cx = 68, cy = 68, stroke = 14;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(used / total, 1);
  const dash = pct * circ;
  return (
    <svg width={136} height={136} viewBox="0 0 136 136">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2563eb" strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        strokeDashoffset={circ / 4} style={{ transition: "stroke-dasharray .8s ease" }}/>
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-900" fontSize="18" fontWeight="800">
        {used.toLocaleString()}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-slate-400" fontSize="10">
        of {total.toLocaleString()}
      </text>
      <text x={cx} y={cy + 25} textAnchor="middle" className="fill-slate-400" fontSize="9">
        credits used
      </text>
    </svg>
  );
}

/* ── Period selector ── */
function PeriodTabs({ active, onChange }: { active: Period; onChange: (p: Period) => void }) {
  const opts: Period[] = ["This Week", "This Month", "This Year"];
  return (
    <div className="flex items-center gap-0 rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold">
      {opts.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`rounded-lg px-3 py-1.5 transition-colors ${active === o ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          {o}
        </button>
      ))}
      <button className="ml-1 grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>
    </div>
  );
}

/* ── Small dropdown ── */
function MiniSelect({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300">
      {label}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
export function SuperAdminAnalytics() {
  const [period, setPeriod] = useState<Period>("This Week");

  const creditsUsed = 4680, creditsTotal = 10000;
  const creditsRemaining = creditsTotal - creditsUsed;

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Analytics</h1>
          <p className="mt-0.5 text-sm text-slate-500">Track performance and engagement across all channels</p>
        </div>
        <PeriodTabs active={period} onChange={setPeriod}/>
      </div>

      {/* ══ ROW 1: Credit Usage / Campaign Overview / Social Media Overview ══ */}
      <div className="grid gap-5 xl:grid-cols-[300px_1fr_280px]">

        {/* ── Credit Usage ── */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="sa-card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Credit Usage</p>
          <div className="mt-3 flex items-center gap-4">
            <Donut used={creditsUsed} total={creditsTotal}/>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"/>
                <span className="font-semibold text-slate-700">Used</span>
              </div>
              <p className="text-slate-500">{creditsUsed.toLocaleString()} <span className="text-slate-400">(46.80%)</span></p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200"/>
                <span className="font-semibold text-slate-700">Remaining</span>
              </div>
              <p className="text-slate-500">{creditsRemaining.toLocaleString()} <span className="text-slate-400">(53.20%)</span></p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs text-blue-600">
            <svg className="mt-0.5 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            You have sufficient credits for your campaigns.
          </div>
        </motion.div>

        {/* ── Campaign Overview ── */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.05}} className="sa-card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Campaign Overview</p>
          <div className="mt-3 grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs text-slate-500">Click Through Rate (CTR)</p>
              <p className="mt-1 text-2xl font-black text-slate-900">8.42%</p>
              <Delta dir="up" val={12.5}/>
            </div>
            <div>
              <p className="text-xs text-slate-500">Active Campaigns</p>
              <p className="mt-1 text-2xl font-black text-slate-900">12</p>
              <Delta dir="up" val={20.0}/>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { Icon: Mail, bg:"bg-blue-50", color:"text-blue-500", name:"Email",    ctr:9.12, dir:"up",   delta:14.3, active:6, aDir:"up",  aDelta:20.0 },
              { Icon: MessageSquare, bg:"bg-orange-50", color:"text-orange-500", name:"SMS", ctr:7.21, dir:"down", delta:5.1, active:3, aDir:"up",  aDelta:7.1  },
              { Icon: WhatsAppIcon, bg:"bg-green-50", color:"text-green-500", name:"WhatsApp", ctr:8.93, dir:"up", delta:18.2, active:3, aDir:"up", aDelta:50.0 },
            ].map(ch => (
              <div key={ch.name} className="rounded-xl border border-slate-100 p-3">
                <div className={`mb-2 grid h-8 w-8 place-items-center rounded-lg ${ch.bg} ${ch.color}`}>
                  <ch.Icon size={16}/>
                </div>
                <p className="text-xs font-semibold text-slate-600">{ch.name}</p>
                <p className="mt-2 text-[10px] text-slate-400">CTR</p>
                <p className="text-sm font-bold text-slate-900">{ch.ctr}% <Delta dir={ch.dir as "up"|"down"} val={ch.delta}/></p>
                <p className="mt-1.5 text-[10px] text-slate-400">Active</p>
                <p className="text-sm font-bold text-slate-900">{ch.active} <Delta dir={ch.aDir as "up"|"down"} val={ch.aDelta}/></p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Social Media Overview ── */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.10}} className="sa-card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Social Media Overview</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {socialRows.map(s => (
              <div key={s.name} className="rounded-xl border border-slate-100 p-2.5">
                <div className="flex items-center gap-1.5">
                  <span className={`grid h-6 w-6 place-items-center rounded-md ${s.bg} ${s.color}`}>
                    <s.Icon size={13}/>
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{s.name}</span>
                </div>
                <div className="mt-2 space-y-0.5 text-[10px]">
                  <p className="text-slate-400">Reach <Delta dir={s.reachDir as "up"|"down"} val={s.reachDelta}/></p>
                  <p className="text-slate-400">Followers <Delta dir={s.followersDir as "up"|"down"} val={s.followersDelta}/></p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{s.reach}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── DETAILED VIEW label ── */}
      <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Detailed View</p>

      {/* ══ ROW 2: Campaign Performance / Social Media Performance ══ */}
      <div className="mt-3 grid gap-5 xl:grid-cols-2">

        {/* ── Campaign Performance chart ── */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.12}} className="sa-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Campaign Performance</h2>
            <div className="flex items-center gap-2">
              <MiniSelect label="CTR"/>
              <MiniSelect label="This Week"/>
            </div>
          </div>
          <div className="mt-1 flex gap-4 text-xs text-slate-500">
            {[{color:"#2563eb",label:"Email"},{color:"#f97316",label:"SMS"},{color:"#22c55e",label:"WhatsApp"}].map(l=>(
              <span key={l.label} className="flex items-center gap-1">
                <span className="h-2 w-4 rounded-full" style={{background:l.color}}/>
                {l.label}
              </span>
            ))}
          </div>
          <div className="mt-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={campaignData[period]} margin={{top:4,right:4,bottom:0,left:-20}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="date" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                <Tooltip contentStyle={{borderRadius:10,border:"1px solid #e2e8f0",fontSize:11}}
                  formatter={(v)=>v!=null?`${v}%`:''}/>
                <Line type="monotone" dataKey="Email"    stroke="#2563eb" strokeWidth={2} dot={{r:3,fill:"#2563eb"}} activeDot={{r:5}}/>
                <Line type="monotone" dataKey="SMS"      stroke="#f97316" strokeWidth={2} dot={{r:3,fill:"#f97316"}} activeDot={{r:5}}/>
                <Line type="monotone" dataKey="WhatsApp" stroke="#22c55e" strokeWidth={2} dot={{r:3,fill:"#22c55e"}} activeDot={{r:5}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Channel table */}
          <table className="mt-4 w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="pb-2 text-left font-semibold">Channel</th>
                <th className="pb-2 text-left font-semibold">Sent</th>
                <th className="pb-2 text-left font-semibold">CTR</th>
                <th className="pb-2 text-left font-semibold">Active Campaigns</th>
                <th className="pb-2 text-left font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {channelRows.map(r => (
                <tr key={r.name} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <span className={`grid h-6 w-6 place-items-center rounded-md ${r.bg} ${r.color}`}>
                        <r.icon size={13}/>
                      </span>
                      <span className="font-semibold text-slate-700">{r.name}</span>
                    </span>
                  </td>
                  <td className="py-2 text-slate-600">{r.sent.toLocaleString()}</td>
                  <td className="py-2">
                    <span className="font-semibold text-slate-800">{r.ctr}%</span>{" "}
                    <Delta dir={r.ctrDir as "up"|"down"} val={r.ctrDelta}/>
                  </td>
                  <td className="py-2">
                    <span className="font-semibold text-slate-800">{r.active}</span>{" "}
                    <Delta dir={r.activeDir as "up"|"down"} val={r.activeDelta}/>
                  </td>
                  <td className="py-2">
                    <Spark data={sparkLines[r.name]} color={r.name==="Email"?"#2563eb":r.name==="SMS"?"#f97316":"#22c55e"}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            View all campaigns <ArrowRight size={13}/>
          </button>
        </motion.div>

        {/* ── Social Media Performance chart ── */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.16}} className="sa-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Social Media Performance</h2>
            <div className="flex items-center gap-2">
              <MiniSelect label="Reach"/>
              <MiniSelect label="This Week"/>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-500">
            {[{color:"#ec4899",label:"Instagram"},{color:"#2563eb",label:"LinkedIn"},{color:"#1e293b",label:"X (Twitter)"},{color:"#3b82f6",label:"Facebook"}].map(l=>(
              <span key={l.label} className="flex items-center gap-1">
                <span className="h-2 w-4 rounded-full" style={{background:l.color}}/>
                {l.label}
              </span>
            ))}
          </div>
          <div className="mt-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={socialData[period]} margin={{top:4,right:4,bottom:0,left:-10}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="date" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}
                  tickFormatter={v=>v>=1000?`${v/1000}K`:v}/>
                <Tooltip contentStyle={{borderRadius:10,border:"1px solid #e2e8f0",fontSize:11}}
                  formatter={(v)=>v!=null&&typeof v==='number'?(v>=1000?`${(v/1000).toFixed(1)}K`:v):''}/>
                <Line type="monotone" dataKey="Instagram"   stroke="#ec4899" strokeWidth={2} dot={{r:3,fill:"#ec4899"}} activeDot={{r:5}}/>
                <Line type="monotone" dataKey="LinkedIn"    stroke="#2563eb" strokeWidth={2} dot={{r:3,fill:"#2563eb"}} activeDot={{r:5}}/>
                <Line type="monotone" dataKey="X (Twitter)" stroke="#1e293b" strokeWidth={2} dot={{r:3,fill:"#1e293b"}} activeDot={{r:5}}/>
                <Line type="monotone" dataKey="Facebook"    stroke="#3b82f6" strokeWidth={2} dot={{r:3,fill:"#3b82f6"}} activeDot={{r:5}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Social table */}
          <table className="mt-4 w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="pb-2 text-left font-semibold">Platform</th>
                <th className="pb-2 text-left font-semibold">Reach</th>
                <th className="pb-2 text-left font-semibold">Followers</th>
                <th className="pb-2 text-left font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {socialRows.map(s => (
                <tr key={s.name} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <span className={`grid h-6 w-6 place-items-center rounded-md ${s.bg} ${s.color}`}>
                        <s.Icon size={13}/>
                      </span>
                      <span className="font-semibold text-slate-700">{s.name}</span>
                    </span>
                  </td>
                  <td className="py-2">
                    <span className="font-semibold text-slate-800">{s.reach}</span>{" "}
                    <Delta dir={s.reachDir as "up"|"down"} val={s.reachDelta}/>
                  </td>
                  <td className="py-2">
                    <span className="font-semibold text-slate-800">{s.followers}</span>{" "}
                    <Delta dir={s.followersDir as "up"|"down"} val={s.followersDelta}/>
                  </td>
                  <td className="py-2">
                    <Spark data={sparkLines[s.name]}
                      color={s.name==="Instagram"?"#ec4899":s.name==="LinkedIn"?"#2563eb":s.name==="X (Twitter)"?"#1e293b":"#3b82f6"}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            View all social media analytics <ArrowRight size={13}/>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
