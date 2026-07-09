import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Settings' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground mt-1">Configure your workspace settings</p>
    </div>
  );
}
