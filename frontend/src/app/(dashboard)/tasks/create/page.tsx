'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { TasksService } from '@/services/tasks.service';
import { contentDraftService } from '@/services/contentDraft.service';
import { AuthService } from '@/services/auth.service';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

export default function CreateTaskPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    audience: '',
    channels: [] as number[],
    priority: 'MEDIUM',
    due_date: '',
    users: [] as number[],
  });

  const { data: audiences = [] } = useQuery({
    queryKey: ['audiences'],
    queryFn: contentDraftService.listAudiences
  });

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: contentDraftService.listChannels
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: AuthService.listUsers
  });

  const createMutation = useMutation({
    mutationFn: TasksService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      router.push('/tasks');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChannelToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(id) 
        ? prev.channels.filter(c => c !== id)
        : [...prev.channels, id]
    }));
  };

  const handleUserToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      users: prev.users.includes(id) 
        ? prev.users.filter(u => u !== id)
        : [...prev.users, id]
    }));
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/tasks" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Create Task</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Assign a new task to your team</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border p-6 space-y-6">
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5">Task Title *</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
              placeholder="e.g. Summer Sale contentDraft Setup"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5">Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground min-h-[80px]"
              placeholder="Brief description of the task..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5">Instructions</label>
            <textarea 
              value={formData.instructions}
              onChange={e => setFormData({...formData, instructions: e.target.value})}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground min-h-[80px]"
              placeholder="Detailed step-by-step instructions..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5">Assigned Contact Dataset (Audience) *</label>
            <select 
              required
              value={formData.audience}
              onChange={e => setFormData({...formData, audience: e.target.value})}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
            >
              <option value="">Select Audience</option>
              {audiences.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5">Priority *</label>
            <select 
              required
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value})}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5">Due Date *</label>
            <input 
              type="datetime-local" 
              required
              value={formData.due_date}
              onChange={e => setFormData({...formData, due_date: e.target.value})}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <label className="block text-xs font-bold uppercase tracking-widest mb-3">Channels *</label>
          <div className="flex flex-wrap gap-3">
            {channels.map((c: any) => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer border border-border p-3 hover:border-foreground transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.channels.includes(c.id)}
                  onChange={() => handleChannelToggle(c.id)}
                  className="accent-foreground"
                />
                <span className="text-sm font-medium">{c.name}</span>
              </label>
            ))}
            {channels.length === 0 && <span className="text-sm text-muted-foreground">No channels available</span>}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <label className="block text-xs font-bold uppercase tracking-widest mb-3">Assign to Users *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {users.map((u: any) => (
              <label key={u.id} className="flex items-center gap-2 cursor-pointer border border-border p-3 hover:border-foreground transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.users.includes(u.id)}
                  onChange={() => handleUserToggle(u.id)}
                  className="accent-foreground"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{u.first_name} {u.last_name}</span>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                </div>
              </label>
            ))}
            {users.length === 0 && <span className="text-sm text-muted-foreground">No users available</span>}
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={createMutation.isPending || formData.channels.length === 0 || formData.users.length === 0 || !formData.audience}
            className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
}
