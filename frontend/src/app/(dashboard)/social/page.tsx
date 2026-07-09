import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Social Publishing' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Social Publishing</h1>
      <p className="text-muted-foreground mt-1">Schedule and publish social media content</p>
    </div>
  );
}
