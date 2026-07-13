'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextContentGenerator } from "./components/TextContentGenerator";
import { SocialMediaGenerator } from "./components/SocialMediaGenerator";

export default function ContentStudioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Content Studio</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Generate marketing copy and social media assets with AI.</p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 mb-6 h-auto">
          <TabsTrigger 
            value="email" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-xs font-bold uppercase tracking-widest"
          >
            Email
          </TabsTrigger>
          <TabsTrigger 
            value="blog" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-xs font-bold uppercase tracking-widest"
          >
            Blog
          </TabsTrigger>
          <TabsTrigger 
            value="ad_copy" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-xs font-bold uppercase tracking-widest"
          >
            Ad Copy
          </TabsTrigger>
          <TabsTrigger 
            value="social" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-xs font-bold uppercase tracking-widest"
          >
            Social Media
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="m-0 focus-visible:outline-none">
          <TextContentGenerator contentType="EMAIL" />
        </TabsContent>
        
        <TabsContent value="blog" className="m-0 focus-visible:outline-none">
          <TextContentGenerator contentType="BLOG" />
        </TabsContent>
        
        <TabsContent value="ad_copy" className="m-0 focus-visible:outline-none">
          <TextContentGenerator contentType="AD_COPY" />
        </TabsContent>
        
        <TabsContent value="social" className="m-0 focus-visible:outline-none">
          <SocialMediaGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
