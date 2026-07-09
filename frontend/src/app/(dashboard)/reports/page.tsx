import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Reports' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
      <p className="text-muted-foreground mt-1">Generate and export custom reports</p>
    </div>
  );
}
