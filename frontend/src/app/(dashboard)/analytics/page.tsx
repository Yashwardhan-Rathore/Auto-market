import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Analytics' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      <p className="text-muted-foreground mt-1">Dive deep into your marketing performance</p>
    </div>
  );
}
