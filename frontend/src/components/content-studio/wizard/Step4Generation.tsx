import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ContentStudioService, GeneratedContentResponse } from '@/services/content.service';
import { toast } from 'sonner';
import { ImagePlus, RefreshCcw, Copy, Loader2, Sparkles, MessageSquare } from 'lucide-react';

interface Step4GenerationProps {
  draftId: string;
  platforms: string[];
  enhancedPrompt: string;
}

export function Step4Generation({ draftId, platforms, enhancedPrompt }: Step4GenerationProps) {
  const [activeTab, setActiveTab] = useState(platforms[0]);
  
  // State for generated content per platform
  const [generatedData, setGeneratedData] = useState<Record<string, GeneratedContentResponse>>({});
  const [isGeneratingImg, setIsGeneratingImg] = useState<Record<string, boolean>>({});
  const [isGeneratingCap, setIsGeneratingCap] = useState<Record<string, boolean>>({});

  const generateImage = async (platform: string) => {
    setIsGeneratingImg(prev => ({...prev, [platform]: true}));
    try {
      // Using existing Generate endpoint as a proxy for image generation
      const res = await ContentStudioService.generate({
        prompt: `[IMAGE ONLY] ${enhancedPrompt}`,
        content_type: 'SOCIAL',
        platform: platform
      });
      setGeneratedData(prev => ({
        ...prev,
        [platform]: { ...prev[platform], image_url: res.image_url, id: res.id, version_id: res.version_id } as GeneratedContentResponse
      }));
      toast.success(`Image generated for ${platform}`);
    } catch (e: any) {
      toast.error(`Image generation failed: ${e.message}`);
    } finally {
      setIsGeneratingImg(prev => ({...prev, [platform]: false}));
    }
  };

  const generateCaption = async (platform: string) => {
    setIsGeneratingCap(prev => ({...prev, [platform]: true}));
    try {
      const res = await ContentStudioService.generate({
        prompt: `[CAPTION ONLY] ${enhancedPrompt}`,
        content_type: 'SOCIAL',
        platform: platform
      });
      setGeneratedData(prev => ({
        ...prev,
        [platform]: { ...prev[platform], text_content: res.text_content, id: res.id, version_id: res.version_id } as GeneratedContentResponse
      }));
      toast.success(`Caption generated for ${platform}`);
    } catch (e: any) {
      toast.error(`Caption generation failed: ${e.message}`);
    } finally {
      setIsGeneratingCap(prev => ({...prev, [platform]: false}));
    }
  };

  const updateCaptionText = (platform: string, text: string) => {
    setGeneratedData(prev => ({
      ...prev,
      [platform]: { ...prev[platform], text_content: text } as GeneratedContentResponse
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div>
        <h3 className="text-lg font-semibold">4. Generate Content</h3>
        <p className="text-sm text-muted-foreground">Generate platform-optimized images and captions independently.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {platforms.map(p => (
            <TabsTrigger key={p} value={p} className="capitalize">{p.toLowerCase()}</TabsTrigger>
          ))}
        </TabsList>
        
        {platforms.map(platform => {
          const data = generatedData[platform];
          
          return (
            <TabsContent key={platform} value={platform} className="flex-1 flex flex-col md:flex-row gap-6 mt-4 h-full outline-none">
              
              {/* Image Section */}
              <div className="flex-1 flex flex-col border rounded-xl overflow-hidden bg-muted/20">
                <div className="p-3 border-b bg-muted/50 flex justify-between items-center">
                  <h4 className="font-semibold text-sm flex items-center gap-2"><ImagePlus size={16}/> Image</h4>
                  {data?.image_url && (
                    <Button variant="ghost" size="sm" onClick={() => generateImage(platform)} disabled={isGeneratingImg[platform]}>
                      <RefreshCcw className="w-4 h-4 mr-2" /> Regenerate
                    </Button>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-center p-6 relative min-h-[300px]">
                  {isGeneratingImg[platform] ? (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                      <span className="text-sm">Generating Image...</span>
                    </div>
                  ) : data?.image_url ? (
                    <img src={data.image_url} alt="Generated" className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm" />
                  ) : (
                    <Button onClick={() => generateImage(platform)} size="lg" className="shadow-sm">
                      <Sparkles className="w-4 h-4 mr-2" /> Generate Image
                    </Button>
                  )}
                </div>
              </div>

              {/* Caption Section */}
              <div className="flex-1 flex flex-col border rounded-xl overflow-hidden bg-muted/20">
                <div className="p-3 border-b bg-muted/50 flex justify-between items-center">
                  <h4 className="font-semibold text-sm flex items-center gap-2"><MessageSquare size={16}/> Caption</h4>
                  {data?.text_content && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(data.text_content)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => generateCaption(platform)} disabled={isGeneratingCap[platform]}>
                        <RefreshCcw className="w-4 h-4 mr-2" /> Regenerate
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-center p-4 min-h-[300px]">
                  {isGeneratingCap[platform] ? (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                      <span className="text-sm">Writing Caption...</span>
                    </div>
                  ) : data?.text_content ? (
                    <div className="w-full h-full flex flex-col relative">
                      <Textarea 
                        value={data.text_content}
                        onChange={(e) => updateCaptionText(platform, e.target.value)}
                        className="flex-1 resize-none bg-transparent border-0 shadow-none focus-visible:ring-0 p-2 text-sm leading-relaxed"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                        {data.text_content.length} chars
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => generateCaption(platform)} size="lg" className="shadow-sm" variant="secondary">
                      <Sparkles className="w-4 h-4 mr-2" /> Generate Caption
                    </Button>
                  )}
                </div>
              </div>

            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
