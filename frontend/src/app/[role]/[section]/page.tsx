import { notFound } from "next/navigation";
import { DataView } from "@/components/modules/data-view";
import { moduleDefinitions } from "@/services/module-services";
import type { ModuleKey } from "@/permissions/permission-matrix";
import { SuperAdminPage } from "@/components/super-admin/page";
import { SuperAdminAccount } from "@/components/super-admin/account";
import { AdminDashboard } from "@/components/admin/dashboard";
import { AdminContacts } from "@/components/admin/contacts";
import { TeamManagement } from "@/components/admin/team-management";
import { AdminCampaigns } from "@/components/admin/campaigns";
import { AdminTasks } from "@/components/admin/tasks";
import { AdminAudiences } from "@/components/admin/audiences";
import { AdminSocialPublisher } from "@/components/admin/social-publisher";
import { AdminAnalytics } from "@/components/admin/analytics";
const superSections = new Set(["dashboard","admins","users","billing","analytics","ai-credits","account"]);
export default async function ModulePage({ params }: { params: Promise<{role:string;section:string}> }) { const {role,section}=await params; if(role==="super-admin"&&superSections.has(section))return <SuperAdminPage section={section}/>; if(role==="admin"&&section==="dashboard")return <AdminDashboard/>; if(role==="admin"&&section==="users")return <TeamManagement/>; if(role==="admin"&&(section==="contacts"||section==="customers"))return <AdminContacts/>; if(role==="admin"&&section==="audiences")return <AdminAudiences/>; if(role==="admin"&&section==="tasks")return <AdminTasks/>; if(role==="admin"&&section==="campaigns")return <AdminCampaigns/>; if(role==="admin"&&section==="channels")return <AdminSocialPublisher/>; if(role==="admin"&&section==="analytics")return <AdminAnalytics/>; if(role==="admin"&&section==="account")return <SuperAdminAccount/>; if(!(section in moduleDefinitions))notFound(); return <DataView module={section as ModuleKey}/>; }
