'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ContentStudioService } from '@/services/content.service';
import { Plus, Search, Image as ImageIcon, Video, FileText, Grid, List as ListIcon } from 'lucide-react';
import { format } from 'date-fns';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${className}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>;
}

export default function ContentStudioPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['content_studio'],
    queryFn: ContentStudioService.list
  });

  const filtered = assets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) && 
    (filter === "All" || a.type.toLowerCase() === filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Content Studio</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{assets.length} assets</p>
        </div>
        <button {...mono("bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity")}>
          <Plus size={13} /> Upload Asset
        </button>
      </div>
      
      <div className="flex gap-3 flex-wrap justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search assets..." 
              className="w-full pl-9 pr-4 py-2 border border-border text-sm outline-none focus:border-foreground" 
            />
          </div>
          {["All", "Image", "Video", "Template"].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              {...mono(`px-3 py-2 text-[11px] uppercase tracking-widest border transition-colors ${filter === f ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground"}`)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 border border-border rounded-sm">
          <button onClick={() => setView("grid")} className={`p-1.5 rounded-sm ${view === "grid" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <Grid size={14} />
          </button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded-sm ${view === "list" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <ListIcon size={14} />
          </button>
        </div>
      </div>
      
      {isLoading && (
        <div className="py-12 text-center text-muted-foreground">Loading assets...</div>
      )}
      
      {!isLoading && filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground flex flex-col items-center border border-dashed border-border bg-card">
          <ImageIcon size={32} className="mb-3 opacity-20" />
          <p>No content assets found</p>
          <button {...mono("mt-4 text-xs uppercase tracking-widest font-semibold underline underline-offset-4 hover:text-foreground")}>Upload your first asset</button>
        </div>
      )}
      
      {!isLoading && filtered.length > 0 && view === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(a => (
            <div key={a.id} className="border border-border bg-card group relative hover:border-foreground/50 transition-colors">
              <div className="aspect-square bg-muted/30 flex items-center justify-center relative overflow-hidden">
                {a.type === 'video' ? <Video size={32} className="opacity-20" /> : <ImageIcon size={32} className="opacity-20" />}
                {a.url && <img src={a.url} alt={a.name} className="absolute inset-0 w-full h-full object-cover" />}
              </div>
              <div className="p-3 border-t border-border">
                <p className="font-medium text-sm truncate">{a.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p {...mono("text-[10px] text-muted-foreground")}>{a.type}</p>
                  <p {...mono("text-[10px] text-muted-foreground")}>{format(new Date(a.created_at), 'MMM dd')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
