'use client';

import { Construction, Twitter, Linkedin, Facebook, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

export default function SocialPublisherWIPPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-2xl mx-auto px-4">
      <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-8 border border-border">
        <Construction size={40} className="text-muted-foreground" />
      </div>
      
      <h2 className="text-3xl md:text-4xl font-black uppercase mb-4" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
        Social Publisher
      </h2>
      
      <p className="text-muted-foreground mb-8 text-lg">
        We're currently building the ultimate social media scheduling and publishing tool. 
        Soon, you'll be able to manage all your social channels directly from Auto-Market.
      </p>

      <div className="flex gap-4 mb-12 opacity-50">
        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-card">
          <Twitter size={20} />
        </div>
        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-card">
          <Linkedin size={20} />
        </div>
        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-card">
          <Facebook size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
        <div className="p-5 border border-border bg-card">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-2">Cross-Platform</h3>
          <p className="text-xs text-muted-foreground">Publish simultaneously to Twitter, LinkedIn, and Facebook.</p>
        </div>
        <div className="p-5 border border-border bg-card">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-2">AI Generated</h3>
          <p className="text-xs text-muted-foreground">Use our AI Content Studio to draft posts automatically.</p>
        </div>
        <div className="p-5 border border-border bg-card">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-2">Smart Scheduling</h3>
          <p className="text-xs text-muted-foreground">Optimize post times for maximum engagement.</p>
        </div>
        <div className="p-5 border border-border bg-card">
          <h3 className="font-bold text-sm uppercase tracking-widest mb-2">Analytics</h3>
          <p className="text-xs text-muted-foreground">Track likes, shares, and clicks in real-time.</p>
        </div>
      </div>

      <Link 
        href="/content"
        className="mt-12 group"
        {...mono("flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground hover:opacity-70 transition-opacity")}
      >
        Return to Content Studio <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
