# Content Studio API - Postman Testing Guide

This document outlines the step-by-step process for testing the new Content Studio workflow endpoints using Postman.

**Base URL**: `http://localhost:8000/api/content` (Adjust the port or domain if necessary).
**Authorization**: All requests require a valid Bearer token for authentication. Ensure you include the header:
`Authorization: Bearer <your_access_token>`

---

## Step 1: Initialize Content Draft
Create a new content draft and select target platforms.

**Endpoint**: `POST /content-drafts/`

**Request Body (JSON)**:
```json
{
  "platforms": ["FACEBOOK", "INSTAGRAM", "LINKEDIN"]
}
```

**Expected Response (201 Created)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "owner": 1,
  "original_prompt": "",
  "enhanced_prompt": "",
  "workflow_state": "DRAFT",
  "platforms": [
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "platform": "FACEBOOK",
      "status": "PENDING",
      "approval_status": "NONE"
    }
  ]
}
```

*(Save the `id` from this response as `draft_id` for the following steps.)*

---

## Step 2: Auto-Save Prompts
Save the original prompt typed by the user or the enhanced AI prompt. 

**Endpoint**: `PATCH /content-drafts/{draft_id}/`

**Request Body (JSON)**:
```json
{
  "original_prompt": "Write a post about our new summer sale",
  "enhanced_prompt": "Task: Create a professional social media content...\nKey Points:\n- Summer Sale\n- 50% Off"
}
```

**Expected Response (200 OK)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "original_prompt": "Write a post about our new summer sale",
  "enhanced_prompt": "Task: Create a professional social media content...\nKey Points:\n- Summer Sale\n- 50% Off",
  "workflow_state": "DRAFT"
}
```

---

## Step 3: Trigger Mock AI Generation (Regenerate)
Take a snapshot of the current prompt and advance the version. This acts as the "Generate" / "Regenerate" trigger.

**Endpoint**: `POST /content-drafts/{draft_id}/regenerate/`

**Request Body (JSON)**:
```json
{
  "reason": "First Generation Request"
}
```

**Expected Response (201 Created)**:
```json
{
  "message": "New version captured.",
  "version_id": "323e4567-e89b-12d3-a456-426614174002",
  "version_number": 2
}
```

---

## Step 4: Request Approval
Move the content draft from `DRAFT` to `IN_REVIEW`.

**Endpoint**: `POST /content-drafts/{draft_id}/request_approval/`

**Request Body (JSON)**:
```json
{}
```

**Expected Response (200 OK)**:
```json
{
  "message": "Approval requested successfully."
}
```

---

## Step 5: Approve Content Draft (Admin Only)
Approve the content draft, setting it to the `APPROVED` state so it can be scheduled or published.

**Endpoint**: `POST /content-drafts/{draft_id}/approve/`

**Request Body (JSON)**:
```json
{
  "notes": "Looks good to go!"
}
```

**Expected Response (200 OK)**:
```json
{
  "message": "Content approved."
}
```
*(Note: If testing with a regular user account, you will receive a 403 Forbidden. Test with an Admin token.)*

---

## Step 6: Schedule Posts
Set the scheduled publishing time for specific platforms within the content draft.

**Endpoint**: `POST /content-drafts/{draft_id}/schedule/`

**Request Body (JSON)**:
*(Replace `platform_id` with the actual UUIDs of the platforms returned in Step 1)*
```json
{
  "schedules": {
    "223e4567-e89b-12d3-a456-426614174001": "2026-12-01T10:00:00Z"
  }
}
```
*(Note: Ensure the key is the exact `platform_id` UUID string and the value is the future ISO datetime string).*

**Expected Response (200 OK)**:
```json
{
  "message": "Schedules saved successfully."
}
```

---

## Step 7: Publish Now
Force publish the approved content draft to live channels immediately.

**Endpoint**: `POST /content-drafts/{draft_id}/publish/`

**Request Body (JSON)**:
```json
{}
```

**Expected Response (200 OK)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "workflow_state": "PUBLISHED",
  "platforms": [
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "platform": "FACEBOOK",
      "status": "POSTED",
      "error_message": ""
    }
  ]
}
```
