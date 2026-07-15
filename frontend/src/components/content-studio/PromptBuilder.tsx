import { useState, useEffect } from 'react';
import { ContentStudioService, ContentTemplate } from '@/services/content.service';
import { Loader2 } from 'lucide-react';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

interface PromptBuilderProps {
  onGenerate: (payload: any) => Promise<void>;
  isGenerating: boolean;
}

export function PromptBuilder({ onGenerate, isGenerating }: PromptBuilderProps) {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('BLOG');
  const [platform, setPlatform] = useState('NONE');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);

  useEffect(() => {
    ContentStudioService.getTemplates().then(setTemplates).catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate({ prompt, content_type: contentType, platform, template_id: templateId || undefined });
  };

  return (
    <div className="bg-card border border-border p-6 rounded-sm">
      <h3 className="text-lg font-bold uppercase mb-4" style={{ fontFamily: "'Archivo Black', sans-serif" }}>AI Generator</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest font-semibold mb-2 text-muted-foreground">Content Type</label>
          <select 
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full p-2 border border-border bg-background text-sm outline-none focus:border-foreground"
          >
            <option value="EMAIL">Email contentDraft</option>
            <option value="BLOG">Blog Post</option>
            <option value="AD_COPY">Ad Copy</option>
            <option value="SOCIAL">Social Media Post</option>
            <option value="CAPTION">Image Caption</option>
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-semibold mb-2 text-muted-foreground">Platform</label>
          <select 
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full p-2 border border-border bg-background text-sm outline-none focus:border-foreground"
          >
            <option value="NONE">General</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="X">X (Twitter)</option>
          </select>
        </div>

        {templates.length > 0 && (
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold mb-2 text-muted-foreground">Apply Template (Optional)</label>
            <select 
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full p-2 border border-border bg-background text-sm outline-none focus:border-foreground"
            >
              <option value="">-- No Template --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-widest font-semibold mb-2 text-muted-foreground">Prompt / Context</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to generate..."
            rows={5}
            className="w-full p-3 border border-border bg-background text-sm outline-none focus:border-foreground resize-none"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={isGenerating || !prompt.trim()}
          {...mono("w-full bg-foreground text-background py-3 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50")}
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : null}
          {isGenerating ? 'Generating...' : 'Generate Content (10 Credits)'}
        </button>
      </form>
    </div>
  );
}
