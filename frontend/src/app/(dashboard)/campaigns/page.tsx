'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CampaignService } from '@/services/campaign.service';
import { Plus, Search, Edit2, PauseCircle, Trash2, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  SENDING: "bg-orange-100 text-orange-700",
  FAILED: "bg-red-100 text-red-700",
};

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  
  const [campaignToDelete, setCampaignToDelete] = useState<number | null>(null);

  const { data: campaigns = [], isLoading, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: CampaignService.list,
    refetchInterval: (query) => {
      const data = query.state.data || [];
      return data.some(c => c.status === 'SENDING' || c.status === 'QUEUED') ? 5000 : false;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: CampaignService.delete,
    onSuccess: () => {
      toast.success('Campaign deleted successfully');
      setCampaignToDelete(null);
      refetch();
    },
    onError: () => {
      toast.error('Failed to delete campaign');
      setCampaignToDelete(null);
    }
  });

  const handleDeleteConfirm = () => {
    if (campaignToDelete) {
      deleteMutation.mutate(campaignToDelete);
    }
  };

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
        <Link 
          href="/campaigns/create" 
          {...mono("bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity")}
        >
          <Plus size={13} /> Create
        </Link>
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
        {["All", "Sending", "Scheduled", "Draft", "Completed"].map(f => (
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
                  <div className="flex gap-1 items-center">
                    {(c.status.toUpperCase() === 'DRAFT' || c.status.toUpperCase() === 'SCHEDULED') ? (
                      <Link href={`/campaigns/${c.id}/edit`} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground inline-flex">
                        <Edit2 size={12} />
                      </Link>
                    ) : (
                      <button disabled className="p-1.5 text-muted-foreground opacity-50 cursor-not-allowed">
                        <Edit2 size={12} />
                      </button>
                    )}
                    
                    <button 
                      onClick={() => setCampaignToDelete(c.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!campaignToDelete} onOpenChange={(open) => !open && setCampaignToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Campaign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
