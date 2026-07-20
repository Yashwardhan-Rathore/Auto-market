# Backend Architecture

## Runtime

- Framework: Django 6.0.6 with Django REST Framework 3.17.1.
- Entry point: `backend/manage.py`; WSGI/ASGI: `backend/config/wsgi.py` and `backend/config/asgi.py`.
- Conventional development port: 8000 (`manage.py runserver`); no custom port is configured.
- API base: `http://127.0.0.1:8000/api` for local development.
- Database: PostgreSQL through `dj-database-url`; the supplied URL identifies a Neon pooler.
- Current live database state: **BLOCKED**. The supplied `DATABASE_URL` has a truncated/non-ASCII hostname and no database path. No live data was changed.
- Isolated verification database: SQLite in-memory. All migrations apply successfully there.
- Background work: Celery; Redis URL is environment-driven. Campaign sends and automation execution can cause external side effects.

## Authentication

- Bearer JWT via SimpleJWT.
- Login returns `data.access`, `data.refresh`, and `data.user`.
- Access lifetime: 30 minutes. Refresh lifetime: 7 days.
- Refresh rotation and blacklist-after-rotation are enabled.
- Refresh endpoint: `POST /api/auth/token/refresh/` (restored during this audit).
- Logout blacklists the submitted refresh token.
- Password reset uses a six-digit, five-minute OTP stored as a password hash in Django cache.
- Exact roles: `SUPER_ADMIN`, `ADMIN`, `USER`, stored in `accounts.MAUser.role`.

## Role hierarchy

| Role | Scope observed in backend |
|---|---|
| SUPER_ADMIN | Global dashboards, Admin management, global tenant-filtered records, provider administration |
| ADMIN | User/team management, department-scoped records where a department exists, audiences/forms/provider operations |
| USER | Own operational records, campaigns, assigned tasks, forms/content where explicitly permitted |

Object-level APIs may narrow this further. Campaign list rows return `available_actions`; the frontend must honor those values.

## Modules and entities

| Module | Principal entities | Identifier |
|---|---|---|
| Accounts | User, MAUser, Department | User: integer; Department: UUID |
| Campaigns | Campaign, CustomerUpload, CustomerRecord, Audience, Channel, Template, Delivery | integer |
| Automations | Automation, Node, Edge, Execution, Log | UUID |
| Content Studio | GeneratedContent, Draft, Platform, Template, Approval | UUID |
| Forms | Form, Field, Submission, Answer | integer; public Form UUID |
| Tasks | Task, TaskAssignment | integer |
| Communications | Providers, CommunicationEvent | UUID |

## Configuration findings

- Global DRF default: authenticated JWT.
- CORS currently allows every origin with credentials. This remains a security blocker until deployment origins are supplied.
- CSRF middleware is enabled, but API auth is bearer-based rather than cookie-based.
- Pagination is explicit only on selected account/campaign endpoints; do not assume all lists paginate.
- Uploads accept `.csv`, `.xlsx`, and `.xls` using multipart field `file`.

## Commands

```powershell
cd "C:\office project\Auto-market\backend"
.\.venv\Scripts\Activate.ps1
python manage.py check
python manage.py runserver 127.0.0.1:8000
```

