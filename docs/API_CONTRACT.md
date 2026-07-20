# API Contract

All protected endpoints use `Authorization: Bearer <access-token>`. JSON is the default request type except customer uploads, which use `multipart/form-data` with field `file`.

## Authentication contracts

- Login request: `{ email, password }`; response: `{ success, message, data: { access, refresh, user: { id, email, role, is_active, last_login } } }`.
- Refresh request: `{ refresh }`; response includes rotated `{ access, refresh }`.
- Logout request: `{ refresh }`.
- Profile response: `{ id, email, username, first_name, last_name, is_active, is_staff, is_superuser, last_login, date_joined, role }`.
- Forgot password: `{ email }`; reset: `{ email, otp, password, confirm_password }`.
- Account create requests: `{ email, password }`; passwords are write-only.

## Key writable contracts

| Resource | Writable fields | Read-only/derived fields |
|---|---|---|
| Audience create | `name`, `customer_upload`, `definition` | `id`, creator and timestamps |
| Audience preview | `customer_upload`, `audience_definition` | `total_customers`, preview records |
| Campaign create | `task`, `name`, optional `description` | status, creator, timestamps |
| Campaign reject | `rejection_reason`, optional `review_comments` | status |
| Campaign schedule | `campaign`, `scheduled_at` | status |
| Channel assignment | `channels: number[]` | message |
| Customer upload | multipart `file` (.csv/.xlsx/.xls) | import counts/status |
| Campaign template | `name`, `channel`, optional `subject`, `body`, `status` | creator/timestamps |
| Form | title/settings plus nested `fields` | `id`, `uuid`, status, published/created timestamps, response count |
| Public submission | `answers: [{ field_id: number, answer: string }]` | submission ID |
| Automation | `name`, optional `description`, status/public/template flags/version | UUID, owner, timestamps |
| Automation node | `node_type`, `action_name`, `label`, configs, execution order | automation, timestamps |
| Automation edge | `source_node`, `target_node`, optional `edge_type` | automation, timestamp |

## Pagination and filtering

- `/api/admins/`, `/api/users/`, `/api/campaigns/my/`: page-number pagination; `search` and `ordering` supported.
- Campaign list also supports exact `status`.
- Many other list APIs return plain arrays and have no server pagination/search contract.
- `/api/customers/` is capped at the newest 100 records in source.
- Communication events are capped at 200.

## Errors

DRF field errors are objects keyed by field. Authentication errors use `detail`. Expected handling: 400 validation, 401 unauthenticated/invalid token, 403 forbidden, 404 missing object, 429 throttled (if infrastructure adds throttling), and 500 unexpected backend failure.

