# Auto Market Frontend

Next.js 16 App Router frontend for the verified Django REST API. It uses a shared role-aware login, rotating bearer JWT sessions, centralized permissions, responsive monochrome portal shell, TanStack Query data loading, and real API error/empty/loading states.

## Run

```powershell
cd "C:\office project\Auto-market\frontend"
Copy-Item .env.example .env.local
npm install
npm run dev
```

The default API origin is `http://127.0.0.1:8000`. Set `NEXT_PUBLIC_API_URL` to the backend origin only; never put database or provider secrets in frontend environment variables.

## Verify

```powershell
npm run lint
npm run test
npm run build
npm run test:e2e
```

Credentialed and side-effecting E2E specs are intentionally skipped until dedicated test-role accounts and a safe database/provider environment are supplied.

## Authentication note

The backend returns bearer access/refresh tokens rather than HTTP-only cookies. Access tokens remain in memory; rotating refresh tokens use per-tab `sessionStorage` to restore a page reload. A future backend cookie flow would be preferable for stronger XSS resistance.

