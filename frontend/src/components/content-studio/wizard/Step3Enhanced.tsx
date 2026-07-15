import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { ContentDraftService } from '@/services/content-draft.service';
import { toast } from 'sonner';

interface Step3EnhancedProps {
  enhancedPrompt: string;
  setEnhancedPrompt: (val: string) => void;
  draftId: string | null;
}

export function Step3Enhanced({ enhancedPrompt, setEnhancedPrompt, draftId }: Step3EnhancedProps) {
  // Parse "Key = Value" format into an array of objects for easier editing
  const [fields, setFields] = useState<{key: string, value: string}[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (enhancedPrompt && fields.length === 0) {
      const parsed = enhancedPrompt.split('\n')
        .map(line => line.trim())
        .filter(line => line.includes('='))
        .map(line => {
          const [k, ...v] = line.split('=');
          return { key: k.trim(), value: v.join('=').trim() };
        });
      if (parsed.length > 0) setFields(parsed);
    }
  }, [enhancedPrompt]);

  // Debounced autosave
  useEffect(() => {
    const serialized = fields.map(f => `${f.key} = ${f.value}`).join('\n');
    setEnhancedPrompt(serialized);
    
    if (draftId && serialized !== enhancedPrompt) {
      const timer = setTimeout(async () => {
        setIsSaving(true);
        try {
          await ContentDraftService.update(draftId, { enhanced_prompt: serialized });
        } catch(e) {
          toast.error("Autosave failed.");
        } finally {
          setIsSaving(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fields, draftId]);

  const updateField = (index: number, key: string, value: string) => {
    const newFields = [...fields];
    newFields[index] = { key, value };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const addField = () => {
    setFields([...fields, { key: 'New Field', value: '' }]);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">3. Enhanced Prompt</h3>
          <p className="text-sm text-muted-foreground">The AI has structured your brief. Tweak the fields below before final generation.</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {isSaving ? "Saving..." : "Saved"}
        </div>
      </div>
      
      <div className="space-y-4">
        {fields.map((field, idx) => (
          <div key={idx} className="flex items-center gap-3 bg-muted/30 p-2 rounded-md border border-transparent hover:border-border transition-colors">
            <div className="w-1/3">
              <Label className="sr-only">Field Name</Label>
              <Input 
                value={field.key} 
                onChange={(e) => updateField(idx, e.target.value, field.value)} 
                className="font-semibold bg-transparent border-none shadow-none focus-visible:ring-1"
              />
            </div>
            <div className="text-muted-foreground">=</div>
            <div className="flex-1">
              <Label className="sr-only">Field Value</Label>
              <Input 
                value={field.value} 
                onChange={(e) => updateField(idx, field.key, e.target.value)} 
                className="bg-transparent border-none shadow-none focus-visible:ring-1"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeField(idx)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <Button variant="outline" size="sm" onClick={addField} className="w-full border-dashed">
        <Plus className="w-4 h-4 mr-2" /> Add Custom Field
      </Button>
    </div>
  );
}
