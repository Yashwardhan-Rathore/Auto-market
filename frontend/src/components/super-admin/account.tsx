"use client";

import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Globe2, Lock, Palette, Save, UserRound, 
  User as UserIcon, Mail, Phone, Calendar, Building2, 
  ShieldCheck, UserCircle2, Briefcase, UserPlus, Pencil,
  Eye, EyeOff, ChevronDown, ChevronUp
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { parseApiError } from "@/services/api-client";
import { superAdminService } from "@/services/super-admin.service";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";

function ProfileField({ icon: Icon, label, value, isEditingMode, isEditable, onChange }: any) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0 dark:border-white/5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50/80 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        <Icon size={18} />
      </div>
      <div className="w-[160px] shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="flex flex-1 items-center gap-3">
        {isEditingMode && isEditable ? (
          <input 
            className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" 
            value={value} 
            onChange={onChange} 
            readOnly={!onChange}
          />
        ) : (
          <div className="font-medium text-slate-900 dark:text-white">{value}</div>
        )}
      </div>
    </div>
  );
}

export function SuperAdminAccount() {
  const { user } = useAuth();
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? ""
  });

  const save = useMutation({
    mutationFn: () => superAdminService.updateProfile(form),
    onSuccess: () => {
      toast.success("Profile updated. Refreshing session data on next load.");
      setIsEditingMode(false);
    },
    onError: e => toast.error(parseApiError(e))
  });

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell }
  ];

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="sa-title">ACCOUNT SETTINGS</h1>
          <p className="sa-subtitle">{user.role.replaceAll("_", " ")} · {user.email}</p>
        </div>
        <DarkModeToggle />
      </div>

      <section className="sa-card mt-7 grid overflow-hidden md:grid-cols-[245px_1fr]">
        <aside className="border-b border-slate-200 p-4 md:border-b-0 md:border-r dark:border-white/10">
          {tabs.map(t => (
            <button 
              onClick={() => (t.id === "profile" || t.id === "notifications" || t.id === "security") ? setActiveTab(t.id) : null}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left ${activeTab === t.id ? "bg-blue-50 font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"}`} 
              key={t.id}
            >
              <t.icon size={20} />
              {t.label}
            </button>
          ))}
        </aside>

        {activeTab === "profile" && (
          <motion.form 
            initial={{ opacity: 0, x: 8 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="p-6 sm:p-10" 
            onSubmit={e => { e.preventDefault(); save.mutate(); }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold">Profile information</h2>
            </div>
            
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl px-5">
              <ProfileField 
                icon={UserIcon} 
                label="First Name" 
                value={form.first_name} 
                isEditingMode={isEditingMode}
                isEditable 
                onChange={(e: any) => setForm({...form, first_name: e.target.value})} 
              />
              <ProfileField 
                icon={UserIcon} 
                label="Last Name" 
                value={form.last_name} 
                isEditingMode={isEditingMode}
                isEditable 
                onChange={(e: any) => setForm({...form, last_name: e.target.value})} 
              />
              <ProfileField 
                icon={Mail} 
                label="Email Address" 
                value={user.email} 
                isEditingMode={isEditingMode}
                isEditable={false} 
              />
              <ProfileField 
                icon={Phone} 
                label="Mobile Number" 
                value="+91 98765 43210" 
                isEditingMode={isEditingMode}
                isEditable 
              />
              <ProfileField 
                icon={Calendar} 
                label="Date of Joining" 
                value="15 Apr 2024" 
                isEditingMode={isEditingMode}
                isEditable={false} 
              />
              <ProfileField 
                icon={Calendar} 
                label="Date of Birth" 
                value="12 Jan 1998" 
                isEditingMode={isEditingMode}
                isEditable 
              />
              <ProfileField 
                icon={Building2} 
                label="Department" 
                value="Marketing" 
                isEditingMode={isEditingMode}
                isEditable 
              />
              <ProfileField 
                icon={ShieldCheck} 
                label="Role" 
                value={user.role.replaceAll("_", " ")} 
                isEditingMode={isEditingMode}
                isEditable={false} 
              />
              <ProfileField 
                icon={UserCircle2} 
                label="Admin" 
                value="Rohit Sharma" 
                isEditingMode={isEditingMode}
                isEditable={false} 
              />
              <ProfileField 
                icon={Briefcase} 
                label="Position" 
                value="Marketing Executive" 
                isEditingMode={isEditingMode}
                isEditable 
              />
              <ProfileField 
                icon={UserPlus} 
                label="Gender" 
                value="Male" 
                isEditingMode={isEditingMode}
                isEditable 
              />
            </div>

            <div className="mt-8 flex items-center gap-4">
              {!isEditingMode ? (
                <button 
                  type="button" 
                  onClick={() => setIsEditingMode(true)}
                  className="primary-button bg-blue-600 px-6 hover:bg-blue-700"
                >
                  <Pencil size={18} className="mr-2 inline" />
                  Edit profile
                </button>
              ) : (
                <>
                  <button 
                    type="submit" 
                    className="primary-button bg-blue-600 px-6 hover:bg-blue-700" 
                    disabled={save.isPending}
                  >
                    <Save size={18} className="mr-2 inline" />
                    Save changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditingMode(false)}
                    className="rounded-xl px-5 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </motion.form>
        )}

        {activeTab === "security" && (
          <motion.div 
            initial={{ opacity: 0, x: 8 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="p-6 sm:p-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Security Settings</h2>
            </div>
            
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
               <button 
                 onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                 className="flex w-full items-center justify-between p-5 text-left font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
               >
                 <span>Change Password</span>
                 {isPasswordOpen ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
               </button>
               
               <AnimatePresence>
                 {isPasswordOpen && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: "auto", opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden"
                   >
                     <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
                       <div className="space-y-5">
                         <div>
                           <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Current Password</label>
                           <div className="relative">
                             <input type={showCurrent ? "text" : "password"} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white pr-10" />
                             <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                               {showCurrent ? <EyeOff size={18}/> : <Eye size={18}/>}
                             </button>
                           </div>
                         </div>
                         <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                           <div>
                             <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">New Password</label>
                             <div className="relative">
                               <input type={showNew ? "text" : "password"} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white pr-10" />
                               <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                 {showNew ? <EyeOff size={18}/> : <Eye size={18}/>}
                               </button>
                             </div>
                           </div>
                           <div>
                             <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Confirm Password</label>
                             <div className="relative">
                               <input type={showConfirm ? "text" : "password"} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white pr-10" />
                               <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                 {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                               </button>
                             </div>
                           </div>
                         </div>
                         <div className="flex justify-end mt-6">
                           <button type="button" className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700 shadow-sm" onClick={() => {toast.success("Password updated successfully."); setIsPasswordOpen(false);}}>
                             Save changes
                           </button>
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === "notifications" && (
          <motion.div 
            initial={{ opacity: 0, x: 8 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="p-6 sm:p-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Notification Preferences</h2>
            </div>
            
            <div className="space-y-6">
              {user.role === "USER" ? (
                <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Tasks & Assignments</h3>
                  
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 bg-white" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">New Task Assigned</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Get notified when an admin gives you a new task.</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 bg-white" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">Task Approved or Rejected</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Get notified when an admin approves or rejects your task submission.</div>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400">No notification preferences available for your role.</div>
              )}
            </div>
            
            <div className="mt-8 flex items-center gap-4">
              <button 
                type="button" 
                className="primary-button bg-blue-600 px-6 hover:bg-blue-700" 
                onClick={() => toast.success("Notification preferences saved.")}
              >
                <Save size={18} className="mr-2 inline" />
                Save preferences
              </button>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
