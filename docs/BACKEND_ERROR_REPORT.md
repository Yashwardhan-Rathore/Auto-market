# Backend Error Report

| Severity | Category | Location | Actual error / root cause | Impact | Fix / result |
|---|---|---|---|---|---|
| Critical | Security | accounts create-super-admin | `AllowAny` permitted unlimited privilege creation | Full compromise | One-time bootstrap + Super Admin permission; tested |
| High | Authentication | accounts URLs | Refresh route commented out while rotation enabled | Expired sessions could not recover | Route restored; tested |
| High | Authorization | automation API views | Direct UUID lookup without ownership/member checks | Cross-tenant read/write/execute | Object permissions added; tested |
| High | Database/environment | `backend/.env` | DB URL has truncated non-ASCII host and no database path | Live DB cannot connect | Not auto-edited; valid secret required |
| High | API contract | communications views | Queries and saves used deleted `organization` fields | Provider/event endpoints raised errors | Current global admin scope used; live retest blocked |
| High | API contract | analytics metrics | Tenant filtering targeted deleted field | Summary endpoint raised FieldError | Current ownership joins used; live retest blocked |
| Medium | Serialization | customer record serializer | Named six nonexistent model fields | Customer list serialization failed | Contract reduced to `id`, `upload`, `data`, `created_at` |
| Medium | Forms | public view/submission | Uppercase status never matched; untyped answers could cause KeyError | Public forms unavailable/500 | Correct enum and nested validation; tested |
| Medium | Tests | forms/content tests | Duplicate models and removed Company imports | Suite could not load | Repaired; 25/25 pass |
| Medium | Security | settings CORS | all origins allowed with credentials | Broad browser access | Remaining blocker: deployment origins required |

