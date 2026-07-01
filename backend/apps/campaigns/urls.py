from django.urls import path
from .views import CustomerUploadAPIView , CustomerUploadListAPIView

urlpatterns = [
    path("customer/upload/",CustomerUploadAPIView.as_view(),name="customer-upload"),
     path("customer/uploads/",CustomerUploadListAPIView.as_view(),name="customer-upload-list"),
]