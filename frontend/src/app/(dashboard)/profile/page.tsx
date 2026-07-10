'use client';

import { useQuery } from '@tanstack/react-query';
import { AuthService } from '@/services/auth.service';
import { User, Mail, Shield, Clock } from 'lucide-react';
import { format } from 'date-fns';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: AuthService.getProfile
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-red-500">Failed to load profile.</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Profile Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-card border border-border p-6 md:p-8 space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-muted flex items-center justify-center rounded-full text-muted-foreground">
            <User size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{profile.first_name} {profile.last_name}</h3>
            <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
              <Mail size={14} /> {profile.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-muted-foreground">Role</label>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-foreground" />
              <span className="font-semibold uppercase tracking-wider text-sm">{profile.role || 'USER'}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-muted-foreground">Last Login</label>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <span {...mono("text-sm")}>{profile.last_login ? format(new Date(profile.last_login), 'MMM dd, yyyy HH:mm') : 'Never'}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest">Update Information</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">First Name</label>
              <input defaultValue={profile.first_name} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Last Name</label>
              <input defaultValue={profile.last_name} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Email</label>
              <input disabled defaultValue={profile.email} className="w-full px-3 py-2 border border-border bg-muted text-sm outline-none cursor-not-allowed opacity-70" />
              <p className="text-[10px] text-muted-foreground mt-1">Contact your administrator to change your email address.</p>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button 
              {...mono("bg-foreground text-background px-6 py-2.5 text-xs uppercase tracking-widest font-semibold hover:opacity-90")}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
