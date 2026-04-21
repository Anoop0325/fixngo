
from django.urls import path
from .views import (
    ServiceRequestListCreateView,
    ServiceRequestDetailView,
    ProviderPendingRequestsView,
    AcceptRequestView,
    UpdateRequestStatusView,
    RateRequestView,
)

app_name = "requests"

urlpatterns = [
    path("", ServiceRequestListCreateView.as_view(), name="list-create"),
    path("pending/", ProviderPendingRequestsView.as_view(), name="pending"),
    path("<uuid:pk>/", ServiceRequestDetailView.as_view(), name="detail"),
    path("<uuid:pk>/accept/", AcceptRequestView.as_view(), name="accept"),
    path("<uuid:pk>/status/", UpdateRequestStatusView.as_view(), name="update-status"),
    path("<uuid:pk>/rate/", RateRequestView.as_view(), name="rate"),
]
