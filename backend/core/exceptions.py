
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    if isinstance(exc, DjangoValidationError):
        exc = exceptions.ValidationError(detail=exc.message_dict if hasattr(exc, "message_dict") else exc.messages)
    elif isinstance(exc, Http404):
        exc = exceptions.NotFound()

    response = drf_exception_handler(exc, context)

    if response is None:
        logger.exception("Unhandled exception in view: %s", exc)
        return Response(
            {
                "status": "error",
                "message": "An unexpected error occurred. Please try again later.",
                "errors": {},
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    
    error_data = response.data
    errors = {}
    
    if isinstance(error_data, list):
        message = str(error_data[0]) if error_data else "Validation error occurred."
    elif isinstance(error_data, dict):
        
        detail = error_data.get("detail")
        if isinstance(detail, list):
            message = str(detail[0])
        elif detail:
            message = str(detail)
        else:
            
            first_field = next(iter(error_data))
            first_err = error_data[first_field]
            message = str(first_err[0] if isinstance(first_err, list) else first_err)
        
        errors = {k: v for k, v in error_data.items() if k != "detail"}
    else:
        message = str(error_data)

    response.data = {
        "status": "error",
        "message": message,
        "errors": errors,
    }
    return response
