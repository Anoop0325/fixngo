
from django.urls import path
from .views import (
    AdminUserListView,
    AdminUserDetailView,
    AdminProviderListView,
    AdminRequestListView,
    AdminStatsView,
)

app_name = "admin_panel"

urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="stats"),
    path("users/", AdminUserListView.as_view(), name="user-list"),
    path("users/<uuid:id>/", AdminUserDetailView.as_view(), name="user-detail"),
    path("providers/", AdminProviderListView.as_view(), name="provider-list"),
    path("requests/", AdminRequestListView.as_view(), name="request-list"),
]
