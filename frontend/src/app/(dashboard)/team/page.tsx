'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@/services/auth.service';
import { Plus, Search, Shield, User, Check, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

function mono(cls = ""): { style: React.CSSProperties; className: string } {
  return { style: { fontFamily: "'JetBrains Mono', monospace" }, className: cls };
}

export default function TeamPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', first_name: '', last_name: '', role: 'USER', password: '' });
  
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: AuthService.listUsers
  });



  const createMutation = useMutation({
    mutationFn: () => AuthService.createTeamMember(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowAddForm(false);
      setFormData({ email: '', first_name: '', last_name: '', role: 'USER', password: '' });
      toast.success("Team member added.");
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.email?.[0] || "Failed to create team member.");
    }
  });



  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div>
          <h2 className="text-xl font-black uppercase" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Team Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage users</p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          {...mono("bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity")}
        >
          {showAddForm ? <X size={13} /> : <Plus size={13} />} {showAddForm ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={e => { e.preventDefault(); createMutation.mutate(); }} className="bg-card border border-border p-5 grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">First Name</label>
            <input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Last Name</label>
            <input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground" />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Email</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-muted-foreground">Role</label>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-border bg-background text-sm outline-none focus:border-foreground">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="col-span-2 pt-2">
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              {...mono("w-full bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50")}
            >
              {createMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Create Team Member'}
            </button>
          </div>
        </form>
      )}


        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Name", "Email"].map(h => (
                  <th key={h} {...mono("text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingUsers && (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">Loading users...</td></tr>
              )}
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <User size={14} className="text-muted-foreground" />
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>



    </div>
  );
}
