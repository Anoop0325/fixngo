
from django.urls import path
from .views import NearbyProvidersView, ProviderSelfView, ProviderLocationView

app_name = "providers"

urlpatterns = [
    path("nearest/", NearbyProvidersView.as_view(), name="nearest"),
    path("me/", ProviderSelfView.as_view(), name="self"),
    path("location/", ProviderLocationView.as_view(), name="location"),
]
