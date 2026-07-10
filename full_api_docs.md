# 📡 Auto-Market Exhaustive API Documentation

> This document lists **every single API endpoint** registered in the Django project, including their supported HTTP methods and automatically extracted request/response schemas (where defined on the view).

## Analytics Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/analytics/summary/`
- **View Class:** `AnalyticsSummaryView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

## Audiences Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/audiences/`
- **View Class:** `AudienceListAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/audiences/create/`
- **View Class:** `AudienceCreateAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/audiences/preview/`
- **View Class:** `AudiencePreviewAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

## Auth Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/register/`
- **View Class:** `RegisterView`
- **Schema:**
```json
{
  "email": {
    "type": "EmailField",
    "required": true
  },
  "password": {
    "type": "CharField",
    "required": true
  }
}
```

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/login/`
- **View Class:** `LoginView`
- **Schema:**
```json
{
  "email": {
    "type": "EmailField",
    "required": true
  },
  "password": {
    "type": "CharField",
    "required": true
  }
}
```

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/token/refresh/`
- **View Class:** `TokenRefreshView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/profile/`
- **View Class:** `ProfileView`
- **Schema:**
```json
{
  "id": {
    "type": "BigIntegerField",
    "required": false
  },
  "email": {
    "type": "EmailField",
    "required": false
  },
  "username": {
    "type": "CharField",
    "required": false
  },
  "first_name": {
    "type": "CharField",
    "required": false
  },
  "last_name": {
    "type": "CharField",
    "required": false
  },
  "is_active": {
    "type": "BooleanField",
    "required": false,
    "description": "Designates whether this user should be treated as active. Unselect this instead of deleting accounts."
  },
  "is_staff": {
    "type": "BooleanField",
    "required": false,
    "description": "Designates whether the user can log into this admin site."
  },
  "is_superuser": {
    "type": "BooleanField",
    "required": false,
    "description": "Designates that this user has all permissions without explicitly assigning them."
  },
  "last_login": {
    "type": "DateTimeField",
    "required": false
  },
  "date_joined": {
    "type": "DateTimeField",
    "required": false
  },
  "role": {
    "type": "SerializerMethodField",
    "required": false
  }
}
```

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/logout/`
- **View Class:** `LogoutView`
- **Schema:**
```json
{
  "refresh": {
    "type": "CharField",
    "required": true
  }
}
```

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/forgot-password/`
- **View Class:** `ForgotPasswordView`
- **Schema:**
```json
{
  "email": {
    "type": "EmailField",
    "required": true
  }
}
```

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/reset-password/`
- **View Class:** `ResetPasswordView`
- **Schema:**
```json
{
  "email": {
    "type": "EmailField",
    "required": true
  },
  "otp": {
    "type": "RegexField",
    "required": true
  },
  "password": {
    "type": "CharField",
    "required": true
  },
  "confirm_password": {
    "type": "CharField",
    "required": true
  }
}
```

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/request-access/`
- **View Class:** `RequestAccessView`
- **Schema:**
```json
{
  "full_name": {
    "type": "CharField",
    "required": true
  },
  "email": {
    "type": "EmailField",
    "required": true
  },
  "department": {
    "type": "CharField",
    "required": true
  },
  "designation": {
    "type": "CharField",
    "required": true
  },
  "reason": {
    "type": "CharField",
    "required": true
  }
}
```

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/access-requests/`
- **View Class:** `AccessRequestListView`
- **Schema:**
```json
{
  "id": {
    "type": "BigIntegerField",
    "required": false
  },
  "full_name": {
    "type": "CharField",
    "required": false
  },
  "email": {
    "type": "EmailField",
    "required": false
  },
  "department": {
    "type": "CharField",
    "required": false
  },
  "designation": {
    "type": "CharField",
    "required": false
  },
  "reason": {
    "type": "CharField",
    "required": false
  },
  "status": {
    "type": "ChoiceField",
    "required": false
  },
  "created_at": {
    "type": "DateTimeField",
    "required": false
  }
}
```

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/access-requests/<int:pk>/approve/`
- **View Class:** `ApproveAccessRequestView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/access-requests/<int:pk>/reject/`
- **View Class:** `RejectAccessRequestView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/auth/create-super-admin/`
- **View Class:** `CreateSuperAdminView`
- **Schema:**
```json
{
  "email": {
    "type": "EmailField",
    "required": true
  },
  "password": {
    "type": "CharField",
    "required": true
  }
}
```

