from django.urls import path
from .views import (
    GenerateContentAPIView,
    UpdateContentVersionAPIView,
    ContentActionAPIView,
    BrandVoiceAPIView,
    ContentTemplateListCreateAPIView,
    ContentTemplateDetailAPIView,
    GeneratedContentListAPIView,
    RegenerateContentAPIView,
)

urlpatterns = [
    path('generate/', GenerateContentAPIView.as_view(), name='content-generate'),
    path('<uuid:pk>/regenerate/', RegenerateContentAPIView.as_view(), name='content-regenerate'),
    path('<uuid:pk>/update/', UpdateContentVersionAPIView.as_view(), name='content-update'),
    path('<uuid:pk>/action/', ContentActionAPIView.as_view(), name='content-action'),
    path('history/', GeneratedContentListAPIView.as_view(), name='content-history'),
    
    path('brand-voice/', BrandVoiceAPIView.as_view(), name='brand-voice'),
    
    path('templates/', ContentTemplateListCreateAPIView.as_view(), name='template-list-create'),
    path('templates/<uuid:pk>/', ContentTemplateDetailAPIView.as_view(), name='template-detail'),
]

from rest_framework.routers import DefaultRouter
from .views import ContentDraftViewSet

router = DefaultRouter()
router.register(r'content-drafts', ContentDraftViewSet, basename='Content')

urlpatterns += router.urls
