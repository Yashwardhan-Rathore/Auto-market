'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, FileText, Video, Trash2, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

// Mock data since backend API is not fully implemented
const MOCK_ASSETS = [
  { id: 1, name: 'logo-dark.png', type: 'IMAGE', size: '124 KB', uploaded_at: '2024-05-10', url: '/placeholder-logo.png' },
  { id: 2, name: 'welcome-email-banner.jpg', type: 'IMAGE', size: '850 KB', uploaded_at: '2024-05-11', url: '/placeholder-banner.jpg' },
  { id: 3, name: 'q3-report-template.pdf', type: 'DOCUMENT', size: '2.4 MB', uploaded_at: '2024-05-15', url: '#' },
];

export default function AssetLibraryPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'ALL' | 'IMAGE' | 'DOCUMENT' | 'VIDEO'>('ALL');
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === 'ALL' || a.type === tab;
    return matchesSearch && matchesTab;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'IMAGE': return <ImageIcon size={24} className="text-blue-500" />;
      case 'DOCUMENT': return <FileText size={24} className="text-orange-500" />;
      case 'VIDEO': return <Video size={24} className="text-purple-500" />;
      default: return <FileText size={24} className="text-gray-500" />;
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      toast.success(`Selected ${files.length} file(s) for upload. (Backend integration pending)`);
      // Here you would normally upload the files to the backend
      // and update the assets list.
    }
  };

  const handleDelete = (id: number) => {
    setAssets(assets.filter(a => a.id !== id));
    toast.success("Asset deleted.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Asset Library</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage images, documents, and media for your contentDrafts.</p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,video/*" 
          onChange={handleFileChange} 
        />
        <button onClick={handleUploadClick} {...mono("bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity")}>
          <Upload size={14} /> Upload Asset
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2">
          {['ALL', 'IMAGE', 'DOCUMENT', 'VIDEO'].map(t => (
            <button 
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${tab === t ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-muted-foreground hover:border-foreground/50'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search assets..." 
            className="w-full pl-9 pr-4 py-2 border border-border text-sm outline-none focus:border-foreground bg-card" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border">
            <ImageIcon size={32} className="mx-auto mb-4 opacity-20" />
            <p>No assets found.</p>
          </div>
        )}
        
        {filtered.map(asset => (
          <div key={asset.id} className="bg-card border border-border group relative overflow-hidden flex flex-col">
            <div className="h-32 bg-muted/30 flex items-center justify-center border-b border-border">
              {asset.type === 'IMAGE' ? (
                // In a real app we'd use next/image or an img tag with the actual URL
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  {getIcon(asset.type)}
                </div>
              ) : (
                getIcon(asset.type)
              )}
            </div>
            
            <div className="p-3">
              <h4 className="font-semibold text-sm truncate" title={asset.name}>{asset.name}</h4>
              <div className="flex justify-between items-center mt-2">
                <span {...mono("text-[10px] text-muted-foreground")}>{asset.size}</span>
                <span {...mono("text-[10px] text-muted-foreground")}>{asset.uploaded_at}</span>
              </div>
            </div>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button 
                onClick={() => handleDelete(asset.id)}
                className="p-1.5 bg-background border border-border text-red-500 hover:bg-red-50 hover:border-red-200"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