## Automations Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/`
- **View Class:** `AutomationListCreateView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/<uuid:pk>/`
- **View Class:** `AutomationDetailView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/<uuid:pk>/validate/`
- **View Class:** `ValidateAutomationView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/<uuid:pk>/publish/`
- **View Class:** `PublishAutomationView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/<uuid:pk>/pause/`
- **View Class:** `PauseAutomationView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/<uuid:pk>/execute/`
- **View Class:** `ExecuteAutomationView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/<uuid:pk>/clone/`
- **View Class:** `CloneAutomationView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/<uuid:automation_id>/nodes/`
- **View Class:** `AutomationNodeCreateView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/nodes/<uuid:pk>/`
- **View Class:** `AutomationNodeDetailView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/<uuid:automation_id>/edges/`
- **View Class:** `AutomationEdgeCreateView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/edges/<uuid:pk>/`
- **View Class:** `AutomationEdgeDeleteView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/<uuid:pk>/executions/`
- **View Class:** `ExecutionHistoryView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/executions/<uuid:pk>/logs/`
- **View Class:** `ExecutionLogsView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/automations/webhook/<uuid:automation_id>/`
- **View Class:** `WebhookTriggerView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

## Campaigns Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/campaigns/`
- **View Class:** `CampaignListAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/campaigns/create/`
- **View Class:** `CampaignCreateAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/campaigns/templates/assign/`
- **View Class:** `CampaignTemplateAssignAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/campaigns/schedule/`
- **View Class:** `CampaignScheduleAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/campaigns/preview/`
- **View Class:** `CampaignPreviewAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/campaigns/send/`
- **View Class:** `CampaignSendAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/campaigns/<int:campaign_id>/analytics/`
- **View Class:** `CampaignAnalyticsAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

## Channels Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/channels/<int:campaign_id>/`
- **View Class:** `AssignChannelsView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

## Communications Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/communications/email-providers/`
- **View Class:** `EmailProviderListCreateView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/communications/events/`
- **View Class:** `CommunicationEventListView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

## Customers Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/customers/uploads/`
- **View Class:** `CustomerUploadAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/customers/uploads/list/`
- **View Class:** `CustomerUploadListAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/customers/`
- **View Class:** `CustomerRecordListAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

## Dashboard Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/dashboard/`
- **View Class:** `DashboardAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

## Events Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/events/track/`
- **View Class:** `TrackEventView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

## Forms Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/forms/`
- **View Class:** `FormListCreateView`
- **Schema:**
```json
{
  "id": {
    "type": "BigIntegerField",
    "required": false
  },
  "uuid": {
    "type": "UUIDField",
    "required": false
  },
  "title": {
    "type": "CharField",
    "required": true
  },
  "status": {
    "type": "ChoiceField",
    "required": false
  },
  "published_at": {
    "type": "DateTimeField",
    "required": false
  },
  "created_at": {
    "type": "DateTimeField",
    "required": false
  },
  "total_responses": {
    "type": "SerializerMethodField",
    "required": false
  }
}
```

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/forms/<int:pk>/`
- **View Class:** `FormDetailView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/forms/<int:pk>/publish/`
- **View Class:** `PublishFormView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/forms/<int:pk>/responses/`
- **View Class:** `FormResponsesView`
- **Schema:**
```json
{
  "id": {
    "type": "BigIntegerField",
    "required": false
  },
  "submitted_at": {
    "type": "DateTimeField",
    "required": false
  },
  "ip_address": {
    "type": "IPAddressField",
    "required": false
  },
  "answers": [
    {
      "field": {
        "type": "PrimaryKeyRelatedField",
        "required": true
      },
      "answer": {
        "type": "CharField",
        "required": false
      }
    }
  ]
}
```

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/forms/public/<uuid:uuid>/`
- **View Class:** `PublicFormView`
- **Schema:**
```json
{
  "id": {
    "type": "BigIntegerField",
    "required": false
  },
  "fields": [
    {
      "id": {
        "type": "BigIntegerField",
        "required": false
      },
      "step_number": {
        "type": "IntegerField",
        "required": false
      },
      "field_type": {
        "type": "ChoiceField",
        "required": true
      },
      "label": {
        "type": "CharField",
        "required": true
      },
      "placeholder": {
        "type": "CharField",
        "required": false
      },
      "help_text": {
        "type": "CharField",
        "required": false
      },
      "required": {
        "type": "BooleanField",
        "required": false
      },
      "unique_field": {
        "type": "BooleanField",
        "required": false
      },
      "options": {
        "type": "JSONField",
        "required": false
      },
      "validation_rules": {
        "type": "JSONField",
        "required": false
      },
      "conditional_logic": {
        "type": "JSONField",
        "required": false
      },
      "settings": {
        "type": "JSONField",
        "required": false
      },
      "field_order": {
        "type": "IntegerField",
        "required": false
      }
    }
  ],
  "total_responses": {
    "type": "SerializerMethodField",
    "required": false
  },
  "uuid": {
    "type": "UUIDField",
    "required": false
  },
  "title": {
    "type": "CharField",
    "required": true
  },
  "description": {
    "type": "CharField",
    "required": false
  },
  "slug": {
    "type": "SlugField",
    "required": false
  },
  "subdomain": {
    "type": "CharField",
    "required": false
  },
  "custom_domain": {
    "type": "CharField",
    "required": false
  },
  "status": {
    "type": "ChoiceField",
    "required": false
  },
  "allow_multiple_submissions": {
    "type": "BooleanField",
    "required": false
  },
  "collect_ip": {
    "type": "BooleanField",
    "required": false
  },
  "collect_device": {
    "type": "BooleanField",
    "required": false
  },
  "collect_location": {
    "type": "BooleanField",
    "required": false
  },
  "submission_limit": {
    "type": "IntegerField",
    "required": false
  },
  "start_date": {
    "type": "DateTimeField",
    "required": false
  },
  "end_date": {
    "type": "DateTimeField",
    "required": false
  },
  "thank_you_message": {
    "type": "CharField",
    "required": false
  },
  "redirect_url": {
    "type": "URLField",
    "required": false
  },
  "published_at": {
    "type": "DateTimeField",
    "required": false
  },
  "created_at": {
    "type": "DateTimeField",
    "required": false
  },
  "updated_at": {
    "type": "DateTimeField",
    "required": false
  },
  "created_by": {
    "type": "PrimaryKeyRelatedField",
    "required": true
  }
}
```

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/forms/public/<uuid:uuid>/submit/`
- **View Class:** `SubmitFormView`
- **Schema:**
```json
{
  "answers": {
    "type": "ListField",
    "required": true
  }
}
```

## Tasks Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/tasks/`
- **View Class:** `CreateTaskView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/tasks/my/`
- **View Class:** `MyTasksView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/tasks/team/`
- **View Class:** `TeamTasksView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/tasks/assignment/<int:assignment_id>/`
- **View Class:** `UpdateTaskStatusView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/tasks/assignment/<int:assignment_id>/approve/`
- **View Class:** `ApproveTaskView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/tasks/assignment/<int:assignment_id>/reject/`
- **View Class:** `RejectTaskView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

## Templates Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/templates/`
- **View Class:** `TemplateListAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/templates/create/`
- **View Class:** `TemplateCreateAPIView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

## Webhooks Endpoints

### GET, POST, PUT, PATCH, DELETE, TRACE `/api/webhooks/<str:secret>/`
- **View Class:** `IncomingWebhookView`
- **Schema:** *Dynamic or not explicitly defined on class level.*

