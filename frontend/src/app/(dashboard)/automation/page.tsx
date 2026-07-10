'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AutomationService } from '@/services/automation.service';
import { Plus, Search, GitMerge, Edit2, Play, Pause, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${className}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>;
}

const statusColor: Record<string, string> = { 
  ACTIVE: "bg-green-100 text-green-700", 
  DRAFT: "bg-muted text-muted-foreground", 
  PAUSED: "bg-orange-100 text-orange-700",
};

export default function AutomationPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['automations'],
    queryFn: AutomationService.list
  });

  const createMutation = useMutation({
    mutationFn: () => AutomationService.create({ name: 'New Automation', description: '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
    }
  });

  const filtered = automations.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Automations</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Build and manage your workflows</p>
        </div>
        <button 
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          {...mono("bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50")}
        >
          <Plus size={13} /> Create
        </button>
      </div>
      
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search automations..." 
            className="w-full pl-9 pr-4 py-2 border border-border text-sm outline-none focus:border-foreground" 
          />
        </div>
      </div>
      
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Name", "Status", "Created", "Actions"].map(h => (
                <th key={h} {...mono("text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading automations...</td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground flex flex-col items-center">
                  <GitMerge size={32} className="mb-3 opacity-20" />
                  <p>No automations found</p>
                </td>
              </tr>
            )}
            {filtered.map(a => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3"><Badge className={statusColor[a.status] || statusColor.DRAFT}>{a.status}</Badge></td>
                <td {...mono("px-4 py-3 text-xs")}>{format(new Date(a.created_at), 'MMM dd, yyyy')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Link href={`/automation/${a.id}`} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Edit2 size={12} />
                    </Link>
                    {a.status === 'ACTIVE' ? (
                      <button className="p-1.5 hover:bg-muted text-muted-foreground hover:text-orange-600"><Pause size={12} /></button>
                    ) : (
                      <button className="p-1.5 hover:bg-muted text-muted-foreground hover:text-green-600"><Play size={12} /></button>
                    )}
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
