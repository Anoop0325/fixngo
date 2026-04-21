
from django.urls import path
from .views import NotificationPollView, NotificationMarkReadView

app_name = "notifications"

urlpatterns = [
    path("poll/", NotificationPollView.as_view(), name="poll"),
    path("mark-read/", NotificationMarkReadView.as_view(), name="mark-read"),
]
