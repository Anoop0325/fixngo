
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification


class NotificationPollView(APIView):
    

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Notification.objects.filter(
            recipient=request.user,
        ).select_related("request").order_by("-created_at")
        
        if request.query_params.get("all", "false").lower() != "true":
            qs = qs.filter(is_read=False)

        since = request.query_params.get("since")
        if since:
            try:
                from django.utils.dateparse import parse_datetime
                since_dt = parse_datetime(since)
                if since_dt:
                    qs = qs.filter(created_at__gt=since_dt)
            except Exception:
                pass  

        notifications = list(qs[:50])

        mark_read = request.query_params.get("mark_read", "true").lower() == "true"
        if mark_read and notifications:
            Notification.objects.filter(
                id__in=[n.id for n in notifications]
            ).update(is_read=True)

        data = [
            {
                "id": str(n.id),
                "type": n.notification_type,
                "message": n.message,
                "request_id": str(n.request_id) if n.request_id else None,
                "request_status": n.request.status if n.request else None,
                "created_at": n.created_at.isoformat(),
            }
            for n in notifications
        ]

        return Response(
            {
                "status": "success",
                "count": len(data),
                "notifications": data,
            }
        )


class NotificationMarkReadView(APIView):
    

    permission_classes = [IsAuthenticated]

    def post(self, request):
        ids = request.data.get("ids", [])
        if not isinstance(ids, list):
            return Response(
                {"status": "error", "message": "ids must be a list."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        updated = Notification.objects.filter(
            id__in=ids, recipient=request.user
        ).update(is_read=True)
        return Response({"status": "success", "updated": updated})
