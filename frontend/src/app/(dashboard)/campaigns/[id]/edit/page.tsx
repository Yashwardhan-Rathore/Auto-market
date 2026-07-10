'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { CampaignService } from '@/services/campaign.service';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = parseInt(params.id as string);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => CampaignService.get(campaignId),
    enabled: !!campaignId
  });

  useEffect(() => {
    if (campaign) {
      // Only Draft and Scheduled are allowed to be edited per backend rules
      if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
        toast.error("This campaign cannot be edited.");
        router.push('/campaigns');
      } else {
        setFormData({
          name: campaign.name || '',
          description: (campaign as any).description || '',
        });
      }
    }
  }, [campaign, router]);

  const updateMutation = useMutation({
    mutationFn: () => CampaignService.update(campaignId, formData),
    onSuccess: () => {
      toast.success('Campaign updated successfully');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      router.push('/campaigns');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.response?.data?.name?.[0] || 'Failed to update campaign';
      toast.error(msg);
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/campaigns" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Edit Campaign</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Update campaign details</p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="bg-card border border-border p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5">Campaign Name *</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
              placeholder="e.g. Summer Sale Dispatch"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5">Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground min-h-[80px]"
              placeholder="Brief description..."
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={updateMutation.isPending || !formData.name}
            className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
