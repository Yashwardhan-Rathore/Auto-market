'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentDraftService, ContentDraftResponse } from '@/services/content-draft.service';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Step1Platforms } from '@/components/content-studio/wizard/Step1Platforms';
import { Step2Prompt } from '@/components/content-studio/wizard/Step2Prompt';
import { Step3Enhanced } from '@/components/content-studio/wizard/Step3Enhanced';
import { Step4Generation } from '@/components/content-studio/wizard/Step4Generation';
import { Step5PreviewPublish } from '@/components/content-studio/wizard/Step5PreviewPublish';

export default function CreateContentWizardPage() {
  const router = useRouter();
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Data State
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftData, setDraftData] = useState<ContentDraftResponse | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [rawPrompt, setRawPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // MOCK: In a real flow with backend AI integration, this would hit the actual endpoint
  const handleAiAssist = async () => {
    setIsProcessing(true);
    // Simulate AI extraction and question generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate user answering questions (we skip the actual dialog in this mockup to jump to enhanced prompt)
    const mockEnhanced = `Goal = Brand Awareness\nTone = Professional and Friendly\nAudience = Small Business Owners\nTopic = ${rawPrompt}`;
    setEnhancedPrompt(mockEnhanced);
    
    // Auto-save to draft if it exists
    if (draftId) {
      await ContentDraftService.update(draftId, { enhanced_prompt: mockEnhanced });
    }
    
    setIsProcessing(false);
    toast.success("Prompt enhanced by AI!");
    setCurrentStep(3); // Jump to Enhanced Prompt step
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      // Create draft when leaving step 1
      if (selectedPlatforms.length === 0) {
        toast.error("Please select at least one platform.");
        return;
      }
      setIsProcessing(true);
      try {
        if (!draftId) {
          const res = await ContentDraftService.create(selectedPlatforms);
          setDraftId(res.id);
          setDraftData(res);
        }
        setCurrentStep(2);
      } catch (e: any) {
        toast.error("Failed to initialize draft.");
      } finally {
        setIsProcessing(false);
      }
    } else if (currentStep < totalSteps) {
      setCurrentStep(curr => curr + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const steps = [
    { id: 1, title: 'Platforms' },
    { id: 2, title: 'Input' },
    { id: 3, title: 'Enhance' },
    { id: 4, title: 'Generate' },
    { id: 5, title: 'Publish' },
  ];

  return (
    <div className="flex flex-col gap-6 h-full min-h-[calc(100vh-8rem)]">
      <div>
        <Link href="/content-studio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Studio
        </Link>
        <h2 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
          AI Content Studio
        </h2>
        
        {/* Stepper Header */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                currentStep === step.id ? 'bg-primary text-primary-foreground' :
                currentStep > step.id ? 'bg-green-500 text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {currentStep > step.id ? <CheckCircle2 size={16} /> : step.id}
              </div>
              <span className={`ml-2 text-sm font-medium whitespace-nowrap ${currentStep === step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-4 text-muted-foreground/50" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-card rounded-xl border shadow-sm p-6 relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        <div className="h-full flex flex-col">
          <div className="flex-1 pb-6 overflow-y-auto">
            {currentStep === 1 && (
              <Step1Platforms 
                selected={selectedPlatforms} 
                onChange={setSelectedPlatforms} 
              />
            )}
            
            {currentStep === 2 && (
              <Step2Prompt 
                rawPrompt={rawPrompt} 
                setRawPrompt={setRawPrompt} 
                onAiAssist={handleAiAssist} 
              />
            )}
            
            {currentStep === 3 && (
              <Step3Enhanced 
                enhancedPrompt={enhancedPrompt} 
                setEnhancedPrompt={setEnhancedPrompt}
                draftId={draftId}
              />
            )}
            
            {currentStep === 4 && draftId && (
              <Step4Generation 
                draftId={draftId} 
                platforms={selectedPlatforms}
                enhancedPrompt={enhancedPrompt}
              />
            )}
            
            {currentStep === 5 && draftId && (
              <Step5PreviewPublish 
                draftId={draftId} 
                platforms={selectedPlatforms} 
              />
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t mt-auto">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || isProcessing}>
              Back
            </Button>
            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button onClick={nextStep} disabled={isProcessing}>
                  Continue
                </Button>
              ) : (
                <Button onClick={() => router.push('/content-studio')} className="bg-green-600 hover:bg-green-700 text-white">
                  Finish
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
