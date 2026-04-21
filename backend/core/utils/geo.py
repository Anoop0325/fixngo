
import math


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    
    R = 6_371.0  

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def bounding_box(lat: float, lon: float, radius_km: float):
    
    delta_lat = radius_km / 111.0
    delta_lon = radius_km / (111.0 * math.cos(math.radians(lat)))

    return (
        lat - delta_lat,
        lat + delta_lat,
        lon - delta_lon,
        lon + delta_lon,
    )
