# Frontend Integration Report

| Page/route | Component/service | Backend | Roles | Status |
|---|---|---|---|---|
| `/login` | LoginForm/AuthProvider/auth service | login, profile, refresh | public | built; build/unit/login UI E2E verified; live credential login blocked |
| forgot/reset password | auth service | forgot/reset | public | built; email side effect not tested |
| `/{role}/dashboard` | PortalShell/DataView | dashboard | all | built; live data blocked |
| Super Admin admins/users | DataView/account service | list/create/delete | SUPER_ADMIN | built; destructive live tests skipped |
| Admin users | DataView/account service | list/create/delete | ADMIN | built; live test blocked |
| analytics/audiences/automations/campaigns/channels/communications/content/customers/forms/tasks/templates | DataView/module service | corresponding verified GET route | matrix-specific | real API wired; live data blocked |
| `/forms/public/{uuid}` | PublicFormPage | public form GET/submit | public | built; backend isolated tests pass |

The generic data surface intentionally renders backend fields rather than invented forms. Module-specific mutation screens are limited to verified Admin/User account creation and deletion; unsafe campaign/automation/publishing actions are not exposed as automatic tests.
