"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Bot, ChevronLeft, ContactRound, CreditCard, Gauge, ListChecks, LogOut, Megaphone, Menu, Settings, Share2, Tags, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { getAllowedNavigation, roleFromPath, type ModuleKey } from "@/permissions/permission-matrix";

const labels: Record<ModuleKey, string> = { dashboard:"Dashboard", admins:"Administrators", users:"Users", analytics:"Analytics", audiences:"Audiences", automations:"Automations", campaigns:"Campaigns", channels:"Channels", communications:"Communications", content:"Content Studio", customers:"Customers", forms:"Forms", tasks:"Tasks", templates:"Templates" };
const superNavigation = [
  {group:"Overview", items:[{key:"dashboard",label:"Dashboard",icon:Gauge}]},
  {group:"Management",items:[{key:"admins",label:"Manage Admins",icon:Users},{key:"users",label:"Manage Users",icon:Users},{key:"billing",label:"Billing & Usage",icon:CreditCard}]},
  {group:"Insights",items:[{key:"analytics",label:"Analytics",icon:BarChart3},{key:"ai-credits",label:"AI Credits",icon:Bot}]},
  {group:"System",items:[{key:"account",label:"Account",icon:Settings}]},
];
const adminNavigation = [
  {key:"dashboard",label:"Dashboard",icon:Gauge},
  {key:"users",label:"Team Management",icon:Users},
  {key:"customers",label:"Contacts",icon:ContactRound},
  {key:"audiences",label:"Segmentation",icon:Tags},
  {key:"tasks",label:"Task Management",icon:ListChecks},
  {key:"campaigns",label:"Campaigns",icon:Megaphone},
  {key:"channels",label:"Social Media",icon:Share2},
  {key:"analytics",label:"Analytics",icon:BarChart3},
  {key:"account",label:"Account",icon:Settings},
];

function initials(email:string, first?:string, last?:string){ return first||last ? `${first?.[0]??""}${last?.[0]??""}`.toUpperCase() : email.slice(0,2).toUpperCase(); }

export function PortalShell({ rolePath, children }: { rolePath: string; children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(); const router = useRouter(); const pathname = usePathname(); const expected = roleFromPath(rolePath);
  const [open,setOpen]=useState(false); const [collapsed,setCollapsed]=useState(false);
  useEffect(()=>{if(!loading&&!user)router.replace("/login");else if(!loading&&user&&user.role!==expected)router.replace("/forbidden");},[loading,user,expected,router]);
  const standardNav=useMemo(()=>user?getAllowedNavigation(user.role):[],[user]);
  if(loading||!user||user.role!==expected)return <div className="grid min-h-screen place-items-center bg-[#06101f] text-white"><div className="flex items-center gap-3"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500"/>Verifying session…</div></div>;
  const link=(key:string,label:string,Icon:typeof Gauge)=>{const href=`/${rolePath}/${key}`;const active=pathname===href;return <Link title={collapsed?label:undefined} key={key} onClick={()=>setOpen(false)} className={`sa-nav-link ${active?"sa-nav-active":""}`} href={href}><Icon size={20}/>{!collapsed&&<span>{label}</span>}</Link>};
  const sidebar=<motion.aside animate={{width:collapsed?88:284}} className="admin-sidebar flex h-full flex-col overflow-hidden border-r border-white/10 bg-[#06101f] text-white">
    <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-5"><motion.div whileHover={{rotate:-8,scale:1.08}} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30"><BarChart3 size={23}/></motion.div>{!collapsed&&<div><span className="text-[11px] font-bold tracking-[.18em] text-blue-400">{rolePath.replace("-"," ").toUpperCase()}</span><strong className="block whitespace-nowrap text-base">MARKETING AUTO.</strong></div>}<button aria-label="Close navigation" className="ml-auto md:hidden" onClick={()=>setOpen(false)}><X/></button></div>
    <nav className="flex-1 overflow-y-auto px-3 py-5">{rolePath==="super-admin"?superNavigation.map(group=><div className="mb-6" key={group.group}>{!collapsed&&<p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-500">{group.group}</p>}<div className="space-y-1">{group.items.map(i=>link(i.key,i.label,i.icon))}</div></div>):<div className="space-y-1">{(rolePath==="admin"?adminNavigation:standardNav.map(item=>({key:item,label:labels[item],icon:Gauge}))).map(item=>link(item.key,item.label,item.icon))}</div>}</nav>
    <div className="border-t border-white/10 p-3"><div className="flex items-center gap-3 rounded-xl bg-white/[.04] p-2.5"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 font-bold">{initials(user.email,user.first_name,user.last_name)}</div>{!collapsed&&<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{[user.first_name,user.last_name].filter(Boolean).join(" ")||user.email}</p><p className="text-xs text-slate-400">{user.role.replaceAll("_"," ")}</p></div>}<button aria-label="Log out" onClick={()=>void logout()} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><LogOut size={18}/></button></div><button className="mt-2 hidden w-full items-center justify-center rounded-lg py-2 text-slate-500 hover:bg-white/5 hover:text-white md:flex" onClick={()=>setCollapsed(v=>!v)}><motion.span animate={{rotate:collapsed?180:0}}><ChevronLeft size={18}/></motion.span></button></div>
  </motion.aside>;
  return <div className={`min-h-screen bg-[#f5f7fb] md:grid ${collapsed?"md:grid-cols-[88px_1fr]":"md:grid-cols-[284px_1fr]"} transition-[grid-template-columns] duration-300`}><div className="hidden md:block">{sidebar}</div><AnimatePresence>{open&&<motion.div className="fixed inset-0 z-50 md:hidden" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><button className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={()=>setOpen(false)}/><motion.div className="relative h-full w-[284px]" initial={{x:-284}} animate={{x:0}} exit={{x:-284}}>{sidebar}</motion.div></motion.div>}</AnimatePresence>
    <main className="min-w-0"><header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200/80 bg-white/85 px-4 shadow-[0_1px_18px_rgba(15,23,42,.04)] backdrop-blur-xl sm:px-6"><button aria-label="Open navigation" className="group grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md md:hidden" onClick={()=>setOpen(true)}><Menu className="transition group-hover:scale-105" size={21}/></button><button aria-label="Collapse navigation" className="group hidden h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md md:grid" onClick={()=>setCollapsed(v=>!v)}><Menu className="transition group-hover:scale-105" size={21}/></button></header><div className="p-4 sm:p-7 lg:p-9">{children}</div></main></div>;
}
