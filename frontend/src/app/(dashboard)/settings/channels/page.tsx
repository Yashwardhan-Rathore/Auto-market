'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '@/services/settings.service';
import { Mail, MessageSquare, Phone, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

export default function ChannelSettingsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'EMAIL' | 'SMS' | 'WHATSAPP'>('EMAIL');

  const { data: emailProviders = [] } = useQuery({ queryKey: ['email_providers'], queryFn: SettingsService.listEmailProviders });
  const { data: smsProviders = [] } = useQuery({ queryKey: ['sms_providers'], queryFn: SettingsService.listSMSProviders });
  const { data: whatsappProviders = [] } = useQuery({ queryKey: ['whatsapp_providers'], queryFn: SettingsService.listWhatsAppProviders });

  const [emailForm, setEmailForm] = useState({ provider: 'SMTP', aws_access_key: '', aws_secret_key: '', aws_region: '', verified_domain: '' });
  const [smsForm, setSmsForm] = useState({ provider: 'MSG91', auth_key: '', sender_id: '' });
  const [whatsappForm, setWhatsappForm] = useState({ provider: 'META', access_token: '', phone_number_id: '', business_account_id: '' });

  const createEmailMutation = useMutation({
    mutationFn: () => SettingsService.createEmailProvider(emailForm),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email_providers'] }); toast.success("Email provider added"); },
    onError: () => toast.error("Failed to add provider")
  });

  const createSmsMutation = useMutation({
    mutationFn: () => SettingsService.createSMSProvider(smsForm),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sms_providers'] }); toast.success("SMS provider added"); },
    onError: () => toast.error("Failed to add provider")
  });

  const createWhatsappMutation = useMutation({
    mutationFn: () => SettingsService.createWhatsAppProvider(whatsappForm),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['whatsapp_providers'] }); toast.success("WhatsApp provider added"); },
    onError: () => toast.error("Failed to add provider")
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Channel Credentials</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage sending capabilities for Email, SMS, and WhatsApp.</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        <button onClick={() => setTab('EMAIL')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 flex items-center gap-2 ${tab === 'EMAIL' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          <Mail size={14} /> Email
        </button>
        <button onClick={() => setTab('SMS')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 flex items-center gap-2 ${tab === 'SMS' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          <MessageSquare size={14} /> SMS
        </button>
        <button onClick={() => setTab('WHATSAPP')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 flex items-center gap-2 ${tab === 'WHATSAPP' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          <Phone size={14} /> WhatsApp
        </button>
      </div>

      <div className="bg-card border border-border p-6 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-widest">Configured Providers</h3>
        <div className="space-y-2">
          {tab === 'EMAIL' && emailProviders.length === 0 && <p className="text-muted-foreground text-sm">No email providers configured.</p>}
          {tab === 'EMAIL' && emailProviders.map((p: any) => (
            <div key={p.id} className="flex justify-between items-center p-3 border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                {p.is_active ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                <span className="font-semibold text-sm">{p.provider}</span>
                <span className="text-xs text-muted-foreground ml-2">Domain: {p.verified_domain}</span>
              </div>
            </div>
          ))}

          {tab === 'SMS' && smsProviders.length === 0 && <p className="text-muted-foreground text-sm">No SMS providers configured.</p>}
          {tab === 'SMS' && smsProviders.map((p: any) => (
            <div key={p.id} className="flex justify-between items-center p-3 border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                {p.is_active ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                <span className="font-semibold text-sm">{p.provider}</span>
                <span className="text-xs text-muted-foreground ml-2">Sender ID: {p.sender_id}</span>
              </div>
            </div>
          ))}

          {tab === 'WHATSAPP' && whatsappProviders.length === 0 && <p className="text-muted-foreground text-sm">No WhatsApp providers configured.</p>}
          {tab === 'WHATSAPP' && whatsappProviders.map((p: any) => (
            <div key={p.id} className="flex justify-between items-center p-3 border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                {p.is_active ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                <span className="font-semibold text-sm">{p.provider}</span>
                <span className="text-xs text-muted-foreground ml-2">Phone ID: {p.phone_number_id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border p-6 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-widest border-b border-border pb-2">Add New Provider</h3>
        
        {tab === 'EMAIL' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Provider</label>
              <select value={emailForm.provider} onChange={e => setEmailForm({...emailForm, provider: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none">
                <option value="SMTP">SMTP</option>
                <option value="AWS_SES">Amazon SES</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Verified Domain</label>
              <input value={emailForm.verified_domain} onChange={e => setEmailForm({...emailForm, verified_domain: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none" />
            </div>
            {emailForm.provider === 'AWS_SES' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">AWS Access Key</label>
                  <input value={emailForm.aws_access_key} onChange={e => setEmailForm({...emailForm, aws_access_key: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">AWS Secret Key</label>
                  <input type="password" value={emailForm.aws_secret_key} onChange={e => setEmailForm({...emailForm, aws_secret_key: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">AWS Region</label>
                  <input value={emailForm.aws_region} onChange={e => setEmailForm({...emailForm, aws_region: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none" />
                </div>
              </>
            )}
            <div className="col-span-2 pt-2">
              <button onClick={() => createEmailMutation.mutate()} {...mono("bg-foreground text-background px-6 py-2 text-xs uppercase tracking-widest font-semibold")}>Save Provider</button>
            </div>
          </div>
        )}

        {tab === 'SMS' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Provider</label>
              <select value={smsForm.provider} onChange={e => setSmsForm({...smsForm, provider: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none">
                <option value="MSG91">MSG91</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Sender ID</label>
              <input value={smsForm.sender_id} onChange={e => setSmsForm({...smsForm, sender_id: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Auth Key</label>
              <input type="password" value={smsForm.auth_key} onChange={e => setSmsForm({...smsForm, auth_key: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none" />
            </div>
            <div className="col-span-2 pt-2">
              <button onClick={() => createSmsMutation.mutate()} {...mono("bg-foreground text-background px-6 py-2 text-xs uppercase tracking-widest font-semibold")}>Save Provider</button>
            </div>
          </div>
        )}

        {tab === 'WHATSAPP' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Provider</label>
              <select value={whatsappForm.provider} onChange={e => setWhatsappForm({...whatsappForm, provider: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none">
                <option value="META">Meta WhatsApp Business Platform</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Phone Number ID</label>
              <input value={whatsappForm.phone_number_id} onChange={e => setWhatsappForm({...whatsappForm, phone_number_id: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Business Account ID</label>
              <input value={whatsappForm.business_account_id} onChange={e => setWhatsappForm({...whatsappForm, business_account_id: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Access Token</label>
              <input type="password" value={whatsappForm.access_token} onChange={e => setWhatsappForm({...whatsappForm, access_token: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none" />
            </div>
            <div className="col-span-2 pt-2">
              <button onClick={() => createWhatsappMutation.mutate()} {...mono("bg-foreground text-background px-6 py-2 text-xs uppercase tracking-widest font-semibold")}>Save Provider</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
