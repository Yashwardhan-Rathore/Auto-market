import { useState } from 'react';
import { ContentStudioService, GeneratedContentResponse } from '@/services/content.service';
import { Save, Send, Calendar, Edit2, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

interface ContentPreviewProps {
  content: GeneratedContentResponse | null;
  onUpdateContent: (content: GeneratedContentResponse) => void;
  onRegenerate: (id: string, prompt: string) => Promise<void>;
}

export function ContentPreview({ content, onUpdateContent, onRegenerate }: ContentPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [regeneratePrompt, setRegeneratePrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!content) {
    return (
      <div className="bg-card border border-border p-6 rounded-sm h-full flex flex-col items-center justify-center text-muted-foreground min-h-[400px]">
        <p>No content generated yet. Use the prompt builder to start.</p>
      </div>
    );
  }

  const handleEdit = () => {
    setEditedText(content.text_content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await ContentStudioService.update(content.id, editedText);
      onUpdateContent({ ...content, text_content: editedText });
      setIsEditing(false);
      toast.success("Content updated.");
    } catch (err: any) {
      toast.error("Failed to update content: " + (err.response?.data?.error || err.message));
    }
  };

  const handleRegenerate = async () => {
    if (!regeneratePrompt.trim()) return;
    setIsRegenerating(true);
    try {
      await onRegenerate(content.id, regeneratePrompt);
      setRegeneratePrompt('');
      toast.success("Content regenerated.");
    } catch (err) {
      // Error handled by parent usually, or we can show toast here
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAction = async (action: 'save_to_library' | 'post' | 'schedule') => {
    try {
      await ContentStudioService.action(content.id, action);
      toast.success(`Action '${action}' successful.`);
    } catch (err: any) {
      toast.error(`Action failed: ` + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
        <h3 className="text-lg font-bold uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Output Preview</h3>
        <span {...mono("text-[10px] uppercase bg-muted px-2 py-1")}>
          {content.content_type} / {content.platform}
        </span>
      </div>

      <div className="flex-1 overflow-auto mb-4">
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-full min-h-[300px] p-3 border border-border bg-background text-sm outline-none focus:border-foreground resize-none"
          />
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-muted/30 border border-border min-h-[300px]">
            {content.text_content}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-border">
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <div className="flex gap-2">
            {isEditing ? (
              <button onClick={handleSaveEdit} {...mono("bg-foreground text-background px-3 py-1.5 text-xs font-semibold flex items-center gap-1 hover:opacity-90")}>
                <Check size={14} /> Save Edit
              </button>
            ) : (
              <button onClick={handleEdit} {...mono("bg-muted text-foreground px-3 py-1.5 text-xs font-semibold flex items-center gap-1 hover:bg-muted/80")}>
                <Edit2 size={14} /> Edit
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleAction('save_to_library')} title="Save to Asset Library" className="p-2 border border-border hover:bg-muted transition-colors">
              <Save size={16} />
            </button>
            <button onClick={() => handleAction('schedule')} title="Schedule Post" className="p-2 border border-border hover:bg-muted transition-colors">
              <Calendar size={16} />
            </button>
            <button onClick={() => handleAction('post')} title="Post Now" className="p-2 bg-foreground text-background hover:opacity-90 transition-opacity">
              <Send size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          <input 
            type="text" 
            placeholder="Feedback (e.g., Make it shorter)..." 
            value={regeneratePrompt}
            onChange={(e) => setRegeneratePrompt(e.target.value)}
            className="flex-1 p-2 border border-border bg-background text-sm outline-none focus:border-foreground"
          />
          <button 
            onClick={handleRegenerate}
            disabled={isRegenerating || !regeneratePrompt.trim()}
            {...mono("px-4 bg-background border border-foreground text-foreground text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground")}
          >
            {isRegenerating ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Regenerate (5 Credits)
          </button>
        </div>
      </div>
    </div>
  );
}
