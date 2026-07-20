# Security Report

- Passwords are serializer write-only and absent from login/create responses.
- JWTs are never logged by frontend code. Access token is memory-only; the rotating refresh token is stored in `sessionStorage` because the backend returns bearer tokens and provides no HTTP-only cookie flow.
- Refresh is single-flight and retried once; failure clears session and redirects.
- Backend profile role is authoritative; route names and browser values do not grant permissions.
- Navigation, frontend module access, actions, and repaired backend automation APIs enforce permissions.
- Provider secrets are write-only in serializers and omitted from generic table columns by secret/token/password name filters.
- Webhook secrets are not displayed or managed in the frontend.
- Super Admin creation is protected after the one-time empty-system bootstrap.
- Remaining: replace `CORS_ALLOW_ALL_ORIGINS` with explicit deployment origins.
- Remaining: repair the private database URL and rotate it if it has been shared outside secure channels.
- `npm install` reported two moderate advisories; no breaking force-upgrade was applied.

