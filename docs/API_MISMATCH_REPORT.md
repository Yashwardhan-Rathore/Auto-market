# API Mismatch Report

- Refresh was required by configured JWT rotation/logout but absent from documented and active routes. It is now `/api/auth/token/refresh/`.
- Automation path identifiers are UUIDs, while documentation used generic `{id}`.
- Form public answers must be objects with `field_id` and `answer`.
- Customer values are arbitrary JSON in `data`, not fixed customer model columns.
- Provider models no longer contain the `organization` field referenced by their views.
- Public form status values are lowercase (`draft`, `published`, `archived`).
- Campaign templates and Content Studio templates are separate entities and ID types.
- Only account and `my campaigns` lists expose verified server pagination/search/ordering.

