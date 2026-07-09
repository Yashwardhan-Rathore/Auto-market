import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Notifications' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
      <p className="text-muted-foreground mt-1">Your notification center</p>
    </div>
  );
}
