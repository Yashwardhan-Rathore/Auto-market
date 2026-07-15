'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, CheckSquare, Megaphone, Users, Settings, Bell, Search, 
  ChevronDown, LogOut, Menu, GitBranch, FileText, Image, BarChart2, 
  CreditCard, Cpu, ShieldCheck, UserCheck, User, Filter, Share2, Sparkles
} from 'lucide-react';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const visible = expanded || hovered;

  if (!user || !user.role) return null; // Wait for full user load

  const role = user.role.toLowerCase() as 'super_admin' | 'admin' | 'user';
  
  const roleBg = role === "super_admin" ? "bg-[#0a0a0a]" : role === "admin" ? "bg-[#111827]" : "bg-foreground";
  const initials = user.first_name?.[0] || "" + user.last_name?.[0] || "";
  const uname = `${user.first_name} ${user.last_name}`;
  const accentLabel = role.replace('_', ' ');

  // Define Nav Groups based on role
  let navGroups: any[] = [];
  
  if (role === 'super_admin') {
    navGroups = [
      { label: "Overview", items: [{ id:"/dashboard", label:"Dashboard", icon:<LayoutDashboard size={15}/> }] },
      { label: "Management", items: [{ id:"/admins", label:"Manage Admins", icon:<Users size={15}/> }, { id:"/billing", label:"Billing & Plans", icon:<CreditCard size={15}/> }] },
      { label: "Insights", items: [{ id:"/analytics", label:"Analytics", icon:<BarChart2 size={15}/> }, { id:"/ai", label:"AI Credits", icon:<Cpu size={15}/> }] },
      { label: "System", items: [{ id:"/account", label:"Account", icon:<Settings size={15}/> }] },
    ];
  } else if (role === 'admin') {
    navGroups = [
      { label: "Overview", items: [{ id:"/dashboard", label:"Dashboard", icon:<LayoutDashboard size={15}/> }] },
      { label: "Audience", items: [{ id:"/contacts", label:"Contacts", icon:<Users size={15}/> }, { id:"/segments", label:"Segmentation", icon:<Filter size={15}/> }] },
      { label: "Marketing", items: [{ id:"/contentDrafts", label:"contentDrafts", icon:<Megaphone size={15}/> }, { id:"/automation", label:"Automation", icon:<GitBranch size={15}/> }, { id:"/social", label:"Social Publisher", icon:<Share2 size={15}/> }] },
      { label: "Team & Data", items: [{ id:"/team", label:"Team Management", icon:<UserCheck size={15}/> }, { id:"/analytics", label:"Analytics", icon:<BarChart2 size={15}/> }] },
      { label: "System", items: [{ id:"/account", label:"Account", icon:<Settings size={15}/> }] },
    ];
  } else {
    navGroups = [
      { label: "Main", items: [{ id:"/dashboard", label:"Dashboard", icon:<LayoutDashboard size={15}/> }, { id:"/tasks", label:"My Tasks", icon:<CheckSquare size={15}/> }, { id:"/contentDrafts", label:"My contentDrafts", icon:<Megaphone size={15}/> }] },
      { label: "Tools", items: [{ id:"/automation", label:"Automation Builder", icon:<GitBranch size={15}/> }, { id:"/contacts", label:"Contacts", icon:<Users size={15}/> }, { id:"/forms", label:"Forms", icon:<FileText size={15}/> }, { id:"/content-studio", label:"Content Studio ✦ AI", icon:<Sparkles size={15}/> }] },
      { label: "Library & Reports", items: [{ id:"/assets", label:"Asset Library", icon:<Image size={15}/> }, { id:"/performance", label:"My Performance", icon:<BarChart2 size={15}/> }] },
      { label: "System", items: [{ id:"/account", label:"Account", icon:<Settings size={15}/> }] },
    ];
  }

  const fullPageViews = new Set(["/automation", "/forms", "/assets"]);

  return (
    <div className="min-h-screen bg-background text-foreground flex" style={{ fontFamily:"'Archivo', sans-serif" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}
      <aside onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} className={`fixed lg:static inset-y-0 left-0 z-30 ${roleBg} text-white flex flex-col overflow-y-auto overflow-x-hidden transition-all duration-200 ${sidebarOpen?"translate-x-0":"-translate-x-full lg:translate-x-0"} ${visible?"lg:w-56":"lg:w-14"} w-56`}>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-white/10 flex-shrink-0 min-h-14">
          {visible && <div className="flex-1 min-w-0 hidden lg:block"><p {...mono("text-[9px] tracking-[0.2em] uppercase text-white/40 leading-none mb-1")}>{accentLabel}</p><p className="font-black uppercase leading-tight text-xs truncate" style={{ fontFamily:"'Archivo Black', sans-serif" }}>Auto Market</p></div>}
          <div className="flex-1 min-w-0 lg:hidden"><p className="font-black uppercase leading-tight text-xs truncate" style={{ fontFamily:"'Archivo Black', sans-serif" }}>Auto Market</p></div>
        </div>
        <nav className="flex-1 p-2 flex flex-col gap-3 mt-1 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.label}>
              {visible && <p {...mono("text-[9px] uppercase tracking-widest text-white/30 px-3 mb-1 hidden lg:block")}>{group.label}</p>}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item: any) => (
                  <a key={item.id} href={item.id} title={!visible?item.label:undefined} className={`flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors w-full ${pathname===item.id?"bg-white/10 text-white font-semibold":"text-white/50 hover:text-white hover:bg-white/5"}`}>
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className={`flex-1 truncate transition-opacity duration-150 ${visible?"opacity-100":"opacity-0 lg:hidden"}`}>{item.label}</span>
                    {pathname===item.id && visible && <span className="w-1 h-3 bg-[#e8001a] rounded-full hidden lg:block"/>}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#e8001a] flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ fontFamily:"'Archivo Black', sans-serif" }}>{initials}</div>
            {visible && <div className="flex-1 min-w-0 hidden lg:block"><p className="text-xs font-semibold truncate">{uname}</p><p {...mono("text-[10px] text-white/40 truncate")}>{user.company?.name || 'Auto Market'}</p></div>}
            <div className="flex-1 min-w-0 lg:hidden"><p className="text-xs font-semibold truncate">{uname}</p></div>
            <button onClick={logout} title="Log out" className="text-white/40 hover:text-white transition-colors flex-shrink-0"><LogOut size={14}/></button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-5 gap-4 bg-background sticky top-0 z-10 flex-shrink-0">
          <button className="text-foreground hover:text-muted-foreground transition-colors" onClick={()=>{if(window.innerWidth>=1024)setExpanded(p=>!p);else setSidebarOpen(p=>!p);}}><Menu size={20}/></button>
          <div className="relative flex-1 max-w-xs hidden sm:block"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input placeholder="Search…" className="w-full pl-9 pr-4 py-1.5 border border-border text-sm bg-background outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"/></div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"><Bell size={18}/><span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#e8001a] rounded-full"/></button>
            <div className="flex items-center gap-2 cursor-pointer"><div className="w-7 h-7 bg-foreground flex items-center justify-center text-background text-xs font-black" style={{ fontFamily:"'Archivo Black', sans-serif" }}>{initials}</div><ChevronDown size={14} className="text-muted-foreground"/></div>
          </div>
        </header>
        <main className={`flex-1 min-h-0 flex flex-col ${fullPageViews.has(pathname)?"overflow-hidden":"overflow-auto p-6"}`}>{children}</main>
      </div>
    </div>
  );
}
