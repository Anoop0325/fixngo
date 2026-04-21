
from .base import *  
from decouple import config

DEBUG = False

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1,fixngo-xbxe.onrender.com").split(",")

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS", 
    default="http://localhost:5173,https://fixngo-theta.vercel.app"
).split(",")

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS", 
    default="https://fixngo-xbxe.onrender.com,https://fixngo-theta.vercel.app"
).split(",")

CORS_ALLOW_CREDENTIALS = True


SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"


MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")  
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

import dj_database_url

# ... (middleware and static files)

DATABASES = {
    "default": dj_database_url.config(
        default=config("DATABASE_URL"),
        conn_max_age=600,
        conn_health_checks=True,
    )
}


REST_FRAMEWORK = {  
    **REST_FRAMEWORK,  
    "DEFAULT_THROTTLE_RATES": {
        "anon": "20/minute",
        "user": "100/minute",
        "login": "5/minute",
    },
}
