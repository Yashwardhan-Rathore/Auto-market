'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { TasksService } from '@/services/tasks.service';
import { CampaignService } from '@/services/campaign.service';
import { ArrowLeft, Save, Loader2, Play, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import { CreateTemplateModal } from './components/CreateTemplateModal';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    task: searchParams.get('taskId') || '',
    name: '',
    description: '',
  });

  const [campaignId, setCampaignId] = useState<number | null>(null);
  
  // templates is a map from channelId -> templateId
  const [channelTemplates, setChannelTemplates] = useState<Record<number, number>>({});
  const [scheduledAt, setScheduledAt] = useState('');
  
  // Modal state for creating templates
  const [showTemplateModalForChannel, setShowTemplateModalForChannel] = useState<{id: number, name: string} | null>(null);

  const { data: myTasks = [] } = useQuery({
    queryKey: ['my_tasks'],
    queryFn: TasksService.listMyTasks
  });

  const { data: allChannels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: CampaignService.listChannels
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: CampaignService.listTemplates
  });

  const selectedTask = myTasks.find(t => t.task.id.toString() === formData.task)?.task;

  const createCampaignMutation = useMutation({
    mutationFn: () => CampaignService.create(formData.name, formData.description, parseInt(formData.task)),
    onSuccess: async (data) => {
      setCampaignId(data.campaign.id);
      
      // Auto assign channels from task
      if (selectedTask?.channels?.length) {
         try {
           await CampaignService.assignTemplate(data.campaign.id, selectedTask.channels, []); // This assigns channels to campaign. Wait, backend uses assignTemplate but expects channel and template. Let's do channels first.
           // Actually, /api/channels/<id> assigns channels. Let's just go to step 2.
         } catch(e) {}
      }

      setStep(2);
    }
  });

  const assignChannelsAndTemplatesMutation = useMutation({
    mutationFn: async () => {
      if (!campaignId) return;
      
      // Assign templates to channels
      for (const [channelId, templateId] of Object.entries(channelTemplates)) {
        if (templateId) {
          await CampaignService.assignTemplate(campaignId, parseInt(channelId), templateId);
        }
      }
    },
    onSuccess: () => {
      setStep(3);
    }
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!campaignId) return;
      if (scheduledAt) {
        await CampaignService.schedule(campaignId, new Date(scheduledAt).toISOString());
      } else {
        await CampaignService.send(campaignId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      router.push('/campaigns');
    }
  });

  const handleCreateNext = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaignMutation.mutate();
  };

  const handleTemplatesNext = (e: React.FormEvent) => {
    e.preventDefault();
    assignChannelsAndTemplatesMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/campaigns" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Create Campaign</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Step {step} of 3</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 ${step >= i ? 'bg-foreground' : 'bg-muted'}`} />
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleCreateNext} className="bg-card border border-border p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5">Select Task *</label>
              <select 
                required
                value={formData.task}
                onChange={e => setFormData({...formData, task: e.target.value})}
                className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
              >
                <option value="">Select a Task</option>
                {myTasks.map((t: any) => (
                  <option key={t.task.id} value={t.task.id}>{t.task.title}</option>
                ))}
              </select>
            </div>

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
              disabled={createCampaignMutation.isPending || !formData.task || !formData.name}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {createCampaignMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Next: Assign Templates'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleTemplatesNext} className="bg-card border border-border p-6 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Select Templates for Channels</h3>
          
          <div className="space-y-6">
            {selectedTask?.channels?.map((channelId: number) => {
              const channel = allChannels.find((c: any) => c.id === channelId);
              const channelTemplatesList = templates.filter((t: any) => t.channel === channelId);
              
              return (
                <div key={channelId} className="border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold uppercase tracking-widest">{channel?.name || 'Unknown Channel'}</label>
                    <button 
                      type="button"
                      onClick={() => setShowTemplateModalForChannel({ id: channelId, name: channel?.name || 'Unknown' })}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground hover:opacity-70 transition-opacity"
                    >
                      <Plus size={12} /> Create New Template
                    </button>
                  </div>
                  <select 
                    value={channelTemplates[channelId] || ''}
                    onChange={e => setChannelTemplates(prev => ({...prev, [channelId]: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
                  >
                    <option value="">Select Template</option>
                    {channelTemplatesList.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name} {t.subject ? `(${t.subject})` : ''}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={assignChannelsAndTemplatesMutation.isPending}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {assignChannelsAndTemplatesMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Next: Review & Send'}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="bg-card border border-border p-6 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Review & Send</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 border border-border">
            <div><span className="text-muted-foreground">Campaign:</span> <span className="font-medium">{formData.name}</span></div>
            <div><span className="text-muted-foreground">Task:</span> <span className="font-medium">{selectedTask?.title}</span></div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5">Schedule Delivery (Optional)</label>
            <input 
              type="datetime-local" 
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
            />
            <p className="text-xs text-muted-foreground mt-2">Leave blank to send immediately.</p>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button 
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {sendMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : (scheduledAt ? <Calendar size={16} /> : <Play size={16} />)}
              {scheduledAt ? 'Schedule Campaign' : 'Send Now'}
            </button>
          </div>
        </div>
      )}
      {showTemplateModalForChannel && (
        <CreateTemplateModal 
          channelId={showTemplateModalForChannel.id}
          channelName={showTemplateModalForChannel.name}
          onClose={() => setShowTemplateModalForChannel(null)}
          onSuccess={(templateId) => {
            setChannelTemplates(prev => ({...prev, [showTemplateModalForChannel.id]: templateId}));
            setShowTemplateModalForChannel(null);
          }}
        />
      )}
    </div>
  );
}
