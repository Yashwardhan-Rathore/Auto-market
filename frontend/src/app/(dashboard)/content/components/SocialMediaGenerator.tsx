'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ContentStudioService, GeneratedContentResponse } from '@/services/content.service';
import { Loader2, Sparkles, Image as ImageIcon, Send, Calendar, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

type Platform = 'X' | 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN';

export function SocialMediaGenerator() {
  const [platform, setPlatform] = useState<Platform>('X');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentResponse | null>(null);
  const [caption, setCaption] = useState('');

  const generateMutation = useMutation({
    mutationFn: () => ContentStudioService.generate({ prompt, content_type: 'SOCIAL', platform }),
    onSuccess: (data) => {
      setGeneratedContent(data);
      setCaption(data.text_content);
      toast.success('Social post generated!');
    },
    onError: () => {
      toast.error('Failed to generate content');
    }
  });

  const actionMutation = useMutation({
    mutationFn: (action: 'save_to_library' | 'post' | 'schedule') => 
      ContentStudioService.action(generatedContent!.id, action),
    onSuccess: (_, action) => {
      if (action === 'save_to_library') toast.success('Saved to Asset Library');
      if (action === 'post') toast.success('Posted successfully');
      if (action === 'schedule') toast.success('Scheduled successfully');
    },
    onError: () => {
      toast.error('Action failed');
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateMutation.mutate();
  };

  const platforms: { id: Platform; label: string }[] = [
    { id: 'X', label: 'X (Twitter)' },
    { id: 'FACEBOOK', label: 'Facebook' },
    { id: 'INSTAGRAM', label: 'Instagram' },
    { id: 'LINKEDIN', label: 'LinkedIn' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors ${
              platform === p.id 
                ? 'bg-foreground text-background border-foreground' 
                : 'bg-card border-border text-muted-foreground hover:border-foreground/50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border p-5">
        <label className="block text-xs font-bold uppercase tracking-widest mb-2">Prompt for {platforms.find(p=>p.id===platform)?.label}</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your post idea, audience, and key points..."
          className="w-full min-h-[100px] p-3 text-sm bg-background border border-border outline-none focus:border-foreground resize-y"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generateMutation.isPending}
            className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {generateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate
          </button>
        </div>
      </div>

      {generatedContent && (
        <div className="bg-card border border-border p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Generated Output</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Image</label>
              <div className="aspect-square w-full bg-muted/30 border border-dashed border-border flex items-center justify-center relative overflow-hidden group">
                {generatedContent.image_url ? (
                  <img src={generatedContent.image_url} alt="Generated" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center opacity-30">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-xs uppercase font-medium">No Image</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full flex-1 min-h-[200px] p-4 text-sm bg-background border border-border outline-none focus:border-foreground resize-y"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-end pt-4 border-t border-border">
            <button
              onClick={() => actionMutation.mutate('save_to_library')}
              disabled={actionMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 border border-border bg-card text-xs font-bold uppercase tracking-widest hover:bg-muted disabled:opacity-50"
            >
              <Bookmark size={14} /> Save to Library
            </button>
            <button
              onClick={() => actionMutation.mutate('schedule')}
              disabled={actionMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 border border-border bg-card text-xs font-bold uppercase tracking-widest hover:bg-muted disabled:opacity-50"
            >
              <Calendar size={14} /> Schedule Post
            </button>
            <button
              onClick={() => actionMutation.mutate('post')}
              disabled={actionMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
            >
              <Send size={14} /> Post Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
