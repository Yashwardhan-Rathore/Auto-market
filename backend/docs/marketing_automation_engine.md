# Marketing Automation Engine

## Execution Lifecycle

Executions move through `PENDING`, `RUNNING`, `WAITING`, `RETRYING`, `SUCCESS`, `FAILED`, and `CANCELLED`.

`WAIT` and `DELAY` utility nodes pause the executor, store `paused_at`, `resume_at`, and `current_node`, and leave the execution in `WAITING`. Celery Beat runs `apps.automation.tasks_resume.resume_workflows` every 60 seconds and resumes from the next edge after the waiting node.

Failed nodes use retry settings from the current node business config:

```json
{
  "retry_count": 3,
  "retry_delay": 60,
  "retry_strategy": "EXPONENTIAL"
}
```

Retries store `retry_count`, `retry_after`, and `error_message` on `AutomationExecution`.

## Branching

Condition nodes return booleans. The executor follows an outgoing edge with `edge_type` `YES` for `true` and `NO` for `false`. Supported condition action names are `EQUALS`, `NOT_EQUALS`, `CONTAINS`, `NOT_CONTAINS`, `EXISTS`, `EMPTY`, `DATE_COMPARE`, `BOOLEAN_COMPARE`, `AND`, `OR`, and `NOT`.

Condition values may reference execution context with JSON paths:

```json
{
  "left": "$.event.url",
  "right": "/pricing"
}
```

## Website Events

`POST /api/events/track/`

```json
{
  "event": "PAGE_VISITED",
  "user": "abc123",
  "url": "/pricing",
  "metadata": {}
}
```

The events app stores `WebsiteEvent` records and dispatches published workflows whose trigger node `action_name` matches the event.

## Webhooks

`POST /api/webhooks/{secret}/`

Webhook workflows use a trigger node with `action_name` `WEBHOOK_RECEIVED` and `business_config.secret` matching the path secret. If `X-Automarket-Signature` or `X-Hub-Signature-256` is present, it must match an HMAC SHA-256 digest of the raw body using the path secret.

## Communications

Email provider configuration is available at `POST /api/communications/email-providers/`.

Email actions use the automation owner's `OrganizationEmailProvider`. `SMTP` uses Django email settings. `AWS_SES` uses the organization's AWS credentials through `boto3`.

Registered action names include `SEND_EMAIL`, `SEND_BULK_EMAIL`, `SEND_SMS`, `SEND_WHATSAPP`, `SEND_NOTIFICATION`, `TRACK_EVENT`, `UPDATE_USER_PROPERTY`, `WEBHOOK_CALL`, `HTTP_REQUEST`, `INTERNAL_API_CALL`, `TRIGGER_WORKFLOW`, and `END`.

Communication events are stored in `CommunicationEvent` and exposed at `GET /api/communications/events/`.

## Analytics

`GET /api/analytics/summary/` returns email, SMS, WhatsApp, and workflow metrics for the authenticated organization owner.
