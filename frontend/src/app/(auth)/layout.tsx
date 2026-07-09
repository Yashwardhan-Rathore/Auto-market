export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left ─ Branding Panel */}
      <div className="relative hidden lg:flex flex-col bg-gradient-to-br from-[hsl(241,76%,40%)] via-[hsl(241,72%,35%)] to-[hsl(241,69%,27%)] p-12 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">AutoMarket</span>
        </div>

        {/* Tagline + Stats */}
        <div className="relative z-10 mt-auto space-y-6">
          <blockquote className="space-y-2">
            <p className="text-2xl font-semibold leading-snug">
              &ldquo;The only marketing platform that grows with your business — from first campaign to Fortune 500.&rdquo;
            </p>
            <footer className="text-sm text-white/70">
              Trusted by 12,000+ businesses worldwide
            </footer>
          </blockquote>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
            {[
              { value: '98%', label: 'Deliverability' },
              { value: '4.9★', label: 'Customer Rating' },
              { value: '12k+', label: 'Active Teams' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-white/70 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right ─ Auth Forms */}
      <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        {children}
      </div>
    </div>
  );
}
