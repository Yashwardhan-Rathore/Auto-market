import { PortalShell } from "@/components/layout/portal-shell";
export default async function RoleLayout({ children, params }: { children: React.ReactNode; params: Promise<{role:string}> }) { const {role}=await params; return <PortalShell rolePath={role}>{children}</PortalShell>; }
