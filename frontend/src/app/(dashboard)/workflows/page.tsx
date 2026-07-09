import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Workflows' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
      <p className="text-muted-foreground mt-1">Build automated marketing workflows</p>
    </div>
  );
}
