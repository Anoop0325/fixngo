
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls", namespace="accounts")),
    path("api/providers/", include("apps.providers.urls", namespace="providers")),
    path("api/requests/", include("apps.requests.urls", namespace="requests")),
    path("api/notifications/", include("apps.notifications.urls", namespace="notifications")),
    path("api/admin-panel/", include("apps.admin_panel.urls", namespace="admin_panel")),
]

if settings.DEBUG:
    try:
        import debug_toolbar
        urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    except ImportError:
        pass
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
