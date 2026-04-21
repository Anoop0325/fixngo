
import logging
from typing import List, Dict, Any

from core.utils.geo import haversine, bounding_box
from .models import ProviderProfile

logger = logging.getLogger(__name__)

DEFAULT_RADIUS_KM = 50  
MAX_RESULTS = 20


class ProviderMatchingService:
    

    @staticmethod
    def find_nearest(
        user_lat: float,
        user_lon: float,
        service_type: str = None,
        radius_km: float = DEFAULT_RADIUS_KM,
    ) -> List[Dict[str, Any]]:
        
        min_lat, max_lat, min_lon, max_lon = bounding_box(user_lat, user_lon, radius_km)

        qs = ProviderProfile.objects.select_related("user").filter(
            is_available=True,
            latitude__isnull=False,
            longitude__isnull=False,
            latitude__gte=min_lat,
            latitude__lte=max_lat,
            longitude__gte=min_lon,
            longitude__lte=max_lon,
            user__is_active=True,
        )

        
        results = []
        for provider in qs:
            if service_type and service_type not in provider.service_types:
                continue
            
            dist = haversine(
                user_lat, user_lon,
                float(provider.latitude), float(provider.longitude),
            )
            if dist <= radius_km:
                results.append({"provider": provider, "distance_km": round(dist, 2)})

        results.sort(key=lambda x: x["distance_km"])

        if not results:
            logger.info(
                "No providers found near (%.4f, %.4f) within %s km (service=%s)",
                user_lat, user_lon, radius_km, service_type,
            )

        return results[:MAX_RESULTS]
