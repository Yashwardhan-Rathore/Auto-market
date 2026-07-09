import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Landing Pages' };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Landing Pages</h1>
      <p className="text-muted-foreground mt-1">Design high-converting landing pages</p>
    </div>
  );
}
