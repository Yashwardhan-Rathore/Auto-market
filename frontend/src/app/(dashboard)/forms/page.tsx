import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Forms' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Forms</h1>
      <p className="text-muted-foreground mt-1">Build and manage capture forms</p>
    </div>
  );
}
