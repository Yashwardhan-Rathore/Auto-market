'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ContentStudioService, GeneratedContentResponse } from '@/services/content.service';
import { Loader2, Edit2, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TextContentGeneratorProps {
  contentType: 'EMAIL' | 'BLOG' | 'AD_COPY';
}

export function TextContentGenerator({ contentType }: TextContentGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const generateMutation = useMutation({
    mutationFn: () => ContentStudioService.generate({ prompt, content_type: contentType }),
    onSuccess: (data) => {
      setGeneratedContent(data);
      setEditValue(data.text_content);
      setIsEditing(false);
      toast.success('Content generated successfully!');
    },
    onError: () => {
      toast.error('Failed to generate content');
    }
  });

  const updateMutation = useMutation({
    mutationFn: () => ContentStudioService.update(generatedContent!.id, editValue),
    onSuccess: () => {
      setGeneratedContent(prev => prev ? { ...prev, text_content: editValue } : null);
      setIsEditing(false);
      toast.success('Changes saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save changes');
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateMutation.mutate();
  };

  const handleSaveEdit = () => {
    if (!generatedContent) return;
    updateMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card border border-border p-5">
        <label className="block text-xs font-bold uppercase tracking-widest mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe what you want this ${contentType.toLowerCase()} to be about...`}
          className="w-full min-h-[120px] p-3 text-sm bg-background border border-border outline-none focus:border-foreground resize-y"
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest">Generated Output</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Edit2 size={14} /> Edit
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditValue(generatedContent.text_content);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1 text-xs font-bold text-foreground"
                >
                  {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} 
                  Save
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full min-h-[250px] p-4 text-sm bg-background border border-border outline-none focus:border-foreground"
            />
          ) : (
            <div className="w-full min-h-[250px] p-4 text-sm bg-muted/20 border border-transparent whitespace-pre-wrap">
              {generatedContent.text_content}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
