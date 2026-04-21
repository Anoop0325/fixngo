
from .base import *  

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://fixngo-theta.vercel.app",
]
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "origin",
    "user-agent",
]

CSRF_TRUSTED_ORIGINS = [
    "https://fixngo-theta.vercel.app",
]

INSTALLED_APPS += ["debug_toolbar"]  
MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]  
INTERNAL_IPS = ["127.0.0.1"]
