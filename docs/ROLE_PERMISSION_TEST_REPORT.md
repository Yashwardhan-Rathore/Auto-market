# Role Permission Test Report

| Role | Route/API | Expected | Actual | Result |
|---|---|---|---|---|
| anonymous | create Super Admin after bootstrap | 401 | 401 | PASS |
| SUPER_ADMIN | create another Super Admin | 201 | 201 | PASS |
| unrelated USER | automation detail GET/PATCH | 403 | 403 | PASS |
| unrelated USER | automation node/history | 403 | 403 | PASS |
| anonymous | public published form GET/submit | 200/201 | 200/201 | PASS |
| anonymous | protected frontend portal | login redirect | redirected to `/login` | PASS |
| SUPER_ADMIN/ADMIN/USER | full live matrix | role-specific | BLOCKED: credentials/database | BLOCKED |
| inactive/expired/invalid token | protected routes | 401/account block | source verified; exhaustive live run blocked | BLOCKED |
