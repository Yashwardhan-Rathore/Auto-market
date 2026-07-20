import { notFound } from "next/navigation";
import { DataView } from "@/components/modules/data-view";
import { moduleDefinitions } from "@/services/module-services";
import type { ModuleKey } from "@/permissions/permission-matrix";
import { SuperAdminPage } from "@/components/super-admin/page";
import { SuperAdminAccount } from "@/components/super-admin/account";
import { AdminDashboard } from "@/components/admin/dashboard";
import { AdminContacts } from "@/components/admin/contacts";
import { TeamManagement } from "@/components/admin/team-management";
const superSections = new Set(["dashboard","admins","users","billing","analytics","ai-credits","account"]);
export default async function ModulePage({ params }: { params: Promise<{role:string;section:string}> }) { const {role,section}=await params; if(role==="super-admin"&&superSections.has(section))return <SuperAdminPage section={section}/>; if(role==="admin"&&section==="dashboard")return <AdminDashboard/>; if(role==="admin"&&section==="users")return <TeamManagement/>; if(role==="admin"&&section==="customers")return <AdminContacts/>; if(role==="admin"&&section==="account")return <SuperAdminAccount/>; if(!(section in moduleDefinitions))notFound(); return <DataView module={section as ModuleKey}/>; }
