"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from apps.accounts.views import ListAdminsView, ListUsersView

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/", include("apps.accounts.urls")),
    
    # List endpoints
    path("api/admins/", ListAdminsView.as_view(), name="list-admins"),
    path("api/users/", ListUsersView.as_view(), name="list-users"),


    path("api/tasks/", include("apps.tasks.urls")),

    path(
        "api/customers/",
        include("apps.campaigns.urls.customers"),
    ),

    path(
        "api/audiences/",
        include("apps.campaigns.urls.audiences"),
    ),

    path(
        "api/campaigns/",
        include("apps.campaigns.urls.campaigns"),
    ),

    path(
        "api/channels/",
        include("apps.campaigns.urls.channels"),

    ),

    path(
        "api/forms/",
        include("apps.forms.urls"),
    ),

    path(
        "api/automations/",
        include("apps.automation.api.urls"),
    ),
    path(
        "api/events/",
        include("apps.events.urls"),
    ),
    path(
        "api/webhooks/",
        include("apps.webhooks.urls"),
    ),
    path(
        "api/communications/",
        include("apps.communications.urls"),
    ),
    path(
        "api/analytics/",
        include("apps.analytics.urls"),
    ),
    path("api/templates/", include("apps.campaigns.urls.templates")),

    path(
    "api/dashboard/",
    include("apps.dashboard.urls"),
),

]

