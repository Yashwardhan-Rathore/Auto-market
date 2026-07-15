import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Step2PromptProps {
  rawPrompt: string;
  setRawPrompt: (val: string) => void;
  onAiAssist: () => void;
}

export function Step2Prompt({ rawPrompt, setRawPrompt, onAiAssist }: Step2PromptProps) {
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div>
        <h3 className="text-lg font-semibold">2. contentDraft Brief</h3>
        <p className="text-sm text-muted-foreground">Describe your contentDraft goal, audience, and key message in your own words.</p>
      </div>
      
      <div className="relative flex-1 flex flex-col min-h-[300px]">
        <Textarea 
          placeholder="E.g. We are running a Black Friday sale for our premium coffee beans. 20% off everything. Target audience is coffee enthusiasts who care about fair trade..."
          className="flex-1 resize-none p-4 text-base bg-muted/50 border-2 focus-visible:ring-primary/20"
          value={rawPrompt}
          onChange={(e) => setRawPrompt(e.target.value)}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-4">
          <span className="text-xs text-muted-foreground font-medium">
            {rawPrompt.length} chars
          </span>
          {rawPrompt.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setRawPrompt("")} className="h-8 text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex justify-center pt-4">
        <Button 
          size="lg" 
          className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg font-semibold px-8"
          disabled={rawPrompt.length < 10}
          onClick={onAiAssist}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          AI Assist: Enhance Prompt & Generate
        </Button>
      </div>
      
      <p className="text-xs text-center text-muted-foreground">
        AI Assist will analyze your brief, ask clarification questions if needed, and optimize it for generation. (Costs 3 credits)
      </p>
    </div>
  );
}
