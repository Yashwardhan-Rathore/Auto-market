# Database Test Report

| Check | Target | Result |
|---|---|---|
| Connection | Configured Neon PostgreSQL | BLOCKED: malformed URL structure; no connection attempted after validation |
| Migration graph | Isolated SQLite memory DB | PASS: all migrations apply |
| Backend tests | Isolated SQLite memory DB | PASS: 25/25 |
| Real record reads | Neon PostgreSQL | BLOCKED |
| Safe CRUD persistence | Neon PostgreSQL | BLOCKED; no test records created |
| Destructive/side-effect tests | Any live environment | SKIPPED |

The `.env` secret must be replaced with a complete provider-issued PostgreSQL URL containing an ASCII hostname and database name. It was not copied into reports or frontend configuration.

