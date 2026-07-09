'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerService } from '@/services/customer.service';
import { Upload, Plus, Search, Users } from 'lucide-react';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${className}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>;
}

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: CustomerService.list
  });

  const filtered = contacts.filter(c => {
    const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim();
    return fullName.toLowerCase().includes(search.toLowerCase()) || 
           c.email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Contacts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{contacts.length} contacts</p>
        </div>
        <div className="flex gap-2">
          <button {...mono("bg-transparent border border-border text-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:bg-muted/50 transition-colors")}>
            <Upload size={13} /> Import
          </button>
          <button {...mono("bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity")}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
      
      <div className="relative max-w-xs">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search contacts..." 
          className="w-full pl-9 pr-4 py-2 border border-border text-sm outline-none focus:border-foreground" 
        />
      </div>
      
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 w-8" />
              {["Name", "Email", "Phone", "Status"].map(h => (
                <th key={h} {...mono("text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading contacts...</td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground flex flex-col items-center">
                  <Users size={32} className="mb-3 opacity-20" />
                  <p>No contacts found</p>
                </td>
              </tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    checked={selected.includes(c.id)} 
                    onChange={() => setSelected(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])} 
                    className="accent-foreground w-4 h-4 rounded-sm border-border" 
                  />
                </td>
                <td className="px-3 py-3 font-medium">{c.first_name} {c.last_name}</td>
                <td {...mono("px-3 py-3 text-xs text-muted-foreground")}>{c.email}</td>
                <td {...mono("px-3 py-3 text-xs text-muted-foreground")}>{c.phone || "-"}</td>
                <td className="px-3 py-3">
                  <Badge className={c.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}>
                    {c.is_active ? "ACTIVE" : "INACTIVE"}
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
