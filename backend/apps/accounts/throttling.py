
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    
    scope = "login"


class RegisterRateThrottle(AnonRateThrottle):
    
    scope = "register"

    THROTTLE_RATES = {"register": "10/minute"}
