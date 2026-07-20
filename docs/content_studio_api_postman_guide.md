# Content Studio API - Postman Testing Guide

This document outlines the step-by-step process for testing the fully autonomous AI-driven Content Studio workflow endpoints using Postman.

**Base URL**: `http://localhost:8000/api/content` (Adjust the port or domain if necessary).
**Authorization**: All requests require a valid Bearer token for authentication. Ensure you include the header:
`Authorization: Bearer <your_access_token>`

---

## Step 1: Analyze Prompt (AI Interaction)
Send the user's initial idea to the AI. The AI will extract a structured spec and generate clarifying questions to improve the final content.

**Endpoint**: `POST /content-drafts/analyze_prompt/`

**Request Body (JSON)**:
```json
{
  "prompt": "Write a post about our new summer sale"
}
```

**Expected Response (200 OK)**:
```json
{
  "content_spec": {
    "topic": "Summer Sale",
    "key_points": ["New summer sale"]
  },
  "questions": [
    "What is the specific discount or offer for the summer sale?",
    "Who is the target audience for this post?",
    "What is the primary call to action (CTA)?"
  ]
}
```

---

## Step 2: Initialize Content Draft
Create a new content draft, passing in the user's initial prompt and selecting the target platforms.

**Endpoint**: `POST /content-drafts/`

**Request Body (JSON)**:
```json
{
  "original_prompt": "Write a post about our new summer sale",
  "platforms": ["FACEBOOK", "INSTAGRAM", "LINKEDIN"]
}
```

**Expected Response (201 Created)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "owner": 1,
  "original_prompt": "Write a post about our new summer sale",
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

## Step 3: Enhance Prompt (AI Interaction)
Send the content spec and the user's answers to the clarifying questions. The AI will generate a highly optimized `enhanced_prompt` and save it to the draft.

**Endpoint**: `POST /content-drafts/{draft_id}/enhance_prompt/`

**Request Body (JSON)**:
```json
{
  "content_spec": {
    "topic": "Summer Sale",
    "key_points": ["New summer sale"]
  },
  "user_answers": {
    "What is the specific discount or offer?": "50% off all shorts",
    "Who is the target audience?": "Young adults",
    "What is the primary call to action (CTA)?": "Shop now at the link in bio"
  }
}
```

**Expected Response (200 OK)**:
```json
{
  "enhanced_prompt": "Task: Create a highly engaging social media post...\nAudience: Young adults...\nOffer: 50% off all shorts...",
  "version_id": "923e4567-e89b-12d3-a456-426614174009"
}
```

---

## Step 4: Generate Content (AI Interaction)
Trigger the AI to generate the actual images and captions for each platform using the `enhanced_prompt`.

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
  "message": "Content generated successfully.",
  "version_id": "323e4567-e89b-12d3-a456-426614174002",
  "version_number": 2
}
```

*(You can now fetch the draft `GET /content-drafts/{draft_id}/` to see the generated images and captions attached to each platform).*

---

## Step 5: Request Approval
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

## Step 6: Approve Content Draft (Admin Only)
Approve the content draft, setting it to the `APPROVED` state.

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

---

## Step 7: Schedule Posts
Set the scheduled publishing time for specific platforms.

**Endpoint**: `POST /content-drafts/{draft_id}/schedule/`

**Request Body (JSON)**:
*(Replace `platform_id` with the actual UUIDs of the platforms returned in Step 2)*
```json
{
  "schedules": {
    "223e4567-e89b-12d3-a456-426614174001": "2026-12-01T10:00:00Z"
  }
}
```

**Expected Response (200 OK)**:
```json
{
  "message": "Schedules saved successfully."
}
```

---

## Step 8: Publish Now
Force publish the approved content draft immediately.

**Endpoint**: `POST /content-drafts/{draft_id}/publish/`

**Request Body (JSON)**:
```json
{}
```

**Expected Response (200 OK)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "workflow_state": "PUBLISHED"
}
```
