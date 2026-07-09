import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Campaigns' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
      <p className="text-muted-foreground mt-1">Create and manage marketing campaigns</p>
    </div>
  );
}
