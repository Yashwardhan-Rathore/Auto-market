# API Correction Report

| Correction | Files | Verification |
|---|---|---|
| Restored rotating JWT refresh route | `accounts/urls.py` | Valid refresh returns rotated access/refresh token |
| Restricted Super Admin creation to one-time bootstrap or existing Super Admin | account permission/view | Anonymous second creation returns 401; authorized creation returns 201 |
| Corrected CustomerRecord fields | campaign customer serializer | Source/model contract verified |
| Fixed public form status casing and answer validation | form view/serializer/URLs | Retrieve, valid submit, malformed submit tests pass |
| Removed references to deleted communication `organization` fields | communication views | Django checks pass; live DB blocked |
| Rebuilt analytics tenant queries around current campaign/automation ownership | metrics service | Django checks pass; live DB blocked |
| Added automation object authorization for detail/actions/nodes/edges/executions | automation API/services | Cross-owner GET/PATCH/node/history return 403 |
| Repaired stale backend tests | forms/content/account/automation tests | Full suite: 25/25 pass |

No migration was created or applied. No live record was inserted, changed, or deleted.

