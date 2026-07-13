from django.urls import path
from .views import (
    GenerateContentAPIView,
    UpdateContentVersionAPIView,
    ContentActionAPIView
)

urlpatterns = [
    path('generate/', GenerateContentAPIView.as_view(), name='content-generate'),
    path('<uuid:pk>/update/', UpdateContentVersionAPIView.as_view(), name='content-update'),
    path('<uuid:pk>/action/', ContentActionAPIView.as_view(), name='content-action'),
]
