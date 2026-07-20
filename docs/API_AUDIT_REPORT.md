# API Audit Report

Audit date: 2026-07-16. Total documented method/route pairs: **111**. Every documented route was resolved against Django source. Runtime verification used an isolated migrated database; live PostgreSQL verification is blocked by the malformed `DATABASE_URL`. External sends, publishing, webhooks, and automation execution were not triggered.

Legend: `RW` = runtime verified by automated test, `SF` = verified from route/view/serializer/model source, `FX` = fixed and runtime verified, `UT` = unsafe to test, `BL` = live-database blocked.

Common columns for all rows: JSON unless marked multipart; JWT required unless marked public; path parameter types are shown in the route. Source-only rows retain `VERIFIED_FROM_SOURCE`, not `VERIFIED_WORKING`.

| Module | Methods and actual routes | Auth / role | Contract evidence | Result |
|---|---|---|---|---|
| Admins | GET `/api/admins/` | SUPER_ADMIN | UserListSerializer; page/search/order | SF/BL |
| Analytics | GET `/api/analytics/summary/` | authenticated, tenant-scoped | metric services | FIXED_FROM_SOURCE/BL |
| Audiences | GET `/api/audiences/`; POST `create/`, `preview/` | ADMIN, SUPER_ADMIN | audience serializers/model | SF/BL |
| Auth | POST `login/`; GET `profile/`; POST `logout/`; POST `forgot-password/`; POST `reset-password/` | public except profile/logout | account serializers | login RW; others SF/BL |
| Auth | POST `token/refresh/` | public with refresh token | SimpleJWT | FX |
| Auth | POST `create-super-admin/` | one-time bootstrap, then SUPER_ADMIN | bootstrap permission | FX |
| Auth | POST/DELETE `admins/`, `admins/{int}/`; POST/DELETE `users/`, `users/{int}/` | role-specific | account serializers/service | SF/BL |
| Automations | GET/POST `/api/automations/`; GET/PATCH/DELETE `/{uuid}/` | authenticated plus object permission | automation serializer/model | list SF; object permission FX |
| Automations | POST `/{uuid}/clone/`, `execute/`, `pause/`, `publish/`, `validate/` | view/edit/execute object permission | services/views | permission FX; execute UT |
| Automations | GET `/{uuid}/executions/`; GET `/executions/{uuid}/logs/` | view object permission | execution models | permission FX |
| Automations | POST `/{uuid}/nodes/`, `/{uuid}/edges/`; PATCH/DELETE `/nodes/{uuid}/`; DELETE `/edges/{uuid}/` | edit object permission | node/edge serializers | permission FX |
| Automations | POST `/webhook/{uuid}/` | webhook contract | webhook view | UT |
| Campaigns | POST `create/`; GET `my/`, `pending-approval/`; PATCH `/{int}/update/` | role/object rules in services | campaign serializers | SF/BL |
| Campaigns | POST `preview/`, `templates/assign/`, `schedule/`; PATCH `/{int}/schedule/` | authenticated/service rules | action serializers | SF/BL |
| Campaigns | POST `/{int}/submit/`, `approve/`, `reject/` | service workflow rules | action serializers | SF/BL |
| Campaigns | POST `send/`; GET `/{int}/analytics/` | authenticated | delivery/analytics service | send UT; analytics SF/BL |
| Channels | GET `/api/channels/`; POST `/{int}/` | authenticated; assignment USER only | channel serializers | SF/BL |
| Communications | GET/POST email, SMS, WhatsApp provider routes; GET `events/` | ADMIN, SUPER_ADMIN | provider serializers/models | FIXED_FROM_SOURCE/BL |
| Content | GET/PUT `brand-voice/`; POST `generate/`; GET `history/` | authenticated | content serializers/services | SF/BL; generate UT |
| Content | GET/POST `templates/`; GET/PUT/PATCH/DELETE `templates/{uuid}/` | authenticated | ContentTemplateSerializer | SF/BL |
| Content | GET/POST `content-drafts/`; GET/PUT/PATCH/DELETE `content-drafts/{id}/` | authenticated/content permission | ContentDraftSerializer | SF/BL |
| Content | POST draft `approve`, `reject`, `request_approval`, `regenerate`, `schedule`, `publish` | workflow/role-specific | viewset actions | publish UT; others SF/BL |
| Content | POST `/{uuid}/action/`, `/{uuid}/regenerate/`; PUT `/{uuid}/update/` | authenticated | generated-content views | publishing UT; others SF/BL |
| Customers | GET `/api/customers/`, `uploads/list/`; POST `uploads/` | authenticated/tenant scope | corrected record serializer, multipart upload serializer | FIXED_FROM_SOURCE/BL |
| Dashboard | GET `/api/dashboard/`; GET `stats/` | authenticated; stats SUPER_ADMIN | dashboard serializers/services | SF/BL |
| Events | POST `/api/events/track/` | authenticated | event serializer | SF/BL |
| Forms | GET/POST `/api/forms/`; GET/PUT/PATCH/DELETE `/{int}/`; POST `/{int}/publish/`; GET responses | ADMIN/USER plus ownership | form serializers/services | SF/BL |
| Forms | GET `/public/{uuid}/`; POST `/public/{uuid}/submit/` | public | corrected status and answer schema | FX |
| Tasks | POST `/api/tasks/`; GET `my/`, `team/`; PATCH assignment; POST approve/reject | role/object permissions | task serializers/services | SF/BL |
| Templates | GET `/api/templates/`; POST `create/`; PATCH `/{int}/` | authenticated/service rules | campaign Template serializers | SF/BL |
| Users | GET `/api/users/` | ADMIN, SUPER_ADMIN | UserListSerializer; page/search/order | SF/BL |
| Webhooks | POST `/api/webhooks/{secret}/` | secret signature/path | dispatcher | UT |

## Confirmed mismatches

1. The documented auth set omitted a refresh route even though refresh rotation was configured and logout requires a refresh token. Fixed and tested.
2. Automation identifiers are UUIDs; campaigns, tasks, users, forms, and campaign templates use integers.
3. Customer records store arbitrary customer values under `data`; formerly documented serializer fields such as `email` are not model columns.
4. Public form answers are objects (`field_id`, `answer`), not strings.
5. `/api/templates/` (campaign delivery templates, integer IDs) and `/api/content/templates/` (content prompt templates, UUID IDs) are distinct resources.
6. Provider and analytics views queried a removed `organization` field. Corrected to match current models and role scope; live DB verification remains blocked.

