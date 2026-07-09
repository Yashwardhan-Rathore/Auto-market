import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Content Studio' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Content Studio</h1>
      <p className="text-muted-foreground mt-1">Create and manage your content library</p>
    </div>
  );
}
