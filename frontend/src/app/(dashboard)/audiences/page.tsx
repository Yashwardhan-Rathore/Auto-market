'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CampaignService } from '@/services/campaign.service';
import { Plus, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${className}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>;
}

export default function AudiencesPage() {
  const [search, setSearch] = useState("");

  const { data: audiences = [], isLoading } = useQuery({
    queryKey: ['audiences'],
    queryFn: CampaignService.listAudiences
  });

  const filtered = audiences.filter((a: any) => 
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Audiences</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{audiences.length} segments created</p>
        </div>
        <Link 
          href="/audiences/create" 
          {...mono("bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity")}
        >
          <Plus size={13} /> Create Segment
        </Link>
      </div>
      
      <div className="relative max-w-xs">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search audiences..." 
          className="w-full pl-9 pr-4 py-2 border border-border text-sm outline-none focus:border-foreground" 
        />
      </div>
      
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Name", "Source Upload", "Created By", "Created At", "Status"].map(h => (
                <th key={h} {...mono("text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading audiences...</td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground flex flex-col items-center">
                  <Users size={32} className="mb-3 opacity-20" />
                  <p>No audiences found</p>
                </td>
              </tr>
            )}
            {filtered.map((a: any) => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td {...mono("px-4 py-3 text-xs text-muted-foreground")}>{a.customer_upload || "-"}</td>
                <td {...mono("px-4 py-3 text-xs text-muted-foreground")}>{a.created_by}</td>
                <td {...mono("px-4 py-3 text-xs")}>{a.created_at ? format(new Date(a.created_at), 'MMM dd, yyyy') : '-'}</td>
                <td className="px-4 py-3">
                  <Badge className={a.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}>
                    {a.is_active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
