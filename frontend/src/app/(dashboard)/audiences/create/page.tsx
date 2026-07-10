'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CampaignService } from '@/services/campaign.service';
import { CustomerService } from '@/services/customer.service';
import { ArrowLeft, Save, Plus, Trash2, Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

export default function CreateAudiencePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [operator, setOperator] = useState("AND");
  const [conditions, setConditions] = useState<{field: string, operator: string, value: string}[]>([
    { field: '', operator: '=', value: '' }
  ]);

  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const { data: uploads = [] } = useQuery({
    queryKey: ['customer_uploads'],
    queryFn: CustomerService.listUploads
  });

  const createMutation = useMutation({
    mutationFn: () => CampaignService.createAudience({
      name,
      customer_upload: parseInt(uploadId),
      definition: {
        operator,
        conditions
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] });
      toast.success("Audience created successfully.");
      router.push('/audiences');
    },
    onError: () => {
      toast.error("Failed to create audience.");
    }
  });

  const previewMutation = useMutation({
    mutationFn: () => CampaignService.previewAudience({
      customer_upload: parseInt(uploadId),
      definition: { operator, conditions }
    }),
    onSuccess: (data: any) => {
      setPreviewCount(data.count || 0);
      toast.success(`Found ${data.count || 0} matching contacts.`);
    },
    onError: () => {
      toast.error("Failed to preview audience.");
    }
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Link href="/audiences" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Create Audience Segment</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Build a dynamic contact segment based on logical rules.</p>
        </div>
      </div>

      <div className="bg-card border border-border p-6 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-muted-foreground">Audience Name *</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
              placeholder="e.g. High Value Customers"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-muted-foreground">Source Data (Upload) *</label>
            <select 
              required
              value={uploadId}
              onChange={e => setUploadId(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
            >
              <option value="">Select a Customer Upload</option>
              {uploads.map((u: any) => (
                <option key={u.id} value={u.id}>{u.file_name} ({u.total_records} records)</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-border pb-2">Logical Rules</h3>
          
          <div className="bg-muted/30 border border-border p-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Match</span>
              <select 
                value={operator}
                onChange={e => setOperator(e.target.value)}
                className="px-3 py-1.5 border border-border bg-background text-xs font-bold outline-none focus:border-foreground"
              >
                <option value="AND">ALL (AND)</option>
                <option value="OR">ANY (OR)</option>
              </select>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">of the following rules:</span>
            </div>

            <div className="space-y-3">
              {conditions.map((cond, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input 
                    value={cond.field}
                    onChange={e => {
                      const newC = [...conditions];
                      newC[index].field = e.target.value;
                      setConditions(newC);
                    }}
                    placeholder="Field name (e.g. email, city)"
                    className="flex-1 px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
                  />
                  <select 
                    value={cond.operator}
                    onChange={e => {
                      const newC = [...conditions];
                      newC[index].operator = e.target.value;
                      setConditions(newC);
                    }}
                    className="w-[140px] px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
                  >
                    <option value="=">Equals (=)</option>
                    <option value="!=">Not Equals (!=)</option>
                    <option value="contains">Contains</option>
                    <option value="startswith">Starts with</option>
                    <option value="endswith">Ends with</option>
                  </select>
                  <input 
                    value={cond.value}
                    onChange={e => {
                      const newC = [...conditions];
                      newC[index].value = e.target.value;
                      setConditions(newC);
                    }}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground"
                  />
                  <button 
                    onClick={() => {
                      const newC = conditions.filter((_, i) => i !== index);
                      setConditions(newC.length ? newC : [{field:'', operator:'=', value:''}]);
                    }}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setConditions([...conditions, {field: '', operator: '=', value: ''}])}
              className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground hover:opacity-70 transition-opacity"
            >
              <Plus size={14} /> Add Rule
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => previewMutation.mutate()}
              disabled={previewMutation.isPending || !uploadId}
              {...mono("bg-muted text-foreground px-6 py-2.5 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50")}
            >
              {previewMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} 
              Preview Segment
            </button>

            {previewCount !== null && !previewMutation.isPending && (
              <div className="text-sm">
                <span className="font-bold text-green-600">{previewCount}</span> contacts match these rules
              </div>
            )}
          </div>

          <button 
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !name || !uploadId}
            {...mono("bg-foreground text-background px-6 py-2.5 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50")}
          >
            {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
            Save Audience
          </button>
        </div>
      </div>
    </div>
  );
}
