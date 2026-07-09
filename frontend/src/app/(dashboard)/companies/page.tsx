import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Companies' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
      <p className="text-muted-foreground mt-1">Manage your business accounts</p>
    </div>
  );
}
