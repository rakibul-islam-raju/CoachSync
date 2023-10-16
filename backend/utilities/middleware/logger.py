import logging

logger = logging.getLogger('status_logger')


class StatusCodeLoggerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Log status code and request path for all responses
        logger.info('Status Code: %s | Path: %s',
                    response.status_code, request.path)

        return response
