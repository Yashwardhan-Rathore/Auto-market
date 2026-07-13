'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CampaignService } from '@/services/campaign.service';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTemplateModalProps {
  channelId: number;
  channelName: string;
  onClose: () => void;
  onSuccess: (templateId: number) => void;
}

export function CreateTemplateModal({ channelId, channelName, onClose, onSuccess }: CreateTemplateModalProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => CampaignService.createTemplate({
      name,
      channel: channelId,
      subject,
      body
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template created successfully');
      onSuccess(data.id);
    },
    onError: () => {
      toast.error('Failed to create template');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border shadow-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-bold uppercase tracking-widest">Create New Template</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Channel</label>
            <div className="px-3 py-2 border border-border bg-muted/30 text-sm font-medium">
              {channelName}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Template Name *</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
              placeholder="e.g. Welcome Series - Email 1"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Subject (Optional)</label>
            <input 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
              placeholder="e.g. Welcome to our store!"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Body Content *</label>
            <textarea 
              required
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full min-h-[200px] p-3 text-sm bg-background border border-border outline-none focus:border-foreground resize-y"
              placeholder="Enter template message content..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createMutation.isPending || !name || !body}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
