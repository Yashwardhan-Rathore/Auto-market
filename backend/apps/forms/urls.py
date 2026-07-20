from django.urls import path

from .views import (
    FormListCreateView,
    FormDetailView,
    PublishFormView,
    PublicFormView,
    SubmitFormView,
    FormResponsesView,
)

urlpatterns = [

    path(
        "",
        FormListCreateView.as_view(),
    ),

    path(
        "<int:pk>/",
        FormDetailView.as_view(),
    ),

    path(
        "<int:pk>/publish/",
        PublishFormView.as_view(),
    ),

    path(
        "<int:pk>/responses/",
        FormResponsesView.as_view(),
    ),

    path(
        "public/<uuid:uuid>/",
        PublicFormView.as_view(),
        name="public-form",
    ),

    path(
        "public/<uuid:uuid>/submit/",
        SubmitFormView.as_view(),
        name="submit-form",
    ),
]

