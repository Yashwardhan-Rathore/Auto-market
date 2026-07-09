import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Workflow Logs' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Workflow Logs</h1>
      <p className="text-muted-foreground mt-1">Monitor workflow execution history</p>
    </div>
  );
}
