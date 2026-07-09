'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CampaignService } from '@/services/campaign.service';
import { Plus, Search, Edit2, PauseCircle, Trash2, Megaphone } from 'lucide-react';
import { format } from 'date-fns';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${className}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>;
}

const statusColor: Record<string, string> = { 
  Running: "bg-green-100 text-green-700", 
  Draft: "bg-muted text-muted-foreground", 
  Scheduled: "bg-blue-100 text-blue-700", 
  Completed: "bg-purple-100 text-purple-700",
  DRAFT: "bg-muted text-muted-foreground", 
  ACTIVE: "bg-green-100 text-green-700", 
  COMPLETED: "bg-purple-100 text-purple-700",
};

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: CampaignService.list
  });

  const filtered = campaigns.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) && 
    (filter === "All" || c.status.toLowerCase() === filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>My Campaigns</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{campaigns.length} campaigns</p>
        </div>
        <button {...mono("bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity")}>
          <Plus size={13} /> Create
        </button>
      </div>
      
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search campaigns..." 
            className="w-full pl-9 pr-4 py-2 border border-border text-sm outline-none focus:border-foreground" 
          />
        </div>
        {["All", "Running", "Scheduled", "Draft", "Completed"].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            {...mono(`px-3 py-2 text-[11px] uppercase tracking-widest border transition-colors ${filter === f ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground"}`)}
          >
            {f}
          </button>
        ))}
      </div>
      
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Name", "Type", "Status", "Contacts", "Created", "Actions"].map(h => (
                <th key={h} {...mono("text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading campaigns...</td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground flex flex-col items-center">
                  <Megaphone size={32} className="mb-3 opacity-20" />
                  <p>No campaigns found</p>
                </td>
              </tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td {...mono("px-4 py-3 text-xs text-muted-foreground")}>Email</td>
                <td className="px-4 py-3"><Badge className={statusColor[c.status] || statusColor.DRAFT}>{c.status}</Badge></td>
                <td {...mono("px-4 py-3 text-xs")}>-</td>
                <td {...mono("px-4 py-3 text-xs")}>{format(new Date(c.created_at), 'MMM dd, yyyy')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 size={12} /></button>
                    <button className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"><PauseCircle size={12} /></button>
                    <button className="p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
