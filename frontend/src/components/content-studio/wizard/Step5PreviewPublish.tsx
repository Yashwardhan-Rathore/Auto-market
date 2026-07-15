import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContentDraftService, ContentDraftResponse } from '@/services/content-draft.service';
import { toast } from 'sonner';
import { Calendar, Check, CheckCircle2, Clock, Image as ImageIcon, Send, ShieldCheck, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Step5PreviewPublishProps {
  draftId: string;
  platforms: string[];
}

export function Step5PreviewPublish({ draftId, platforms }: Step5PreviewPublishProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(platforms[0]);
  const [draft, setDraft] = useState<ContentDraftResponse | null>(null);
  
  // Local scheduling state
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const data = await ContentDraftService.get(draftId);
        setDraft(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDraft();
  }, [draftId]);

  const handleRequestApproval = async () => {
    setIsSubmitting(true);
    try {
      await ContentDraftService.requestApproval(draftId);
      toast.success("Approval requested successfully.");
      const updated = await ContentDraftService.get(draftId);
      setDraft(updated);
    } catch (e: any) {
      toast.error(`Request failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error("Please select both date and time.");
      return;
    }
    
    setIsSubmitting(true);
    const combined = `${scheduleDate}T${scheduleTime}:00Z`;
    
    try {
      const schedules = platforms.map(p => ({
        // Assuming platform objects are inside draft.platforms matching the string names
        platform_id: draft?.platforms.find(dp => dp.platform === p)?.id || p, 
        scheduled_time: combined 
      }));
      
      await ContentDraftService.schedule(draftId, schedules);
      toast.success("contentDraft scheduled successfully!");
      router.push('/content-studio');
    } catch (e: any) {
      toast.error(`Scheduling failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostNow = async () => {
    setIsSubmitting(true);
    try {
      const updatedDraft = await ContentDraftService.publish(draftId);
      setDraft(updatedDraft);
      toast.success("contentDraft published successfully!");
      setTimeout(() => {
        router.push('/content-studio');
      }, 1500);
    } catch (e: any) {
      toast.error(`Publishing failed: ${e.response?.data?.error || e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-lg font-semibold">5. Preview & Publish</h3>
          <p className="text-sm text-muted-foreground">Review your content and schedule it for publishing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={draft?.workflow_state || 'DRAFT'} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left: Mobile Preview Simulator */}
        <div className="lg:col-span-5 h-full flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start overflow-x-auto mb-4 bg-muted/50">
              {platforms.map(p => (
                <TabsTrigger key={p} value={p} className="capitalize">{p.toLowerCase()}</TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="flex-1 flex justify-center items-center py-4 bg-muted/20 rounded-xl border border-dashed">
              <div className="w-[320px] h-[600px] bg-background rounded-[40px] shadow-2xl border-[8px] border-muted overflow-hidden relative flex flex-col">
                {/* Phone Notch */}
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
                  <div className="w-32 h-4 bg-muted rounded-b-xl"></div>
                </div>
                
                {/* Simulated Content */}
                <div className="mt-8 flex-1 overflow-y-auto">
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-primary">B</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Your Brand</p>
                      <p className="text-xs text-muted-foreground">Just now • {activeTab}</p>
                    </div>
                  </div>
                  
                  <div className="w-full aspect-square bg-muted/50 flex items-center justify-center mb-3">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                    {/* If we had the real image URL from state, we'd render it here */}
                  </div>
                  
                  <div className="px-4 pb-4">
                    <p className="text-sm whitespace-pre-wrap">
                      <span className="text-muted-foreground italic">[Simulated {activeTab} Caption placeholder...]</span>
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Actions & Scheduling */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h4 className="font-semibold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-500" /> Approval Workflow</h4>
              <p className="text-sm text-muted-foreground">
                Current Status: <strong>{draft?.workflow_state || 'Draft'}</strong>
              </p>
              <Button 
                variant="outline" 
                onClick={handleRequestApproval}
                disabled={isSubmitting || draft?.workflow_state === 'IN_REVIEW'}
                className="w-full"
              >
                {draft?.workflow_state === 'IN_REVIEW' ? 'Approval Pending...' : 'Request Internal Approval'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h4 className="font-semibold flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" /> Scheduling</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleSchedule} disabled={isSubmitting} className="w-full" variant="secondary">
                Schedule for {platforms.length} platforms
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 space-y-4">
              <h4 className="font-semibold flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Publish Now</h4>
              <p className="text-sm text-muted-foreground">
                Skip scheduling and push directly to your connected channels immediately.
              </p>
              <Button onClick={handlePostNow} disabled={isSubmitting} className="w-full shadow-lg">
                Post All Instantly
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'DRAFT': 'bg-gray-100 text-gray-800',
    'IN_REVIEW': 'bg-yellow-100 text-yellow-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'PUBLISHED': 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || colors['DRAFT']}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
