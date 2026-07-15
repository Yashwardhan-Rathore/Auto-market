'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContentStudioService } from '@/services/content.service';
import { Plus, Clock, FileText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

export default function ContentStudioDashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await ContentStudioService.getHistory();
        setHistory(data);
      } catch (err: any) {
        toast.error("Failed to load history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Content Studio</h2>
          <p className="text-sm text-muted-foreground mt-1">Generate and manage AI-powered content.</p>
        </div>
        
        <Link 
          href="/content-studio/create" 
          {...mono("bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity")}
        >
          <Plus size={14} /> New Content
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-card border border-border p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase tracking-widest font-bold">Total Generated</span>
            <FileText size={16} />
          </div>
          <span className="text-3xl font-black">{history.length}</span>
        </div>
        {/* Placeholder stats */}
        <div className="bg-card border border-border p-4 flex flex-col gap-2 opacity-50">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase tracking-widest font-bold">Credits Used</span>
            <span className="text-xs font-mono">THIS MONTH</span>
          </div>
          <span className="text-3xl font-black">---</span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold uppercase mb-4" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Recent History</h3>
        
        {isLoading ? (
          <div className="text-center p-8 text-muted-foreground">Loading...</div>
        ) : history.length === 0 ? (
          <div className="bg-card border border-border p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
            <Clock size={32} className="mb-4 opacity-20" />
            <p className="mb-4">No content generated yet.</p>
            <Link 
              href="/content-studio/create" 
              {...mono("border border-foreground text-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-foreground hover:text-background transition-colors")}
            >
              Generate Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((item) => (
              <div key={item.id} className="bg-card border border-border p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{item.content_type} <span className="text-muted-foreground font-normal text-sm">for {item.platform}</span></span>
                  <span {...mono("text-[10px] text-muted-foreground uppercase")}>
                    {new Date(item.created_at).toLocaleDateString()} • {item.status}
                  </span>
                </div>
                <button className="text-muted-foreground group-hover:text-foreground transition-colors p-2">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
