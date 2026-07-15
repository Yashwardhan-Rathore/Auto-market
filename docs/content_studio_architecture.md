# Content Studio Architecture

## Overview
Content Studio is an AI-powered SaaS module that orchestrates the creation, approval, and publishing of social media and marketing contents across multiple platforms.

## Core Workflows

### 1. content Generation Flow
1. **Briefing**: User provides a raw text brief and selects platforms.
2. **Orchestration**: The `AIOrchestrator` structures the brief into an enhanced key-value format using `SpecPromptBuilder`.
3. **Generation**: Content is generated for images (via DALL-E) and captions (via GPT) per platform via `ImagePromptBuilder` and `CaptionPromptBuilder`.
4. **Versioning**: Every generation or regeneration is captured as a snapshot in `ContentDraftVersion`, linked to the master `ContentDraft`.

### 2. Publishing Flow (`PublishingService`)
- The `PublishingService` reads the draft and extracts the final text and image assets from `ContentPlatform`.
- Assets are automatically saved to `AssetLibrary` if they were AI-generated.
- It iterates through platforms and delegates to `apps.integrations.social_service.SocialService` to handle external APIs.
- Platform statuses update independently (`POSTED`, `FAILED`, `PENDING`).

### 3. Approval & Scheduling
- Status moves from `DRAFT` -> `IN_REVIEW` -> `APPROVED` via `ApprovalService`.
- Scheduling is stored in `ContentPlatform.scheduled_datetime` and validated by `ScheduleService`.

## Database Schema
- **ContentDraft**: Master record, holds the raw/enhanced prompt and `workflow_state`.
- **ContentPlatform**: Links a Draft to a specific platform (e.g., INSTAGRAM), tracking individual publishing status and errors.
- **ContentDraftVersion**: Snapshots the prompt across iterations.
- **Caption / ImageReference**: Stores platform-specific generated artifacts.

## Extending the Platform

### Adding a New Social Platform
1. Update `ContentPlatform.PlatformChoices` model enum.
2. Ensure `SocialService.publish_post(platform=NEW_PLATFORM)` in `integrations` supports the new enum.
3. Update `Step1Platforms.tsx` `PLATFORMS` array in the frontend wizard.

### Adding a New AI Provider (e.g., Claude)
1. Subclass `BaseAIProvider` inside `apps.content_studio.ai.providers`.
2. Implement `generate_text()` and `generate_image()` (or raise NotImplemented).
3. Switch the orchestrator to inject the new provider.
