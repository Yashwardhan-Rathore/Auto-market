# Module Test Report

| Module | Operation | Result | Evidence |
|---|---|---|---|
| Auth | login/refresh/bootstrap permissions | PASS | backend automated tests |
| Forms | public GET/valid and invalid submit | PASS | backend automated tests |
| Automations | execution engine + cross-owner denial | PASS | backend automated tests |
| Content | generation/workflow/publishing services mocked at provider boundary | PASS | backend tests |
| All frontend modules | compile/type/static generation | PASS | Next production build |
| Permissions/login schema | unit | PASS (3 assertions/tests) | Vitest |
| Login UI and anonymous protected-route redirect | browser E2E | PASS (2/2 safe tests) | Playwright Chromium |
| Admins/users/dashboard/analytics/audiences/campaigns/communications/customers/tasks/templates | live database operations | BLOCKED | malformed database URL |
| Send/publish/webhook/execute | external side effect | SKIPPED | safety requirement |

Playwright total: 2 passed, 7 explicitly skipped, 0 failed.
