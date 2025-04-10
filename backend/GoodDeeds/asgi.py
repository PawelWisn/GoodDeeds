"""
ASGI config for GoodDeeds project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from chat.urls import websocket_urlpatterns as chat_websocket_urlpatterns
from django.core.asgi import get_asgi_application
from users.urls import websocket_urlpatterns as users_websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "GoodDeeds.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AllowedHostsOriginValidator(AuthMiddlewareStack(URLRouter(chat_websocket_urlpatterns + users_websocket_urlpatterns))),
    }
)
